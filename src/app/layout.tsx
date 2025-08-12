'use client'
import '@/styles/globals.css';
import React from 'react';
import { Inter } from 'next/font/google';
import { UserBoot } from './user-boot';
import NotificationManager from '@/components/NotificationManager';
import { QueryClient, QueryClientProvider } from 'react-query';

const inter = Inter({ subsets: ['latin'] });

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Academic OS</title>
      </head>
      <body className={`min-h-screen bg-slate-50 ${inter.className}`}>
        <QueryClientProvider client={queryClient}>
          <div className="min-h-screen">
            <UserBoot />
            <NotificationManager />
            {children}
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}


