// app/providers/CartProviderWrapper.tsx

'use client';

import { CartProvider } from '@/contexts/CartContext';

export default function CartProviderWrapper({ children }) {
  return <CartProvider>{children}</CartProvider>;
}
