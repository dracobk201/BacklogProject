import { InfoCircleOutlined } from '@ant-design/icons';
import { Col, Form, InputNumber, Row, Slider, Tooltip } from 'antd';
import React from 'react';

export interface WeightSliderProps {
    label: string;
    name: string;
    tooltip?: string;
}

export const WeightSlider: React.FC<WeightSliderProps> = ({
    label,
    name,
    tooltip
}) => {
    return (
        <Form.Item label={label}>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name={name} noStyle>
                        <Slider min={1} max={100} step={1} />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name={name} noStyle>
                        <InputNumber min={1} max={100} />
                    </Form.Item>
                </Col>
                {tooltip && (
                    <Col
                        span={2}
                        style={{
                            textAlign: 'right',
                            alignSelf: 'center',
                            marginLeft: 10
                        }}
                    >
                        <Tooltip title={tooltip} placement="right">
                            <InfoCircleOutlined />
                        </Tooltip>
                    </Col>
                )}
            </Row>
        </Form.Item>
    );
};
