import React from 'react';

interface HubLayoutProps {
  children: React.ReactNode;
}

export function HubLayout({ children }: HubLayoutProps) {
  return (
    <div className="min-h-[100dvh] bg-hub-gradient text-white overflow-x-hidden supports-[height:100dvh]:min-h-[100dvh]">
      {/* Safe area padding for iOS notch/home indicator */}
      <div className="pb-safe pt-safe">
        {/* Animated background orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[hsl(var(--accent-glow))] rounded-full opacity-10 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[hsl(var(--accent-glow-secondary))] rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[hsl(var(--accent-glow))] rounded-full opacity-5 blur-3xl" />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
