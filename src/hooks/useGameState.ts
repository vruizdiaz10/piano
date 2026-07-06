import { useState, useCallback } from 'react'
import { GameState, Note } from '../types'
import { midiToNote } from '../utils/midiToNote'
import { getLessonPool } from '../data/lessons'

const SESSION_TARGET = 10

const INITIAL_STATE: GameState = {
  phase: 'idle',
  currentNote: null,
  lastAnswerCorrect: null,
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

function randomNote(lessonId: string): Note {
  const pool = getLessonPool(lessonId)
  const midi = pool[Math.floor(Math.random() * pool.length)]
  return midiToNote(midi)
}

export function useGameState() {
  const [state, setState] = useState<GameState>(INITIAL_STATE)

  const startGame = useCallback(() => {
    setState(prev => {
      const note = randomNote(prev.lessonId)
      return { ...prev, phase: 'waiting', currentNote: note, streak: 0, bestStreak: 0, totalAttempts: 0, correctAttempts: 0, startTime: Date.now() }
    })
  }, [])

  const submitAnswer = useCallback((midi: number) => {
    setState(prev => {
      if (prev.phase !== 'waiting' || !prev.currentNote) return prev
      const isCorrect = midi === prev.currentNote.midi
      const newStreak = isCorrect ? prev.streak + 1 : 0
      const newTotal = prev.totalAttempts + 1
      const newCorrect = prev.correctAttempts + (isCorrect ? 1 : 0)
      const newBestStreak = Math.max(prev.bestStreak, newStreak)
      const sessionDone = newTotal >= prev.sessionTarget
      return {
        ...prev,
        phase: sessionDone ? 'levelComplete' : 'feedback',
        lastAnswerCorrect: isCorrect,
        streak: newStreak,
        bestStreak: newBestStreak,
        totalAttempts: newTotal,
        correctAttempts: newCorrect,
      }
    })
  }, [])

  const nextNote = useCallback(() => {
    setState(prev => {
      const note = randomNote(prev.lessonId)
      return { ...prev, phase: 'waiting', currentNote: note }
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

  const resetToIdle = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'idle', currentNote: null, streak: 0, totalAttempts: 0, correctAttempts: 0, startTime: null }))
  }, [])

  return { state, startGame, submitAnswer, nextNote, setLesson, setShowNoteName, setMuted, setTheme, resetToIdle }
}
