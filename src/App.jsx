import { useCallback, useEffect, useMemo, useReducer } from 'react'
import Starfield from './components/Starfield'
import Intro from './components/Intro'
import Shuffle from './components/Shuffle'
import Deck from './components/Deck'
import Spread from './components/Spread'
import Reading from './components/Reading'
import { getDeck } from './data/decks'
import { getSpread, resolvePositions } from './data/spreads'
import { buildDeck } from './lib/shuffle'
import { loadSettings, saveSettings } from './lib/storage'

// 화면 흐름: intro → shuffle → pick → reveal → reading
const init = () => ({
  step: 'intro',
  settings: loadSettings(),
  question: '',
  topic: 'general', // 종합 / love / work / money
  optionA: '',
  optionB: '',
  deck: [], // 셔플된 덱 [{ card, reversed }]
  picked: [], // 고른 순서대로 deck 인덱스
  flipped: [], // 자리별 뒤집힘 여부
  round: 0,
})

function reducer(state, action) {
  const need = getSpread(state.settings.spreadId).positions.length
  switch (action.type) {
    case 'settings':
      return { ...state, settings: { ...state.settings, ...action.patch } }
    case 'field':
      return { ...state, [action.name]: action.value }
    case 'start': {
      const deck = buildDeck(getDeck(state.settings.deckId).cards, { reversals: state.settings.reversals })
      return { ...state, step: 'shuffle', deck, picked: [], flipped: [], round: state.round + 1 }
    }
    case 'shuffled':
      return state.step === 'shuffle' ? { ...state, step: 'pick' } : state
    case 'pick': {
      if (state.step !== 'pick') return state
      const { index } = action
      if (state.picked.includes(index)) return { ...state, picked: state.picked.filter((i) => i !== index) }
      if (state.picked.length >= need) return state
      return { ...state, picked: [...state.picked, index] }
    }
    case 'reveal':
      return state.step === 'pick' && state.picked.length === need
        ? { ...state, step: 'reveal', flipped: Array(need).fill(false) }
        : state
    case 'flip':
      return { ...state, flipped: state.flipped.map((f, i) => (i === action.slot ? true : f)) }
    case 'flipAll':
      return { ...state, flipped: state.flipped.map(() => true) }
    case 'reading':
      return { ...state, step: 'reading' }
    case 'home':
      return { ...state, step: 'intro', deck: [], picked: [], flipped: [] }
    default:
      return state
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, init)
  const { step, settings, question, topic, optionA, optionB } = state

  const spread = getSpread(settings.spreadId)
  const deckDef = getDeck(settings.deckId)
  const positions = useMemo(() => resolvePositions(spread, { optionA, optionB }), [spread, optionA, optionB])
  const drawn = useMemo(() => state.picked.map((i) => state.deck[i]), [state.picked, state.deck])
  const q = question.trim()

  useEffect(() => {
    saveSettings(settings)
  }, [settings])
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step])

  const onShuffled = useCallback(() => dispatch({ type: 'shuffled' }), [])
  const onReveal = useCallback(() => dispatch({ type: 'reveal' }), [])
  const start = () => dispatch({ type: 'start' })
  const home = () => dispatch({ type: 'home' })

  let screen
  if (step === 'intro') {
    screen = (
      <Intro
        settings={settings}
        question={question}
        topic={topic}
        optionA={optionA}
        optionB={optionB}
        onSettings={(patch) => dispatch({ type: 'settings', patch })}
        onField={(name, value) => dispatch({ type: 'field', name, value })}
        onStart={start}
      />
    )
  } else if (step === 'shuffle') {
    screen = (
      <Shuffle
        styleId={settings.styleId}
        deckTitle={deckDef.title}
        count={state.deck.length}
        onDone={onShuffled}
      />
    )
  } else if (step === 'pick') {
    screen = (
      <Deck
        key={state.round}
        deck={state.deck}
        picked={state.picked}
        need={positions.length}
        positions={positions}
        styleId={settings.styleId}
        question={q}
        onPick={(index) => dispatch({ type: 'pick', index })}
        onDone={onReveal}
        onReshuffle={start}
        onHome={home}
      />
    )
  } else if (step === 'reveal') {
    screen = (
      <Spread
        spread={spread}
        positions={positions}
        drawn={drawn}
        flipped={state.flipped}
        styleId={settings.styleId}
        question={q}
        onFlip={(slot) => dispatch({ type: 'flip', slot })}
        onFlipAll={() => dispatch({ type: 'flipAll' })}
        onReading={() => dispatch({ type: 'reading' })}
        onHome={home}
      />
    )
  } else {
    screen = (
      <Reading
        spread={spread}
        deck={deckDef}
        positions={positions}
        drawn={drawn}
        styleId={settings.styleId}
        question={q}
        topic={topic}
        optionA={optionA}
        optionB={optionB}
        onAgain={start}
        onHome={home}
      />
    )
  }

  return (
    <>
      <Starfield />
      <main className="app">
        <div className="screen" key={`${step}-${state.round}`}>
          {screen}
        </div>
        <footer className="foot">밤의 타로 · 재미로 보는 타로 🌙</footer>
      </main>
    </>
  )
}
