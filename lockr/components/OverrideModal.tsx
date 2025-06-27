"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

interface OverrideModalProps {
  isOpen: boolean;
  onClose: (success: boolean) => void;
  blockTarget: string;
}

export default function OverrideModal({ isOpen, onClose, blockTarget }: OverrideModalProps) {
  const [puzzleAnswer, setPuzzleAnswer] = useState('');
  const [puzzleQuestion, setPuzzleQuestion] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [waitTimer, setWaitTimer] = useState(0);
  const [isPuzzleSolved, setIsPuzzleSolved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generatePuzzle();
      setPuzzleAnswer('');
      setWaitTimer(0);
      setIsPuzzleSolved(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPuzzleSolved && waitTimer > 0) {
      timer = setInterval(() => {
        setWaitTimer((prev) => prev - 1);
      }, 1000);
    } else if (isPuzzleSolved && waitTimer === 0) {
      onClose(true); // Puzzle solved and wait time is over
    }
    return () => clearInterval(timer);
  }, [isPuzzleSolved, waitTimer, onClose]);

  const generatePuzzle = () => {
    // Simple math puzzle: addition of two random numbers
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setPuzzleQuestion(`${num1} + ${num2} = ?`);
    setCorrectAnswer((num1 + num2).toString());
  };

  const handlePuzzleSubmit = () => {
    if (puzzleAnswer.trim() === correctAnswer) {
      setIsPuzzleSolved(true);
      setWaitTimer(5); // 5-second wait for MVP
      toast.success('Puzzle solved! Waiting for override...');
    } else {
      toast.error('Incorrect answer. Try again!');
      generatePuzzle(); // Regenerate puzzle on failure
      setPuzzleAnswer('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Override Block for {blockTarget}</DialogTitle>
          <DialogDescription>
            Solve the puzzle to override this block.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="text-center text-lg font-semibold">
            {puzzleQuestion}
          </div>
          <Input
            id="puzzleAnswer"
            type="text"
            value={puzzleAnswer}
            onChange={(e) => setPuzzleAnswer(e.target.value)}
            placeholder="Your answer"
            className="col-span-3"
            disabled={isPuzzleSolved}
          />
          <Button onClick={handlePuzzleSubmit} disabled={isPuzzleSolved}>
            {isPuzzleSolved ? `Waiting... (${waitTimer}s)` : 'Submit Answer'}
          </Button>
        </div>
        <div className="text-center text-sm text-gray-500">
          {isPuzzleSolved && waitTimer > 0 && `Override will be active in ${waitTimer} seconds.`}
        </div>
      </DialogContent>
    </Dialog>
  );
}
