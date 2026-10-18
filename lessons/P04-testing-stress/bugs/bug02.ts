// Bug 02 · sắp từ theo tần suất. Code CÓ LỖI.
export function sortByFrequency(words: string[]): string[] {
  const cnt = new Map<string, number>();
  for (const w of words) cnt.set(w, (cnt.get(w) ?? 0) + 1);
  return [...cnt.keys()].sort((a, b) => cnt.get(b)! - cnt.get(a)!);
}
