import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartProviderWrapper from '@/components/CartProvider';

export default function PublicLayout({ children }) {
  return (
    <CartProviderWrapper>
      <div className="flex flex-col min-h-screen bg-[#191919]">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </CartProviderWrapper>
  );
}
