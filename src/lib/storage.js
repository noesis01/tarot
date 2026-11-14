// localStorage는 막혀 있을 수 있으므로 항상 try/catch
const KEY = 'night-tarot:settings'

export const DEFAULT_SETTINGS = {
  spreadId: 'three',
  deckId: 'major',
  styleId: 'rws',
  reversals: true,
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings))
  } catch {
    /* 저장 실패는 무시 */
  }
}
