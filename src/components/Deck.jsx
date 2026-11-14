import { useEffect, useMemo, useRef } from 'react'
import { CardBack } from './Card'
import { useWidth } from '../lib/useWidth'

// 덱을 여러 줄의 부채꼴로 펼친다. 폭이 넓으면 22장이 한 줄, 좁으면 여러 줄.
function fanLayout(N, W) {
  const cw = Math.round(Math.min(74, Math.max(46, W / 7.2)))
  const ch = cw * 1.7
  const usable = W - cw - 8
  let perRow = Math.max(3, Math.floor(usable / (cw * 0.52)) + 1)
  const rows = Math.ceil(N / perRow)
  perRow = Math.ceil(N / rows)
  const lift = 24 // 고른 카드가 떠오를 여유
  const arc = cw * 0.28
  const rowStep = ch * 0.68
  const items = []
  for (let i = 0; i < N; i++) {
    const row = Math.floor(i / perRow)
    const col = i % perRow
    const n = row === rows - 1 ? N - row * perRow : perRow
    const step = n > 1 ? Math.min(cw * 0.75, usable / (n - 1)) : 0
    const x0 = (W - ((n - 1) * step + cw)) / 2
    const t = n > 1 ? col / (n - 1) - 0.5 : 0
    const maxRot = Math.min(26, n * 1.3)
    items.push({ x: x0 + col * step, y: lift + row * rowStep + t * t * 4 * arc, rot: t * maxRot })
  }
  return { cw, items, height: lift + (rows - 1) * rowStep + ch + arc + 12 }
}

export default function Deck({ deck, picked, need, positions, styleId, question, onPick, onDone, onReshuffle, onHome }) {
  const ref = useRef(null)
  const W = useWidth(ref)
  const layout = useMemo(() => (W ? fanLayout(deck.length, W) : null), [deck.length, W])
  const remain = need - picked.length

  // 다 고르면 잠깐 보여 준 뒤 펼치기 화면으로
  useEffect(() => {
    if (remain !== 0) return
    const t = setTimeout(onDone, 800)
    return () => clearTimeout(t)
  }, [remain, onDone])

  const next = positions[picked.length]

  return (
    <section className="screen-pick">
      <header className="screen-head">
        {question && <p className="q-chip">“{question}”</p>}
        <h2>
          {remain > 0
            ? need === 1
              ? '마음이 끌리는 카드 한 장을 골라 주세요'
              : `카드를 ${remain}장 ${picked.length ? '더 ' : ''}골라 주세요`
            : '좋아요, 카드를 펼칠게요…'}
        </h2>
        <p className="muted" aria-live="polite">
          {remain > 0 && need > 1 ? (
            <>
              {picked.length + 1}번째 카드는 <b className="gold">‘{next.label}’</b> 자리에 놓여요
            </>
          ) : remain > 0 ? (
            `${deck.length}장 중에서 직감을 믿어 보세요`
          ) : (
            ' '
          )}
        </p>
      </header>

      <div className="fan" ref={ref} style={{ height: layout?.height ?? 240 }}>
        {layout &&
          deck.map((d, i) => {
            const p = layout.items[i]
            const order = picked.indexOf(i)
            const isPicked = order >= 0
            return (
              <button
                key={d.card.key}
                type="button"
                className={`fan-card ${isPicked ? 'is-picked' : ''}`}
                style={{
                  '--w': `${layout.cw}px`,
                  transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg)`,
                  zIndex: i,
                }}
                onClick={() => onPick(i)}
                disabled={remain === 0 && !isPicked}
                aria-pressed={isPicked}
                aria-label={isPicked ? `${order + 1}번째로 고른 카드 (다시 누르면 취소)` : `카드 ${i + 1}`}
              >
                <span className="fan-inner" style={{ animationDelay: `${Math.min(i * 14, 900)}ms` }}>
                  <CardBack styleId={styleId} />
                  {isPicked && <span className="fan-badge">{order + 1}</span>}
                </span>
              </button>
            )
          })}
      </div>

      <p className="muted small center">고른 카드를 다시 누르면 선택이 취소돼요.</p>
      <div className="actions">
        <button type="button" className="btn" onClick={onReshuffle}>
          다시 섞기
        </button>
        <button type="button" className="btn btn-ghost" onClick={onHome}>
          처음으로
        </button>
      </div>
    </section>
  )
}
