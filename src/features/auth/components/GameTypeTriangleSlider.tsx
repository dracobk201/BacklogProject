import React, { useEffect } from 'react';
import { Mixer, useMixer } from 'react-xy-mixer';
import { GameType } from '../../../types/addGame.types';

/**
 * Triangle Slider to select the weight of each game type
 *
 * @param value - Object with the weights of each game type
 * @param onChange - Callback function to update the weights
 */
export interface GameTypeTriangleSliderProps {
    value?: Record<string, number>;
    onChange?: (value: Record<string, number>) => void;
}

/**
 * Triangle Slider component to select the weight of each game type
 */
export const GameTypeTriangleSlider: React.FC<GameTypeTriangleSliderProps> = ({
    value = {},
    onChange
}) => {
    // Initializing the mixer
    const [mixerProps, weights] = useMixer(3, {
        size: 260,
        boundary: 'polygon'
    });

    const isInternalUpdate = React.useRef(false);

    /**
     * Sync incoming prop `value` to slider handle position (setCenter & setWeights)
     */
    useEffect(() => {
        if (!mixerProps || !mixerProps.nodes || mixerProps.nodes.length < 3) {
            return;
        }

        const valAAA = value[GameType.AAA];
        const valAA = value[GameType.AA];
        const valIndie = value[GameType.Indie];

        if (
            valAAA !== undefined ||
            valAA !== undefined ||
            valIndie !== undefined
        ) {
            const vAAA = valAAA ?? 0;
            const vAA = valAA ?? 0;
            const vIndie = valIndie ?? 0;
            const total = vAAA + vAA + vIndie || 1;

            const w0 = vAAA / total;
            const w1 = vAA / total;
            const w2 = vIndie / total;

            const curAAA = weights ? Math.round(weights[0] * 100) : -1;
            const curAA = weights ? Math.round(weights[1] * 100) : -1;
            const curIndie = weights ? Math.round(weights[2] * 100) : -1;

            const targetAAA = Math.round(w0 * 100);
            const targetAA = Math.round(w1 * 100);
            const targetIndie = Math.round(w2 * 100);

            if (
                curAAA !== targetAAA ||
                curAA !== targetAA ||
                curIndie !== targetIndie
            ) {
                const targetX =
                    w0 * mixerProps.nodes[0][0] +
                    w1 * mixerProps.nodes[1][0] +
                    w2 * mixerProps.nodes[2][0];
                const targetY =
                    w0 * mixerProps.nodes[0][1] +
                    w1 * mixerProps.nodes[1][1] +
                    w2 * mixerProps.nodes[2][1];

                isInternalUpdate.current = true;
                mixerProps.setCenter({ x: targetX, y: targetY });
                mixerProps.setWeights([w0, w1, w2]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, mixerProps.nodes]);

    /**
     * Handle user dragging slider handle: emit onChange to parent form
     */
    useEffect(() => {
        if (weights && onChange) {
            if (isInternalUpdate.current) {
                isInternalUpdate.current = false;
                return;
            }

            const [wAAA, wAA, wIndie] = weights;

            const newAAA = Math.round(wAAA * 100);
            const newAA = Math.round(wAA * 100);
            const newIndie = Math.round(wIndie * 100);

            if (
                value[GameType.AAA] !== newAAA ||
                value[GameType.AA] !== newAA ||
                value[GameType.Indie] !== newIndie
            ) {
                onChange({
                    [GameType.AAA]: newAAA,
                    [GameType.AA]: newAA,
                    [GameType.Indie]: newIndie
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [weights]);

    if (!weights || weights.length < 3) {
        return null;
    }

    return (
        <div className="w-full flex flex-col items-center my-4">
            <div className="relative w-65 h-65">
                {/* Labels */}
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-bold text-xs">
                    AAA
                </span>
                <span className="absolute bottom-1 -right-4 font-bold text-xs">
                    AA
                </span>
                <span className="absolute bottom-1 -left-6 font-bold text-xs">
                    Indie
                </span>

                {/* The Mixer */}
                <Mixer
                    {...mixerProps}
                    style={{
                        width: '100%',
                        height: '100%',
                        stroke: 'var(--primary)',
                        strokeWidth: 2
                    }}
                />
            </div>

            <div className="grid grid-cols-3 gap-2 w-full mt-6 text-center text-xs text-muted-foreground font-medium">
                <div>AAA: {Math.round(weights[0] * 100)}%</div>
                <div>AA: {Math.round(weights[1] * 100)}%</div>
                <div>Indie: {Math.round(weights[2] * 100)}%</div>
            </div>
        </div>
    );
};
