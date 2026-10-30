import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { copy, games, itemTypes, lessonNotes, quiz, type CopyKey, type Language } from './content'
import { calculateScanPoints, isModuleUnlocked, nextLevel, passedLevel } from './lib/progression'

type Screen = 'home' | 'learn' | 'lesson' | 'quiz' | 'play' | 'game' | 'scan' | 'schedule' | 'rewards' | 'profile' | 'settings'
type Booking = { id: string; date: string; slot: string; category: string; mode: 'pickup' | 'dropoff'; completed: boolean }
type ChatMessage = { from: 'bot' | 'user'; text: string }
type AppState = {
  language: Language
  ageGroup: 'kid' | 'teen' | 'adult' | 'senior'
  name: string
  modulesPassed: boolean[]
  gamePoints: number
  recyclePoints: number
  streak: number
  scans: number
  lastScanDate: string
  bookings: Booking[]
  demoUnlock: boolean
  largeText: boolean
}

const STORAGE_KEY = 'ecodrawer-demo-v1'
const today = () => new Date().toISOString().slice(0, 10)

const initialState: AppState = {
  language: 'en',
  ageGroup: 'adult',
  name: 'Friend',
  modulesPassed: [false, false, false],
  gamePoints: 0,
  recyclePoints: 0,
  streak: 1,
  scans: 0,
  lastScanDate: '',
  bookings: [],
  demoUnlock: false,
  largeText: false,
}

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return initialState
    const parsed: Partial<AppState> = JSON.parse(saved)
    return {
      ...initialState,
      ...parsed,
      modulesPassed: Array.isArray(parsed.modulesPassed) ? parsed.modulesPassed.slice(0, 3) : initialState.modulesPassed,
      bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
    }
  } catch {
    return initialState
  }
}

const itemLabel = (value: string, language: Language) =>
  itemTypes.find((item) => item.value === value)?.name[language] ?? value

function makeBotReply(message: string, language: Language): string {
  const text = message.toLowerCase()
  const t = copy[language]
  if (!/(ewaste|e-waste|waste|recycl|battery|batteries|மின்னணு|கழிவு|மறுசுழற்சி|மின்கல|மின்சார|energy|charger|phone|device|data|கைப்பேசி|சார்ஜர்)/i.test(text)) {
    return t.botOffTopic
  }
  if (/(battery|batteries|மின்கல)/i.test(text)) return t.answerBattery
  if (/(data|wipe|reset|தகவல்|மீட்டமை)/i.test(text)) return t.answerData
  if (/(what|e-waste|ewaste|என்ன|கைப்பேசி)/i.test(text)) return t.answerEWaste
  return t.answerDefault
}

function downloadCalendar(booking: Booking) {
  const compactDate = booking.date.replace(/-/g, '')
  const slotStart = booking.slot === '2:00 PM' ? '140000' : '100000'
  const slotEnd = booking.slot === '2:00 PM' ? '150000' : '110000'
  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EcoDrawer//Demo//EN',
    'BEGIN:VEVENT',
    `UID:${booking.id}@ecodrawer.demo`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART:${compactDate}T${slotStart}`,
    `DTEND:${compactDate}T${slotEnd}`,
    'SUMMARY:EcoDrawer demo recycling reminder',
    `DESCRIPTION:${booking.mode === 'pickup' ? 'Sample pickup' : 'Sample drop-off'} for ${itemLabel(booking.category, 'en')}. Verify your recycler before attending.`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'ecodrawer-reminder.ics'
  link.click()
  URL.revokeObjectURL(url)
}

const navScreens: { id: Screen; icon: string; key: CopyKey }[] = [
  { id: 'home', icon: '⌂', key: 'navHome' },
  { id: 'learn', icon: '▤', key: 'navLearn' },
  { id: 'play', icon: '✳', key: 'navPlay' },
  { id: 'scan', icon: '⌕', key: 'navScan' },
  { id: 'schedule', icon: '▦', key: 'navSchedule' },
]

function App() {
  const [data, setData] = useState<AppState>(loadState)
  const [screen, setScreen] = useState<Screen>('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [botOpen, setBotOpen] = useState(false)
  const [chatText, setChatText] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [activeModule, setActiveModule] = useState(0)
  const [activeGame, setActiveGame] = useState(0)
  const [gameLevel, setGameLevel] = useState(1)
  const [gameQuestion, setGameQuestion] = useState(0)
  const [gameScore, setGameScore] = useState(0)
  const [gameResult, setGameResult] = useState<number | null>(null)
  const [quizQuestion, setQuizQuestion] = useState(0)
  const [quizScore, setQuizScore] = useState(0)
  const [quizChoice, setQuizChoice] = useState<number | null>(null)
  const [quizResult, setQuizResult] = useState<number | null>(null)
  const [scanGuess, setScanGuess] = useState<'yes' | 'no' | 'unsure' | null>(null)
  const [scanCategory, setScanCategory] = useState('phone')
  const [scanImage, setScanImage] = useState('')
  const [scanResult, setScanResult] = useState(false)
  const [lastScanPoints, setLastScanPoints] = useState(0)
  const [bookingCategory, setBookingCategory] = useState('phone')
  const [bookingDate, setBookingDate] = useState('')
  const [bookingSlot, setBookingSlot] = useState('10:00 AM')
  const [bookingMode, setBookingMode] = useState<'pickup' | 'dropoff'>('pickup')
  const [toast, setToast] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const t = copy[data.language]

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    document.documentElement.lang = data.language
    document.documentElement.dataset.age = data.ageGroup
    document.documentElement.classList.toggle('large-text', data.largeText)
  }, [data])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const passedCount = data.modulesPassed.filter(Boolean).length
  const firstUnpassedModule = data.modulesPassed.findIndex((passed) => !passed)
  const nextModule = firstUnpassedModule < 0 ? 2 : firstUnpassedModule
  const currentBooking = data.bookings.find((booking) => !booking.completed)
  const completedBookings = data.bookings.filter((booking) => booking.completed)

  const setLanguage = (language: Language) => setData((current) => ({ ...current, language }))
  const go = (next: Screen) => {
    setScreen(next)
    setMenuOpen(false)
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }
  const updateData = (partial: Partial<AppState>) => setData((current) => ({ ...current, ...partial }))

  const openLesson = (index: number) => {
    if (!data.demoUnlock && !isModuleUnlocked(index, data.modulesPassed)) return
    setActiveModule(index)
    go('lesson')
  }

  const startQuiz = () => {
    setQuizQuestion(0)
    setQuizScore(0)
    setQuizChoice(null)
    setQuizResult(null)
    go('quiz')
  }

  const submitQuizAnswer = () => {
    if (quizChoice === null) return
    const earned = quizScore + (quizChoice === quiz[data.language][quizQuestion].answer ? 1 : 0)
    if (quizQuestion === quiz[data.language].length - 1) {
      setQuizResult(earned)
      setQuizScore(earned)
      if (earned >= 3 && !data.modulesPassed[activeModule]) {
        const completesLevel = data.modulesPassed.every((passed, index) => passed || index === activeModule)
        const points = completesLevel ? 70 : 20
        setData((current) => ({
          ...current,
          modulesPassed: current.modulesPassed.map((value, index) => index === activeModule ? true : value),
          gamePoints: current.gamePoints + points,
        }))
        setToast(completesLevel ? '+20 lesson points · +50 level bonus' : '+20 eco points')
      }
      return
    }
    setQuizScore(earned)
    setQuizQuestion((current) => current + 1)
    setQuizChoice(null)
  }

  const chooseGame = (index: number) => {
    setActiveGame(index)
    go('game')
  }

  const startGame = (level: number) => {
    if (!data.demoUnlock && level > 1) {
      const progress = Number(localStorage.getItem(`ecodrawer-game-${activeGame}`) ?? '0')
      if (level > nextLevel(progress)) return
    }
    setGameLevel(level)
    setGameQuestion(0)
    setGameScore(0)
    setGameResult(null)
  }

  const answerGame = (answer: number) => {
    if (gameResult !== null) return
    const questions = quiz[data.language]
    const correct = answer === questions[(gameQuestion + activeGame) % questions.length].answer
    const score = gameScore + (correct ? 1 : 0)
    if (gameQuestion === 4) {
      setGameScore(score)
      setGameResult(score)
      if (passedLevel(score, 5)) {
        const key = `ecodrawer-game-${activeGame}`
        const previous = Number(localStorage.getItem(key) ?? '0')
        const points = (activeGame + 1) * (gameLevel > previous ? 10 : 5)
        localStorage.setItem(key, String(Math.max(previous, gameLevel)))
        setData((current) => ({ ...current, gamePoints: current.gamePoints + points }))
        setToast(`+${points} eco points`)
      }
      return
    }
    setGameScore(score)
    setGameQuestion((current) => current + 1)
  }

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setToast(t.invalidPhoto)
      return
    }
    setScanImage(URL.createObjectURL(file))
    setScanResult(false)
  }

  const classifyScan = () => {
    if (!scanGuess) {
      setToast(data.language === 'en' ? 'Choose your guess first.' : 'முதலில் உங்கள் பதிலைத் தேர்ந்தெடுக்கவும்.')
      return
    }
    const count = data.lastScanDate === today() ? data.scans : 0
    const points = calculateScanPoints(scanGuess === 'yes', count)
    setLastScanPoints(points)
    setData((current) => ({ ...current, scans: count + (points > 0 ? 1 : 0), lastScanDate: today(), gamePoints: current.gamePoints + points }))
    setScanResult(true)
    if (points > 0) setToast(`+${points} eco points`)
  }

  const createBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!bookingDate) {
      setToast(t.chooseDate)
      return
    }
    const booking: Booking = {
      id: crypto.randomUUID(),
      date: bookingDate,
      slot: bookingSlot,
      category: bookingCategory,
      mode: bookingMode,
      completed: false,
    }
    setData((current) => ({ ...current, bookings: [booking, ...current.bookings], recyclePoints: current.recyclePoints + 100 }))
    setToast(data.language === 'en' ? 'Booking saved · +100 recycle points' : 'பதிவு சேமிக்கப்பட்டது · +100 மறுசுழற்சி புள்ளிகள்')
  }

  const completeBooking = (bookingId: string) => {
    setData((current) => ({
      ...current,
      bookings: current.bookings.map((booking) => booking.id === bookingId ? { ...booking, completed: true } : booking),
      recyclePoints: current.recyclePoints + 300,
    }))
    setToast(t.bookingCompleted)
  }

  const submitChat = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = chatText.trim()
    if (!message) return
    setChatMessages((current) => [...current, { from: 'user', text: message }, { from: 'bot', text: makeBotReply(message, data.language) }])
    setChatText('')
  }

  const resetDemo = () => {
    localStorage.removeItem(STORAGE_KEY)
    for (let index = 0; index < games.length; index += 1) localStorage.removeItem(`ecodrawer-game-${index}`)
    setData(initialState)
    setToast(t.resetToast)
    go('home')
  }

  const renderPage = () => {
    if (screen === 'home') return (
      <>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow"><span className="status-dot" /> {t.greeting}</p>
            <h1>{t.heroTitle.split('\\n').map((line, index) => <span key={index}>{line}</span>)}</h1>
            <p className="hero-description">{t.heroText}</p>
            <div className="hero-actions">
              <button className="button button-dark" onClick={() => openLesson(nextModule)}>{t.startLearning}<span aria-hidden="true">↗</span></button>
              <button className="text-button hero-secondary" onClick={() => go('play')}>{t.exploreApp}<span aria-hidden="true">→</span></button>
            </div>
            <div className="hero-proof"><span className="avatar-stack"><i>♻</i><i>✦</i><i>◌</i></span><span>{t.impactText}</span></div>
          </div>
          <div className="hero-art" aria-label="Illustration of a green circular e-waste symbol">
            <div className="art-glow" />
            <div className="art-ring art-ring-one" />
            <div className="art-ring art-ring-two" />
            <div className="device device-back"><span>♻</span></div>
            <div className="device device-front"><div className="device-camera" /><div className="device-label">ECO<span>DRAWER</span></div><div className="device-sheen" /></div>
            <div className="floating-leaf leaf-one">✦</div><div className="floating-leaf leaf-two">↻</div>
            <div className="art-caption"><span className="caption-dot" /> MAKE TECH COUNT <span>01 — 03</span></div>
          </div>
        </section>

        <div className="content-wrap">
          <div className="journey-heading section-heading"><div><p className="eyebrow">{t.yourJourney}</p><h2>{t.continueLearning}</h2></div><span className="muted">{t.journeyHint}</span></div>
          <section className="stats-grid" aria-label={t.yourJourney}>
            <div className="stat-card stat-progress"><div className="stat-top"><span className="stat-icon">◒</span><span className="stat-kicker">{t.modules}</span></div><strong>{passedCount}<small> / 3</small></strong><div className="progress-track"><span style={{ width: `${passedCount / 3 * 100}%` }} /></div><p>{t.continueText}</p></div>
            <div className="stat-card stat-points"><div className="stat-top"><span className="stat-icon">✳</span><span className="stat-kicker">{t.points}</span></div><strong>{data.gamePoints}</strong><p>{t.impactText}</p></div>
            <div className="stat-card stat-streak"><div className="stat-top"><span className="stat-icon">♨</span><span className="stat-kicker">{t.streak}</span></div><strong>{data.streak}<small> {streakDays(data.streak, data.language)}</small></strong><div className="week-dots">{weekDayLabels(data.language).map((day, index) => <i className={index < data.streak ? 'active' : ''} key={`${day}-${index}`}>{day}</i>)}</div></div>
          </section>

          <section className="home-feature-grid">
            <button className="feature-card lesson-feature" onClick={() => openLesson(nextModule)}>
              <span className="feature-badge">{t.featured} · 0{nextModule + 1}</span><span className="feature-orb">✳</span>
              <div><h3>{t.lessonTitle}</h3><p>{t.lessonSub}</p><span className="feature-link">{t.startLesson} <b>↗</b></span></div>
            </button>
            <div className="quick-card"><p className="eyebrow">{t.quickActions}</p><button className="quick-row" onClick={() => go('scan')}><span className="quick-icon lavender">⌕</span><span><b>{t.scanAction}</b><small>{t.scanText}</small></span><span className="quick-arrow">↗</span></button><button className="quick-row" onClick={() => go('schedule')}><span className="quick-icon lime">▦</span><span><b>{t.bookAction}</b><small>{t.bookText}</small></span><span className="quick-arrow">↗</span></button></div>
          </section>
          {currentBooking && <button className="booking-banner" onClick={() => go('schedule')}><span>✓</span><span><b>{t.booked}</b><small>{formatDate(currentBooking.date, data.language)} · {currentBooking.slot}</small></span><span>→</span></button>}
        </div>
      </>
    )

    if (screen === 'learn') return (
      <PageIntro eyebrow={t.navLearn} title={t.learnTitle} subtitle={t.learnSubtitle}>
        <div className="level-tabs"><button className="active">{t.beginner}<span>01</span></button><button disabled={!data.demoUnlock && passedCount < 3}>{t.intermediate}<span>02</span>{passedCount < 3 && !data.demoUnlock ? ' · 🔒' : ''}</button><button disabled={!data.demoUnlock && passedCount < 3}>{t.advanced}<span>03</span>{passedCount < 3 && !data.demoUnlock ? ' · 🔒' : ''}</button></div>
        <div className="learn-overview"><div><b>{passedCount} / 3</b><span>{t.modules}</span></div><div className="progress-track"><span style={{ width: `${passedCount / 3 * 100}%` }} /></div><p>{t.passMark}</p></div>
        <div className="module-list">{[0, 1, 2].map((index) => {
          const unlocked = data.demoUnlock || isModuleUnlocked(index, data.modulesPassed)
          return <article className={`module-card ${unlocked ? '' : 'is-locked'}`} key={index}>
            <div className="module-number">{data.modulesPassed[index] ? '✓' : `0${index + 1}`}</div>
            <div className="module-copy"><span className="module-status">{data.modulesPassed[index] ? t.passed : unlocked ? t.ready : t.locked}</span><h3>{t[`module${index + 1}` as 'module1' | 'module2' | 'module3']}</h3><p>{t[`module${index + 1}Desc` as 'module1Desc' | 'module2Desc' | 'module3Desc']}</p><div className="module-meta"><span>◷ {t.lessonDuration}</span><span>✦ +20 {t.pointsShort}</span></div></div>
            <button className="button button-outline" disabled={!unlocked} onClick={() => openLesson(index)}>{t.openModule} <span>↗</span></button>
          </article>
        })}</div>
      </PageIntro>
    )

    if (screen === 'lesson') return (
      <PageIntro eyebrow={`${t.navLearn} · 0${activeModule + 1}`} title={t[`module${activeModule + 1}` as 'module1' | 'module2' | 'module3']} subtitle={t[`module${activeModule + 1}Desc` as 'module1Desc' | 'module2Desc' | 'module3Desc']}>
        <div className="lesson-layout">
          <section className="video-card"><div className="video-screen"><div className="play-mark">▶</div><span className="video-tag">{t.lessonVideo}</span><span className="video-time">04:12</span></div><p className="notice"><span>ⓘ</span> {t.videoDemo}</p></section>
          <section className="notes-card"><p className="eyebrow">{t.keyIdeas}</p><div className="lesson-notes">{lessonNotes[data.language][activeModule].map((note, index) => <div className="note-line" key={note}><span>0{index + 1}</span><p>{note}</p></div>)}</div><div className="pass-note">✦ {t.passMark}</div><button className="button button-dark button-wide" onClick={startQuiz}>{t.takeQuiz}<span>→</span></button></section>
        </div>
        <button className="text-button back-link" onClick={() => go('learn')}>← {t.back}</button>
      </PageIntro>
    )

    if (screen === 'quiz') {
      const question = quiz[data.language][quizQuestion]
      return <PageIntro eyebrow={`${t.question} ${quizQuestion + 1} / 4`} title={t.quizTitle} subtitle={t.passMark}>
        {quizResult === null ? <section className="quiz-card"><div className="quiz-progress"><span style={{ width: `${(quizQuestion + 1) * 25}%` }} /></div><p className="quiz-question">{question.question}</p><div className="answer-list">{question.options.map((option, index) => <button key={option} className={`answer-option ${quizChoice === index ? 'selected' : ''}`} onClick={() => setQuizChoice(index)}><span className="answer-letter">{String.fromCharCode(65 + index)}</span>{option}</button>)}</div><button className="button button-dark button-wide" disabled={quizChoice === null} onClick={submitQuizAnswer}>{quizQuestion === 3 ? t.finishQuiz : t.nextQuestion}<span>→</span></button></section> :
          <section className="result-card"><div className={`result-icon ${quizResult >= 3 ? 'success' : 'retry'}`}>{quizResult >= 3 ? '✦' : '↻'}</div><p className="eyebrow">{t.quizTitle}</p><h2>{quizResult >= 3 ? t.quizPassed : t.tryAgain}</h2><strong>{quizResult} / 4</strong><p>{t.passMark}</p><button className="button button-dark" onClick={() => quizResult >= 3 ? go('learn') : startQuiz()}>{quizResult >= 3 ? t.back : t.continue}<span>→</span></button></section>}
      </PageIntro>
    }

    if (screen === 'play') return <PageIntro eyebrow={t.navPlay} title={t.yourGames} subtitle={t.gamesSubtitle}>
      <div className="games-grid">{games.map((game, index) => <button className="game-card" key={game.name.en} onClick={() => chooseGame(index)}><span className={`game-icon game-icon-${index}`}>{game.icon}</span><span className="game-level-count">{localStorage.getItem(`ecodrawer-game-${index}`) ?? 0}/30 {t.levels}</span><h3>{game.name[data.language]}</h3><p>{game.description[data.language]}</p><span className="game-progress"><i style={{ width: `${Math.min(100, Number(localStorage.getItem(`ecodrawer-game-${index}`) ?? 0) / 30 * 100)}%` }} /></span><span className="game-open">{t.playNow} <b>↗</b></span></button>)}</div>
    </PageIntro>

    if (screen === 'game') {
      const currentQuestion = quiz[data.language][(gameQuestion + activeGame) % quiz[data.language].length]
      const progress = Number(localStorage.getItem(`ecodrawer-game-${activeGame}`) ?? '0')
      return <PageIntro eyebrow={`${games[activeGame].icon} ${games[activeGame].name[data.language]}`} title={gameResult === null ? `${t.chooseLevel} ${gameLevel}` : `${t.question} ${gameResult}/5`} subtitle={t.gameRule}>
        <div className="game-panel">
          <div className="game-panel-top"><span>{t.difficulty}: {t.beginner}</span><span>{t.levelLabel} {String(gameLevel).padStart(2, '0')} / 10</span></div>
          <div className="level-grid">{Array.from({ length: 10 }, (_, index) => { const level = index + 1; const unlocked = data.demoUnlock || level <= nextLevel(progress); return <button key={level} className={`${level <= progress ? 'cleared' : level === nextLevel(progress) ? 'current' : ''}`} disabled={!unlocked} onClick={() => startGame(level)} aria-label={`${t.chooseLevel} ${level}${unlocked ? '' : ', locked'}`}>{level <= progress ? '✓' : unlocked ? level : '🔒'}</button> })}</div>
          {gameResult === null ? <div className="game-question-card"><div className="quiz-progress"><span style={{ width: `${(gameQuestion + 1) * 20}%` }} /></div><p className="eyebrow">{t.question} {gameQuestion + 1} / 5</p><h3>{currentQuestion.question}</h3><div className="answer-list">{currentQuestion.options.map((option, index) => <button key={option} className="answer-option" onClick={() => answerGame(index)}><span className="answer-letter">{String.fromCharCode(65 + index)}</span>{option}</button>)}</div></div> :
            <div className="game-result"><span className="result-icon success">{passedLevel(gameResult, 5) ? '✦' : '↻'}</span><h2>{gameResult} / 5</h2><p>{passedLevel(gameResult, 5) ? t.quizPassed : t.tryAgain}</p><button className="button button-dark" onClick={() => startGame(passedLevel(gameResult, 5) ? Math.min(gameLevel + 1, 10) : gameLevel)}>{passedLevel(gameResult, 5) ? t.continue : t.playNow}<span>→</span></button></div>}
        </div><button className="text-button back-link" onClick={() => go('play')}>← {t.back}</button>
      </PageIntro>
    }

    if (screen === 'scan') return <PageIntro eyebrow={t.navScan} title={t.scanTitle} subtitle={t.scanSubtitle}>
      <div className="scan-layout"><section className="scan-card"><p className="eyebrow">01 — {t.scanSubtitle}</p><div className="guess-buttons">{(['yes', 'no', 'unsure'] as const).map((guess) => <button key={guess} className={scanGuess === guess ? 'selected' : ''} onClick={() => { setScanGuess(guess); setScanResult(false) }}><span className="guess-icon" aria-hidden="true">{guess === 'yes' ? '✓' : guess === 'no' ? '×' : '?'}</span><span className="guess-label">{t[guess]}</span></button>)}</div>
        <button className="upload-zone" type="button" onClick={() => fileInput.current?.click()}><span className="upload-icon">↑</span><b>{t.addPhoto}</b><small>{t.photoHint}</small>{scanImage && <img className="scan-preview" src={scanImage} alt="" />}</button><input className="visually-hidden" ref={fileInput} type="file" accept="image/*" capture="environment" onChange={handlePhoto} aria-label={t.addPhoto} />
        <label className="form-field"><span>{t.chooseItem}</span><select value={scanCategory} onChange={(event) => { setScanCategory(event.target.value); setScanResult(false) }}>{itemTypes.map((item) => <option value={item.value} key={item.value}>{item.icon} {item.name[data.language]}</option>)}</select></label>
        <div className="demo-label"><span>●</span> {t.demoMode}</div><button className="button button-dark button-wide" onClick={classifyScan}>{t.classify}<span>→</span></button>
      </section>
      {scanResult ? <section className="scan-result">      <span className="scan-result-icon">{itemTypes.find((item) => item.value === scanCategory)?.icon}</span><p className="eyebrow">{t.scanResult}</p><h2>{itemLabel(scanCategory, data.language)}</h2><span className="demo-pill">{t.demoMode}</span><h3>{t.disposal}</h3><p>{t.scanAdvice}</p><div className="scan-reward">✦ {t.scanPoints}: {lastScanPoints}</div><button className="button button-outline" onClick={() => { setBookingCategory(scanCategory); go('schedule') }}>{t.bookAction}<span>↗</span></button></section> : <aside className="scan-side"><div className="scan-side-orb">♻</div><h3>{t.yourImpact}</h3><p>{t.scanAdvice}</p></aside>}</div>
    </PageIntro>

    if (screen === 'schedule') return <PageIntro eyebrow={t.navSchedule} title={t.scheduleTitle} subtitle={t.scheduleSubtitle}>
      <div className="notice notice-wide"><span>ⓘ</span>{t.sampleNotice}</div><div className="schedule-layout"><form className="schedule-form" onSubmit={createBooking}><p className="eyebrow">01 — {t.bookAction}</p><label className="form-field"><span>{t.itemCategory}</span><select value={bookingCategory} onChange={(event) => setBookingCategory(event.target.value)}>{itemTypes.map((item) => <option value={item.value} key={item.value}>{item.icon} {item.name[data.language]}</option>)}</select></label><div className="form-columns"><label className="form-field"><span>{t.pickupDate}</span><input type="date" min={today()} value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} required /></label><label className="form-field"><span>{t.timeSlot}</span><select value={bookingSlot} onChange={(event) => setBookingSlot(event.target.value)}><option>10:00 AM</option><option>2:00 PM</option></select></label></div><label className="form-field"><span>{t.mode}</span><select value={bookingMode} onChange={(event) => setBookingMode(event.target.value as 'pickup' | 'dropoff')}><option value="pickup">{t.pickup}</option><option value="dropoff">{t.dropoff}</option></select></label><div className="sample-recycler"><div className="recycler-symbol">♻</div><div><b>{t.sampleRecycler}</b><small>{t.locationUnavailable}</small></div><span className="sample-tag">{t.sample}</span></div><button className="button button-dark button-wide" type="submit">{t.bookPickup}<span>→</span></button></form>
        <aside className="calendar-card"><p className="eyebrow">{t.thisWeek}</p><div className="calendar-month">{new Date().toLocaleDateString(data.language === 'ta' ? 'ta-IN' : 'en-IN', { month: 'long', year: 'numeric' })}</div><div className="calendar-grid">{weekDayLabels(data.language).map((day, index) => <span className="calendar-weekday" key={`${day}-${index}`}>{day}</span>)}{calendarDays().map((day, index) => day === null ? <span key={`blank-${index}`} /> : <span className={`${day === new Date().getDate() ? 'calendar-today' : ''} ${data.bookings.some((booking) => new Date(`${booking.date}T12:00:00`).getDate() === day && !booking.completed) ? 'calendar-booked' : ''}`} key={day}>{day}</span>)}</div><div className="calendar-legend"><span><i className="legend-today" />{t.today}</span><span><i className="legend-booked" />{t.booked}</span></div></aside></div>
      <div className="schedule-lower"><section className="schedule-info"><p className="eyebrow">{t.recyclerNearby}</p><h3>{t.sampleRecycler}</h3><p>{t.sampleNotice}</p><a href="https://www.google.com/maps/search/authorised+e-waste+recycler+near+me" target="_blank" rel="noreferrer">{t.mapsSearch} ↗</a></section><section className="booking-list"><p className="eyebrow">{t.booked}</p>{data.bookings.length === 0 ? <p>{t.noBookings}</p> : data.bookings.map((booking) => <article className="booking-item" key={booking.id}><div><b>{formatDate(booking.date, data.language)}</b><small>{booking.slot} · {itemLabel(booking.category, data.language)} · {booking.mode === 'pickup' ? t.pickup : t.dropoff}</small></div>{booking.completed ? <span className="completed-pill">✓ {t.passed}</span> : <div className="booking-actions"><button className="small-outline" onClick={() => downloadCalendar(booking)}>{t.calendarFile}</button><button className="small-primary" onClick={() => completeBooking(booking.id)}>{t.completePickup}</button></div>}</article>)}</section></div>
    </PageIntro>

    if (screen === 'rewards') return <PageIntro eyebrow={t.navHome} title={t.rewardsTitle} subtitle={t.rewardsSubtitle}>
      <div className="rewards-grid"><section className="reward-card reward-streak"><span className="reward-icon">♨</span><p className="eyebrow">{t.streak}</p><strong>{data.streak} <small>{streakDays(data.streak, data.language)}</small></strong><div className="week-dots large">{weekDayLabels(data.language).map((day, index) => <i className={index < data.streak ? 'active' : ''} key={`${day}-${index}`}>{day}</i>)}</div></section><section className="reward-card reward-game"><span className="reward-icon">✳</span><p className="eyebrow">{t.gamePoints}</p><strong>{data.gamePoints.toLocaleString(data.language === 'ta' ? 'ta-IN' : 'en-IN')}</strong><p>{t.impactText}</p></section><section className="reward-card reward-recycle"><span className="reward-icon">♻</span><p className="eyebrow">{t.recyclePoints}</p><strong>{data.recyclePoints.toLocaleString(data.language === 'ta' ? 'ta-IN' : 'en-IN')}</strong><p>{t.bookAction}</p></section></div>
      <section className="payout-card"><p className="eyebrow">{t.payoutHistory}</p>{completedBookings.length === 0 ? <p>{t.noPayouts}</p> : completedBookings.map((booking) => <div className="payout-row" key={booking.id}><span className="payout-check">✓</span><span><b>{itemLabel(booking.category, data.language)}</b><small>{formatDate(booking.date, data.language)} · {t.payoutUnavailable}</small></span><span className="payout-points">+300 {t.pointsShort}</span></div>)}</section>
    </PageIntro>

    if (screen === 'profile') return <PageIntro eyebrow={t.navHome} title={t.profileTitle} subtitle={t.profileText}><div className="profile-card"><div className="profile-avatar">E</div><div><h2>{data.name}</h2><p>{t.demoProfile}</p></div><span className="sample-tag">{t.localDemo}</span></div><section className="profile-progress"><p className="eyebrow">{t.yourJourney}</p><div className="profile-metrics"><span><b>{passedCount}/3</b><small>{t.modules}</small></span><span><b>{data.gamePoints}</b><small>{t.gamePoints}</small></span><span><b>{data.recyclePoints}</b><small>{t.recyclePoints}</small></span></div><div className="progress-track"><span style={{ width: `${passedCount / 3 * 100}%` }} /></div></section></PageIntro>

    if (screen === 'settings') return <PageIntro eyebrow={t.navHome} title={t.settingsTitle} subtitle={t.profileText}><div className="settings-card"><label className="setting-row"><span><b>{t.language}</b><small>English / தமிழ்</small></span><select value={data.language} onChange={(event) => setLanguage(event.target.value as Language)}><option value="en">English</option><option value="ta">தமிழ்</option></select></label><label className="setting-row"><span><b>{t.ageGroup}</b><small>{t.personaliseHelp}</small></span><select value={data.ageGroup} onChange={(event) => updateData({ ageGroup: event.target.value as AppState['ageGroup'] })}><option value="kid">{t.ageKid}</option><option value="teen">{t.ageTeen}</option><option value="adult">{t.ageAdult}</option><option value="senior">{t.ageSenior}</option></select></label><label className="setting-row"><span><b>{t.largeText}</b><small>{t.largeTextHelp}</small></span><input type="checkbox" checked={data.largeText} onChange={(event) => updateData({ largeText: event.target.checked })} /></label><label className="setting-row"><span><b>{t.demoUnlock}</b><small>{t.demoUnlockHelp}</small></span><input type="checkbox" checked={data.demoUnlock} onChange={(event) => updateData({ demoUnlock: event.target.checked })} /></label><button className="button button-danger" onClick={resetDemo}>{t.resetProgress}</button></div></PageIntro>

    return null
  }

  return <div className="app-shell">
    <header className="topbar"><button className="brand" onClick={() => go('home')} aria-label="EcoDrawer home"><span className="brand-mark">↻</span><span>Eco<span className="brand-leaf">Drawer</span><small>{t.brandTagline}</small></span></button><nav className="top-nav" aria-label="Main navigation">{navScreens.map((item) => <button className={screen === item.id || (item.id === 'learn' && ['lesson', 'quiz'].includes(screen)) || (item.id === 'play' && screen === 'game') ? 'active' : ''} key={item.id} onClick={() => go(item.id)}>{t[item.key]}</button>)}</nav><div className="top-actions"><button className="language-toggle" onClick={() => setLanguage(data.language === 'en' ? 'ta' : 'en')} aria-label="Change language">{data.language === 'en' ? 'தமிழ்' : 'EN'}</button><button className="points-chip" onClick={() => go('rewards')}><span>✳</span>{data.gamePoints}</button><button className="avatar-button" onClick={() => setMenuOpen((open) => !open)} aria-label="Open profile menu">E</button></div></header>
    <main>{renderPage()}</main>
    <footer className="site-footer"><button className="brand footer-brand" onClick={() => go('home')}><span className="brand-mark">↻</span><span>Eco<span className="brand-leaf">Drawer</span></span></button><p>{t.footerText}</p><span>{t.footerMotto} <b>↗</b></span></footer>
    <nav className="mobile-nav" aria-label="Main navigation">{navScreens.map((item) => <button className={screen === item.id || (item.id === 'learn' && ['lesson', 'quiz'].includes(screen)) || (item.id === 'play' && screen === 'game') ? 'active' : ''} key={item.id} onClick={() => go(item.id)}><span>{item.icon}</span><small>{t[item.key]}</small></button>)}</nav>
    <button className="bot-fab" onClick={() => setBotOpen(true)} aria-label={t.botTitle}><span>✳</span><b>{t.botTitle}</b></button>
    {menuOpen && <><button className="scrim menu-scrim" onClick={() => setMenuOpen(false)} aria-label={t.close} /><div className="person-menu"><div className="menu-person"><div className="profile-avatar small">E</div><span><b>{data.name}</b><small>EcoDrawer demo</small></span></div><button onClick={() => go('profile')}>◉ {t.profileTitle}<span>→</span></button><button onClick={() => go('rewards')}>✳ {t.rewardsTitle}<span>→</span></button><button onClick={() => go('settings')}>⚙ {t.settingsTitle}<span>→</span></button><button className="menu-language" onClick={() => setLanguage(data.language === 'en' ? 'ta' : 'en')}>◉ {t.language}<span>{data.language === 'en' ? 'தமிழ்' : 'English'}</span></button></div></>}
    {botOpen && <><button className="scrim bot-scrim" onClick={() => setBotOpen(false)} aria-label={t.close} /><section className="bot-panel" aria-label={t.botTitle}><header className="bot-header"><div className="bot-avatar">✳</div><div><b>{t.botTitle}</b><small>{t.botDemo}</small></div><button onClick={() => setBotOpen(false)} aria-label={t.close}>×</button></header><div className="chat-log"><div className="chat-bubble bot-message">{t.botGreeting}</div>{chatMessages.map((message, index) => <div className={`chat-bubble ${message.from === 'user' ? 'user-message' : 'bot-message'}`} key={`${index}-${message.text}`}>{message.text}</div>)}</div><div className="quick-prompts">{['How do I recycle a battery?', 'What is e-waste?'].map((prompt) => <button key={prompt} onClick={() => { setChatText(data.language === 'ta' ? (prompt.includes('battery') ? 'மின்கலத்தை எப்படிச் செய்வது?' : 'மின்னணுக் கழிவு என்றால் என்ன?') : prompt); }}>{data.language === 'ta' ? (prompt.includes('battery') ? 'மின்கலத்தை எப்படிச் செய்வது?' : 'மின்னணுக் கழிவு என்றால் என்ன?') : prompt}</button>)}</div><form className="chat-form" onSubmit={submitChat}><input value={chatText} onChange={(event) => setChatText(event.target.value)} placeholder={t.botPlaceholder} aria-label={t.botPlaceholder} /><button className="button button-dark" type="submit">{t.send}<span>↑</span></button></form></section></>}
    {toast && <div className="toast" role="status">{toast}</div>}
  </div>
}

function PageIntro({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children: ReactNode }) {
  return <div className="content-wrap page-wrap"><div className="page-heading"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{subtitle}</p></div>{children}</div>
}

function formatDate(date: string, language: Language) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', { day: 'numeric', month: 'short' })
}

function weekDayLabels(language: Language): string[] {
  return language === 'ta' ? ['தி', 'செ', 'பு', 'வி', 'வெ', 'ச', 'ஞா'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S']
}

function streakDays(count: number, language: Language): string {
  return count === 1 ? copy[language].day : copy[language].days
}

function calendarDays(): (number | null)[] {
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay()
  const offset = (firstDay + 6) % 7
  const days = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  return [...Array<null>(offset).fill(null), ...Array.from({ length: days }, (_, index) => index + 1)]
}

export default App
