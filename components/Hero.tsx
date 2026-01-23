export default function Hero() {
  return (
    <section className='min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden'>
      {/* Animated background elements */}
      <div className='absolute top-20 left-10 w-72 h-72 bg-red-600/5 rounded-full blur-3xl animate-pulse' />
      <div className='absolute bottom-20 right-10 w-96 h-96 bg-red-500/3 rounded-full blur-3xl animate-pulse' />

      <div className='relative z-10 text-center max-w-4xl'>
        <div className='mb-8 inline-block'>
          <span className='px-4 py-2 bg-red-600/10 border border-red-600/30 rounded-full text-red-600 text-sm font-medium'>
            Roblox Exploit Script
          </span>
        </div>

        <h1 className='text-6xl md:text-7xl font-black mb-6 leading-tight'>
          <span className='text-white'>Ziaan</span>
          <span className='text-transparent bg-gradient-to-r from-red-600 via-red-500 to-red-600 bg-clip-text'>
            Hub
          </span>
        </h1>

        <p className='text-lg md:text-xl text-gray-300 mb-8 leading-relaxed'>
          Advanced Roblox exploit script with full support for{' '}
          <span className='text-red-600 font-semibold'>Mobile and PC</span>. Packed with powerful features and easy to use.
        </p>

        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <button className='px-8 py-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all transform hover:scale-105 glow-accent'>
            Download Script
          </button>
          <button className='px-8 py-4 border border-red-600 text-red-600 font-bold rounded-lg hover:bg-red-600/10 transition-all'>
            Documentation
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className='absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce'>
        <svg className='w-6 h-6 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 14l-7 7m0 0l-7-7m7 7V3' />
        </svg>
      </div>
    </section>
  )
}
