// 카드별 상세 해석 (카드 이야기, 자세한 정/역방향, 연애·일·금전운, 조언)
import major from './major'
import wands from './wands'
import cups from './cups'
import swords from './swords'
import pentacles from './pentacles'

const ALL = { ...major, ...wands, ...cups, ...swords, ...pentacles }

export const getDetail = (card) => ALL[card.key]

// 정/역방향에 맞는 문장 꺼내기
export function detailFor({ card, reversed }) {
  const d = ALL[card.key]
  if (!d) return null
  const i = reversed ? 1 : 0
  return {
    desc: d.desc,
    long: reversed ? d.rev : d.up,
    love: d.love[i],
    work: d.work[i],
    money: d.money[i],
    advice: d.advice[i],
  }
}
