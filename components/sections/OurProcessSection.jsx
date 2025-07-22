'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

const steps = [
  {
    number: '01',
    title: 'Source',
    headline: 'From Farm to Market',
    text: 'We begin by sourcing the freshest ingredients directly from trusted local farms.',
    image: '/assets/1.jpg',
    button: 'See Our Farms',
  },
  {
    number: '02',
    title: 'Craft',
    headline: 'Expertly Prepared',
    text: 'Our skilled artisans transform these ingredients into mouthwatering products.',
    image: '/assets/2.jpg',
    button: 'Meet Our Chefs',
  },
  {
    number: '03',
    title: 'Deliver',
    headline: 'To Your Doorstep',
    text: 'Seamless delivery ensures your favorites arrive fresh and fast.',
    image: '/assets/3.jpg',
    button: 'Track Delivery',
  },
]

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8 } },
}

const imageVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.8 } },
}

const TextContent = ({ step }) => (
  <div className="relative space-y-6">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 0.07, y: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute -top-12 left-0 text-9xl font-bold text-red-600 -translate-y-16 select-none z-0"
    >
      {step.number}
    </motion.div>

    <div className="relative z-10 flex items-center space-x-4 ml-16">
      <div className="h-0.5 w-16 bg-yellow-500" />
      <p className="text-yellow-500 uppercase tracking-widest font-semibold">
        {step.title}
      </p>
    </div>

    <h2 className="text-4xl sm:text-5xl z-10 relative text-white">
      {step.headline}
    </h2>
    <p className="text-gray-300 max-w-md z-10 relative">{step.text}</p>

    <button className="text-white border-2 border-white hover:bg-yellow-600 hover:text-black font-bold px-8 py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 text-lg bg-black/50 hover:scale-105 transform w-full sm:w-auto">
        {step.button}
    </button>
  </div>
)

const ImageBlock = ({ step }) => (
  <motion.div
    variants={imageVariants}
    className="w-full h-72 sm:h-96 lg:h-[28rem] rounded-xl overflow-hidden shadow-xl"
  >
    <Image
      src={step.image}
      alt={step.title}
      width={1000}
      height={800}
      className="w-full h-full object-cover"
    />
  </motion.div>
)

export default function FarmToTableSection() {
  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      className="py-24 px-2 md:px-12 text-white"
    >
      <div className="max-w-6xl mx-auto space-y-32">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {i % 2 === 0 ? (
              <>
                <TextContent step={step} />
                <ImageBlock step={step} />
              </>
            ) : (
              <>
                <ImageBlock step={step} />
                <TextContent step={step} />
              </>
            )}
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
