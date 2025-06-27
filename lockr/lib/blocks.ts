import { supabase } from './supabase';

export interface BlockType {
  id: string;
  user_id: string;
  target: string;
  type: 'temp' | 'forever';
  blocked_until: string | null; // ISO string for temporary blocks
  created_at: string;
  unlocked: boolean;
  override_attempts: number;
}

export const addBlock = async (
  userId: string,
  target: string,
  type: 'temp' | 'forever',
  durationMinutes?: number
) => {
  let blocked_until: string | null = null;
  if (type === 'temp' && durationMinutes) {
    const now = new Date();
    now.setMinutes(now.getMinutes() + durationMinutes);
    blocked_until = now.toISOString();
  }

  const { data, error } = await supabase
    .from('blocks')
    .insert([
      {
        user_id: userId,
        target,
        type,
        blocked_until,
        unlocked: false,
        override_attempts: 0,
      },
    ])
    .select();

  if (error) {
    console.error('Error adding block:', error);
    throw error;
  }
  return data ? (data[0] as BlockType) : null;
};

export const updateBlockOverride = async (blockId: string, unlocked: boolean) => {
  const { data, error } = await supabase
    .from('blocks')
    .update({ unlocked: unlocked, override_attempts: (blockId as any).override_attempts + 1 }) // Increment override_attempts
    .eq('id', blockId)
    .select();

  if (error) {
    console.error('Error updating block override:', error);
    throw error;
  }
  return data ? (data[0] as BlockType) : null;
};

export const getActiveBlocks = async (userId: string) => {
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('user_id', userId)
    .eq('unlocked', false); // Only fetch active, not unlocked blocks

  if (error) {
    console.error('Error fetching active blocks:', error);
    throw error;
  }

  // Filter out expired temporary blocks on the client side for now
  const activeBlocks = (data as BlockType[]).filter(block => {
    if (block.type === 'temp' && block.blocked_until) {
      return new Date(block.blocked_until) > new Date();
    }
    return true; // Forever blocks and unexpired temporary blocks are active
  });

  return activeBlocks;
};
