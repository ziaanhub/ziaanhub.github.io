'use client'

import { useState } from 'react'

export default function GetScriptTab() {
  const [copied, setCopied] = useState(false)
  const scriptCode = 'loadstring(game:HttpGet("https://ziaanhub.github.io/main"))()'

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className='animate-in fade-in duration-500'>
      <div className='max-w-3xl mx-auto space-y-12'>
        {/* Title */}
        <div>
          <h2 className='text-4xl md:text-5xl font-bold mb-4'>Get Script</h2>
          <div className='h-1 w-20 bg-gradient-to-r from-red-600 to-transparent' />
          <p className='text-gray-400 mt-4'>Copy the script below and use it in your Roblox executor</p>
        </div>

        {/* Script Display Box */}
        <div className='space-y-4'>
          <div className='bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-8 relative overflow-hidden group'>
            {/* Animated background */}
            <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
              <div className='absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5' />
            </div>

            <div className='relative z-10'>
              {/* Code Display */}
              <div className='bg-black/50 border border-gray-800 rounded-lg p-6 mb-4'>
                <code className='text-red-400 font-mono text-sm md:text-base break-all leading-relaxed'>
                  {scriptCode}
                </code>
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className={`w-full py-3 px-6 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/50'
                }`}
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  {copied ? (
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  ) : (
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                  )}
                </svg>
                {copied ? 'Copied!' : 'Copy Script'}
              </button>
            </div>
          </div>
        </div>

        {/* How to Use */}
        <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-8'>
          <h3 className='text-2xl font-bold mb-6 text-white flex items-center gap-2'>
            <svg className='w-6 h-6 text-red-600' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M9 2a1 1 0 000 2h2a1 1 0 100-2H9z' />
              <path fillRule='evenodd' d='M4 5a2 2 0 012-2 1 1 0 000-2 4 4 0 00-4 4v10a4 4 0 004 4h12a4 4 0 004-4V5a4 4 0 00-4-4 1 1 0 000 2 2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5z' />
            </svg>
            How to Use
          </h3>
          <ol className='space-y-4 text-gray-300'>
            <li className='flex gap-4'>
              <span className='bg-red-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0'>
                1
              </span>
              <span>Copy the script above using the "Copy Script" button</span>
            </li>
            <li className='flex gap-4'>
              <span className='bg-red-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0'>
                2
              </span>
              <span>Open Roblox and select the game you want to exploit</span>
            </li>
            <li className='flex gap-4'>
              <span className='bg-red-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0'>
                3
              </span>
              <span>Use your favorite executor (Synapse X, Script-Ware, Krnl, etc)</span>
            </li>
            <li className='flex gap-4'>
              <span className='bg-red-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0'>
                4
              </span>
              <span>Paste the script and click execute/run</span>
            </li>
            <li className='flex gap-4'>
              <span className='bg-red-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0'>
                5
              </span>
              <span>Enjoy ZiaanHub features in your game!</span>
            </li>
          </ol>
        </div>

        {/* Requirements */}
        <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-8'>
          <h3 className='text-2xl font-bold mb-6 text-white flex items-center gap-2'>
            <svg className='w-6 h-6 text-red-600' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 3.062v2.332c0 2.992-1.797 5.74-4.31 7.023C10.3 16.620 9.5 16.86 8.5 17h-1c-1 -.14-1.8-.38-2.7-.968C3.02 13.645 1.222 10.897 1.222 7.849v-2.332a3.066 3.066 0 012.812-3.062z' />
            </svg>
            Requirements
          </h3>
          <div className='space-y-3 text-gray-300'>
            <div className='flex items-center gap-3'>
              <svg className='w-5 h-5 text-red-600' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' />
              </svg>
              <span>Roblox game to exploit</span>
            </div>
            <div className='flex items-center gap-3'>
              <svg className='w-5 h-5 text-red-600' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' />
              </svg>
              <span>Script executor (Synapse X, Script-Ware, Krnl, etc)</span>
            </div>
            <div className='flex items-center gap-3'>
              <svg className='w-5 h-5 text-red-600' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' />
              </svg>
              <span>Stable internet connection</span>
            </div>
            <div className='flex items-center gap-3'>
              <svg className='w-5 h-5 text-red-600' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' />
              </svg>
              <span>Roblox player installed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
