"use client";

import { useState, useEffect, ReactNode } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { getActiveBlocks, BlockType, updateBlockOverride } from '@/lib/blocks';
import OverrideModal from './OverrideModal';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button'; // Import Button

interface BlockEnforcerProps {
  target: string; // The site/app this enforcer is protecting
  children: ReactNode;
}

export default function BlockEnforcer({ target, children }: BlockEnforcerProps) {
  const session = useSession(); // Corrected: directly get session
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockingBlock, setBlockingBlock] = useState<BlockType | null>(null);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [unlockedForSession, setUnlockedForSession] = useState(false); // Client-side session override

  const checkBlockStatus = async () => {
    if (!session?.user?.id || unlockedForSession) {
      setIsBlocked(false);
      setBlockingBlock(null);
      return;
    }

    try {
      const activeBlocks = await getActiveBlocks(session.user.id);
      const foundBlock = activeBlocks.find(
        (block) => block.target.toLowerCase() === target.toLowerCase()
      );

      if (foundBlock) {
        setIsBlocked(true);
        setBlockingBlock(foundBlock);
      } else {
        setIsBlocked(false);
        setBlockingBlock(null);
      }
    } catch (error) {
      console.error('Error checking block status:', error);
      setIsBlocked(false);
      setBlockingBlock(null);
    }
  };

  useEffect(() => {
    checkBlockStatus();
    const interval = setInterval(checkBlockStatus, 5000); // Re-check every 5 seconds
    return () => clearInterval(interval);
  }, [session, target, unlockedForSession]);

  const handleOverrideAttempt = () => {
    setIsOverrideModalOpen(true);
  };

  const handleOverrideModalClose = async (success: boolean) => {
    setIsOverrideModalOpen(false);
    if (success && blockingBlock) {
      try {
        // Mark as unlocked in DB (for accountability, though client-side state handles immediate unblock)
        await updateBlockOverride(blockingBlock.id, true);
        setUnlockedForSession(true); // Allow access for this session
        toast.success(`Successfully overridden ${blockingBlock.target} for this session!`);
      } catch (error) {
        toast.error('Failed to record override.');
        console.error('Override update error:', error);
      }
    } else if (!success) {
      toast.error('Override failed or cancelled.');
    }
  };

  if (isBlocked && blockingBlock && !unlockedForSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-800 p-4 text-center">
        <h2 className="text-4xl font-bold mb-4">🚫 Blocked!</h2>
        <p className="text-lg mb-2">
          You are currently blocked from accessing "{blockingBlock.target}".
        </p>
        {blockingBlock.type === 'temp' && blockingBlock.blocked_until && (
          <p className="text-md mb-4">
            This block expires{' '}
            {new Date(blockingBlock.blocked_until).toLocaleString()}.
          </p>
        )}
        <Button onClick={handleOverrideAttempt} className="mt-4 bg-red-600 hover:bg-red-700 text-white">
          Override Block
        </Button>
        <OverrideModal
          isOpen={isOverrideModalOpen}
          onClose={handleOverrideModalClose}
          blockTarget={blockingBlock.target}
        />
      </div>
    );
  }

  return <>{children}</>;
}
