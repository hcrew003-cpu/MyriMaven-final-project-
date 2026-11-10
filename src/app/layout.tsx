
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Career Sandbox | Explore Your Future',
  description:
    'Explore career possibilities, discover your strengths, and experiment with different career priorities in an interactive career exploration sandbox.',

  applicationName: 'Career Sandbox',

  manifest: '/manifest.webmanifest',

  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },

  appleWebApp: {
    capable: true,
    title: 'Career Sandbox',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#087b70',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
