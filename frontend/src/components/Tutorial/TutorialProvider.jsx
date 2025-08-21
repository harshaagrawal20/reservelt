import React, { createContext, useContext, useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import TutorialOverlay from './TutorialOverlay'

const TutorialContext = createContext()

export const useTutorial = () => {
  const context = useContext(TutorialContext)
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider')
  }
  return context
}

export const TutorialProvider = ({ children }) => {
  const { user, isLoaded } = useUser()
  const [showTutorial, setShowTutorial] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      checkIfNewUser()
    }
  }, [isLoaded, user])

  useEffect(() => {
    // Show tutorial when user navigates to dashboard after signing up
    if (isNewUser) {
      // Listen for route changes
      const checkPath = () => {
        if (window.location.pathname === '/dashboard') {
          const timer = setTimeout(() => {
            setShowTutorial(true)
          }, 1000) // Small delay to let the dashboard load
          return () => clearTimeout(timer)
        }
      }
      
      // Check immediately
      checkPath()
      
      // Also listen for popstate events (browser navigation)
      window.addEventListener('popstate', checkPath)
      
      return () => {
        window.removeEventListener('popstate', checkPath)
      }
    }
  }, [isNewUser])

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

  const startTutorial = () => {
    setShowTutorial(true)
  }

  const handleTutorialComplete = () => {
    setShowTutorial(false)
    setIsNewUser(false)
  }

  const handleTutorialSkip = () => {
    setShowTutorial(false)
    setIsNewUser(false)
  }

  const value = {
    showTutorial,
    startTutorial,
    isNewUser
  }

  return (
    <TutorialContext.Provider value={value}>
      {children}
      <TutorialOverlay
        isVisible={showTutorial}
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
      />
    </TutorialContext.Provider>
  )
}

export default TutorialProvider
