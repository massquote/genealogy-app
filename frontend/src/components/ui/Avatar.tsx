import { cn } from '@/lib/cn';
import { colorForName, getInitials } from '@/lib/initials';

export interface AvatarProps {
  name: string | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Override the auto-picked colour with a Tailwind bg-* class. */
  bgClassName?: string;
}

const sizeClasses: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
};

export function Avatar({ name, size = 'md', className, bgClassName }: AvatarProps) {
  return (
    <span
      aria-label={name ?? 'User avatar'}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold text-white select-none',
        bgClassName ?? colorForName(name),
        sizeClasses[size],
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
