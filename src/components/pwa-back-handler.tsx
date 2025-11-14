'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function PWABackHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if running as PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true;

    if (!isPWA) return;

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      
      // Define navigation hierarchy
      const dashboardRoutes = [
        '/dashboard/user',
        '/dashboard/professional', 
        '/dashboard/admin',
        '/dashboard/corporate'
      ];

      // If on a dashboard route and trying to go back, stay in app
      if (dashboardRoutes.includes(pathname)) {
        // Prevent exit, stay on current page
        window.history.pushState(null, '', pathname);
        return;
      }

      // If on other pages, go back to appropriate dashboard
      if (pathname.startsWith('/dashboard/')) {
        router.push('/dashboard');
      } else if (pathname !== '/dashboard') {
        router.push('/dashboard');
      }
    };

    // Add initial state to prevent immediate exit
    window.history.pushState(null, '', pathname);

    // Listen to popstate (back button)
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname, router]);

  return null;
}
