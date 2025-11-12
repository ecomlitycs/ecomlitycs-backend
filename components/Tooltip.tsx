import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [isTooltipVisible, setTooltipVisible] = useState(false);

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
    >
      {children}
      {isTooltipVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs z-10 px-3 py-1.5 text-xs font-semibold text-primary-foreground bg-foreground rounded-md shadow-lg animate-fade-in-up-tooltip">
          {text}
           <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-foreground"></div>
        </div>
      )}
      <style>{`
        @keyframes fade-in-up-tooltip {
          0% { opacity: 0; transform: translate(-50%, 5px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in-up-tooltip { animation: fade-in-up-tooltip 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default Tooltip;