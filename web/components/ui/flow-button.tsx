'use client';
import { cn } from '@/lib/utils';

interface FlowButtonProps {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export function FlowButton({ 
  text, 
  onClick,
  disabled = false,
  className,
  icon
}: FlowButtonProps) {
  return (
    <button 
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative flex items-center gap-2 overflow-hidden rounded-full border-[1.5px] bg-transparent px-6 py-2.5 text-sm font-semibold cursor-pointer transition-all duration-500 ease-out hover:rounded-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        "border-foreground/40 text-foreground hover:border-transparent hover:text-background",
        className
      )}
    >
      {/* Custom icon (optional) */}
      {icon && (
        <span className="relative z-[1] transition-all duration-700 ease-out">
          {icon}
        </span>
      )}

      {/* Text */}
      {text && (
        <span className="relative z-[1] transition-all duration-700 ease-out">
          {text}
        </span>
      )}

      {/* Expanding circle background */}
      <span className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full opacity-0 transition-all duration-700 ease-out",
        "bg-foreground group-hover:w-[220px] group-hover:h-[220px] group-hover:opacity-100"
      )}></span>
    </button>
  );
}
