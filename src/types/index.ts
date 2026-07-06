export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B'

export interface Note {
  name: NoteName
  octave: number
  midi: number
}

export type Difficulty = 'beginner' | 'intermediate'

export type GamePhase = 'idle' | 'waiting' | 'feedback'

export interface GameState {
  phase: GamePhase
  currentNote: Note | null
  lastAnswerCorrect: boolean | null
  streak: number
  totalAttempts: number
  correctAttempts: number
  difficulty: Difficulty
  showNoteName: boolean
}
