import { useState, useCallback } from 'react'
import { GameState, Note } from '../types'
import { midiToNote } from '../utils/midiToNote'
import { getLessonPool } from '../data/lessons'

const INITIAL_STATE: GameState = {
  phase: 'idle',
  currentNote: null,
  lastAnswerCorrect: null,
  streak: 0,
  totalAttempts: 0,
  correctAttempts: 0,
  lessonId: 'lines',
  showNoteName: true,
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
      return { ...prev, phase: 'waiting', currentNote: note, streak: 0, totalAttempts: 0, correctAttempts: 0 }
    })
  }, [])

  const submitAnswer = useCallback((midi: number) => {
    setState(prev => {
      if (prev.phase !== 'waiting' || !prev.currentNote) return prev
      const isCorrect = midi === prev.currentNote.midi
      return {
        ...prev,
        phase: 'feedback',
        lastAnswerCorrect: isCorrect,
        streak: isCorrect ? prev.streak + 1 : 0,
        totalAttempts: prev.totalAttempts + 1,
        correctAttempts: prev.correctAttempts + (isCorrect ? 1 : 0),
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

  return { state, startGame, submitAnswer, nextNote, setLesson, setShowNoteName }
}
