import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({ open, onClose, title, description, children, size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // ESC + backdrop click handling. <dialog> closes on ESC natively but we
  // intercept the close event so we can call our onClose prop.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    const handleClick = (e: MouseEvent) => {
      if (e.target === dialog) onClose();
    };
    dialog.addEventListener('close', handleClose);
    dialog.addEventListener('click', handleClick);
    return () => {
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('click', handleClick);
    };
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        'rounded-lg border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40',
        'w-full',
        sizeClasses[size],
      )}
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div className="p-6">
        {title && (
          <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
        )}
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        <div className={cn(title || description ? 'mt-5' : '')}>{children}</div>
      </div>
    </dialog>
  );
}
