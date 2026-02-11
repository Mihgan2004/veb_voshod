'use client';

import React from 'react';
import { useCart } from '@/lib/cart/cart-store';
import { Stamp } from '@/components/ui/Stamp';

export function StampOverlay() {
  const stampVisible = useCart(s => s.stampVisible);
  return <Stamp visible={stampVisible} />;
}
