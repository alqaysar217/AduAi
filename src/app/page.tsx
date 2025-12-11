
'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Ensure the app always starts at the launch screen which handles the flow logic
    redirect('/launch');
  }, []);

  // Render nothing while redirecting
  return null;
}
