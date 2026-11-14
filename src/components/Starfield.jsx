import { memo, useMemo } from 'react'

// 배경 밤하늘 — 반짝이는 별 + 가끔 지나가는 별똥별
function Starfield() {
  const stars = useMemo(
    () =>
      Array.from({ length: 90 }, () => {
        const big = Math.random() < 0.15
        return {
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: big ? 2 + Math.random() * 1.4 : 0.8 + Math.random() * 1.2,
          delay: Math.random() * 6,
          dur: 2.5 + Math.random() * 4,
          gold: Math.random() < 0.18,
        }
      }),
    [],
  )
  return (
    <div className="starfield" aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          className={`star ${s.gold ? 'gold' : ''}`}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
          }}
        />
      ))}
      <span className="shooting" />
    </div>
  )
}

export default memo(Starfield)
