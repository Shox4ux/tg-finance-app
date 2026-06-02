import { useEffect } from 'react';
import { X } from 'lucide-react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const isDesktop = window.innerWidth >= 640;

  return (
    <div
      className="fixed inset-0 z-[100] flex"
      style={{
        alignItems: isDesktop ? 'center' : 'flex-end',
        justifyContent: 'center',
        padding: isDesktop ? '24px' : '0',
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div
        className="relative slide-up overflow-auto w-full"
        style={{
          backgroundColor: 'var(--tg-theme-bg-color, #fff)',
          maxHeight: isDesktop ? '85dvh' : '92dvh',
          maxWidth: isDesktop ? 560 : '100%',
          borderRadius: isDesktop ? 24 : '24px 24px 0 0',
          paddingBottom: isDesktop ? 0 : 'calc(env(safe-area-inset-bottom) + 8px)',
          boxShadow: isDesktop ? '0 24px 60px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-3">
          <h2 className="font-bold text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full active:opacity-60 transition-opacity"
            style={{ color: 'var(--tg-theme-hint-color)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}
