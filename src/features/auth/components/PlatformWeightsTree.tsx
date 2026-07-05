import { Col, InputNumber, Row, Slider, Tree } from 'antd';
import type { TreeDataNode } from 'antd';
import React from 'react';
import { platformsData } from '../../../data/platforms';

export interface PlatformWeightsTreeProps {
    value?: Record<string, number>;
    onChange?: (value: Record<string, number>) => void;
}

const platformTreeData: TreeDataNode[] = platformsData.map((company) => ({
    title: company.company,
    key: company.company,
    selectable: false,
    children: company.consoles.map((consoleItem) => ({
        title: consoleItem.name,
        key: consoleItem.id
    }))
}));

export const PlatformWeightsTree: React.FC<PlatformWeightsTreeProps> = ({
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

    const titleRender = (nodeData: TreeDataNode) => {
        // Only render sliders for leaf nodes (actual platforms)
        const isLeaf = !nodeData.children || nodeData.children.length === 0;

        if (!isLeaf) {
            return <strong>{nodeData.title as React.ReactNode}</strong>;
        }

        const keyString = String(nodeData.key);
        const nodeValue = value[keyString] ?? 50;

        return (
            <div
                style={{
                    width: '100%',
                    minWidth: 300,
                    display: 'inline-block'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <Row align="middle" gutter={16}>
                    <Col
                        span={8}
                        style={{ whiteSpace: 'normal', lineHeight: '1.2' }}
                    >
                        {nodeData.title as React.ReactNode}
                    </Col>
                    <Col span={10}>
                        <Slider
                            min={1}
                            max={100}
                            value={nodeValue}
                            onChange={(val) =>
                                handleValueChange(keyString, val)
                            }
                        />
                    </Col>
                    <Col span={6}>
                        <InputNumber
                            min={1}
                            max={100}
                            value={nodeValue}
                            onChange={(val) =>
                                handleValueChange(keyString, val)
                            }
                        />
                    </Col>
                </Row>
            </div>
        );
    };

    return (
        <Tree
            treeData={platformTreeData}
            titleRender={titleRender}
            selectable={false}
            blockNode
        />
    );
};
