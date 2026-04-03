import React from 'react'
import { Outlet } from 'react-router-dom'
import AppFooter from './AppFooter'

export default function SiteLayout() {
  return (
    <>
      <Outlet />
      <AppFooter />
    </>
  )
}
