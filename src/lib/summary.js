// 스프레드 전체 풀이 만들기 (템플릿 기반, 재미용)
import { particle } from './josa'
import { SUITS } from '../data/minor'
import { detailFor } from '../data/details'
import { getTopic, effectiveTopic } from '../data/topics'

export const YN_INFO = {
  y: { label: '예', en: 'YES', text: '긍정적인 쪽으로 기울어 있어요. 마음먹은 대로 움직여 봐도 좋겠어요.' },
  n: { label: '아니오', en: 'NO', text: '지금은 아닐 수 있어요. 서두르기보다 다른 길도 함께 살펴보세요.' },
  m: { label: '글쎄요', en: 'MAYBE', text: '아직 정해지지 않았어요. 상황이 조금 더 분명해지면 다시 물어보세요.' },
}

// 정방향이면 카드 본래 성향, 역방향이면 한 단계 어둡게(예→아니오, 아니오→글쎄요)
export function yesNoOf({ card, reversed }) {
  if (!reversed) return card.yn
  return card.yn === 'y' ? 'n' : 'm'
}

// 밝기 점수: 정/역 + 카드 성향
export function scoreOf(d) {
  const yn = d.card.yn
  return (d.reversed ? -1 : 1) + (yn === 'y' ? 1 : yn === 'n' ? -1 : 0)
}

// ───── 문장 조각 ─────
const kw = (d) => d.card.keywords[0]
// ‘단어’ + 조사
const q = (word, pair) => `‘${word}’${pair ? particle(word, pair) : ''}`
// 카드 이름(+역방향) + 조사 — 예: ‘별’ 역방향이
const nm = (d, pair) => {
  const tail = d.reversed ? '역방향' : d.card.name
  return `‘${d.card.name}’${d.reversed ? ' 역방향' : ''}${pair ? particle(tail, pair) : ''}`
}
const short = (d) => (d.reversed ? d.card.reversed : d.card.upright)

// 스프레드별 핵심 카드(결론 자리)와 조언 카드
const KEY_INDEX = { one: 0, yesno: 0, three: 2, advice: 2, choice: 0, love: 4, horseshoe: 6, celtic: 9 }
const ADVICE_INDEX = { advice: 2, horseshoe: 5 }
// 주제별 풀이에 쓸 자리
const TOPIC_INDEX = { choice: [1, 2] }

function toneLine(drawn) {
  const up = drawn.filter((d) => !d.reversed).length
  const down = drawn.length - up
  if (down === 0) return '모든 카드가 정방향으로 나왔어요. 전반적으로 순풍이 부는 흐름이에요.'
  if (up === 0) return '모든 카드가 역방향으로 나왔어요. 잠시 숨 고르기가 필요한 흐름이니, 쉬어 가도 괜찮아요.'
  if (up > down) return `정방향 ${up}장, 역방향 ${down}장으로 밝은 기운이 더 커요. 전반적으로 순풍이 부는 흐름이에요.`
  if (down > up) return `정방향 ${up}장, 역방향 ${down}장으로 그늘이 조금 더 짙어요. 잠시 숨 고르기가 필요한 흐름이에요.`
  return `정방향과 역방향이 ${up}장씩 반반이에요. 밝은 기운과 그늘 사이에서 균형을 잡아 가는 중이에요.`
}

function deckLines(drawn, deckId) {
  const lines = []
  const majors = drawn.filter((d) => d.card.arcana === 'major').length
  if (deckId === 'full' && drawn.length >= 3) {
    if (majors / drawn.length >= 0.5)
      lines.push(`메이저 아르카나가 ${majors}장이나 나왔어요. 개인의 노력만으로는 설명되지 않는, 인생의 큰 흐름이 움직이고 있다는 신호예요.`)
    else if (majors === 0 && drawn.length >= 5)
      lines.push('메이저 아르카나가 한 장도 없어요. 운명보다는 내 선택과 일상의 노력이 결과를 좌우하는 흐름이에요.')
  }

  const minors = drawn.filter((d) => d.card.arcana === 'minor')
  if (minors.length >= 2) {
    const counts = SUITS.map((s) => ({ suit: s, n: minors.filter((d) => d.card.suit === s.id).length }))
    counts.sort((a, b) => b.n - a.n)
    const [top, second] = counts
    if (top.n >= 2 && top.n > second.n) {
      lines.push(
        `${top.suit.element}의 원소인 ${top.suit.ko} 카드가 ${top.n}장 나왔어요. ${top.suit.theme}${particle(top.suit.theme, '이/가')} 이번 고민의 중심에 있어요.`,
      )
    }
    const courts = minors.filter((d) => d.card.rank >= 11).length
    if (courts >= 2) lines.push('인물 카드가 여러 장 나왔어요. 주변 사람들이 이 일에서 중요한 역할을 할 거예요.')
    if (drawn.length >= 3 && minors.some((d) => d.card.rank === 1))
      lines.push('에이스는 새로운 시작의 씨앗이에요. 무언가가 막 싹트려 하고 있어요.')
  }
  return lines
}

function yesNoReason(d) {
  const name = `‘${d.card.name}’`
  const base = d.card.yn
  const p = (pair) => particle(d.card.name, pair)
  if (base === 'm') return `${name}${p('은/는')} 답을 잠시 미뤄 두는 성격의 카드예요. 아직 결정되지 않은 흐름이라 대답은 ‘글쎄요’예요.`
  if (base === 'y')
    return d.reversed
      ? `${name}${p('은/는')} 본래 밝은 기운을 지닌 카드지만 거꾸로 나와서, 지금은 그 힘이 잠시 막혀 있어요. 그래서 대답은 ‘아니오’ 쪽으로 기울어요.`
      : `${name}${p('은/는')} 본래 밝은 기운을 지닌 카드인데, 바로 선 모습으로 나왔어요. 그래서 대답은 ‘예’ 쪽으로 기울어요.`
  return d.reversed
    ? `조심하라는 신호를 담은 ${name}${p('이/가')} 거꾸로 나와 그 힘이 약해졌어요. 상황이 바뀌는 중이라 대답은 ‘글쎄요’에 가까워요.`
    : `${name}${p('은/는')} 조심하라는 신호를 담은 카드예요. 바로 선 모습으로 나와 이번 대답은 ‘아니오’ 쪽으로 기울어요.`
}

// 스프레드별 이야기 — { flow: 이야기 문단들, notes: 덧붙이는 한 줄들, answer? }
const BY_SPREAD = {
  one([d]) {
    const kws = d.card.keywords
    const last = kws[kws.length - 1]
    return {
      flow: [
        `오늘 당신에게 찾아온 카드는 ${nm(d, '이에요/예요')}. ${short(d)}`,
        `${kws.map((k) => `‘${k}’`).join(', ')}${particle(last, '이라는/라는')} 키워드를 마음 한쪽에 품고 하루를 보내 보세요. ${
          d.reversed
            ? '역방향으로 나온 만큼 오늘은 속도를 조금 늦추고, 나를 다독이는 데 마음을 써 주세요.'
            : '정방향으로 나왔으니 이 카드의 기운을 마음껏 누려도 좋아요.'
        }`,
      ],
      notes: [],
    }
  },

  yesno([d]) {
    const yn = yesNoOf(d)
    return {
      answer: { key: yn, ...YN_INFO[yn] },
      flow: [yesNoReason(d), `${YN_INFO[yn].text} ${short(d)}`],
      notes: [],
    }
  },

  three([past, present, future]) {
    const sp = scoreOf(past)
    const sf = scoreOf(future)
    return {
      flow: [
        `과거 자리의 ${nm(past, '은/는')} ${q(kw(past))}의 기운으로 지금까지의 흐름을 만들어 왔어요. 현재의 ${nm(present, '은/는')} ${q(kw(present))} — 지금 당신이 서 있는 자리를 보여 주고, 미래의 ${nm(future, '은/는')} ${q(kw(future))}의 방향으로 이야기가 이어질 것을 암시해요.`,
        sf > sp
          ? '과거보다 미래 카드가 밝아요. 지금은 조금 힘들더라도 점점 나아지는 흐름이니, 지금 걷고 있는 길을 믿어 보세요.'
          : sf < sp
            ? '미래 카드가 과거보다 조금 흐려요. 하지만 미래는 정해진 결말이 아니라 지금의 선택이 만드는 것이에요. 현재 카드의 메시지를 실마리 삼아 방향을 한 번 점검해 보세요.'
            : '과거와 미래의 기운이 비슷하게 이어져요. 큰 기복 없이 흐르는 시기이니, 지금의 페이스를 차분히 지켜 보세요.',
      ],
      notes: [],
    }
  },

  advice([situation, obstacle, advice]) {
    return {
      flow: [
        `지금 상황은 ${nm(situation, '으로/로')} 나타났어요. 한마디로 ${q(kw(situation), '으로/로')} 요약할 수 있는 상태예요. 그 길을 막고 있는 건 ${nm(obstacle, '이/가')} 상징하는 ${q(kw(obstacle), '이에요/예요')}. 그리고 카드는 ${nm(advice, '을/를')} 통해 ${q(kw(advice), '을/를')} 실마리로 건네고 있어요.`,
      ],
      notes: [
        obstacle.reversed
          ? '장애물 카드가 역방향이라, 걸림돌의 힘이 약해지고 있어요. 생각보다 쉽게 풀릴 수 있어요.'
          : '장애물 카드가 정방향이라 지금은 그 벽이 꽤 단단해요. 정체를 알았으니 반은 넘은 셈이에요.',
        ...(advice.reversed ? ['조언 카드가 역방향이니, 무엇을 더 할지보다 무엇을 그만둘지부터 정리해 보면 좋아요.'] : []),
      ],
    }
  },

  choice([me, a, b], { optionA, optionB }) {
    const nameA = optionA?.trim() || 'A'
    const nameB = optionB?.trim() || 'B'
    const sa = scoreOf(a)
    const sb = scoreOf(b)
    return {
      flow: [
        `지금의 당신에게는 ${nm(me, '이/가')} 놓였어요. ${q(kw(me))}의 마음으로 갈림길 앞에 서 있네요. ${q(nameA, '을/를')} 고르면 ${nm(a, '이/가')} 보여 주는 ${q(kw(a))}의 흐름이, ${q(nameB, '을/를')} 고르면 ${nm(b, '이/가')} 보여 주는 ${q(kw(b))}의 흐름이 기다리고 있어요.`,
        sa > sb
          ? `두 카드를 견주어 보면 ${q(nameA)} 쪽이 조금 더 밝아 보여요. 다만 이건 ‘정답’이라기보다 지금 시점의 기운이에요.`
          : sb > sa
            ? `두 카드를 견주어 보면 ${q(nameB)} 쪽이 조금 더 밝아 보여요. 다만 이건 ‘정답’이라기보다 지금 시점의 기운이에요.`
            : '두 길의 기운이 비슷해요. 결국 마음이 더 설레는 쪽이 정답일 거예요.',
      ],
      notes: [`어느 길을 고르든 지금 당신에게 필요한 건 ${q(kw(me), '이에요/예요')}.`],
    }
  },

  love([mine, theirs, rel, obs, fut]) {
    const open = [mine, theirs].filter((d) => !d.reversed).length
    return {
      flow: [
        `당신의 마음 자리에는 ${nm(mine, '이/가')}, 상대의 마음 자리에는 ${nm(theirs, '이/가')} 나왔어요. 각각 ${q(kw(mine), '과/와')} ${q(kw(theirs))}의 기운이에요. 두 사람 사이의 지금은 ${nm(rel, '이/가')} 보여 주는 ${q(kw(rel))}, 관계를 어렵게 하는 건 ${q(kw(obs))}, 그리고 앞으로의 흐름에는 ${nm(fut, '이/가')} 놓였어요.`,
        open === 2
          ? '두 사람 모두 마음이 열려 있는 상태예요. 지금이라면 솔직한 표현이 관계를 한 걸음 더 가깝게 만들어 줄 거예요.'
          : open === 1
            ? '한쪽의 마음이 조금 닫혀 있거나 지쳐 있어요. 서두르기보다 서로의 속도를 맞춰 주는 게 먼저예요.'
            : '둘 다 지금은 조금 지쳐 있네요. 무언가를 해결하려 하기보다 서로에게 여유를 주는 시간이 필요해요.',
      ],
      notes: [
        scoreOf(fut) > 0
          ? '앞으로의 흐름은 따뜻한 쪽을 가리키고 있어요.'
          : '앞으로는 솔직한 대화가 관계의 열쇠가 될 거예요.',
      ],
    }
  },

  horseshoe(drawn) {
    const [past, present, hidden, obstacle, others, advice, outcome] = drawn
    return {
      flow: [
        `과거의 ${nm(past)}에서 시작된 흐름이 현재의 ${nm(present, '으로/로')} 이어지고 있어요. 그 아래에서는 ${nm(hidden, '이/가')} 아직 드러나지 않은 영향으로 작용하고, 넘어야 할 벽은 ${q(kw(obstacle), '이에요/예요')}. 주변에서는 ${nm(others)}의 기운이 다가오고 있네요.`,
        `카드는 ${nm(advice, '을/를')} 조언으로, ${nm(outcome, '을/를')} 결과로 보여 줘요. ${
          scoreOf(outcome) > 0
            ? '결과 카드가 밝은 쪽을 가리키고 있으니, 조언을 따라 지금처럼 나아가면 좋은 결말을 기대해도 좋아요.'
            : '결과 카드가 아직 흐릿해요. 하지만 조언 카드의 메시지를 따르면 흐름을 충분히 바꿀 수 있어요.'
        }`,
      ],
      notes: [],
    }
  },

  celtic(drawn) {
    const [now, cross, goal, root, past, soon, self, env, hope, outcome] = drawn
    return {
      flow: [
        `지금 고민의 한가운데에는 ${nm(now, '이/가')} 있고, ${nm(cross, '이/가')} 그 위를 가로지르며 도전 과제를 던지고 있어요. 의식하고 있는 목표는 ${nm(goal, '이고/고')}, 마음 깊은 뿌리에는 ${nm(root, '이/가')} 자리 잡고 있네요. 막 지나간 ${nm(past)}의 흐름은 곧 ${nm(soon, '으로/로')} 이어질 거예요.`,
        `당신은 ${nm(self)}의 태도로 상황을 마주하고 있고, 주변에서는 ${nm(env)}의 영향이 느껴져요. 마음속 희망과 두려움 자리에는 ${nm(hope, '이/가')}, 그리고 최종 결과 자리에는 ${nm(outcome, '이/가')} 놓여 이 여정의 도착지를 비춰 줘요. ${
          scoreOf(outcome) > 0
            ? '결과 카드가 밝게 빛나고 있어요. 지금의 방향을 믿고 나아가도 좋아요.'
            : '결말은 아직 열려 있어요. 지금의 선택과 태도가 결과를 바꿀 수 있답니다.'
        }`,
      ],
      notes: [
        `희망과 두려움 자리의 키워드는 ${q(kw(hope), '이에요/예요')}. 바라는 마음과 걱정이 사실은 같은 곳을 향하고 있을지도 몰라요.`,
      ],
    }
  },
}

export function summarize({ spread, deckId, drawn, positions, question, topic = 'general', optionA, optionB }) {
  const res = BY_SPREAD[spread.id]?.(drawn, { optionA, optionB }) ?? { flow: [], notes: [] }
  const n = drawn.length

  const intro = question
    ? `“${question}” — 이 질문에 카드가 들려준 이야기를 차근차근 풀어 볼게요.`
    : n === 1
      ? `${spread.title} 카드가 들려준 이야기를 풀어 볼게요.`
      : `${spread.title} 스프레드로 펼친 ${n}장의 카드가 들려준 이야기를 차근차근 풀어 볼게요.`

  const energy = n >= 3 ? [toneLine(drawn), ...deckLines(drawn, deckId)] : deckLines(drawn, deckId)

  // 주제별 풀이
  const topicId = effectiveTopic(topic, spread.id)
  let topicPart = null
  if (topicId !== 'general') {
    const t = getTopic(topicId)
    const idxs = TOPIC_INDEX[spread.id] ?? [KEY_INDEX[spread.id] ?? n - 1]
    const items = idxs
      .map((i) => ({ label: positions[i]?.label, d: drawn[i], text: detailFor(drawn[i])?.[topicId] }))
      .filter((x) => x.text)
    if (items.length) topicPart = { title: `${t.icon} ${t.label}으로 보면`, items }
  }

  // 핵심 카드와 조언
  const keyIdx = KEY_INDEX[spread.id] ?? n - 1
  const adviceIdx = ADVICE_INDEX[spread.id] ?? keyIdx
  const key = n > 1 ? { label: positions[keyIdx]?.label, d: drawn[keyIdx], text: short(drawn[keyIdx]) } : null
  const adviceText = detailFor(drawn[adviceIdx])?.advice ?? null

  return {
    answer: res.answer,
    intro,
    flow: res.flow,
    notes: res.notes,
    energy,
    topic: topicPart,
    key,
    advice: adviceText && { label: positions[adviceIdx]?.label, d: drawn[adviceIdx], text: adviceText },
  }
}
