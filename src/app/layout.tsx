
import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { I18nProvider, defaultLocale } from '@/lib/i18n'; // Import I18nProvider

const geistSans = Geist({ 
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({ 
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Metadata can also be internationalized, but that's a more advanced setup.
// For now, keeping it simple with one language or placeholder.
export const metadata: Metadata = {
  title: 'City Park Residence', // This will be static or can be updated via useI18n in child client components if needed
  description: 'CityPark — a modern residential complex in Denov',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The `lang` attribute will be updated by I18nProvider's useEffect on the client-side.
    // Initial `lang` is set to the default locale to avoid hydration mismatches for this attribute.
    <html lang={defaultLocale}> 
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <I18nProvider>
          {children}
        </I18nProvider>
        <Toaster />
      </body>
    </html>
  );
}
