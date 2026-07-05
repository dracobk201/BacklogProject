import { Col, InputNumber, Row, Slider } from 'antd';
import React from 'react';
import { GameType } from '../../../types/addGame.types';

export interface GameTypeWeightsTreeProps {
    value?: Record<string, number>;
    onChange?: (value: Record<string, number>) => void;
}

export const GameTypeWeightsTree: React.FC<GameTypeWeightsTreeProps> = ({
    value = {},
    onChange
}) => {
    const handleValueChange = (key: string, newValue: number | null) => {
        const numValue = newValue ?? 50;
        if (onChange) {
            onChange({
                ...value,
                [key]: numValue
            });
        }
    };

    const gameTypes = Object.values(GameType);

    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}
        >
            {gameTypes.map((type) => {
                const nodeValue = value[type] ?? 50;
                return (
                    <Row align="middle" gutter={16} key={type}>
                        <Col
                            span={8}
                            style={{ whiteSpace: 'normal', lineHeight: '1.2' }}
                        >
                            <strong>{type}</strong>
                        </Col>
                        <Col span={10}>
                            <Slider
                                min={1}
                                max={100}
                                value={nodeValue}
                                onChange={(val) => handleValueChange(type, val)}
                            />
                        </Col>
                        <Col span={6}>
                            <InputNumber
                                min={1}
                                max={100}
                                value={nodeValue}
                                onChange={(val) => handleValueChange(type, val)}
                            />
                        </Col>
                    </Row>
                );
            })}
        </div>
    );
};
