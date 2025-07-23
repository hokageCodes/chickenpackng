import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Head from 'next/head';

export const metadata = {
  title: 'Chicken Pack | Food that matters - to me, to farmers and to the planet we all share.',
  description:
    'Providing high-quality, fresh broiler meat and eggs to households, restaurants, and businesses.',
  authors: [{ name: 'Hokage Creative Labs' }],
  keywords: [
    'Chicken Pack',
    'Grilled Chicken Lagos',
    'Affordable meal packs Nigeria',
    'Best chicken delivery Lagos',
    'Office lunch packs Nigeria',
    'Quick meal delivery',
    'Chicken takeout Lagos',
    'Nigerian food packs',
    'Lagos grilled chicken',
    'Small chops and chicken',
    'Event food packs Nigeria',
    'Chicken wraps Nigeria',
    'Chicken rice combo',
    'Fast food Lagos',
    'Delicious chicken meals',
    'Party food packs',
    'Order grilled chicken',
    'Chicken Pack menu',
    'Chicken pack near me',
    'Best chicken combo Nigeria',
    'Flavor-packed meals Lagos',
  ],
  openGraph: {
    title: 'Chicken Pack | Food that matters - to me, to farmers and to the planet we all share.',
    description:
      'providing high-quality, fresh broiler meat and eggs to households, restaurants, and businesses.',
    url: 'https://chickenpackng.vercel.app',
    siteName: 'Chicken Pack',
    images: [
      {
        url: 'https://chickenpackng.vercel.app/assets/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Chicken Pack grilled chicken',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@chickenpackng',
    creator: '@chickenpackng',
    images: ['https://chickenpackng.vercel.app/assets/og-image.png'],
  },
  metadataBase: new URL('https://chickenpackng.vercel.app'),
  alternates: {
    canonical: 'https://chickenpackng.vercel.app',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <link rel="canonical" href="https://chickenpackng.vercel.app" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Restaurant",
              "name": "Chicken Pack",
              "image": "https://chickenpackng.vercel.app/assets/og-image.png",
              "logo": "https://chickenpackng.vercel.app/assets/Logo.png",
              "url": "https://chickenpackng.vercel.app",
              "telephone": "+2348123456789",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Lagos",
                "addressCountry": "NG"
              },
              "priceRange": "$",
              "servesCuisine": ["Nigerian", "Raw Chicken", "Frozen Chicken", "Chicken"],
              "description": "Food that matters - to me, to farmers and to the planet we all share."
            }
          `}
        </script>

        <link
          rel="preload"
          href="/assets/fonts/Satoshi-Regular.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/assets/fonts/Satoshi-Bold.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
      </Head>
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
