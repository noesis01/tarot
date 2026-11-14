import { useRef } from 'react'
import { FlipCard } from './Card'
import { useWidth } from '../lib/useWidth'
import { fitCardWidth, layoutSpread } from '../data/spreads'

const LABEL_H = 38

// 고른 카드를 자리(position)에 배치하고, 탭하면 하나씩 뒤집는다
export default function Spread({ spread, positions, drawn, flipped, styleId, question, onFlip, onFlipAll, onReading, onHome }) {
  const ref = useRef(null)
  const W = useWidth(ref)
  const w = W ? fitCardWidth(positions, W, spread.maxW) : 0
  const layout = w ? layoutSpread(positions, { w, labelH: LABEL_H, gapY: 12 }) : null
  const allFlipped = flipped.every(Boolean)
  const showNum = positions.length >= 5
  const labelW = Math.max(w * 1.16, 64)

  return (
    <section className="screen-reveal">
      <header className="screen-head">
        <p className="eyebrow">
          {spread.icon} {spread.title}
        </p>
        {question && <p className="q-chip">“{question}”</p>}
        <h2>{allFlipped ? '모든 카드가 펼쳐졌어요' : '카드를 눌러 한 장씩 뒤집어 보세요'}</h2>
        {spread.id === 'celtic' && (
          <p className="muted small">2번 카드는 1번 카드 위에 가로로 놓여요.</p>
        )}
      </header>

      <div className="spread-wrap" ref={ref}>
        {layout && (
          <div className="spread" style={{ width: layout.width, height: layout.height }}>
            {positions.map((p, i) => {
              const s = layout.slots[i]
              const d = drawn[i]
              const name = `${d.card.name}${d.reversed ? ' (역방향)' : ''}`
              return (
                <div
                  key={i}
                  className={`slot ${p.rot ? 'is-cross' : ''}`}
                  style={{
                    left: s.left,
                    top: s.top,
                    width: layout.w,
                    zIndex: p.rot ? 5 : 1,
                    animationDelay: `${i * 90}ms`,
                  }}
                >
                  <div className="slot-card" style={p.rot ? { transform: `rotate(${p.rot}deg) scale(.9)` } : undefined}>
                    <FlipCard
                      card={d.card}
                      reversed={d.reversed}
                      flipped={flipped[i]}
                      styleId={styleId}
                      w={layout.w}
                      onFlip={() => onFlip(i)}
                      ariaLabel={flipped[i] ? `${p.label}: ${name}` : `카드 뒤집기: ${p.label}`}
                    />
                    {showNum && <span className="slot-num">{i + 1}</span>}
                  </div>
                  {!p.noLabel && (
                    // 자리 이름을 눌러도 뒤집힌다 (가려진 카드도 쉽게 뒤집도록). 키보드는 카드 버튼으로 충분
                    <div className="slot-label" style={{ width: labelW, top: layout.h + 6 }} onClick={() => onFlip(i)}>
                      <b>{p.label}</b>
                      <span className={flipped[i] ? 'is-shown' : ''}>
                        {flipped[i] ? `${d.card.name}${d.reversed ? ' · 역' : ''}` : ' '}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="actions">
        {allFlipped ? (
          <button type="button" className="btn btn-primary btn-big appear" onClick={onReading}>
            해석 보기 →
          </button>
        ) : (
          positions.length > 1 && (
            <button type="button" className="btn" onClick={onFlipAll}>
              모두 뒤집기
            </button>
          )
        )}
        <button type="button" className="btn btn-ghost" onClick={onHome}>
          처음으로
        </button>
      </div>
    </section>
  )
}
