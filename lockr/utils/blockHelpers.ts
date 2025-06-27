// Placeholder for block-related utility functions
export const isBlocked = (url: string) => {
  // TODO: Implement actual blocking logic
  return false;
};

export const getRemainingTime = (endTime: number) => {
  const now = Date.now();
  const remaining = endTime - now;
  return remaining > 0 ? remaining : 0;
};
