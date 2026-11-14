# 🌙 밤의 타로 — 기획 & 구현 가이드

> 재미로 만드는 타로 점 웹앱. React(Vite)로 만들고 GitHub Pages로 무료 호스팅한다.
> 이 문서는 **Claude Code가 읽고 처음부터 끝까지(생성 → 구현 → GitHub 업로드 → 배포) 진행**할 수 있도록 작성됨.

---

## 0. Claude Code에게 (작업 지시 요약)

1. 아래 스펙대로 Vite + React 프로젝트를 만든다. (저장소 이름 기본값: `tarot`)
2. 기능 구현 후 `npm run build`가 에러 없이 되는지 확인하고, `npm run dev`로 동작을 점검한다.
3. GitHub에 새 저장소를 만들고 push한다. (`gh` CLI가 있으면 `gh repo create tarot --public --source=. --push`)
4. GitHub Actions 워크플로(§7)로 GitHub Pages 배포를 설정하고, 저장소 Settings → Pages → Source를 **GitHub Actions**로 설정한다.
   (`gh api -X POST repos/{owner}/tarot/pages -f build_type=workflow` 로도 가능)
5. 배포 완료 후 URL(`https://<username>.github.io/tarot/`)을 알려준다.
6. 애매한 점은 이 문서의 "결정 사항"을 따르고, 문서에 없는 건 재미·단순함 쪽으로 판단한다.

---

## 1. 컨셉

- **이름**: 밤의 타로 (Night Tarot)
- **톤**: 신비롭지만 가볍고 다정한 말투. 무서운 해석 없이 "오늘 하루 참고용" 느낌.
- **분위기**: 깊은 남보라 밤하늘 + 반짝이는 별 + 금박 테두리 카드.
- **목표**: 폰에서 열어 30초 안에 카드 뽑고 해석 보는 경험. 손맛(셔플·뒤집기 애니메이션)이 핵심 재미.

## 2. 핵심 기능 (MVP)

| # | 기능 | 설명 |
|---|------|------|
| 1 | 스프레드 선택 | 오늘의 한 장 / 과거·현재·미래 / 갈림길(A·B) |
| 2 | 질문 입력(선택) | "요즘 이직 고민…" 같은 질문을 적으면 결과 화면 상단에 표시 |
| 3 | 셔플 | 버튼 누르면 카드 덱이 섞이는 애니메이션 (약 1.5초) |
| 4 | 카드 고르기 | 뒷면 22장을 부채꼴/그리드로 펼쳐놓고 필요한 장수만큼 탭해서 선택 |
| 5 | 카드 뒤집기 | 자리에 놓인 카드를 탭하면 3D 플립으로 앞면 공개 |
| 6 | 정·역방향 | 뽑을 때 약 30% 확률로 역방향. 역방향 카드는 180° 회전 표시 + 역방향 해석 |
| 7 | 해석 | 카드별 이름·키워드·해석 + 스프레드 전체 한 줄 요약 |
| 8 | 다시 하기 | 처음 화면으로 |

### 있으면 좋은 것 (2차)
- 결과 이미지로 저장/공유 (`html-to-image` 라이브러리)
- 최근 점 기록 (localStorage, try/catch로 감싸기)
- "오늘의 한 장"은 날짜 시드로 고정 (하루에 같은 카드) 옵션
- 마이너 아르카나 56장 추가 (수트 × 숫자 조합 해석)
- 효과음 (셔플 사르륵, 뒤집기 착) + 음소거 토글

## 3. 결정 사항

- **카드 덱**: 메이저 아르카나 22장만 사용 (MVP). 데이터는 §9 참고.
- **카드 그림**: 이미지 파일 없이 **CSS + 이모지/심볼**로 그린다. (저작권 걱정 없음, 용량 0)
  - 앞면: 로마 숫자(상단) / 큰 심볼(중앙) / 한글 이름 + 영문 이름(하단), 카드마다 `hue` 값으로 은은한 그라데이션.
  - 뒷면: 남보라 바탕 + 금색 테두리 + 가운데 초승달·별 패턴 (CSS로).
- **라우팅 없음**: 단일 페이지, `step` state로 화면 전환 (GitHub Pages에서 라우팅 404 문제 회피).
- **상태관리**: React `useState`/`useReducer`만. 외부 라이브러리 X.
- **스타일**: 순수 CSS (CSS 변수). Tailwind 등 X — 단순하게.
- **애니메이션**: CSS transition/keyframes 위주. 필요하면 `framer-motion`(motion) 하나만 추가 허용.
- **모바일 우선**: 375px 폭 기준 설계, 데스크탑은 가운데 정렬 최대 960px.
- **폰트**: Google Fonts — 본문 `Gowun Batang`, 영문/숫자 `Cinzel`.

## 4. 기술 스택

- Vite + React (최신, JS — TS는 선택)
- 빌드 결과: 정적 파일 → GitHub Pages
- `vite.config.js`에 **`base: './'`** 설정 (저장소 이름 상관없이 Pages에서 경로 동작)
- 배포: GitHub Actions (`actions/deploy-pages`)

## 5. 폴더 구조

```
tarot/
├─ .github/workflows/deploy.yml
├─ public/favicon.svg
├─ src/
│  ├─ main.jsx
│  ├─ App.jsx            # step 상태로 화면 전환
│  ├─ cards.js           # 카드 데이터 + 스프레드 정의 (§9)
│  ├─ lib/
│  │  ├─ shuffle.js      # Fisher–Yates 셔플, 역방향 랜덤
│  │  └─ summary.js      # 스프레드 전체 요약 문장 생성
│  ├─ components/
│  │  ├─ Starfield.jsx   # 배경 반짝이는 별 (CSS/Canvas)
│  │  ├─ Intro.jsx       # 타이틀 + 스프레드 선택 + 질문 입력
│  │  ├─ Deck.jsx        # 셔플 애니메이션 + 카드 펼치기/고르기
│  │  ├─ Card.jsx        # 앞/뒤 3D 플립 카드 (props: card, reversed, flipped)
│  │  ├─ Spread.jsx      # 고른 카드를 자리(position)에 배치, 탭하면 뒤집기
│  │  └─ Reading.jsx     # 해석 목록 + 요약 + 다시 하기
│  └─ styles/
│     ├─ index.css       # 전역, CSS 변수, 폰트
│     └─ card.css        # 카드 플립/셔플 애니메이션
├─ index.html            # lang="ko", 제목 "밤의 타로", 폰트 링크
├─ vite.config.js        # base: './'
└─ README.md
```

## 6. 화면 흐름 & 구현 메모

```
Intro ──(스프레드 선택, 질문 입력, [카드 섞기])──▶ Shuffle(1.5s)
   ──▶ Pick(22장 중 N장 탭) ──▶ Reveal(자리에서 하나씩 탭해서 뒤집기)
   ──(모두 뒤집힘)──▶ Reading(해석, 요약) ──[다시 하기]──▶ Intro
```

- **state 예시**
  ```js
  { step: 'intro'|'shuffle'|'pick'|'reveal'|'reading',
    spread, question,
    deck: [{ card, reversed }],   // 셔플된 22장
    picked: [index...],           // deck에서 고른 인덱스
    flipped: [bool...] }          // 자리별 뒤집힘 여부
  ```
- **셔플**: Fisher–Yates. 각 카드에 `reversed = Math.random() < 0.3`을 셔플 시점에 미리 부여.
- **셔플 애니메이션**: 카드 뒷면 5~7장을 겹쳐놓고 좌우로 엇갈리며 튕기는 keyframes 2~3회 → `pick`으로 전환.
- **Pick 화면**: 22장을 살짝 겹친 부채꼴(데스크탑) / 2줄 가로 스크롤 또는 그리드(모바일). 선택한 카드는 위로 떠오르고 금빛 glow, 남은 선택 수 "2장 더 골라주세요" 표시. 다 고르면 자동으로 `reveal`.
- **3D 플립**: `.card-inner { transform-style: preserve-3d; transition: transform .7s }`, `.flipped { transform: rotateY(180deg) }`, 앞/뒷면 `backface-visibility: hidden`. 역방향이면 앞면에 추가로 `rotate(180deg)`.
- **Reveal**: 자리 이름(과거/현재/미래) 라벨 위에 카드. 다 뒤집히면 "해석 보기" 버튼 등장(혹은 자동 스크롤).
- **요약(summary.js)**: 카드 수/정역 비율로 간단한 템플릿 문장. 예)
  - 정방향 다수 → "전반적으로 순풍이 부는 흐름이에요."
  - 역방향 다수 → "잠시 숨 고르기가 필요한 흐름이에요."
  - 갈림길 스프레드 → A/B 카드 정역을 비교해 "A 쪽이 조금 더 밝아 보여요" 식.
  - 마지막에 항상 "타로는 재미로만 봐주세요 🌙" 한 줄.
- **접근성**: 카드 버튼은 `<button>` + `aria-label="카드 뒤집기: 과거"`. `prefers-reduced-motion`이면 애니메이션 짧게.

## 7. 배포 — GitHub Actions 워크플로

`.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

> 액션 버전은 작업 시점의 최신 메이저 버전으로 올려도 됨.
> `npm ci`를 쓰므로 `package-lock.json`을 반드시 커밋할 것.

**배포 순서**
1. `git init && git add . && git commit -m "init: 밤의 타로"`
2. `gh repo create tarot --public --source=. --remote=origin --push` (브랜치는 `main`)
3. Settings → Pages → Build and deployment → Source: **GitHub Actions**
4. Actions 탭에서 워크플로 성공 확인 → `https://<username>.github.io/tarot/`

## 8. 디자인 토큰

```css
:root {
  --bg-1: #0b0818;      /* 밤하늘 위 */
  --bg-2: #1d1538;      /* 밤하늘 아래 */
  --gold: #e8c372;      /* 테두리, 포인트 */
  --gold-soft: #f6e3b4;
  --ink: #efe9ff;       /* 본문 글자 */
  --muted: #a99fc9;
  --card-w: min(28vw, 150px);
  --card-ratio: 1.7;    /* 높이 = 너비 × 1.7 */
  --radius: 14px;
}
```
- 배경: `radial-gradient` 밤하늘 + 작은 별 점 수십 개 반짝임(opacity keyframes, 랜덤 delay).
- 카드 앞면 배경: `linear-gradient(160deg, hsl(hue 45% 22%), hsl(hue 35% 10%))` + 금색 1.5px 테두리 + 안쪽 얇은 이중선.
- 버튼: 금색 외곽선, 호버/탭 시 은은한 glow.

## 9. 카드 데이터 (`src/cards.js`)

해석 문장은 직접 작성한 것 (재미용). 그대로 사용.

```js
export const CARDS = [
  { id: 0, numeral: '0', name: '광대', en: 'The Fool', symbol: '🎒', hue: 48,
    keywords: ['시작', '자유', '모험'],
    upright: '계산보다 설렘이 앞서는 시기예요. 완벽하게 준비되지 않았어도 첫걸음을 떼면 길이 보입니다.',
    reversed: '충동적인 결정이 발목을 잡을 수 있어요. 뛰어들기 전에 한 번만 아래를 내려다보세요.' },
  { id: 1, numeral: 'I', name: '마법사', en: 'The Magician', symbol: '🪄', hue: 12,
    keywords: ['실행력', '재능', '집중'],
    upright: '필요한 재료는 이미 손에 다 있어요. 지금은 생각을 행동으로 바꿀 때입니다.',
    reversed: '재주는 있는데 방향이 흩어져 있어요. 말만 앞서지 않았는지 점검해 보세요.' },
  { id: 2, numeral: 'II', name: '여사제', en: 'The High Priestess', symbol: '🌙', hue: 220,
    keywords: ['직관', '비밀', '침묵'],
    upright: '답은 바깥이 아니라 안쪽에 있어요. 조용히 머무르면 직감이 먼저 알려줄 거예요.',
    reversed: '내면의 목소리를 무시하고 있진 않나요? 남의 의견에 너무 휩쓸리고 있을 수 있어요.' },
  { id: 3, numeral: 'III', name: '여황제', en: 'The Empress', symbol: '🌿', hue: 110,
    keywords: ['풍요', '돌봄', '창조'],
    upright: '정성 들인 일이 열매를 맺는 흐름이에요. 나 자신도 넉넉하게 챙겨 주세요.',
    reversed: '남을 챙기느라 정작 나를 놓치고 있어요. 쉬어 가도 괜찮습니다.' },
  { id: 4, numeral: 'IV', name: '황제', en: 'The Emperor', symbol: '👑', hue: 0,
    keywords: ['구조', '책임', '리더십'],
    upright: '규칙과 계획이 힘이 되는 때예요. 주도권을 잡고 판을 정리해 보세요.',
    reversed: '통제하려는 마음이 지나치면 오히려 경직돼요. 조금 느슨하게 쥐어 보세요.' },
  { id: 5, numeral: 'V', name: '교황', en: 'The Hierophant', symbol: '🔑', hue: 30,
    keywords: ['전통', '배움', '조언'],
    upright: '검증된 방법이나 믿을 만한 사람의 조언이 도움이 돼요. 기본기를 따르세요.',
    reversed: '정해진 틀이 답답하게 느껴진다면, 나만의 방식을 시도해 볼 신호예요.' },
  { id: 6, numeral: 'VI', name: '연인', en: 'The Lovers', symbol: '💞', hue: 335,
    keywords: ['선택', '조화', '관계'],
    upright: '마음이 진짜로 끌리는 쪽을 고르세요. 가치관이 맞는 인연이나 기회가 가까이 있어요.',
    reversed: '머리와 마음이 따로 놀고 있어요. 서로의 기대를 솔직하게 맞춰 볼 때입니다.' },
  { id: 7, numeral: 'VII', name: '전차', en: 'The Chariot', symbol: '🏇', hue: 200,
    keywords: ['추진력', '승리', '의지'],
    upright: '밀어붙이면 이기는 흐름이에요. 흔들리는 마음을 고삐 잡듯 한 방향으로 모으세요.',
    reversed: '속도는 나는데 방향이 없어요. 잠깐 멈춰 목적지를 다시 확인하세요.' },
  { id: 8, numeral: 'VIII', name: '힘', en: 'Strength', symbol: '🦁', hue: 38,
    keywords: ['인내', '용기', '부드러움'],
    upright: '힘으로 누르기보다 다정하게 다룰 때 일이 풀려요. 당신은 생각보다 단단합니다.',
    reversed: '자신감이 조금 꺾여 있어요. 작은 성공 하나부터 다시 쌓아 보세요.' },
  { id: 9, numeral: 'IX', name: '은둔자', en: 'The Hermit', symbol: '🏮', hue: 250,
    keywords: ['성찰', '고독', '탐구'],
    upright: '혼자만의 시간이 답을 줘요. 시끄러운 알림을 끄고 나에게 집중해 보세요.',
    reversed: '혼자 너무 오래 웅크리고 있었어요. 가까운 사람에게 먼저 연락해 보세요.' },
  { id: 10, numeral: 'X', name: '운명의 수레바퀴', en: 'Wheel of Fortune', symbol: '🎡', hue: 280,
    keywords: ['전환점', '운', '흐름'],
    upright: '바퀴가 좋은 쪽으로 돌고 있어요. 예상 밖의 기회가 오면 올라타 보세요.',
    reversed: '잠시 운이 엇나가는 구간이에요. 버티면 바퀴는 다시 돕니다.' },
  { id: 11, numeral: 'XI', name: '정의', en: 'Justice', symbol: '⚖️', hue: 190,
    keywords: ['균형', '공정', '결과'],
    upright: '뿌린 대로 거두는 때예요. 객관적으로 따져 보면 답이 명확해집니다.',
    reversed: '한쪽으로 치우친 판단을 하고 있을 수 있어요. 반대편 입장도 들어 보세요.' },
  { id: 12, numeral: 'XII', name: '매달린 사람', en: 'The Hanged Man', symbol: '🙃', hue: 170,
    keywords: ['관점 전환', '기다림', '내려놓기'],
    upright: '거꾸로 보면 새로운 답이 보여요. 지금의 정체는 낭비가 아니라 숙성입니다.',
    reversed: '의미 없는 기다림을 끌고 있진 않나요? 이제는 결정을 내릴 때예요.' },
  { id: 13, numeral: 'XIII', name: '죽음', en: 'Death', symbol: '🦋', hue: 270,
    keywords: ['끝과 시작', '변화', '정리'],
    upright: '무서운 카드가 아니에요. 한 챕터가 닫혀야 다음 챕터가 열립니다.',
    reversed: '끝내야 할 것을 붙잡고 있어요. 변화를 미룰수록 더 무거워집니다.' },
  { id: 14, numeral: 'XIV', name: '절제', en: 'Temperance', symbol: '🏺', hue: 160,
    keywords: ['균형', '조율', '회복'],
    upright: '적당함이 최고의 전략이에요. 일과 쉼, 나와 남 사이에서 비율을 맞춰 보세요.',
    reversed: '어딘가 과하거나 모자라요. 수면, 식사, 일정부터 리듬을 다시 잡으세요.' },
  { id: 15, numeral: 'XV', name: '악마', en: 'The Devil', symbol: '⛓️', hue: 350,
    keywords: ['유혹', '집착', '습관'],
    upright: '알면서도 끊지 못하는 무언가가 있어요. 사슬은 생각보다 느슨하게 걸려 있습니다.',
    reversed: '얽매였던 것에서 벗어나는 중이에요. 해방감을 즐기세요.' },
  { id: 16, numeral: 'XVI', name: '탑', en: 'The Tower', symbol: '⚡', hue: 18,
    keywords: ['급변', '깨달음', '해체'],
    upright: '갑작스러운 흔들림이 와도 괜찮아요. 무너진 자리에 더 튼튼한 걸 세울 수 있어요.',
    reversed: '피할 수 없는 변화를 버티고만 있어요. 작게라도 먼저 손대는 게 덜 아픕니다.' },
  { id: 17, numeral: 'XVII', name: '별', en: 'The Star', symbol: '⭐', hue: 205,
    keywords: ['희망', '치유', '영감'],
    upright: '긴 밤 끝에 별이 떴어요. 조급해하지 않아도 회복은 이미 시작됐습니다.',
    reversed: '희망을 잠깐 잃어버렸어요. 아주 작은 기대 하나만 다시 품어 보세요.' },
  { id: 18, numeral: 'XVIII', name: '달', en: 'The Moon', symbol: '🌕', hue: 235,
    keywords: ['불안', '상상', '모호함'],
    upright: '보이는 게 전부가 아니에요. 확실해질 때까지 큰 결정은 잠시 미루세요.',
    reversed: '안개가 걷히고 있어요. 막연하던 불안의 정체가 곧 드러납니다.' },
  { id: 19, numeral: 'XIX', name: '태양', en: 'The Sun', symbol: '☀️', hue: 45,
    keywords: ['성공', '기쁨', '활력'],
    upright: '오늘의 주인공은 당신이에요. 숨기지 말고 마음껏 드러내세요.',
    reversed: '좋은 일이 있는데 즐기지 못하고 있어요. 구름 뒤에도 해는 떠 있습니다.' },
  { id: 20, numeral: 'XX', name: '심판', en: 'Judgement', symbol: '📯', hue: 15,
    keywords: ['부름', '재평가', '부활'],
    upright: '예전에 접어 둔 꿈이 다시 부르고 있어요. 지금이라면 다르게 해낼 수 있어요.',
    reversed: '스스로를 너무 가혹하게 평가하고 있어요. 과거의 나를 용서해 주세요.' },
  { id: 21, numeral: 'XXI', name: '세계', en: 'The World', symbol: '🌍', hue: 140,
    keywords: ['완성', '성취', '여정'],
    upright: '한 바퀴를 멋지게 완주했어요. 성취를 축하하고 다음 무대를 준비하세요.',
    reversed: '마지막 한 조각이 남았어요. 마무리를 미루지 말고 끝까지 가 보세요.' },
]

export const SPREADS = [
  { id: 'one',    title: '오늘의 한 장',     desc: '오늘 하루를 비춰 줄 카드 한 장',  positions: ['오늘의 메시지'] },
  { id: 'three',  title: '과거 · 현재 · 미래', desc: '흐름을 읽는 클래식 3장 스프레드', positions: ['과거', '현재', '미래'] },
  { id: 'choice', title: '갈림길',            desc: 'A와 B 사이에서 고민될 때',       positions: ['지금의 나', 'A를 고르면', 'B를 고르면'] },
]
```

## 10. 완료 체크리스트

- [ ] `npm run build` 성공, 콘솔 에러 없음
- [ ] 세 가지 스프레드 모두 끝까지 진행 가능
- [ ] 같은 카드가 한 번에 두 번 나오지 않음
- [ ] 역방향 카드가 뒤집힌 모습 + 역방향 해석으로 나옴
- [ ] 모바일(375px)에서 카드 고르기·뒤집기 편함, 가로 스크롤 깨짐 없음
- [ ] GitHub Pages URL에서 새로고침해도 정상 (base `./` 확인)
- [ ] README에 실행 방법(`npm i`, `npm run dev`)과 배포 URL 기재

## 11. 이후 아이디어 (재미 확장)

- 마이너 아르카나 추가로 78장 풀덱
- 카드 앞면을 SVG 일러스트로 직접 그려 교체
- 결과 카드 이미지 저장 → 카톡 공유
- "오늘의 운세 점수" 게이지, 행운의 색/숫자
- 다크/라이트 대신 "새벽/한밤" 테마 토글
