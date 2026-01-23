'use client'

import Image from 'next/image'

interface HeaderProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header className='sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-gray-900'>
      <div className='max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between'>
        {/* Logo */}
        <div className='flex items-center gap-3 cursor-pointer hover:opacity-80 transition'>
          <div className='w-10 h-10 relative'>
            <Image
              src='https://files.catbox.moe/fvvwc4.png'
              alt='ZiaanHub Logo'
              width={40}
              height={40}
              className='w-full h-full object-contain'
              unoptimized
            />
          </div>
          <span className='text-xl font-bold bg-gradient-to-r from-white to-red-600 bg-clip-text text-transparent'>
            ZiaanHub
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className='flex gap-8'>
          <button
            onClick={() => setActiveTab('about')}
            className={`pb-2 px-4 font-medium transition-all border-b-2 ${
              activeTab === 'about'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`pb-2 px-4 font-medium transition-all border-b-2 ${
              activeTab === 'script'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Get Script
          </button>
        </nav>
      </div>
    </header>
  )
}
