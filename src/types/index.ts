export type Notation = 'american' | 'latino'

export type Clef = 'treble' | 'bass' | 'both'

export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B'

export interface Note {
  name: NoteName
  octave: number
  midi: number
}

export type GamePhase = 'idle' | 'waiting' | 'feedback' | 'levelComplete'

export interface QuickLessonConfig {
  clef: 'treble' | 'bass' | 'both'
  lines: boolean
  spaces: boolean
  ledgerAbove: number  // 0-3
  ledgerBelow: number  // 0-3
  sharps: boolean
  timed: boolean
  noteCount: 5 | 10 | 20
}

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

export interface GameState {
  notation: Notation
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
  lessonId: string
  showNoteName: boolean
  sessionTarget: number
  startTime: number | null
  isMuted: boolean
  noteShownAt: number
  responseTimes: number[]
  lastCorrectNote?: Note | null
  isTimed: boolean
  customPool?: number[]
  /** Display-only: used for staff rendering and clef switching. Note selection uses customPool. */
  clef: Clef
}
