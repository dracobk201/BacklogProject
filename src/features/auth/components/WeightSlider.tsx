import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';

export interface WeightSliderProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    tooltip?: string;
    min?: number;
    max?: number;
    step?: number;
}

/**
 * Custom Weight Slider for scoring weights configuration.
 * Touch-optimized for mobile devices with live numeric feedback.
 */
export const WeightSlider: React.FC<WeightSliderProps> = ({
    label,
    value = 50,
    onChange,
    tooltip,
    min = 1,
    max = 100,
    step = 1
}) => {
    return (
        <div className="space-y-2 p-3 rounded-xl bg-card border border-border/70 shadow-xs">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                    <Label className="text-xs sm:text-sm font-semibold text-foreground">
                        {label}
                    </Label>
                    {tooltip && (
                        <span title={tooltip} className="text-muted-foreground hover:text-foreground cursor-help">
                            <Info className="w-3.5 h-3.5" />
                        </span>
                    )}
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-muted text-foreground min-w-9 text-center border border-border/50">
                    {value}
                </span>
            </div>

            <div className="py-2">
                <Slider
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onValueChange={(val) => {
                        const num = typeof val === 'number' ? val : (Array.isArray(val) ? val[0] : 50);
                        onChange(num);
                    }}
                    className="touch-manipulation cursor-pointer"
                />
            </div>
        </div>
    );
};
