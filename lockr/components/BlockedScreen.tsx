import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BlockedScreenProps {
  target: string;
  reason: "forever" | "temporary" | "expired" | null;
  blockedUntil: Date | null;
  onOverrideClick: () => void;
}

const BlockedScreen: React.FC<BlockedScreenProps> = ({ target, reason, blockedUntil, onOverrideClick }) => {
  const isTemporary = reason === 'temporary';
  const timeLeft = isTemporary && blockedUntil ?
    Math.max(0, Math.floor((blockedUntil.getTime() - Date.now()) / 60000)) :
    null;

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <h2 className="text-2xl font-bold mb-4">Access Blocked</h2>
      <p className="text-lg mb-2">
        You are blocked from accessing {target}
      </p>
      {isTemporary && timeLeft !== null && timeLeft > 0 && (
        <p>Time remaining: {timeLeft} minutes</p>
      )}
      {reason === 'forever' && (
        <p>Blocked Forever</p>
      )}
      <Button onClick={onOverrideClick} className="mt-4">
        Override
      </Button>
    </div>
  );
};

export default BlockedScreen;
