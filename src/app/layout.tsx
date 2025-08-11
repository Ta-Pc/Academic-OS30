import '@/styles/globals.css';
import React from 'react';
import { Inter } from 'next/font/google';
import { UserBoot } from './user-boot';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Academic OS - Standalone Academic Management System',
  description: 'Academic Management System for tracking modules, assignments, and academic progress'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Academic OS</title>
      </head>
      <body className={`min-h-screen bg-slate-50 ${inter.className}`}>
        <div className="min-h-screen">
          <UserBoot />
          {children}
        </div>
      </body>
    </html>
  );
}


