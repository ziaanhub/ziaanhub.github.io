'use client'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const contactInfo = [
    {
      title: 'Email',
      value: 'ziaanhub@gmail.com',
      icon: (
        <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 20 20'>
          <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z' />
          <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' />
        </svg>
      ),
      link: 'mailto:ziaanhub@gmail.com',
    },
    {
      title: 'Discord Server',
      value: 'Join Community',
      icon: (
        <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 20 20'>
          <path d='M8 11a2 2 0 110-4 2 2 0 010 4z' />
          <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z' />
        </svg>
      ),
      link: 'https://discord.gg/5z4se9C758',
    },
    {
      title: 'YouTube',
      value: '@ZiaanHub',
      icon: (
        <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 20 20'>
          <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z' />
        </svg>
      ),
      link: 'https://youtube.com/@ZiaanHub',
    },
    {
      title: 'Developer',
      value: '@ziaandev',
      icon: (
        <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 20 20'>
          <path fillRule='evenodd' d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' />
        </svg>
      ),
      link: 'https://discord.com/users/ziaandev',
    },
  ]

  return (
    <footer className='border-t border-gray-800 bg-black/50 backdrop-blur'>
      {/* Contact Section */}
      <div className='max-w-7xl mx-auto px-4 md:px-6 py-20'>
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16'>
          {contactInfo.map((contact) => (
            <a
              key={contact.title}
              href={contact.link}
              target={contact.link.startsWith('http') ? '_blank' : undefined}
              rel={contact.link.startsWith('http') ? 'noopener noreferrer' : undefined}
              className='group'
            >
              <div className='bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-red-600/50 hover:bg-gray-900/80 transition-all duration-300'>
                <div className='text-3xl mb-3 group-hover:scale-110 transition-transform duration-300 text-red-600'>
                  {contact.icon}
                </div>
                <h3 className='text-gray-400 text-sm font-medium mb-2'>{contact.title}</h3>
                <p className='text-white font-bold group-hover:text-red-600 transition-colors'>
                  {contact.value}
                </p>
              </div>
            </a>
          ))}
        </div>

        {/* Stats */}
        <div className='grid md:grid-cols-3 gap-8 mb-16 py-12 border-y border-gray-800'>
          <div className='text-center'>
            <div className='text-4xl font-bold text-red-600 mb-2'>1000+</div>
            <p className='text-gray-400'>Active Users</p>
          </div>
          <div className='text-center'>
            <div className='text-4xl font-bold text-red-600 mb-2'>5+</div>
            <p className='text-gray-400'>Games Supported</p>
          </div>
          <div className='text-center'>
            <div className='text-4xl font-bold text-red-600 mb-2'>24/7</div>
            <p className='text-gray-400'>Community Support</p>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className='flex flex-col md:flex-row items-center justify-between'>
          <p className='text-gray-500 text-sm'>© {currentYear} ZiaanHub. All rights reserved.</p>

          <div className='flex gap-6 mt-6 md:mt-0'>
            <a
              href='#'
              className='text-gray-400 hover:text-red-600 transition-colors text-sm'
            >
              Privacy Policy
            </a>
            <a href='#' className='text-gray-400 hover:text-red-600 transition-colors text-sm'>
              Terms of Service
            </a>
            <a href='#' className='text-gray-400 hover:text-red-600 transition-colors text-sm'>
              Contact
            </a>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className='absolute top-20 right-10 w-40 h-40 bg-red-600/5 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute bottom-10 left-20 w-32 h-32 bg-red-500/3 rounded-full blur-3xl pointer-events-none' />
    </footer>
  )
}
