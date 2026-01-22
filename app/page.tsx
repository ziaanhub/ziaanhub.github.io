'use client'

import { useState, useRef, useEffect } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import TabContent from '@/components/TabContent'
import Footer from '@/components/Footer'

export default function Home() {
  const [activeTab, setActiveTab] = useState('about')

  return (
    <div className='min-h-screen bg-black text-white animated-grid relative'>
      {/* Animated background overlay */}
      <div className='fixed inset-0 pointer-events-none opacity-30'>
        <div className='absolute inset-0 bg-gradient-to-b from-red-600/3 to-transparent' />
      </div>

      <div className='relative z-10'>
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        <Hero />
        <TabContent activeTab={activeTab} />
        <Footer />
      </div>
    </div>
  )
}
