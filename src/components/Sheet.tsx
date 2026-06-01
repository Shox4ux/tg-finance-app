import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Sheet({ open, onClose, title, children }: SheetProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end" style={{ maxWidth: 480, margin: '0 auto' }}>
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        ref={ref}
        className="relative rounded-t-3xl slide-up overflow-auto"
        style={{
          backgroundColor: 'var(--tg-theme-bg-color, #fff)',
          maxHeight: '90dvh',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
        }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full active:opacity-60" style={{ color: 'var(--tg-theme-hint-color)' }}>
            <X size={20} />
          </button>
        </div>
        <div className="px-5 pb-4">{children}</div>
      </div>
    </div>
  );
}
