"use client";
import { useEffect } from 'react';
import { useUserStore } from '@/lib/user-store';

export function UserBoot() {
  const hydrate = useUserStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return null;
}


