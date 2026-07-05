import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button, Col, Layout, Row, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { getBacklog } from '../../../services/backlogService';
import type { BacklogItem } from '../../../types/database.types';

const GamesPage: React.FC = () => {
    const navigate = useNavigate();
    const [gamesFromBacklog, setGamesFromBacklog] = useState<BacklogItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const backlog = await getBacklog();
                setGamesFromBacklog(backlog);
            } catch (error) {
                console.error('Error fetching backlog:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, []);

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
                <Button onClick={handleAddGame}>Add Game</Button>
            </Layout>
            <Row gutter={16}>
                <Col className="gutter-row" span={6}>
                    {!loading &&
                        gamesFromBacklog.map((game: BacklogItem) => (
                            <div key={game.id}>{game.game_title}</div>
                        ))}
                </Col>
            </Row>
        </Layout>
    );
};

export default GamesPage;
