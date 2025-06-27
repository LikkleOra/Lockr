"use client";

import { useEffect, useState } from 'react';
import { BlockType } from '@/lib/blocks';
import { Button } from '@/components/ui/button';
import { formatDistanceToNowStrict, isPast, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface BlockCardProps {
  block: BlockType;
  lastSyncTime: Date; // New prop for last sync time
}

export default function BlockCard({ block, lastSyncTime }: BlockCardProps) {
  const [displayTime, setDisplayTime] = useState<string | null>(null);
  const [isBlockActive, setIsBlockActive] = useState(true); // Tracks if block is still active (not expired/unlocked)

  useEffect(() => {
    const checkBlockStatus = () => {
      if (block.unlocked) {
        setIsBlockActive(false);
        setDisplayTime('Unlocked');
        return;
      }

      if (block.type === 'temp' && block.blocked_until) {
        const endTime = new Date(block.blocked_until);
        if (isPast(endTime)) {
          if (isBlockActive) { // Only show toast if it just expired
            toast.success(`✅ Access to ${block.target} is now restored.`);
          }
          setDisplayTime('Expired');
          setIsBlockActive(false);
        } else {
          setDisplayTime(formatDistanceToNowStrict(endTime, { addSuffix: true }));
          setIsBlockActive(true);
        }
      } else if (block.type === 'forever') {
        setDisplayTime('Forever');
        setIsBlockActive(true);
      }
    };

    checkBlockStatus(); // Initial check
    const interval = setInterval(checkBlockStatus, 1000); // Update every second for temporary blocks

    return () => clearInterval(interval);
  }, [block, isBlockActive]);

  const handleOverride = () => {
    console.log(`Attempting to override block: ${block.target}`);
    // This will be handled by the BlockEnforcer's OverrideModal
  };

  const cardClasses = cn(
    "p-4 rounded-lg shadow-md",
    {
      "bg-green-100 text-green-800": isBlockActive && block.type === 'forever', // Green for active forever
      "bg-yellow-100 text-yellow-800": isBlockActive && block.type === 'temp', // Yellow for active temporary
      "bg-gray-200 text-gray-700": !isBlockActive, // Gray for expired or unlocked
      "border-red-500 border-2": block.override_attempts >= 3, // Red border for 3+ override attempts
    }
  );

  return (
    <div className={cardClasses}>
      <h3 className="text-xl font-bold mb-2">{block.target}</h3>
      <p className="text-sm mb-1">Type: {block.type === 'temp' ? 'Temporary' : 'Forever'}</p>
      <p className="text-sm mb-2">Status: {displayTime}</p>
      {block.override_attempts > 0 && (
        <p className={cn("text-xs mb-2", { "text-red-600 font-semibold": block.override_attempts >= 3 })}>
          Override attempts: {block.override_attempts}
        </p>
      )}
      <Button onClick={handleOverride} disabled={!isBlockActive} className="w-full">
        Override
      </Button>
      <p className="text-xs text-gray-500 mt-2">
        🔁 Last synced {formatDistanceToNow(lastSyncTime, { addSuffix: true })}
      </p>
    </div>
  );
}
