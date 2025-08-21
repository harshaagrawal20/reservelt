import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useLocation } from 'react-router-dom'
import TutorialOverlay from './TutorialOverlay'

const TutorialManager = () => {
  const { user, isLoaded } = useUser()
  const location = useLocation()
  const [showTutorial, setShowTutorial] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      checkIfNewUser()
    }
  }, [isLoaded, user])

  useEffect(() => {
    // Show tutorial when user navigates to dashboard after signing up
    if (isNewUser && location.pathname === '/dashboard') {
      const timer = setTimeout(() => {
        setShowTutorial(true)
      }, 1000) // Small delay to let the dashboard load

      return () => clearTimeout(timer)
    }
  }, [isNewUser, location.pathname])

  const checkIfNewUser = () => {
    if (!user?.id) return

    // Check if tutorial has been completed for this user
    const tutorialCompleted = localStorage.getItem(`tutorial_completed_${user.id}`)
    
    // Check if this is a new user (account created recently)
    const userCreatedAt = new Date(user.createdAt)
    const now = new Date()
    const daysSinceCreation = (now - userCreatedAt) / (1000 * 60 * 60 * 24)
    
    // Show tutorial if it hasn't been completed and user is new (within 7 days)
    const shouldShowTutorial = !tutorialCompleted && daysSinceCreation <= 7
    
    setIsNewUser(shouldShowTutorial)
  }

  const handleTutorialComplete = () => {
    setShowTutorial(false)
    setIsNewUser(false)
  }

  const handleTutorialSkip = () => {
    setShowTutorial(false)
    setIsNewUser(false)
  }

  // Manual trigger for tutorial (can be called from settings or help menu)
  const startTutorial = () => {
    setShowTutorial(true)
  }

  // Expose the startTutorial function globally for other components to use
  useEffect(() => {
    window.startTutorial = startTutorial
    return () => {
      delete window.startTutorial
    }
  }, [])

  return (
    <TutorialOverlay
      isVisible={showTutorial}
      onComplete={handleTutorialComplete}
      onSkip={handleTutorialSkip}
    />
  )
}

export default TutorialManager
