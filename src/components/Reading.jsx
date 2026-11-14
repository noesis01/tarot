import { useMemo } from 'react'
import { StaticCard } from './Card'
import { summarize } from '../lib/summary'
import { detailFor } from '../data/details'
import { TOPIC_FIELDS, getTopic, effectiveTopic } from '../data/topics'

// 분야별 운세 — 종합이면 셋 다, 주제를 골랐으면 그 주제를 강조하고 나머지는 접어 둔다
function TopicBlock({ det, topicId }) {
  if (topicId === 'general') {
    return (
      <section className="ri-sec">
        <h4>🌙 분야별 운세</h4>
        <dl className="ri-topics">
          {TOPIC_FIELDS.map((t) => (
            <div key={t.id} className="ri-topic">
              <dt>
                {t.icon} {t.label}
              </dt>
              <dd>{det[t.id]}</dd>
            </div>
          ))}
        </dl>
      </section>
    )
  }
  const t = getTopic(topicId)
  const others = TOPIC_FIELDS.filter((o) => o.id !== topicId)
  return (
    <>
      <section className="ri-sec ri-focus">
        <h4>
          {t.icon} {t.label}
        </h4>
        <p>{det[topicId]}</p>
      </section>
      <details className="ri-more">
        <summary>다른 운세도 보기</summary>
        <dl className="ri-topics">
          {others.map((o) => (
            <div key={o.id} className="ri-topic">
              <dt>
                {o.icon} {o.label}
              </dt>
              <dd>{det[o.id]}</dd>
            </div>
          ))}
        </dl>
      </details>
    </>
  )
}

const cardName = (d) => `‘${d.card.name}’${d.reversed ? ' 역방향' : ''}`

// 카드별 해석 + 스프레드 전체 풀이
export default function Reading({ spread, deck, positions, drawn, styleId, question, topic, optionA, optionB, onAgain, onHome }) {
  const topicId = effectiveTopic(topic, spread.id)
  const sum = useMemo(
    () => summarize({ spread, deckId: deck.id, drawn, positions, question, topic, optionA, optionB }),
    [spread, deck.id, drawn, positions, question, topic, optionA, optionB],
  )

  return (
    <section className="screen-reading">
      <header className="screen-head">
        <p className="eyebrow">
          {spread.icon} {spread.title} · {deck.title}
          {topicId !== 'general' && ` · ${getTopic(topicId).label}`}
        </p>
        <h2>카드가 전하는 이야기</h2>
        {question && <p className="q-chip">“{question}”</p>}
      </header>

      {sum.answer && (
        <div className={`yn-answer yn-${sum.answer.key}`}>
          <span className="yn-en">{sum.answer.en}</span>
          <strong>{sum.answer.label}</strong>
        </div>
      )}

      <section className="panel summary">
        <h3>✦ 전체 흐름</h3>
        <p className="sum-intro">{sum.intro}</p>
        {sum.flow.map((t, i) => (
          <p key={i}>{t}</p>
        ))}
        {sum.notes.length > 0 && (
          <ul className="sum-notes">
            {sum.notes.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        )}

        {sum.energy.length > 0 && (
          <div className="sum-block">
            <h4>🔭 카드의 기운</h4>
            <p>{sum.energy.join(' ')}</p>
          </div>
        )}

        {sum.topic && (
          <div className="sum-block">
            <h4>{sum.topic.title}</h4>
            {sum.topic.items.map((it, i) => (
              <p key={i}>
                {sum.topic.items.length > 1 ? (
                  <b className="gold">{it.label} — </b>
                ) : (
                  <b className="gold">
                    {it.label} 자리의 {cardName(it.d)} —{' '}
                  </b>
                )}
                {it.text}
              </p>
            ))}
          </div>
        )}

        {(sum.key || sum.advice) && (
          <div className="sum-callouts">
            {sum.key && (
              <div className="sum-callout">
                <span className="sum-callout-label">🔑 이번 리딩의 열쇠</span>
                <p>
                  <b>
                    {sum.key.label} · {cardName(sum.key.d)}
                  </b>
                  <br />
                  {sum.key.text}
                </p>
              </div>
            )}
            {sum.advice && (
              <div className="sum-callout is-advice">
                <span className="sum-callout-label">✦ 카드의 조언</span>
                <p>{sum.advice.text}</p>
              </div>
            )}
          </div>
        )}
        <p className="disclaimer">타로는 재미로만 봐주세요 🌙</p>
      </section>

      <h3 className="list-title">카드별 자세한 풀이</h3>
      <ol className="reading-list">
        {drawn.map((d, i) => {
          const p = positions[i]
          const c = d.card
          const det = detailFor(d)
          return (
            <li key={c.key} className="panel reading-item" style={{ animationDelay: `${i * 70}ms` }}>
              <div className="ri-head">
                <StaticCard card={c} reversed={d.reversed} styleId={styleId} w={88} />
                <div className="ri-headtext">
                  <p className="ri-pos">
                    {drawn.length > 1 && <span className="ri-num">{i + 1}</span>}
                    <b>{p.label}</b>
                    <span className="ri-hint">{p.hint}</span>
                  </p>
                  <h3 className="ri-name">
                    {c.name} <small>{c.en}</small>
                  </h3>
                  <p className="ri-tags">
                    <span className={`badge ${d.reversed ? 'is-rev' : 'is-up'}`}>
                      {d.reversed ? '역방향' : '정방향'}
                    </span>
                    {c.keywords.map((k) => (
                      <span key={k} className="chip">
                        {k}
                      </span>
                    ))}
                  </p>
                  <p className="ri-lead">{d.reversed ? c.reversed : c.upright}</p>
                </div>
              </div>

              {det && (
                <div className="ri-detail">
                  <section className="ri-sec">
                    <h4>📜 카드 이야기</h4>
                    <p className="ri-desc">{det.desc}</p>
                  </section>
                  <section className="ri-sec">
                    <h4>🔮 {d.reversed ? '역방향' : '정방향'} 해석</h4>
                    <p>{det.long}</p>
                  </section>
                  <TopicBlock det={det} topicId={topicId} />
                  <p className="ri-advice">
                    <span>✦ 카드의 조언</span>
                    {det.advice}
                  </p>
                </div>
              )}
            </li>
          )
        })}
      </ol>

      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={onAgain}>
          같은 방법으로 다시 보기
        </button>
        <button type="button" className="btn btn-ghost" onClick={onHome}>
          처음으로
        </button>
      </div>
    </section>
  )
}
