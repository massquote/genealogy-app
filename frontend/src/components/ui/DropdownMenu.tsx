import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

export interface DropdownMenuProps {
  /** Trigger element. Receives onClick, aria-expanded, aria-haspopup props. */
  trigger: ReactElement;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function DropdownMenu({ trigger, children, align = 'right', className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: globalThis.MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, close]);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, close]);

  if (!isValidElement(trigger)) {
    throw new Error('DropdownMenu trigger must be a valid React element');
  }

  const triggerProps = trigger.props as ButtonHTMLAttributes<HTMLElement>;

  const enhancedTrigger = cloneElement(
    trigger as ReactElement<ButtonHTMLAttributes<HTMLElement>>,
    {
      onClick: (e: MouseEvent<HTMLElement>) => {
        triggerProps.onClick?.(e);
        toggle();
      },
      'aria-haspopup': 'menu',
      'aria-expanded': open,
      'aria-controls': open ? menuId : undefined,
    },
  );

  return (
    <div ref={wrapperRef} className={cn('relative inline-block text-left', className)}>
      {enhancedTrigger}
      {open && (
        <div
          id={menuId}
          role="menu"
          className={cn(
            'absolute z-50 mt-2 min-w-[12rem] rounded-md border border-slate-200 bg-white py-1 shadow-lg focus:outline-none',
            align === 'right' ? 'right-0' : 'left-0',
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export interface DropdownItemProps {
  /** If provided, renders a <Link>; otherwise renders a <button>. */
  to?: string;
  onClick?: () => void;
  children: ReactNode;
  /** Visual styling variant. */
  tone?: 'default' | 'danger';
  icon?: ReactNode;
}

const toneClasses: Record<NonNullable<DropdownItemProps['tone']>, string> = {
  default: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
  danger: 'text-red-600 hover:bg-red-50',
};

export function DropdownItem({ to, onClick, children, tone = 'default', icon }: DropdownItemProps) {
  const baseClasses = cn(
    'flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors',
    toneClasses[tone],
  );

  if (to) {
    return (
      <Link to={to} role="menuitem" className={baseClasses} onClick={onClick}>
        {icon && <span aria-hidden>{icon}</span>}
        {children}
      </Link>
    );
  }

  return (
    <button type="button" role="menuitem" className={baseClasses} onClick={onClick}>
      {icon && <span aria-hidden>{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <hr className="my-1 border-slate-100" />;
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
      {children}
    </div>
  );
}
