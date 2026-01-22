export default function AboutTab() {
  return (
    <div className='animate-in fade-in duration-500'>
      <div className='grid md:grid-cols-2 gap-12 items-center'>
        {/* Left side */}
        <div className='space-y-8'>
          <div>
            <h2 className='text-4xl md:text-5xl font-bold mb-4'>About ZiaanHub</h2>
            <div className='h-1 w-20 bg-gradient-to-r from-red-600 to-transparent' />
          </div>

          <div className='space-y-6 text-gray-300'>
            <p className='text-lg leading-relaxed'>
              ZiaanHub is a premium Roblox exploit script platform designed with cutting-edge technology. We provide powerful, secure, and user-friendly scripts for the modern exploiter.
            </p>

            <div className='bg-gray-900/50 border border-gray-800 rounded-lg p-6'>
              <h3 className='text-red-600 font-bold mb-4 flex items-center gap-2'>
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                </svg>
                Key Features
              </h3>
              <ul className='space-y-3 text-sm'>
                <li className='flex gap-3'>
                  <span className='text-red-600'>•</span>
                  <span>Full support for Mobile and PC platforms</span>
                </li>
                <li className='flex gap-3'>
                  <span className='text-red-600'>•</span>
                  <span>Compatible with all major executors</span>
                </li>
                <li className='flex gap-3'>
                  <span className='text-red-600'>•</span>
                  <span>Regular updates with new features</span>
                </li>
                <li className='flex gap-3'>
                  <span className='text-red-600'>•</span>
                  <span>24/7 responsive community support</span>
                </li>
                <li className='flex gap-3'>
                  <span className='text-red-600'>•</span>
                  <span>Intuitive and easy to use interface</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className='relative'>
          <div className='absolute inset-0 bg-gradient-to-br from-red-600/20 to-red-500/10 rounded-2xl blur-2xl' />
          <div className='relative bg-gray-900/80 border border-gray-800 rounded-2xl p-8 space-y-8'>
            <div className='space-y-3'>
              <h3 className='text-xl font-bold text-white flex items-center gap-2'>
                <svg className='w-5 h-5 text-red-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z' />
                </svg>
                Platform Support
              </h3>
              <div className='space-y-2'>
                <div className='flex items-center gap-3'>
                  <div className='w-3 h-3 rounded-full bg-red-600' />
                  <span className='text-gray-300'>Windows PC</span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-3 h-3 rounded-full bg-red-600' />
                  <span className='text-gray-300'>Mac OS</span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-3 h-3 rounded-full bg-red-600' />
                  <span className='text-gray-300'>Android Mobile</span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-3 h-3 rounded-full bg-red-600' />
                  <span className='text-gray-300'>iOS Mobile</span>
                </div>
              </div>
            </div>

            <div className='space-y-3'>
              <h3 className='text-xl font-bold text-white flex items-center gap-2'>
                <svg className='w-5 h-5 text-red-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z' />
                </svg>
                Latest Version
              </h3>
              <div className='text-sm text-gray-400'>
                <p>Version: <span className='text-red-600 font-bold'>2.5.0</span></p>
                <p>Last Updated: <span className='text-red-600 font-bold'>January 2025</span></p>
              </div>
            </div>

            <div className='pt-4 border-t border-gray-800'>
              <p className='text-sm text-gray-400'>
                Join our thriving community with thousands of active users worldwide enjoying premium script features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
