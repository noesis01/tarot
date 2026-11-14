import { DECKS, CARD_STYLES } from '../data/decks'
import { SPREADS, getSpread, layoutSpread } from '../data/spreads'
import { MAJOR } from '../data/major'
import { TOPICS } from '../data/topics'
import { StaticCard } from './Card'

// 스프레드 모양 미리보기(작은 직사각형 배치)
function SpreadMini({ spread }) {
  const ps = spread.positions
  const xs = ps.map((p) => p.x)
  const ys = ps.map((p) => p.y)
  const spanX = Math.max(...xs) - Math.min(...xs)
  const spanY = Math.max(...ys) - Math.min(...ys)
  const w = Math.min(15, 76 / (spanX * 1.16 + 1), 54 / (spanY * 1.95 + 1.7))
  const lay = layoutSpread(ps, { w, gapY: w * 0.25 })
  return (
    <span className="mini" aria-hidden="true">
      <span className="mini-inner" style={{ width: lay.width, height: lay.height }}>
        {lay.slots.map((s, i) => (
          <span
            key={i}
            className="mini-card"
            style={{
              left: s.left,
              top: s.top,
              width: w,
              height: lay.h,
              transform: ps[i].rot ? `rotate(${ps[i].rot}deg) scale(.9)` : undefined,
            }}
          />
        ))}
      </span>
    </span>
  )
}

const PREVIEW_CARD = MAJOR[17] // 별

export default function Intro({ settings, question, topic, optionA, optionB, onSettings, onField, onStart }) {
  const spread = getSpread(settings.spreadId)

  return (
    <div className="intro">
      <header className="hero">
        <div className="hero-moon" aria-hidden="true" />
        <h1>밤의 타로</h1>
        <p className="hero-en">Night Tarot</p>
        <p className="hero-sub">마음속 질문을 하나 떠올리고, 오늘의 카드를 만나 보세요.</p>
      </header>

      <section className="panel">
        <h2 className="panel-title">
          <span className="step-num">1</span> 점 치는 방법
        </h2>
        <div className="opt-grid spread-grid" role="radiogroup" aria-label="점 치는 방법">
          {SPREADS.map((s) => {
            const active = s.id === settings.spreadId
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={active}
                className={`opt spread-opt ${active ? 'is-active' : ''}`}
                onClick={() => onSettings({ spreadId: s.id })}
              >
                <SpreadMini spread={s} />
                <span className="opt-title">
                  <span className="opt-icon">{s.icon}</span> {s.title}
                </span>
                <span className="opt-count">{s.positions.length}장</span>
                <span className="opt-desc">{s.desc}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">
          <span className="step-num">2</span> 고민 <small>(선택)</small>
        </h2>
        <p className="field-label">어떤 운세가 궁금하세요?</p>
        <div className="topic-row" role="radiogroup" aria-label="고민 주제">
          {TOPICS.map((t) => {
            const active = t.id === topic
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={active}
                className={`topic-chip ${active ? 'is-active' : ''}`}
                onClick={() => onField('topic', t.id)}
              >
                <span aria-hidden="true">{t.icon}</span> {t.title}
              </button>
            )
          })}
        </div>
        {spread.id === 'love' && topic === 'general' && (
          <p className="help">‘두 사람의 마음’은 연애운 중심으로 풀어 드려요.</p>
        )}
        <p className="field-label">질문</p>
        <textarea
          className="question"
          rows={2}
          maxLength={120}
          value={question}
          placeholder={spread.placeholder}
          onChange={(e) => onField('question', e.target.value)}
          aria-label="질문"
        />
        {spread.id === 'yesno' && (
          <p className="help">‘예/아니오’로 답할 수 있는 질문일수록 잘 맞아요.</p>
        )}
        {spread.hasOptions && <p className="field-label">두 갈래 길의 이름</p>}
        {spread.hasOptions && (
          <div className="option-inputs">
            <label>
              <span className="tag">A</span>
              <input
                value={optionA}
                maxLength={20}
                placeholder="예) 이직"
                onChange={(e) => onField('optionA', e.target.value)}
              />
            </label>
            <label>
              <span className="tag">B</span>
              <input
                value={optionB}
                maxLength={20}
                placeholder="예) 지금 회사"
                onChange={(e) => onField('optionB', e.target.value)}
              />
            </label>
          </div>
        )}
      </section>

      <section className="panel">
        <h2 className="panel-title">
          <span className="step-num">3</span> 카드 종류
        </h2>
        <div className="opt-grid deck-grid" role="radiogroup" aria-label="카드 덱">
          {DECKS.map((d) => {
            const active = d.id === settings.deckId
            return (
              <button
                key={d.id}
                type="button"
                role="radio"
                aria-checked={active}
                className={`opt deck-opt ${active ? 'is-active' : ''}`}
                onClick={() => onSettings({ deckId: d.id })}
              >
                <span className="opt-title">{d.title}</span>
                <span className="opt-count">{d.cards.length}장</span>
                <span className="opt-desc">{d.desc}</span>
              </button>
            )
          })}
        </div>

        <h3 className="sub-title">카드 디자인</h3>
        <div className="opt-grid style-grid" role="radiogroup" aria-label="카드 디자인">
          {CARD_STYLES.map((st) => {
            const active = st.id === settings.styleId
            return (
              <button
                key={st.id}
                type="button"
                role="radio"
                aria-checked={active}
                className={`opt style-opt ${active ? 'is-active' : ''}`}
                onClick={() => onSettings({ styleId: st.id })}
              >
                <span className="style-preview">
                  <StaticCard back styleId={st.id} w={46} className="pv-back" />
                  <StaticCard card={PREVIEW_CARD} styleId={st.id} w={46} className="pv-front" />
                </span>
                <span className="opt-title">{st.title}</span>
                <span className="opt-desc">{st.desc}</span>
              </button>
            )
          })}
        </div>

        {CARD_STYLES.find((s) => s.id === settings.styleId)?.image && (
          <p className="muted small credit">
            그림: Pamela Colman Smith (1909) · 퍼블릭 도메인 · 스캔 출처 Wikimedia Commons
          </p>
        )}

        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.reversals}
            onChange={(e) => onSettings({ reversals: e.target.checked })}
          />
          <span className="toggle-track" aria-hidden="true">
            <span className="toggle-thumb" />
          </span>
          <span>
            역방향 카드 사용 <small>(약 30% 확률로 거꾸로 나와요)</small>
          </span>
        </label>
      </section>

      <div className="cta-bar">
        <button type="button" className="btn btn-primary btn-big" onClick={onStart}>
          카드 섞기 ✦
        </button>
      </div>
    </div>
  )
}
