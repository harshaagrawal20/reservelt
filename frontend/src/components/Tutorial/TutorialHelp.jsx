import React from 'react'
import { HelpCircle, Play } from 'lucide-react'
import { useTutorial } from './TutorialProvider'

const TutorialHelp = ({ variant = 'button', className = '' }) => {
  const { startTutorial } = useTutorial()

  const handleStartTutorial = () => {
    startTutorial()
  }

  if (variant === 'menu-item') {
    return (
      <button
        onClick={handleStartTutorial}
        className={`w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
      >
        <Play size={16} className="text-blue-600" />
        <span>Take Tutorial</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleStartTutorial}
      className={`flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors tutorial-help-button ${className}`}
      title="Take a guided tour"
    >
      <HelpCircle size={20} />
      <span className="hidden sm:inline"></span>
    </button>
  )
}

export default TutorialHelp
