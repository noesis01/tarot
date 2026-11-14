import { josa } from '../lib/josa'

// 점 치는 방법(스프레드)
// positions: 카드를 고른 순서대로 채워지는 자리
//   x, y   — 배치 좌표(카드 한 칸 단위, 소수 가능)
//   rot    — 회전 각도(켈틱 크로스의 가로지르는 카드)
//   noLabel — 자리 이름을 카드 아래에 표시하지 않음
// maxW: 펼쳐 놓을 때 카드 최대 너비(px)

export const SPREADS = [
  {
    id: 'one',
    icon: '☀️',
    title: '오늘의 한 장',
    desc: '오늘 하루를 비춰 줄 카드 한 장',
    placeholder: '예) 오늘 하루 어떤 마음으로 보내면 좋을까?',
    maxW: 190,
    positions: [{ label: '오늘의 메시지', hint: '오늘 하루 마음에 품고 다닐 메시지', x: 0, y: 0 }],
  },
  {
    id: 'yesno',
    icon: '🔮',
    title: '예 / 아니오',
    desc: '간단한 질문에 한 장으로 답해요',
    placeholder: '예) 이번 주말에 연락해 볼까?',
    maxW: 190,
    positions: [{ label: '카드의 대답', hint: '질문에 대한 카드의 대답', x: 0, y: 0 }],
  },
  {
    id: 'three',
    icon: '⏳',
    title: '과거 · 현재 · 미래',
    desc: '흐름을 읽는 클래식 3장 스프레드',
    placeholder: '예) 요즘 이직 고민…',
    maxW: 150,
    positions: [
      { label: '과거', hint: '지금을 만든 지난 흐름', x: 0, y: 0 },
      { label: '현재', hint: '지금 내가 서 있는 자리', x: 1, y: 0 },
      { label: '미래', hint: '이대로 간다면 다가올 흐름', x: 2, y: 0 },
    ],
  },
  {
    id: 'advice',
    icon: '🧭',
    title: '상황 · 장애물 · 조언',
    desc: '고민을 풀어 갈 실마리 찾기',
    placeholder: '예) 팀 프로젝트가 잘 안 풀려요',
    maxW: 150,
    positions: [
      { label: '상황', hint: '지금 벌어지고 있는 일', x: 0, y: 0 },
      { label: '장애물', hint: '발목을 잡고 있는 것', x: 1, y: 0 },
      { label: '조언', hint: '카드가 건네는 한 마디', x: 2, y: 0 },
    ],
  },
  {
    id: 'choice',
    icon: '🛤️',
    title: '갈림길',
    desc: 'A와 B 사이에서 고민될 때',
    placeholder: '예) 이직할까, 남을까?',
    hasOptions: true,
    maxW: 140,
    positions: [
      { label: '지금의 나', hint: '고민하고 있는 지금 나의 마음', x: 1, y: 1 },
      { label: 'A를 고르면', hint: 'A를 선택했을 때의 흐름', x: 0, y: 0, option: 'A' },
      { label: 'B를 고르면', hint: 'B를 선택했을 때의 흐름', x: 2, y: 0, option: 'B' },
    ],
  },
  {
    id: 'love',
    icon: '💞',
    title: '두 사람의 마음',
    desc: '연인·친구·동료, 누군가와의 관계가 궁금할 때',
    placeholder: '예) 요즘 그 사람과 나 사이',
    maxW: 125,
    positions: [
      { label: '나의 마음', hint: '이 관계를 바라보는 나의 마음', x: 0, y: 0 },
      { label: '상대의 마음', hint: '상대가 품고 있는 마음', x: 2, y: 0 },
      { label: '지금의 관계', hint: '두 사람 사이의 지금 분위기', x: 1, y: 0 },
      { label: '걸림돌', hint: '관계를 어렵게 하는 것', x: 0.5, y: 1 },
      { label: '앞으로', hint: '두 사람이 함께 갈 흐름', x: 1.5, y: 1 },
    ],
  },
  {
    id: 'horseshoe',
    icon: '🐴',
    title: '말굽',
    desc: '7장으로 상황을 넓게 훑어보기',
    placeholder: '예) 새로 시작한 일, 어떻게 흘러갈까?',
    maxW: 100,
    positions: [
      { label: '과거', hint: '지나온 흐름', x: 0, y: 0 },
      { label: '현재', hint: '지금의 상황', x: 0.5, y: 1 },
      { label: '숨은 영향', hint: '아직 드러나지 않은 요인', x: 1, y: 2 },
      { label: '장애물', hint: '넘어야 할 벽', x: 1.5, y: 3 },
      { label: '주변의 영향', hint: '주변 사람과 환경', x: 2, y: 2 },
      { label: '조언', hint: '취하면 좋을 태도', x: 2.5, y: 1 },
      { label: '결과', hint: '이대로 흘러갈 때의 결말', x: 3, y: 0 },
    ],
  },
  {
    id: 'celtic',
    icon: '☘️',
    title: '켈틱 크로스',
    desc: '10장으로 깊이 들여다보는 정통 스프레드',
    placeholder: '예) 올해 나의 커리어는?',
    maxW: 92,
    positions: [
      { label: '현재', hint: '지금 고민의 한가운데', x: 1.15, y: 1.5 },
      { label: '가로막는 것', hint: '현재를 가로지르는 도전 과제', x: 1.15, y: 1.5, rot: 90, noLabel: true },
      { label: '목표', hint: '의식하고 있는 바람과 목표', x: 1.15, y: 0.5 },
      { label: '뿌리', hint: '무의식, 이 일의 근본 원인', x: 1.15, y: 2.5 },
      { label: '지난 일', hint: '막 지나간 흐름', x: 0, y: 1.5 },
      { label: '가까운 미래', hint: '곧 다가올 일', x: 2.3, y: 1.5 },
      { label: '나의 태도', hint: '이 상황을 대하는 나', x: 3.5, y: 3 },
      { label: '주변 환경', hint: '주변 사람과 환경의 영향', x: 3.5, y: 2 },
      { label: '희망과 두려움', hint: '마음속 기대와 걱정', x: 3.5, y: 1 },
      { label: '최종 결과', hint: '이대로 흘러갈 때의 결론', x: 3.5, y: 0 },
    ],
  },
]

export const getSpread = (id) => SPREADS.find((s) => s.id === id) ?? SPREADS[0]

// 갈림길처럼 사용자가 선택지 이름을 적은 경우 자리 이름에 반영
export function resolvePositions(spread, { optionA = '', optionB = '' } = {}) {
  const names = { A: optionA.trim(), B: optionB.trim() }
  return spread.positions.map((p) => {
    const name = p.option && names[p.option]
    if (!name) return p
    return { ...p, label: `${josa(name, '을/를')} 고르면`, hint: `‘${name}’ 쪽을 선택했을 때의 흐름` }
  })
}

// 카드 배치 계산 — 스프레드 화면과 미리보기 썸네일이 함께 사용
export function layoutSpread(positions, { w, kx = 1.16, labelH = 0, gapY = 10 }) {
  const xs = positions.map((p) => p.x)
  const ys = positions.map((p) => p.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const spanX = Math.max(...xs) - minX
  const spanY = Math.max(...ys) - minY
  const h = w * 1.7
  const stepX = w * kx
  const stepY = h + labelH + gapY
  return {
    w,
    h,
    width: spanX * stepX + w,
    height: spanY * stepY + h + labelH,
    slots: positions.map((p) => ({
      left: (p.x - minX) * stepX,
      top: (p.y - minY) * stepY,
    })),
    spanX,
    spanY,
  }
}

// 주어진 폭에 맞는 카드 너비
export function fitCardWidth(positions, availW, maxW, { kx = 1.16, minW = 40 } = {}) {
  const xs = positions.map((p) => p.x)
  const spanX = Math.max(...xs) - Math.min(...xs)
  return Math.max(minW, Math.min(maxW, availW / (spanX * kx + 1)))
}
