import { useState, useCallback } from 'react'
import { GameState, Note, ErrorType } from '../types'
import { midiToNote } from '../utils/midiToNote'
import { analyzeError } from '../utils/errorAnalysis'
import { getLessonPool } from '../data/lessons'

const SESSION_TARGET = 10

const INITIAL_STATE: GameState = {
  phase: 'idle',
  currentNote: null,
  lastAnswerCorrect: null,
  lastAnswerMidi: null,
  lastErrorType: null,
  recovering: false,
  streak: 0,
  bestStreak: 0,
  totalAttempts: 0,
  correctAttempts: 0,
  lessonId: 'lines',
  showNoteName: true,
  sessionTarget: SESSION_TARGET,
  startTime: null,
  isMuted: false,
  theme: (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light',
}

function selectNote(lessonId: string, excludeMidi?: number): Note {
  const pool = getLessonPool(lessonId)
  const filtered = pool.length > 1 ? pool.filter(m => m !== excludeMidi) : pool
  const midi = filtered[Math.floor(Math.random() * filtered.length)]
  return midiToNote(midi)
}

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL_STATE)

  const startGame = useCallback(() => {
    setState(prev => {
      const note = selectNote(prev.lessonId)
      return {
        ...prev, phase: 'waiting', currentNote: note,
        streak: 0, bestStreak: 0, totalAttempts: 0, correctAttempts: 0,
        lastAnswerCorrect: null, lastAnswerMidi: null, lastErrorType: null,
        startTime: Date.now(), recovering: false,
      }
    })
  }, [])

  const submitAnswer = useCallback((midi: number) => {
    setState(prev => {
      if (prev.phase === 'waiting' && prev.currentNote) {
        const isCorrect = midi === prev.currentNote.midi
        const newStreak = isCorrect ? prev.streak + 1 : 0
        const newTotal = prev.totalAttempts + 1
        const newCorrect = prev.correctAttempts + (isCorrect ? 1 : 0)
        const newBestStreak = Math.max(prev.bestStreak, newStreak)
        const sessionDone = newTotal >= prev.sessionTarget

        const errorType: ErrorType | null = isCorrect ? null : analyzeError(prev.currentNote, midi)

        return {
          ...prev,
          phase: sessionDone ? 'levelComplete' : 'feedback',
          lastAnswerCorrect: isCorrect,
          lastAnswerMidi: midi,
          lastErrorType: errorType,
          recovering: !isCorrect && !sessionDone,
          streak: newStreak,
          bestStreak: newBestStreak,
          totalAttempts: newTotal,
          correctAttempts: newCorrect,
        }
      }
      if (prev.phase === 'feedback' && prev.recovering && !prev.lastAnswerCorrect && prev.currentNote) {
        if (midi !== prev.currentNote.midi) return prev
        return {
          ...prev,
          lastAnswerCorrect: true,
          lastAnswerMidi: midi,
          lastErrorType: null,
          recovering: false,
          correctAttempts: prev.correctAttempts + 1,
        }
      }
      return prev
    })
  }, [])

  const nextNote = useCallback(() => {
    setState(prev => {
      const note = selectNote(prev.lessonId, prev.currentNote?.midi)
      return { ...prev, phase: 'waiting', currentNote: note, lastAnswerCorrect: null, lastAnswerMidi: null, lastErrorType: null, recovering: false }
    })
  }, [])

  const setLesson = useCallback((lessonId: string) => {
    setState(prev => ({ ...prev, lessonId }))
  }, [])

  const setShowNoteName = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showNoteName: show }))
  }, [])

  const setMuted = useCallback((muted: boolean) => {
    setState(prev => ({ ...prev, isMuted: muted }))
  }, [])

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setState(prev => ({ ...prev, theme }))
  }, [])

  const restartGame = useCallback(() => {
    setState(prev => {
      const note = selectNote(prev.lessonId)
      return {
        ...prev, phase: 'waiting', currentNote: note,
        streak: 0, bestStreak: 0, totalAttempts: 0, correctAttempts: 0,
        lastAnswerCorrect: null, lastAnswerMidi: null, lastErrorType: null,
        startTime: Date.now(), recovering: false,
      }
    })
  }, [])

  return {
    state, startGame, submitAnswer, nextNote,
    setLesson, setShowNoteName, setMuted, setTheme, restartGame,
  }
}
