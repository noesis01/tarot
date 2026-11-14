// Fisher–Yates 셔플
export function shuffle(arr, rand = Math.random) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// 셔플하면서 정/역방향을 미리 정해 둔다
export function buildDeck(cards, { reversals = true, reverseRate = 0.3 } = {}) {
  return shuffle(cards).map((card) => ({
    card,
    reversed: reversals && Math.random() < reverseRate,
  }))
}
