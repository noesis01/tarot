import { MAJOR } from './major'
import { MINOR } from './minor'

// 카드 종류(덱 구성)
export const DECKS = [
  {
    id: 'major',
    title: '메이저 아르카나',
    en: 'Major Arcana',
    desc: '인생의 큰 흐름을 보여 주는 22장. 처음이라면 여기서부터!',
    cards: MAJOR,
  },
  {
    id: 'full',
    title: '풀 덱',
    en: 'Full Deck',
    desc: '메이저 22장 + 마이너 56장. 큰 흐름과 일상의 디테일을 함께',
    cards: [...MAJOR, ...MINOR],
  },
  {
    id: 'minor',
    title: '마이너 아르카나',
    en: 'Minor Arcana',
    desc: '완드·컵·소드·펜타클 네 수트. 일상의 구체적인 고민에',
    cards: MINOR,
  },
]

// 카드 디자인(그림 스타일)
export const CARD_STYLES = [
  { id: 'night', title: '밤하늘 금박', desc: '남보라 밤하늘에 금색 테두리' },
  { id: 'vintage', title: '빈티지 양피지', desc: '오래된 종이와 붉은 잉크' },
  { id: 'mono', title: '흑백 판화', desc: '먹선으로 찍어낸 모노톤' },
]

export const getDeck = (id) => DECKS.find((d) => d.id === id) ?? DECKS[0]
export const getStyle = (id) => CARD_STYLES.find((s) => s.id === id) ?? CARD_STYLES[0]
