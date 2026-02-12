import { ReactNode } from "react";

interface PageBackgroundProps {
  children: ReactNode;
  className?: string;
}

export const PageBackground = ({ children, className = "" }: PageBackgroundProps) => {
  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* Blurred background */}
      <div className="fixed inset-0 -z-10">
        <img
          src="/bg.png"
          alt="CALEBel background"
          className="w-full h-full object-cover blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
