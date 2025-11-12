import React, { useEffect } from 'react';
import { CheckCircleIcon, AlertTriangleIcon, CloseIcon } from './icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto-close after 4 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const isSuccess = type === 'success';

  const icon = isSuccess ? <CheckCircleIcon /> : <AlertTriangleIcon />;
  const containerClasses = `
    fixed top-5 right-5 z-50 flex items-center p-4 rounded-xl shadow-lg border
    ${isSuccess ? 'bg-primary-soft border-primary/20 text-primary-soft-fg' : 'bg-accent-red/10 border-accent-red/20 text-accent-red'}
    animate-fade-in-down
  `;

  return (
    <div className={containerClasses}>
      <div className="flex-shrink-0 w-6 h-6 mr-3">{icon}</div>
      <p className="font-semibold text-sm">{message}</p>
      <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-black/10">
        <CloseIcon />
      </button>
      <style>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Toast;