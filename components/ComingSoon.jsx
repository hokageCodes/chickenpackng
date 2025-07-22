import React from 'react'

export default function ComingSoon() {
  return (
    <section
  className="h-screen w-full bg-fixed bg-cover bg-center relative flex items-center justify-center text-white"
  style={{ backgroundImage: `url('/images/chicken-bg.jpg')` }} // Replace with your actual image path
>

  {/* Content */}
  <div className="relative z-10 text-center px-6">
    <h1 className="text-5xl md:text-9xl text-white mb-4">Chicken Pack</h1>
    <p className="text-xl md:text-2xl font-medium text-white mb-8">
      We’re cooking something fresh and exciting. <br /> Stay tuned!
    </p>
    <a
      href="/"
      className="inline-block border hover:bg-yellow-500 hover:text-black px-8 py-3 rounded-full text-lg font-semibold shadow-md transition"
    >
      Go to Home Page
    </a>
  </div>
</section>

  )
}
