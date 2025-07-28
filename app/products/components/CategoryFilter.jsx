// app/products/components/CategoryFilter.tsx

'use client';

import { useState } from 'react';

const categories = ['All', 'Full Chicken', 'Laps', 'Chest & Wings'];
const weights = ['1kg', '2kg', '5kg', '10kg', '20kg'];

export default function CategoryFilter() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWeight, setSelectedWeight] = useState('');

  return (
<section className="bg-white py-4 px-4 md:px-[111px] shadow-sm sticky top-0 z-20">
  <div className="flex flex-wrap gap-4 items-center justify-between">
    {/* Search */}
    <input
      type="text"
      placeholder="Search products..."
      className="border border-gray-300 rounded-full px-4 py-2 w-full md:w-60"
    />

    {/* Category Filter */}
    <select className="rounded-full border border-gray-300 px-4 py-2 text-gray-600">
      <option value="">Category</option>
      <option value="full">Full</option>
      <option value="laps">Laps</option>
      <option value="chest">Chest</option>
      <option value="wings">Wings</option>
    </select>

    {/* Pack Type Filter */}
    <select className="rounded-full border border-gray-300 px-4 py-2 text-gray-600">
      <option value="">Pack Type</option>
      <option value="standard">Standard</option>
      <option value="family">Family</option>
      <option value="party">Party</option>
    </select>

    {/* Size Filter */}
    <select className="rounded-full border border-gray-300 px-4 py-2 text-gray-600">
      <option value="">Size</option>
      <option value="1kg">1kg</option>
      <option value="2kg">2kg</option>
      <option value="5kg">5kg</option>
      <option value="10kg">10kg</option>
      <option value="20kg">20kg</option>
    </select>
  </div>
</section>

  );
}
