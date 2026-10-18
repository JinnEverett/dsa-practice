// Bug 07 · số đồng xu ít nhất để đổi `amount`; -1 nếu không thể. Code CÓ LỖI.
export function coinChange(coins: number[], amount: number): number {
  const sorted = [...coins].sort((a, b) => b - a);
  let count = 0;
  for (const c of sorted) {
    count += Math.floor(amount / c);
    amount %= c;
  }
  return amount === 0 ? count : -1;
}
