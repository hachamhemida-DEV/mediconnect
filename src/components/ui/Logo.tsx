import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  withText?: boolean;
  textColor?: 'default' | 'white';
  size?: number;
}

/**
 * MediConnect logo — a rounded-square mark combining a medical pulse wave
 * over a stylized heart. Uses a teal→green gradient matching the brand.
 */
export function Logo({ className, withText = false, textColor = 'default', size = 44 }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="MediConnect"
        className="shrink-0 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="mc-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#2a9ed4" />
            <stop offset="55%"  stopColor="#1ab39d" />
            <stop offset="100%" stopColor="#15b886" />
          </linearGradient>
        </defs>
        {/* rounded square tile */}
        <rect width="64" height="64" rx="14" fill="url(#mc-grad)" />
        {/* pulse wave + heart glyph, single white stroke */}
        <path
          d="M10 34 H18 L22 26 L28 42 L34 22 L40 38 L44 34 H54"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M44.5 32.5 C44.5 28.5 41 25.5 37.5 27.5 C34 25.5 30.5 28.5 30.5 32.5 C30.5 37 37.5 42 37.5 42 C37.5 42 44.5 37 44.5 32.5 Z"
          fill="white"
          fillOpacity="0.95"
          transform="translate(-8 -2)"
        />
      </svg>

      {withText && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              'font-bold text-xl tracking-tight',
              textColor === 'white' ? 'text-white' : 'text-ink-900',
            )}
          >
            مديكونيكت
          </span>
          <span
            className={cn(
              'text-[11px] font-medium uppercase tracking-widest mt-1',
              textColor === 'white' ? 'text-white/80' : 'text-ink-500',
            )}
          >
            MediConnect
          </span>
        </div>
      )}
    </div>
  );
}
