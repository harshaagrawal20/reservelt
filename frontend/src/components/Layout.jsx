import React from 'react'
import { Outlet } from 'react-router-dom'
import TutorialManager from './Tutorial/TutorialManager'

const Layout = () => {
  return (
    <>
      <Outlet />
      <TutorialManager />
    </>
  )
}

export default Layout
