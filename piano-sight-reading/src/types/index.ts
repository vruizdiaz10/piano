export type Clef = 'treble' | 'bass'

export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B'

export interface Note {
  name: NoteName
  octave: number
  midi: number
}

export type GamePhase = 'idle' | 'waiting' | 'feedback' | 'levelComplete'

export type ErrorType =
  | 'line-space'
  | 'step'
  | 'skip'
  | 'octave'
  | 'accidental'
  | 'ledger-line'
  | 'random'

export interface MasteryCriteria {
  minAccuracy: number
  minStreak: number
  minNotes: number
  unlockNext: boolean
}

export interface AdaptiveData {
  window: boolean[]
  windowSize: number
}

export interface GameState {
  phase: GamePhase
  currentNote: Note | null
  lastAnswerCorrect: boolean | null
  lastAnswerMidi: number | null
  lastErrorType: ErrorType | null
  recovering: boolean
  streak: number
  bestStreak: number
  totalAttempts: number
  correctAttempts: number
  adaptive: AdaptiveData
  lessonId: string
  showNoteName: boolean
  sessionTarget: number
  startTime: number | null
  isMuted: boolean
  theme: 'light' | 'dark'
}
