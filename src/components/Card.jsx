// 카드 그림 — 이미지 없이 CSS + 이모지로 그린다.
// 크기는 부모에서 --w(카드 너비) CSS 변수로 지정하며, 모든 글자 크기가 그에 비례한다.

const PIP_ROWS = {
  2: [1, 1],
  3: [1, 1, 1],
  4: [2, 2],
  5: [2, 1, 2],
  6: [2, 2, 2],
  7: [2, 3, 2],
  8: [3, 2, 3],
  9: [3, 3, 3],
  10: [3, 4, 3],
}

// 카드가 이만큼보다 작으면 이름 글씨를 생략(라벨로 대신 보여 줌)
export const COMPACT_W = 84

function Pips({ n, symbol }) {
  return (
    <div className={`tf-pips n${n}`}>
      {PIP_ROWS[n].map((count, r) => (
        <div className="tf-pip-row" key={r}>
          {Array.from({ length: count }, (_, i) => (
            <span className="tf-pip" key={i}>
              {symbol}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardFace({ card, styleId = 'night', compact = false, className = '' }) {
  const isMinor = card.arcana === 'minor'
  const isPip = isMinor && card.rank >= 2 && card.rank <= 10
  const isCourt = isMinor && card.rank >= 11

  let center
  if (isPip && !compact) center = <Pips n={card.rank} symbol={card.suitSymbol} />
  else if (isCourt)
    center = (
      <>
        <span className="tf-symbol is-court">{card.symbol}</span>
        <span className="tf-suit">{card.suitSymbol}</span>
      </>
    )
  else center = <span className="tf-symbol">{isPip ? card.suitSymbol : card.symbol}</span>

  return (
    <div
      className={`tface tfront st-${styleId} ${compact ? 'is-compact' : ''} ${className}`}
      style={{ '--hue': card.hue }}
    >
      <div className="tf-frame">
        <div className="tf-top">{card.numeral}</div>
        <div className="tf-center">{center}</div>
        {!compact && (
          <div className="tf-bottom">
            <div className="tf-name">{card.name}</div>
            <div className="tf-en">{card.en}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export function CardBack({ styleId = 'night', className = '' }) {
  return (
    <div className={`tface tback st-${styleId} ${className}`}>
      <div className="tb-frame">
        <div className="tb-motif">
          {styleId === 'night' && (
            <>
              <span className="tb-moon" />
              <span className="tb-star s1">✦</span>
              <span className="tb-star s2">✦</span>
              <span className="tb-star s3">✧</span>
            </>
          )}
          {styleId === 'vintage' && <span className="tb-sun" />}
          {styleId === 'mono' && <span className="tb-rings" />}
        </div>
      </div>
    </div>
  )
}

// 탭하면 3D로 뒤집히는 카드
export function FlipCard({ card, reversed, flipped, styleId, w, onFlip, ariaLabel, className = '' }) {
  return (
    <button
      type="button"
      className={`tcard ${flipped ? 'is-flipped' : ''} ${className}`}
      style={{ '--w': `${w}px` }}
      onClick={onFlip}
      aria-label={ariaLabel}
    >
      <span className="tcard-inner" aria-hidden="true">
        <CardBack styleId={styleId} className="tcard-back" />
        <CardFace
          card={card}
          styleId={styleId}
          compact={w < COMPACT_W}
          className={`tcard-front ${reversed ? 'is-reversed' : ''}`}
        />
      </span>
    </button>
  )
}

// 해석 화면 등에 쓰는 정적인 카드
export function StaticCard({ card, reversed = false, styleId, w, back = false, className = '' }) {
  return (
    <div
      className={`tcard tcard-static ${reversed ? 'is-reversed' : ''} ${className}`}
      style={{ '--w': `${w}px` }}
      aria-hidden="true"
    >
      {back ? (
        <CardBack styleId={styleId} />
      ) : (
        <CardFace card={card} styleId={styleId} compact={w < COMPACT_W} />
      )}
    </div>
  )
}
