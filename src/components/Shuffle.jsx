import { useEffect } from 'react'
import { CardBack } from './Card'
import { prefersReducedMotion } from '../lib/useWidth'

// 뒷면 7장을 겹쳐 놓고 좌우로 엇갈리며 섞는 애니메이션
export default function Shuffle({ styleId, deckTitle, count, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, prefersReducedMotion() ? 400 : 1800)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <section className="screen-shuffle" aria-live="polite">
      <div className="shuffle-stack" style={{ '--w': '118px' }}>
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className={`shuffle-card ${i % 2 ? 'go-right' : 'go-left'}`}
            style={{ '--i': i, zIndex: i }}
          >
            <CardBack styleId={styleId} />
          </div>
        ))}
      </div>
      <p className="shuffle-text">
        카드를 섞고 있어요<span className="dots" />
      </p>
      <p className="muted small">
        {deckTitle} · {count}장
      </p>
    </section>
  )
}
