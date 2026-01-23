'use client'

import { useState } from 'react'
import AboutTab from './tabs/AboutTab'
import GetScriptTab from './tabs/GetScriptTab'

interface TabContentProps {
  activeTab: string
}

export default function TabContent({ activeTab }: TabContentProps) {
  return (
    <section className='py-20 px-4 max-w-6xl mx-auto'>
      {activeTab === 'about' && <AboutTab />}
      {activeTab === 'script' && <GetScriptTab />}
    </section>
  )
}
