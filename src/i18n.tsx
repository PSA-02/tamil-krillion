import { createContext, useContext, type ReactNode } from 'react'

export type Lang = 'ta' | 'en'

export const STRINGS = {
  title: { ta: 'கிரில்லியன் தமிழ்', en: 'Krillion Tamil' },
  tagline: {
    ta: 'சரியான பதில் போதாது. அரிதான பதிலே ஆழத்துக்குக் கொண்டு செல்லும்.',
    en: 'Being right is not enough. Rare answers take you deeper.',
  },
  dailyDive: { ta: 'இன்றைய மூழ்கல்', en: 'Daily Dive' },
  diveNo: { ta: 'மூழ்கல் #', en: 'Dive #' },
  practice: { ta: 'பயிற்சி மூழ்கல்', en: 'Practice Dive' },
  practiceHint: { ta: 'வரம்பில்லை, புள்ளிவிவரத்தில் சேராது', en: 'Unlimited, not counted in stats' },
  viewResult: { ta: 'இன்றைய முடிவைப் பார்', en: "See today's result" },
  doneToday: { ta: 'இன்றைய மூழ்கல் முடிந்தது. நாளை புதிய கேள்விகள்.', en: "Today's dive is done. New prompts tomorrow." },
  howToPlay: { ta: 'எப்படி விளையாடுவது?', en: 'How to play' },
  rules1: {
    ta: '7 கேள்விகள். ஒவ்வொன்றுக்கும் 25 வினாடிகள், ஒரே ஒரு பதில்.',
    en: '7 prompts. 25 seconds and one answer for each.',
  },
  rules2: {
    ta: 'பல சரியான பதில்கள் உண்டு. குறைவானவர்கள் நினைக்கும் பதிலுக்கு அதிகப் புள்ளிகள்.',
    en: 'Many answers are correct. The fewer people who would think of yours, the more it scores.',
  },
  rules3: {
    ta: 'தமிழிலோ ஆங்கில எழுத்திலோ எழுதலாம்: "இட்லி" அல்லது "idli".',
    en: 'Type in Tamil script or in English letters: "இட்லி" or "idli".',
  },
  rules4: {
    ta: 'ஒவ்வொரு புள்ளியும் 10 மீட்டர் ஆழம். முழு மதிப்பெண் = 7,000 மீ.',
    en: 'Every point is 10 metres of depth. A perfect dive reaches 7,000 m.',
  },
  tiersTitle: { ta: 'அரிதுத் தரங்கள்', en: 'Rarity tiers' },
  points: { ta: 'புள்ளிகள்', en: 'points' },
  pts: { ta: 'பு', en: 'pts' },
  metres: { ta: 'மீ', en: 'm' },
  prompt: { ta: 'கேள்வி', en: 'Prompt' },
  of: { ta: '/', en: '/' },
  placeholder: { ta: 'உங்கள் பதில்…', en: 'Your answer…' },
  submit: { ta: 'மூழ்கு', en: 'Dive' },
  skip: { ta: 'தவிர்', en: 'Skip' },
  next: { ta: 'அடுத்தது', en: 'Next' },
  finish: { ta: 'முடிவைப் பார்', en: 'See results' },
  secondsLeft: { ta: 'வினாடிகள் மீதம்', en: 'seconds left' },
  notOnList: { ta: 'பட்டியலில் இல்லை', en: 'Not on the list' },
  timeUp: { ta: 'நேரம் முடிந்தது', en: "Time's up" },
  skipped: { ta: 'தவிர்க்கப்பட்டது', en: 'Skipped' },
  deeperAnswers: { ta: 'ஆழத்தில் இருந்த பதில்கள்', en: 'Deeper answers you could have found' },
  resultTitle: { ta: 'நீங்கள் அடைந்த ஆழம்', en: 'You reached' },
  share: { ta: 'பகிர்', en: 'Share' },
  copied: { ta: 'நகலெடுக்கப்பட்டது!', en: 'Copied!' },
  home: { ta: 'முகப்பு', en: 'Home' },
  playAgain: { ta: 'மீண்டும் பயிற்சி', en: 'Practice again' },
  yourAnswers: { ta: 'உங்கள் பதில்கள்', en: 'Your answers' },
  stats: { ta: 'புள்ளிவிவரம்', en: 'Stats' },
  played: { ta: 'மூழ்கல்கள்', en: 'Dives' },
  best: { ta: 'சிறந்தது', en: 'Best' },
  streak: { ta: 'தொடர்', en: 'Streak' },
  maxStreak: { ta: 'உச்சத் தொடர்', en: 'Max streak' },
  surface: { ta: 'கடல் மேற்பரப்பு', en: 'Surface' },
  language: { ta: 'English', en: 'தமிழ்' },
  footer: {
    ta: 'Krillion விளையாட்டால் ஈர்க்கப்பட்ட ரசிகர் திட்டம்.',
    en: 'A fan project inspired by the game Krillion.',
  },
  tagline2: {
    ta: 'மெரினாவிலிருந்து வங்கக் கடலுக்குள் மூழ்குங்கள்.',
    en: 'Dive from Marina Beach into the Bay of Bengal.',
  },
  sound: { ta: 'ஒலி', en: 'Sound' },
  soundOn: { ta: 'ஒலியை நிறுத்து', en: 'Mute sound' },
  soundOff: { ta: 'ஒலியை இயக்கு', en: 'Turn sound on' },
  categories: { ta: 'வகைகள்', en: 'categories' },
  answersCount: { ta: 'பதில்கள்', en: 'answers' },
  secrets: { ta: 'ரகசியங்கள்', en: 'Secrets found' },
  secretsHint: {
    ta: 'கடற்கரையில் சில ரகசியங்கள் ஒளிந்துள்ளன…',
    en: 'A few secrets are hidden on the beach…',
  },
  friends: { ta: 'நண்பருடன் போட்டி', en: 'Friend duel' },
  friendsEmpty: {
    ta: 'இன்றைய மூழ்கலை முடித்து, ஒரு நண்பருக்குச் சவால் இணைப்பை அனுப்புங்கள்.',
    en: "Finish today's dive, then send a friend your challenge link.",
  },
  you: { ta: 'நீங்கள்', en: 'You' },
  wins: { ta: 'வெற்றி', en: 'Wins' },
  draws: { ta: 'சமன்', en: 'Draws' },
  totalDepth: { ta: 'மொத்த ஆழம்', en: 'Total depth' },
  bestDepth: { ta: 'சிறந்த ஆழம்', en: 'Best' },
  recentDuels: { ta: 'சமீபத்திய மோதல்கள்', en: 'Recent duels' },
  waiting: { ta: 'காத்திருக்கிறது', en: 'waiting' },
  challenge: { ta: 'நண்பருக்குச் சவால் விடு', en: 'Challenge a friend' },
  sendBack: { ta: 'உங்கள் முடிவைத் திருப்பி அனுப்பு', en: 'Send your score back' },
  linkCopied: { ta: 'இணைப்பு நகலெடுக்கப்பட்டது!', en: 'Link copied!' },
  yourName: { ta: 'உங்கள் பெயர்', en: 'Your name' },
  namePrompt: {
    ta: 'சவால் இணைப்பில் உங்கள் நண்பர் காணும் பெயர்',
    en: 'The name your friend will see on the challenge',
  },
  save: { ta: 'சேமி', en: 'Save' },
  challengedYou: { ta: 'உங்களுக்குச் சவால் விட்டுள்ளார்', en: 'challenged you' },
  challengeToday: {
    ta: 'இன்றைய மூழ்கலை விளையாடி ஒப்பிடுங்கள்!',
    en: "Play today's dive to compare!",
  },
  challengeOld: {
    ta: 'இந்தச் சவால் முந்தைய மூழ்கலுக்கானது. மதிப்பெண் சேமிக்கப்பட்டது.',
    en: 'This challenge was for an earlier dive. Their score is saved.',
  },
  acceptChallenge: { ta: 'சவாலை ஏற்று மூழ்கு', en: 'Accept and dive' },
  youWin: { ta: 'நீங்கள் வென்றீர்கள்!', en: 'You win!' },
  youLose: { ta: 'இந்த முறை தோல்வி', en: 'They win this one' },
  itsDraw: { ta: 'சமன்!', en: "It's a draw!" },
  versus: { ta: 'எதிர்', en: 'vs' },
  challengeText: {
    ta: 'கிரில்லியன் தமிழில் என் ஆழத்தைத் தாண்ட முடியுமா?',
    en: 'Can you dive deeper than me in Krillion Tamil?',
  },
  egg_night: { ta: 'இரவு மெரினா 🌙 கலங்கரை விளக்கம் விழித்தது!', en: 'Marina at night 🌙 The lighthouse is awake!' },
  egg_lighthouse: { ta: 'கலங்கரை விளக்கம் ஒளிர்கிறது! ✨', en: 'You lit the lighthouse! ✨' },
  egg_sundal: { ta: 'சுண்டல், சுண்டல்! 🥜 சுண்டல் வண்டி வந்தது', en: 'Sundal, sundal! 🥜 The sundal cart has arrived' },
  egg_whistle: { ta: 'விசில் போடு! 🦁💛', en: 'Whistle podu! 🦁💛' },
  egg_neithal: {
    ta: 'நெய்தல்: கடலும் கடல் சார்ந்த இடமும். மெரினாவின் திணை இதுதான் 🌊',
    en: "Neithal: the seashore landscape. That's Marina's thinai 🌊",
  },
  egg_kattumaram: { ta: 'கட்டுமரம் கடலுக்குப் புறப்பட்டது ⛵', en: 'A kattumaram sets sail ⛵' },
  egg_crore: { ta: 'கோடியில் ஒருவன்! முழு 7,000 மீ 💎', en: 'One in a crore! The full 7,000 m 💎' },
} satisfies Record<string, Record<Lang, string>>

export type StringKey = keyof typeof STRINGS

interface LangValue {
  lang: Lang
  t: (key: StringKey) => string
  /** Picks the field for the current language from any {ta, en} pair. */
  pick: (value: { ta: string; en: string }) => string
}

const LangContext = createContext<LangValue>({
  lang: 'ta',
  t: (key) => STRINGS[key].ta,
  pick: (value) => value.ta,
})

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const value: LangValue = {
    lang,
    t: (key) => STRINGS[key][lang],
    pick: (v) => v[lang],
  }
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang(): LangValue {
  return useContext(LangContext)
}
