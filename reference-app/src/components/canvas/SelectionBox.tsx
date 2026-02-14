import { cn } from '@/lib/utils';

interface SelectionBoxProps {
  start: { x: number; y: number };
  end: { x: number; y: number };
  className?: string;
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({
  start,
  end,
  className = '',
}) => {
  const left = Math.min(start.x, end.x);
  const top = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);

  return (
    <div
      className={cn(
        'absolute border border-green/50 bg-green/5 pointer-events-none',
        className
      )}
      style={{
        left,
        top,
        width,
        height,
      }}
    >
      {/* Corner handles */}
      <div className="absolute -top-1 -left-1 w-2 h-2 bg-green rounded-full" />
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green rounded-full" />
      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-green rounded-full" />
      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green rounded-full" />
    </div>
  );
};
