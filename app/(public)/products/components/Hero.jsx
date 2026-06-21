import React from 'react'

export default function Hero() {
  return (
    <>
    <section className="relative h-[60vh] md:h-[7 5vh] w-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/assets/2.jpg')" }}>
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center px-4 text-center">
            <h1 className="text-3xl md:text-7xl font-bold text-white leading-tight max-w-5xl">
            Welcome To Our Coop
            </h1>
        </div>
        </section>

        <section className="py-10 px-2 md:px-16 text-center">
        <p className="max-w-2xl mx-auto text-lg text-gray-400">
            Chicken Pack specializes in providing high-quality, fresh broiler meat and eggs to households,
            restaurants, and businesses. Our mission is to deliver fresh, healthy, and affordable poultry
            products while maintaining the highest standards of quality and hygiene.
        </p>
        </section>
    </>
  )
}
