export function calculateEqualSplits(
  amount: number,
  participants: string[],
): Record<string, number> {
  const share = parseFloat((amount / participants.length).toFixed(2));
  const splits: Record<string, number> = {};
  let distributed = 0;

  participants.forEach((userId, index) => {
    if (index === participants.length - 1) {
      splits[userId] = parseFloat((amount - distributed).toFixed(2));
    } else {
      splits[userId] = share;
      distributed += share;
    }
  });

  return splits;
}
