import React from 'react'
import { Outlet } from 'react-router-dom'
import TutorialProvider from './Tutorial/TutorialProvider'

const AppLayout = () => {
  return (
    <TutorialProvider>
      <Outlet />
    </TutorialProvider>
  )
}

export default AppLayout
