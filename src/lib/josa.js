// 한국어 조사 붙이기: josa('사과', '을/를') → '사과를'

// 마지막 글자의 받침 번호(0 = 받침 없음, 8 = ㄹ). 한글이 아니면 숫자 읽기로 추정
function jong(word) {
  const s = String(word).trim()
  const ch = s[s.length - 1]
  if (!ch) return 0
  const code = ch.charCodeAt(0)
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28
  // 영·일·삼·육·칠·팔 → 받침 있음 (일·칠·팔은 ㄹ)
  if (/[0-9]/.test(ch)) return { 0: 21, 1: 8, 3: 16, 6: 1, 7: 8, 8: 8 }[ch] ?? 0
  return 0
}

export const hasBatchim = (word) => jong(word) !== 0

export function particle(word, pair) {
  const [withBatchim, without] = pair.split('/')
  const j = jong(word)
  if (pair === '으로/로') return j === 0 || j === 8 ? without : withBatchim
  return j ? withBatchim : without
}

export const josa = (word, pair) => `${word}${particle(word, pair)}`
