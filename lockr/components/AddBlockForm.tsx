"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { addBlock } from '@/lib/blocks';
import { useSession } from '@supabase/auth-helpers-react'; // Assuming this hook exists or will be created
import toast from 'react-hot-toast';

interface AddBlockFormProps {
  onBlockAdded: () => void;
}

export default function AddBlockForm({ onBlockAdded }: AddBlockFormProps) {
  const [target, setTarget] = useState('');
  const [blockType, setBlockType] = useState<'temp' | 'forever'>('forever');
  const [duration, setDuration] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const session = useSession(); // Get session from auth-helpers-react

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast.error('You must be logged in to add a block.');
      return;
    }
    if (!target.trim()) {
      toast.error('Block target cannot be empty.');
      return;
    }
    if (blockType === 'temp' && (!duration || duration <= 0)) {
      toast.error('Temporary blocks require a valid duration in minutes.');
      return;
    }

    setLoading(true);
    try {
      await addBlock(session.user.id, target, blockType, blockType === 'temp' ? (duration as number) : undefined);
      toast.success('Block added successfully!');
      setTarget('');
      setDuration('');
      setBlockType('forever');
      onBlockAdded(); // Notify parent to refresh blocks
    } catch (error) {
      toast.error('Failed to add block.');
      console.error('Add block error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg shadow-sm bg-white">
      <div>
        <Label htmlFor="target">Website/App Name or URL</Label>
        <Input
          id="target"
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="e.g., facebook.com or Instagram"
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label>Block Type</Label>
        <RadioGroup
          value={blockType}
          onValueChange={(value: 'temp' | 'forever') => setBlockType(value)}
          className="flex space-x-4 mt-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="forever" id="forever" />
            <Label htmlFor="forever">Forever</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="temp" id="temp" />
            <Label htmlFor="temp">Temporary</Label>
          </div>
        </RadioGroup>
      </div>

      {blockType === 'temp' && (
        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || '')}
            placeholder="e.g., 60"
            min="1"
            required
            className="mt-1"
          />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Adding...' : 'Add Block'}
      </Button>
    </form>
  );
}
