import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button, Card, Col, Layout, Row, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { getBacklog } from '../../../services/backlogService';
import type { BacklogItem } from '../../../types/database.types';
import { Meta } from 'antd/es/list/Item';
import { platformsData } from '../../../data/platforms';
import { useTranslation } from 'react-i18next';

const GamesPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [gamesFromBacklog, setGamesFromBacklog] = useState<BacklogItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const unknownGameURL =
        'https://www.igdb.com/assets/no_cover_show-ef1e36c00e101c2fb23d15bb80edd9667bbf604a12fc0267a66033afea320c65.png';
    useEffect(() => {
        const fetchGames = async () => {
            try {
                const backlog = await getBacklog();
                console.log(backlog);
                setGamesFromBacklog(backlog);
            } catch (error) {
                console.error('Error fetching backlog:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, []);

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
                <Spin size="large" />
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
