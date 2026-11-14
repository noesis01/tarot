// 고민 주제 — 카드별 연애/일·학업/금전 해석 중 무엇을 강조할지
export const TOPICS = [
  { id: 'general', icon: '🌙', title: '종합', label: '종합운' },
  { id: 'love', icon: '💕', title: '연애', label: '연애운' },
  { id: 'work', icon: '💼', title: '일·학업', label: '일·학업운' },
  { id: 'money', icon: '💰', title: '금전', label: '금전운' },
]

export const TOPIC_FIELDS = TOPICS.filter((t) => t.id !== 'general')

export const getTopic = (id) => TOPICS.find((t) => t.id === id) ?? TOPICS[0]

// '두 사람의 마음' 스프레드는 종합을 골라도 연애운 중심으로 풀어 준다
export const effectiveTopic = (topicId, spreadId) =>
  topicId === 'general' && spreadId === 'love' ? 'love' : topicId
