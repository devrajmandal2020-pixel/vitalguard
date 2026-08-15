import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function Disclaimer({ variant = 'inline' }: { variant?: 'inline' | 'banner' | 'tooltip' }) {
  const text = 'VitalGuard AI is a prototype for clinical decision support. Risk scores are not medical diagnoses and should be reviewed by qualified healthcare professionals.';

  if (variant === 'banner') {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/60 p-3.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-xs leading-relaxed text-amber-800">{text}</p>
      </div>
    );
  }

  if (variant === 'tooltip') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <Info className="h-3.5 w-3.5" />
              <span>Disclaimer</span>
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs">{text}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{text}</span>
    </p>
  );
}
