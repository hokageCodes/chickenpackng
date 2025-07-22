'use client';
import FAQ from '@/components/sections/FAQSection';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { FaCheckCircle } from 'react-icons/fa';

export default function ChickenPackCompanyPage() {
  return (
    <div className="bg-[#191919] text-[#3D3C42] text-base">
      {/* Hero Section */}
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

        <section className="py-24 px-2 md:px-16 relative">
  {/* Animated background elements */}
  {/* <div className="absolute inset-0 overflow-hidden">
    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#3498DB]/20 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-yellow-500 rounded-full blur-2xl animate-pulse delay-700"></div>
  </div> */}

  <div className="relative z-10 max-w-7xl px-2 mx-auto">
    {/* Header */}
    <div className="text-center mb-20">
      <div className="inline-block">
        <h2 className="text-5xl md:text-7xl text-white mb-4 tracking-tight">
          THE MINDS
        </h2>
        <div className="h-2 bg-yellow-500 rounded-full transform -skew-x-12"></div>
      </div>
      <p className="text-xl text-gray-300 mt-8 max-w-3xl mx-auto font-light">
        Behind every revolution are the visionaries who dare to challenge the status quo
      </p>
    </div>

    {/* Split Layout */}
    <div className="grid lg:grid-cols-2 gap-0 bg-white rounded-3xl overflow-hidden shadow-2xl">
    <div className="relative border border-2 p-12 text-[#2C3E50]">
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-start gap-6 mb-8">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/50 shadow-xl flex-shrink-0">
              <img
                src="/assets/hen.webp"
                alt="Abiodun Young"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-3xl mb-2">Abiodun Young</h3>
              <p className="text-black text-lg">Founder</p>
              <div className="w-16 h-1 bg-[#2C3E50]/30 mt-3 rounded-full"></div>
            </div>
          </div>

          <blockquote className="text-lg leading-relaxed mb-8 text-[#34495E] italic">
            "Excellence in execution transforms bold visions into market-changing realities."
          </blockquote>

          {/* <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#2C3E50] rounded-full"></div>
              <span className="text-[#34495E]">Supply Chain Mastery</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#2C3E50] rounded-full"></div>
              <span className="text-[#34495E]">Operations Excellence</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#2C3E50] rounded-full"></div>
              <span className="text-[#34495E]">Market Strategy Leader</span>
            </div>
          </div> */}
        </div>
      </div>
      {/* Left Side - Philip */}
      <div className="relative border border-2 p-12 text-white">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-start gap-6 mb-8">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/30 shadow-xl flex-shrink-0">
              <img
                src="/assets/hen.webp"
                alt="Philip Omoike"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-black text-3xl mb-2">Philip Omoike</h3>
              <p className="text-lg text-black">Founder</p>
              <div className="w-16 h-1 mt-3 rounded-full"></div>
            </div>
          </div>

          <blockquote className="text-lg leading-relaxed mb-8 text-black italic">
            "Innovation isn't just about technology—it's about reimagining how we feed the world sustainably."
          </blockquote>

          {/* <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-blue-100">15+ years in AgriTech</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-blue-100">Food Systems Innovation</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-blue-100">Sustainable Agriculture Expert</span>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  </div>
</section> 



      {/* Vision & Mission */}
      <section className="py-20 px-2 md:px-16 bg-[#FEFBF6] text-[#3D3C42]">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-4xl md:text-5xl text-black mb-12 relative inline-block">
      Our Vision & Mission
      <span className="block h-1 w-20 bg-yellow-500 mt-2"></span>
    </h2>

    <div className="grid md:grid-cols-2 gap-12 md:gap-20">
      {/* Vision */}
      <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-yellow-500 hover:shadow-lg transition">
        <h3 className="text-2xl mb-3 text-black">Our Vision</h3>
        <p className="text-base leading-relaxed">
          To provide fresh, high-quality broiler meat and eggs to our community, ensuring affordability,
          convenience, and strict hygiene standards. We strive to become the most trusted poultry supplier
          by prioritizing customer satisfaction and sustainable farming partnerships.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-yellow-500 hover:shadow-lg transition">
        <h3 className="text-2xl mb-3 text-black">Our Mission</h3>
        <p className="text-base leading-relaxed">
          To revolutionize poultry consumption in Nigeria by making nutritious, farm-fresh broiler meat and eggs
          accessible to every household and business, while setting industry standards for quality and service.
        </p>
      </div>
    </div>
  </div>
</section>


      {/* Popular Products */}
      <section className="py-20 px-2 md:px-16 text-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-5xl text-white mb-4 tracking-tight">Popular Products</h2>
          <div className="w-24 h-1 bg-amber-400 mx-auto mb-12"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
            {[
              { name: 'Eggs', image: 'https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=200&h=200&fit=crop&crop=center' },
              { name: 'Full Chicken', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=200&h=200&fit=crop&crop=center' },
              { name: 'Chicken Wings', image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=200&h=200&fit=crop&crop=center' },
              { name: 'Chicken Laps', image: 'https://images.unsplash.com/photo-1532636875304-0c89119d9b4d?w=200&h=200&fit=crop&crop=center' },
              { name: 'Chicken Chest', image: 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=200&h=200&fit=crop&crop=center' }
            ].map((item, index) => (
              <div key={item.name} className="group cursor-pointer transform transition-all duration-300 hover:scale-105">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden border-2 border-transparent hover:border-amber-300">
                  <div className="relative">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-red-800 group-hover:text-amber-600 transition-colors duration-300">
                      {item.name}
                    </h3>
                    <div className="w-8 h-0.5 bg-amber-400 mx-auto mt-2 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 inline-flex items-center gap-2 px-2 py-3">
          <button className="text-white border-2 border-white hover:bg-yellow-600 hover:text-black px-8 py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 text-xl hover:scale-105 transform w-full sm:w-auto">
                <ShoppingCart size={24} />
                Shop ChickenPack Now
            </button>
          </div>
        </div>
      </section>


      {/* Why Choose Us */}
      <section
  className="relative bg-fixed bg-center bg-cover py-32 px-6 text-white text-center"
  style={{
    backgroundImage: `url('/assets/chi.webp')`, // Change to your actual image path
  }}
>
  <div className="absolute inset-0 bg-black/60"></div> {/* Overlay for contrast */}
  <div className="relative z-10 max-w-3xl mx-auto">
    <p className="text-2xl md:text-3xl leading-relaxed font-semibold">
      “Choose <span className="text-[#A6D1E6]">Chicken Pack</span> for farm-fresh broiler meat and eggs — ethically sourced, hygienically processed, and delivered straight to your door. Meals that matter, trust that lasts.”
    </p>
  </div>
</section>


      {/* Production Steps */}
      <section className="py-24 px-2 md:px-16 text-white">
  <div className="max-w-6xl mx-auto text-center">
    <h2 className="text-4xl md:text-5xl text-white mb-12 relative inline-block">
      Production Steps
      <span className="block h-1 w-20 bg-yellow-500 mx-auto mt-2"></span>
    </h2>

    <div className="grid md:grid-cols-3 gap-8 text-left">
      {[
        'Sourcing DOC: We partner with reputable hatcheries to procure healthy day-old chicks.',
        'Brooding: Ensure vaccination, proper feeding, and environment setup.',
        'Health Management: Regular checks for disease prevention.',
        'Growth & Monitoring: Feed, track, and ensure proper development.',
        'Processing & Storage: Humane slaughter, food-grade packaging.',
        'Cold Storage: Stored safely between -4°C and -1°C.',
      ].map((step, index) => (
        <div
          key={index}
          className="relative bg-transparent border p-6 rounded-2xl shadow-lg hover:shadow-xl transition"
        >
          <span className="absolute -top-4 -left-4 w-10 h-10 bg-yellow-500 text-black rounded-full flex items-center justify-center text-sm font-bold shadow-md">
            {index + 1}
          </span>
          <div className="flex items-start gap-3">
            <p className="text-base leading-relaxed text-center">{step}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>


      {/* Meet Our Team */}
      <section className="py-16 px-2 md:px-16 bg-white text-center">
        <FAQ />
      </section>
    </div>
  );
}
