import React from 'react';
import { GameType } from '../../../types/addGame.types';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export interface GameTypeWeightsTreeProps {
    value?: Record<string, number>;
    onChange?: (value: Record<string, number>) => void;
}

/**
 * Weights configuration for Game Types (AAA, AA, Indie).
 */
export const GameTypeWeightsTree: React.FC<GameTypeWeightsTreeProps> = ({
    value = {},
    onChange
}) => {
    const handleValueChange = (key: string, newValue: number) => {
        if (onChange) {
            onChange({
                ...value,
                [key]: newValue
            });
        }
    };

    const gameTypes = Object.values(GameType);

    return (
        <div className="space-y-3">
            {gameTypes.map((type) => {
                const nodeValue = value[type] ?? 50;

                return (
                    <div
                        key={type}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-card border border-border/60"
                    >
                        <div className="flex items-center justify-between sm:w-1/3">
                            <Label className="text-xs sm:text-sm font-semibold">
                                {type}
                            </Label>
                            <span className="sm:hidden text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted text-foreground">
                                {nodeValue}
                            </span>
                        </div>

                        <div className="flex-1 flex items-center space-x-3">
                            <Slider
                                min={1}
                                max={100}
                                step={1}
                                value={nodeValue}
                                onValueChange={(val) => {
                                    const num = typeof val === 'number' ? val : (Array.isArray(val) ? val[0] : 50);
                                    handleValueChange(type, num);
                                }}
                                className="flex-1 touch-manipulation cursor-pointer"
                            />
                            <span className="hidden sm:inline-block text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted text-foreground min-w-[36px] text-center border border-border/50">
                                {nodeValue}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
