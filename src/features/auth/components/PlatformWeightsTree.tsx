import React, { useState } from 'react';
import { platformsData } from '../../../data/platforms';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronRight, Gamepad2 } from 'lucide-react';

export interface PlatformWeightsTreeProps {
    value?: Record<string, number>;
    onChange?: (value: Record<string, number>) => void;
}

/**
 * Weights configuration for gaming platforms grouped by company.
 * Clean, mobile-friendly collapsible sections with smooth touch sliders.
 */
export const PlatformWeightsTree: React.FC<PlatformWeightsTreeProps> = ({
    value = {},
    onChange
}) => {
    // Keep track of which company sections are expanded
    const [expandedCompanies, setExpandedCompanies] = useState<Record<string, boolean>>({
        PC: true,
        Sony: true,
        Nintendo: true,
        Microsoft: true
    });

    const toggleCompany = (company: string) => {
        setExpandedCompanies((prev) => ({
            ...prev,
            [company]: !prev[company]
        }));
    };

    const handleValueChange = (platformId: string, newValue: number) => {
        if (onChange) {
            onChange({
                ...value,
                [platformId]: newValue
            });
        }
    };

    return (
        <div className="space-y-3">
            {platformsData.map((companyGroup) => {
                const isExpanded = !!expandedCompanies[companyGroup.company];

                return (
                    <div
                        key={companyGroup.company}
                        className="rounded-xl border border-border bg-card overflow-hidden shadow-xs"
                    >
                        {/* Company Header Toggle */}
                        <button
                            type="button"
                            onClick={() => toggleCompany(companyGroup.company)}
                            className="w-full flex items-center justify-between p-3.5 bg-muted/30 hover:bg-muted/50 transition-colors text-left font-bold text-sm touch-manipulation min-h-[44px]"
                        >
                            <div className="flex items-center space-x-2">
                                <Gamepad2 className="w-4 h-4 text-primary" />
                                <span>{companyGroup.company}</span>
                                <span className="text-xs font-normal text-muted-foreground">
                                    ({companyGroup.consoles.length})
                                </span>
                            </div>
                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                        </button>

                        {/* Consoles Sliders List */}
                        {isExpanded && (
                            <div className="p-3 space-y-3 border-t border-border/50 bg-background/50">
                                {companyGroup.consoles.map((consoleItem) => {
                                    const nodeValue = value[consoleItem.id] ?? 50;

                                    return (
                                        <div
                                            key={consoleItem.id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                                        >
                                            <div className="flex items-center justify-between sm:w-2/5">
                                                <Label className="text-xs sm:text-sm font-medium text-foreground truncate max-w-[200px]">
                                                    {consoleItem.name}
                                                </Label>
                                                <span className="sm:hidden text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-muted text-foreground">
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
                                                        handleValueChange(consoleItem.id, num);
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
                        )}
                    </div>
                );
            })}
        </div>
    );
};
