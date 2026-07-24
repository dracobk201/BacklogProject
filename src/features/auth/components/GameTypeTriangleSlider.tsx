import React, { useEffect } from 'react';
import { Mixer, useMixer } from 'react-xy-mixer';
import { Typography, Row, Col } from 'antd';
import { GameType } from '../../../types/addGame.types';

const { Text } = Typography;

/**
 *  Triangle Slider to select the weight of each game type
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
        size: 300,
        boundary: 'polygon'
    });

    /**
     * Handle initialization or syncing with DB value
     */
    useEffect(() => {
        if (weights && onChange) {
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

    // react-xy-mixer draws nodes starting from top (0, -1) and goes clockwise
    // Point 0 (Top): AAA
    // Point 1 (Bottom Right): AA
    // Point 2 (Bottom Left): Indie

    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                margin: '20px 0'
            }}
        >
            <div style={{ position: 'relative', width: 300, height: 300 }}>
                {/* Labels */}
                <Text
                    strong
                    style={{
                        position: 'absolute',
                        top: -10,
                        left: '50%',
                        transform: 'translateX(-50%)'
                    }}
                >
                    AAA
                </Text>
                <Text
                    strong
                    style={{ position: 'absolute', bottom: 10, right: -10 }}
                >
                    AA
                </Text>
                <Text
                    strong
                    style={{ position: 'absolute', bottom: 10, left: -20 }}
                >
                    Indie
                </Text>

                {/* The Mixer */}
                <Mixer
                    {...mixerProps}
                    style={{
                        width: '100%',
                        height: '100%',
                        stroke: '#1677ff',
                        strokeWidth: 2
                    }}
                />
            </div>

            <Row gutter={16} style={{ width: '100%', marginTop: '30px' }}>
                <Col span={8} style={{ textAlign: 'center' }}>
                    <Text type="secondary">
                        AAA: {Math.round(weights[0] * 100)}%
                    </Text>
                </Col>
                <Col span={8} style={{ textAlign: 'center' }}>
                    <Text type="secondary">
                        AA: {Math.round(weights[1] * 100)}%
                    </Text>
                </Col>
                <Col span={8} style={{ textAlign: 'center' }}>
                    <Text type="secondary">
                        Indie: {Math.round(weights[2] * 100)}%
                    </Text>
                </Col>
            </Row>
        </div>
    );
};
