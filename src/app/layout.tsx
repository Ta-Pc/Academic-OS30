import '@/styles/globals.css';
import React from 'react';
import { Inter } from 'next/font/google';
import { UserBoot } from './user-boot';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-slate-50 ${inter.className}`}>
        <div className="min-h-screen">
          <UserBoot />
          {children}
        </div>
      </body>
    </html>
  );
}


