import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  id: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type = 'info',
  title,
  message,
  duration = 4000,
  onClose,
  className,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const config = {
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      border: 'border-green/30',
      bg: 'bg-green/10',
      text: 'text-green',
    },
    error: {
      icon: <XCircle className="w-5 h-5" />,
      border: 'border-danger/30',
      bg: 'bg-danger/10',
      text: 'text-danger',
    },
    warning: {
      icon: <AlertCircle className="w-5 h-5" />,
      border: 'border-warning/30',
      bg: 'bg-warning/10',
      text: 'text-warning',
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      border: 'border-blue-400/30',
      bg: 'bg-blue-400/10',
      text: 'text-blue-400',
    },
  };

  const c = config[type];

  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border shadow-lg min-w-[320px] max-w-md",
        "animate-slide-right",
        c.bg,
        c.border,
        className
      )}
    >
      <div className={cn("flex-shrink-0", c.text)}>
        {c.icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-white">{title}</h4>
        {message && <p className="text-sm text-white/60 mt-1">{message}</p>}
      </div>
      <button 
        onClick={() => onClose(id)}
        className="flex-shrink-0 text-white/40 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
  }>;
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
};
