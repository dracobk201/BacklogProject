import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button, Card, Col, Layout, Row, Skeleton, Typography } from 'antd';
import {
    getBacklog,
    getUserScoringWeights,
    softDeleteGame
} from '../../../services/backlogService';
import type { BacklogItem } from '../../../types/database.types';
const { Meta } = Card;
import { platformsData } from '../../../data/platforms';
import { useTranslation } from 'react-i18next';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { calculateCustomPriority } from '../../../utils/priorityCalculator';
import GameDetailsModal from '../components/GameDetailsModal';
import { toast } from 'react-toastify';
import { Modal } from 'antd';

const GamesPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [selectedGame, setSelectedGame] = React.useState<BacklogItem | null>(
        null
    );
    const [isModalVisible, setIsModalVisible] = React.useState(false);

    const { data: gamesFromBacklog = [], isLoading: loading } = useQuery({
        queryKey: ['backlog'],
        queryFn: getBacklog
    });

    const { data: weights, isLoading: isLoadingWeights } = useQuery({
        queryKey: ['user-scoring-weights'],
        queryFn: getUserScoringWeights
    });

    const processedGames = React.useMemo(() => {
        const result = [...gamesFromBacklog];

        // TODO: Apply future filters here
        // result = result.filter(...)

        // Sort by priority (highest to lowest)
        if (weights) {
            result.sort((a, b) => {
                const priorityA = calculateCustomPriority(a, weights);
                const priorityB = calculateCustomPriority(b, weights);
                return priorityB - priorityA;
            });
        }

        return result;
    }, [gamesFromBacklog, weights]);

    const unknownGameURL =
        'https://www.igdb.com/assets/no_cover_show-ef1e36c00e101c2fb23d15bb80edd9667bbf604a12fc0267a66033afea320c65.png';

    const findConsoleById = (id: string | null) => {
        if (id == null) return t('games.unknownPlatform');
        for (const company of platformsData) {
            const console = company.consoles.find(
                (console) => console.id === id
            );
            if (console) {
                return console.name;
            }
        }
        return t('games.unknownPlatform');
    };

    const handleAddGame = () => {
        navigate({ to: '/games/add-game' });
    };

    const handleEditGame = (gameId: string) => {
        setIsModalVisible(false);
        navigate({ to: `/games/edit-game/${gameId}` });
    };

    const deleteGameMutation = useMutation({
        mutationFn: softDeleteGame,
        onSuccess: () => {
            toast.success(t('games.toast.deleteSuccess'));
            queryClient.invalidateQueries({ queryKey: ['backlog'] });
        },
        onError: (error) => {
            console.error(error);
            toast.error(t('games.toast.errorDelete'));
        }
    });

    const handleDeleteGame = (gameId: string) => {
        Modal.confirm({
            title: t('games.modal.deleteTitle'),
            content: t('games.modal.deleteContent'),
            okText: t('games.modal.confirmDelete'),
            okType: 'danger',
            cancelText: t('games.modal.cancelDelete'),
            onOk() {
                deleteGameMutation.mutate(gameId);
            }
        });
    };

    const handleCardClick = (game: BacklogItem) => {
        setSelectedGame(game);
        setIsModalVisible(true);
    };

    if (loading) {
        return (
            <Layout>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginBottom: 16
                    }}
                >
                    <Button type="primary" disabled style={{ width: 120 }}>
                        {t('games.addGame')}
                    </Button>
                </div>
                <Row gutter={[16, 16]}>
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Col
                            className="gutter-row"
                            xs={24}
                            sm={12}
                            md={8}
                            lg={6}
                            xl={4}
                            key={index}
                        >
                            <Card
                                hoverable
                                variant="borderless"
                                style={{ width: '100%', height: '100%' }}
                            >
                                <Skeleton.Image
                                    active
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        marginBottom: 16
                                    }}
                                />
                                <Skeleton
                                    active
                                    paragraph={{ rows: 1 }}
                                    title={{ width: 100 }}
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Layout>
        );
    }

    return (
        <Layout>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: 16
                }}
            >
                <Button type="primary" onClick={handleAddGame}>
                    {t('games.addGame')}
                </Button>
            </div>
            <Row gutter={[16, 16]}>
                {!loading &&
                    processedGames.map((game: BacklogItem) => (
                        <Col
                            className="gutter-row"
                            xs={24}
                            sm={12}
                            md={8}
                            lg={6}
                            xl={4}
                            key={game.id}
                        >
                            <Card
                                hoverable
                                variant="borderless"
                                style={{ width: '100%', height: '100%' }}
                                cover={
                                    <img
                                        draggable={false}
                                        alt={game.game_title}
                                        src={game.cover_url || unknownGameURL}
                                        style={{
                                            height: 250,
                                            objectFit: 'cover'
                                        }}
                                    />
                                }
                                actions={[
                                    <EditOutlined
                                        key="edit"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditGame(game.id);
                                        }}
                                    />,
                                    <DeleteOutlined
                                        key="delete"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteGame(game.id);
                                        }}
                                    />
                                ]}
                                onClick={() => handleCardClick(game)}
                            >
                                <Meta
                                    avatar={
                                        <Typography.Title level={3}>
                                            {!isLoadingWeights && weights
                                                ? calculateCustomPriority(
                                                      game,
                                                      weights
                                                  )
                                                : 'N/A'}
                                        </Typography.Title>
                                    }
                                    title={game.game_title}
                                    description={findConsoleById(game.platform)}
                                />
                            </Card>
                        </Col>
                    ))}
            </Row>

            <GameDetailsModal
                game={selectedGame}
                open={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onEdit={handleEditGame}
            />
        </Layout>
    );
};

export default GamesPage;
