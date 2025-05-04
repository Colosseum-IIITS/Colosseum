'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to safely handle client-side only code
 * Use this hook to prevent hydration errors when using browser APIs
 * 
 * @returns {boolean} - Whether the component is mounted on the client
 */
export default function useClientOnly() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}
