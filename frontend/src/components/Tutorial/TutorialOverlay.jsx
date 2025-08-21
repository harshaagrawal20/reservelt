import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { X, ArrowRight, SkipForward, ArrowLeft } from 'lucide-react'
import './tutorial.css'

const TutorialOverlay = ({ isVisible, onComplete, onSkip }) => {
  const { user } = useUser()
  const [currentStep, setCurrentStep] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const tutorialSteps = [
    {
      id: 'welcome',
      title: 'Welcome to Rental Management System!',
      content: 'Hi there! Let\'s take a quick tour of our rental management platform to help you get started.',
      target: null,
      position: 'center'
    },
    {
      id: 'dashboard',
      title: 'Your Dashboard',
      content: 'This is your main dashboard where you can see an overview of your rentals, recent orders, and important notifications.',
      target: '.dashboard-overview',
      position: 'bottom'
    },
    {
      id: 'products',
      title: 'Browse Products',
      content: 'Here you can browse our entire catalog of available rental products. Use filters to find exactly what you need.',
      target: '[href="/browse-products"]',
      position: 'bottom'
    },
    {
      id: 'orders',
      title: 'Manage Orders',
      content: 'View all your rental orders, track their status, and manage pickups and returns from this section.',
      target: '[href="/orders"]',
      position: 'bottom'
    },
    {
      id: 'create-order',
      title: 'Create New Order',
      content: 'Ready to rent something? Click here to create a new rental order and start the booking process.',
      target: '[href="/orders/new"]',
      position: 'bottom'
    },
    {
      id: 'notifications',
      title: 'Stay Updated',
      content: 'Keep track of important updates, order status changes, and system notifications here.',
      target: '.notification-bell',
      position: 'bottom-left'
    },
    {
      id: 'profile',
      title: 'Your Profile',
      content: 'Access your account settings, update your information, and manage your preferences from your profile menu.',
      target: '.user-profile',
      position: 'bottom-left'
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      content: 'Great! You\'ve completed the tutorial. You can always restart this tutorial from the help button in the navbar. Happy renting!',
      target: null,
      position: 'center'
    }
  ]

  const currentStepData = tutorialSteps[currentStep]

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isVisible])

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setIsTransitioning(false)
      }, 150)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentStep(currentStep - 1)
        setIsTransitioning(false)
      }, 150)
    }
  }

  const handleComplete = () => {
    // Mark tutorial as completed for this user
    localStorage.setItem(`tutorial_completed_${user?.id}`, 'true')
    onComplete()
  }

  const handleSkip = () => {
    // Mark tutorial as skipped for this user
    localStorage.setItem(`tutorial_completed_${user?.id}`, 'true')
    onSkip()
  }

  const getTargetElement = (selector) => {
    if (!selector) return null
    return document.querySelector(selector)
  }

  const getTooltipPosition = (target, position) => {
    if (!target || position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }
    }

    const rect = target.getBoundingClientRect()
    const tooltipWidth = 400
    const tooltipHeight = 200

    switch (position) {
      case 'bottom':
        return {
          top: rect.bottom + 20,
          left: Math.max(20, Math.min(window.innerWidth - tooltipWidth - 20, rect.left + (rect.width / 2) - (tooltipWidth / 2)))
        }
      case 'bottom-left':
        return {
          top: rect.bottom + 20,
          left: Math.max(20, rect.right - tooltipWidth)
        }
      case 'top':
        return {
          top: rect.top - tooltipHeight - 20,
          left: Math.max(20, Math.min(window.innerWidth - tooltipWidth - 20, rect.left + (rect.width / 2) - (tooltipWidth / 2)))
        }
      case 'right':
        return {
          top: Math.max(20, rect.top + (rect.height / 2) - (tooltipHeight / 2)),
          left: rect.right + 20
        }
      case 'left':
        return {
          top: Math.max(20, rect.top + (rect.height / 2) - (tooltipHeight / 2)),
          left: rect.left - tooltipWidth - 20
        }
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }
    }
  }

  const targetElement = getTargetElement(currentStepData.target)
  const tooltipStyle = getTooltipPosition(targetElement, currentStepData.position)

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 tutorial-overlay">
      {/* Overlay */}
      <div className="absolute inset-0 tutorial-backdrop" />
      
      {/* Highlight target element */}
      {targetElement && (
        <div
          className="absolute border-4 border-blue-500 rounded-lg shadow-lg tutorial-highlight"
          style={{
            top: targetElement.getBoundingClientRect().top - 4,
            left: targetElement.getBoundingClientRect().left - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Tutorial tooltip */}
      <div
        className={`absolute bg-white rounded-lg shadow-2xl p-6 max-w-md z-60 tutorial-tooltip ${
          isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        style={tooltipStyle}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-1">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full tutorial-progress-dot ${
                  index === currentStep ? 'bg-blue-500 active' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">
            {currentStep + 1} of {tutorialSteps.length}
          </span>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            {currentStepData.title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {currentStepData.content}
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={16} />
                Previous
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSkip}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <SkipForward size={16} />
              Skip Tutorial
            </button>
            
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors tutorial-button"
            >
              {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
              {currentStep < tutorialSteps.length - 1 && <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TutorialOverlay
