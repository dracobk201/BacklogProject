import React from 'react';
import { Modal, Button, Descriptions, Tag, Typography, Space } from 'antd';
import type { BacklogItem } from '../../../types/database.types';
import { useTranslation } from 'react-i18next';
import { platformsData } from '../../../data/platforms';

const { Title } = Typography;

interface GameDetailsModalProps {
    game: BacklogItem | null;
    open: boolean;
    onClose: () => void;
    onEdit: (gameId: string) => void;
}

const GameDetailsModal: React.FC<GameDetailsModalProps> = ({
    game,
    open,
    onClose,
    onEdit
}) => {
    const { t } = useTranslation();

    if (!game) return null;

    const findConsoleById = (id: string | null) => {
        if (id == null) return t('games.unknownPlatform');
        for (const company of platformsData) {
            const console = company.consoles.find((c) => c.id === id);
            if (console) {
                return console.name;
            }
        }
        return t('games.unknownPlatform');
    };

    const getStatusLabel = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return t('addGame.statusPending');
            case 'playing':
                return t('addGame.statusPlaying');
            case 'completed':
                return t('addGame.statusCompleted');
            case 'dropped':
                return t('addGame.statusDropped');
            default:
                return status;
        }
    };

    return (
        <Modal
            title={
                <Title level={3} style={{ margin: 0 }}>
                    {game.game_title}
                </Title>
            }
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    {t('gameDetailsModal.close')}
                </Button>,
                <Button
                    key="edit"
                    type="primary"
                    onClick={() => onEdit(game.id)}
                >
                    {t('gameDetailsModal.update')}
                </Button>
            ]}
            centered
            width={600}
        >
            <div style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
                {game.cover_url && (
                    <img
                        src={game.cover_url}
                        alt={game.game_title}
                        style={{
                            width: 150,
                            borderRadius: 8,
                            objectFit: 'cover'
                        }}
                    />
                )}
                <div style={{ flex: 1 }}>
                    <Descriptions column={1} size="small" bordered>
                        <Descriptions.Item label={t('addGame.platform')}>
                            {findConsoleById(game.platform)}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('addGame.releaseYear')}>
                            {game.release_year || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('addGame.gameType')}>
                            {game.game_type || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('addGame.lengthHours')}>
                            {game.length_hours
                                ? `${game.length_hours}h`
                                : 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('addGame.status')}>
                            {getStatusLabel(game.status)}
                        </Descriptions.Item>
                        <Descriptions.Item label={t('addGame.excitement')}>
                            {game.excitement} / 5
                        </Descriptions.Item>
                    </Descriptions>
                </div>
            </div>

            <Space orientation="vertical" style={{ width: '100%' }}>
                <Space>
                    {game.dropped && (
                        <Tag color="red">{t('addGame.dropped')}</Tag>
                    )}
                    {game.beaten_before && (
                        <Tag color="green">{t('addGame.beatenBefore')}</Tag>
                    )}
                    {game.recommended && (
                        <Tag color="blue">{t('addGame.recommended')}</Tag>
                    )}
                </Space>

                {game.notes && (
                    <div style={{ marginTop: 16 }}>
                        <Typography.Text strong>
                            {t('addGame.notes')}
                        </Typography.Text>
                        <p style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
                            {game.notes}
                        </p>
                    </div>
                )}
            </Space>
        </Modal>
    );
};

export default GameDetailsModal;
