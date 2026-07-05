import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button, Card, Col, Layout, Row, Skeleton } from 'antd';
import { getBacklog } from '../../../services/backlogService';
import type { BacklogItem } from '../../../types/database.types';
import { Meta } from 'antd/es/list/Item';
import { platformsData } from '../../../data/platforms';
import { useTranslation } from 'react-i18next';

import { useQuery } from '@tanstack/react-query';

const GamesPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { data: gamesFromBacklog = [], isLoading: loading } = useQuery({
        queryKey: ['backlog'],
        queryFn: getBacklog
    });

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

    if (loading) {
        return (
            <Layout>
                <Layout style={{ marginBottom: 16 }}>
                    <Button disabled style={{ width: 120 }}>
                        {t('games.addGame')}
                    </Button>
                </Layout>
                <Row gutter={16}>
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Col className="gutter-row" span={6} key={index}>
                            <Card
                                hoverable
                                variant="borderless"
                                style={{ width: 240, height: 350 }}
                            >
                                <Skeleton.Image
                                    active
                                    style={{
                                        width: 192,
                                        height: 200,
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
            <Layout>
                <Button onClick={handleAddGame}>{t('games.addGame')}</Button>
            </Layout>
            <Row gutter={16}>
                <Col className="gutter-row" span={6}>
                    {!loading &&
                        gamesFromBacklog.map((game: BacklogItem) => (
                            <Card
                                key={game.id}
                                hoverable
                                variant="borderless"
                                style={{ width: 240 }}
                                cover={
                                    <img
                                        draggable={false}
                                        alt={game.game_title}
                                        src={game.cover_url || unknownGameURL}
                                    />
                                }
                            >
                                <Meta
                                    title={game.game_title}
                                    description={findConsoleById(game.platform)}
                                />
                            </Card>
                        ))}
                </Col>
            </Row>
        </Layout>
    );
};

export default GamesPage;
