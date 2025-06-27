import { useState, useEffect } from 'react';
import { getActiveBlocks } from '@/lib/blocks';
import { useSession } from '@/lib/auth';

interface UseBlockStatusProps {
  target: string;
}

interface BlockStatus {
  isBlocked: boolean;
  reason: "forever" | "temporary" | "expired" | null;
  blockedUntil: Date | null;
}

const useBlockStatus = ({ target }: UseBlockStatusProps): BlockStatus => {
  const [blockStatus, setBlockStatus] = useState<BlockStatus>({
    isBlocked: false,
    reason: null,
    blockedUntil: null,
  });
  const { session, isLoading } = useSession();

  useEffect(() => {
    if (!session?.user?.id || isLoading) {
      setBlockStatus({ isBlocked: false, reason: null, blockedUntil: null });
      return;
    }

    const fetchBlockStatus = async () => {
      try {
        const userId = session.user.id;
        const blocks = await getActiveBlocks(userId);
        const now = new Date();

        const matchingBlock = blocks.find((block) => block.target === target);

        if (!matchingBlock) {
          setBlockStatus({ isBlocked: false, reason: null, blockedUntil: null });
          return;
        }

        if (matchingBlock.type === 'forever') {
          setBlockStatus({ isBlocked: true, reason: 'forever', blockedUntil: null });
          return;
        }

        if (matchingBlock.type === 'temporary' && matchingBlock.blocked_until) {
          const blockedUntilDate = new Date(matchingBlock.blocked_until);
          if (blockedUntilDate > now) {
            setBlockStatus({ isBlocked: true, reason: 'temporary', blockedUntil: blockedUntilDate });
            return;
          }
        }

        setBlockStatus({ isBlocked: false, reason: 'expired', blockedUntil: null });

      } catch (error) {
        console.error('Error fetching block status:', error);
        setBlockStatus({ isBlocked: false, reason: null, blockedUntil: null });
      }
    };

    fetchBlockStatus();
  }, [target, session, isLoading]);

  return blockStatus;
};

export default useBlockStatus;
