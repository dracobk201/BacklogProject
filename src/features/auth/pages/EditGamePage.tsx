import React, { useEffect } from 'react';
import {
    Button,
    Cascader,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Layout,
    Rate,
    Select,
    Switch,
    Typography,
    Modal,
    Image,
    Spin
} from 'antd';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getGameById,
    updateGameInfo,
    softDeleteGame
} from '../../../services/backlogService';
import { platformCascaderOptions } from '../../../data/platforms';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import type { GameStatus, GameType } from '../../../types/addGame.types';
import type { FormValues } from '../../../types/addGame.types';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;
const { TextArea } = Input;

const EditGamePage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { gameId } = useParams({
        from: '/_authenticated/games/edit-game/$gameId'
    });
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const currentStatus = Form.useWatch('status', form) || 'pending';

    const { data: game, isLoading } = useQuery({
        queryKey: ['game', gameId],
        queryFn: () => getGameById(gameId)
    });

    useEffect(() => {
        if (game) {
            form.setFieldsValue({
                game: game.game_title,
                excitement: game.excitement,
                dropped: game.dropped,
                beaten_before: game.beaten_before,
                recommended: game.recommended,
                platform: game.platform ? [game.platform] : undefined,
                release_year: game.release_year
                    ? dayjs().year(game.release_year)
                    : null,
                rating: game.rating,
                steam_rating: game.steam_rating,
                length_hours: game.length_hours,
                game_type: game.game_type,
                status: game.status,
                start_date: game.start_date ? dayjs(game.start_date) : null,
                completion_date: game.completion_date
                    ? dayjs(game.completion_date)
                    : null,
                notes: game.notes
            });
        }
    }, [game, form]);

    const updateMutation = useMutation({
        mutationFn: (values: Partial<FormValues>) => {
            const platformVal =
                values.platform && values.platform.length > 1
                    ? values.platform[1]
                    : values.platform
                      ? values.platform[0]
                      : null;

            return updateGameInfo(gameId, {
                excitement: values.excitement,
                dropped: values.dropped,
                beaten_before: values.beaten_before,
                recommended: values.recommended,
                length_hours: values.length_hours,
                platform: platformVal as string | null,
                game_type: values.game_type as GameType | null,
                status: values.status as GameStatus,
                start_date: values.start_date
                    ? dayjs(values.start_date).toISOString()
                    : null,
                completion_date: values.completion_date
                    ? dayjs(values.completion_date).toISOString()
                    : null,
                notes: values.notes
            });
        },
        onSuccess: () => {
            toast.success(t('editGame.toast.updateSuccess'));
            queryClient.invalidateQueries({ queryKey: ['backlog'] });
            queryClient.invalidateQueries({ queryKey: ['game', gameId] });
            navigate({ to: '/games' });
        },
        onError: (error) => {
            console.error('Update error:', error);
            toast.error(t('editGame.toast.errorUpdate'));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: () => softDeleteGame(gameId),
        onSuccess: () => {
            toast.success(t('editGame.toast.deleteSuccess'));
            queryClient.invalidateQueries({ queryKey: ['backlog'] });
            navigate({ to: '/games' });
        },
        onError: (error) => {
            console.error('Delete error:', error);
            toast.error(t('editGame.toast.errorDelete'));
        }
    });

    const onFinish = (values: FormValues) => {
        Modal.confirm({
            title: t('editGame.modal.updateTitle'),
            content: t('editGame.modal.updateContent'),
            okText: t('editGame.modal.updateConfirm'),
            cancelText: t('editGame.modal.updateCancel'),
            onOk: () => {
                updateMutation.mutate(values);
            }
        });
    };

    const handleDelete = () => {
        Modal.confirm({
            title: t('editGame.modal.deleteTitle'),
            content: t('editGame.modal.deleteContent'),
            okText: t('editGame.modal.confirmDelete'),
            okType: 'danger',
            cancelText: t('editGame.modal.cancelDelete'),
            onOk: () => {
                deleteMutation.mutate();
            }
        });
    };

    if (isLoading) {
        return (
            <Layout style={{ padding: '50px', alignItems: 'center' }}>
                <Spin size="large" />
            </Layout>
        );
    }

    if (!game) {
        return (
            <Layout>
                <Title level={3}>{t('editGame.notFound')}</Title>
                <Button onClick={() => navigate({ to: '/games' })}>
                    {t('editGame.back')}
                </Button>
            </Layout>
        );
    }

    return (
        <>
            <Layout
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    maxWidth: 600,
                    marginBottom: 20
                }}
            >
                <Title level={2}>{t('editGame.title')}</Title>
                <Button danger type="primary" onClick={handleDelete}>
                    {t('editGame.delete')}
                </Button>
            </Layout>

            <Form
                form={form}
                onFinish={onFinish}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
                layout="horizontal"
                style={{ maxWidth: 600 }}
            >
                <Form.Item label={t('addGame.gameName')} name="game">
                    <Input disabled />
                </Form.Item>

                {game.cover_url && (
                    <Form.Item wrapperCol={{ offset: 8, span: 14 }}>
                        <Image width={150} alt="Game" src={game.cover_url} />
                    </Form.Item>
                )}

                <Form.Item label={t('addGame.excitement')} name="excitement">
                    <Rate allowHalf />
                </Form.Item>
                <Form.Item
                    label={t('addGame.dropped')}
                    name="dropped"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>
                <Form.Item
                    label={t('addGame.beatenBefore')}
                    name="beaten_before"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>
                <Form.Item
                    label={t('addGame.recommended')}
                    name="recommended"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>
                <Form.Item
                    label={t('addGame.platform')}
                    name="platform"
                    rules={[
                        {
                            required: true,
                            message: t('addGame.platformRequired')
                        }
                    ]}
                >
                    <Cascader options={platformCascaderOptions} />
                </Form.Item>
                <Form.Item label={t('addGame.releaseYear')} name="release_year">
                    <DatePicker picker="year" disabled />
                </Form.Item>
                <Form.Item label={t('addGame.ratingOpencritic')} name="rating">
                    <InputNumber disabled />
                </Form.Item>
                <Form.Item label={t('addGame.steamRating')} name="steam_rating">
                    <InputNumber disabled />
                </Form.Item>
                <Form.Item label={t('addGame.lengthHours')} name="length_hours">
                    <InputNumber disabled />
                </Form.Item>
                <Form.Item
                    label={t('addGame.gameType')}
                    name="game_type"
                    rules={[
                        {
                            required: true,
                            message: t('addGame.gameTypeRequired')
                        }
                    ]}
                >
                    <Select
                        options={[
                            { label: 'AAA', value: 'AAA' },
                            { label: 'AA', value: 'AA' },
                            { label: 'Indie', value: 'Indie' }
                        ]}
                    />
                </Form.Item>
                <Form.Item label={t('addGame.status')} name="status">
                    <Select
                        options={[
                            {
                                label: t('addGame.statusPending'),
                                value: 'pending'
                            },
                            {
                                label: t('addGame.statusPlaying'),
                                value: 'playing'
                            },
                            {
                                label: t('addGame.statusCompleted'),
                                value: 'completed'
                            },
                            {
                                label: t('addGame.statusDropped'),
                                value: 'dropped'
                            }
                        ]}
                        onSelect={(value) => {
                            if (value === 'completed') {
                                form.setFieldsValue({
                                    completion_date: dayjs(),
                                    dropped: false,
                                    beaten_before: true
                                });
                            } else if (value === 'dropped') {
                                form.setFieldsValue({
                                    completion_date: null,
                                    dropped: true,
                                    beaten_before: false
                                });
                            } else if (value === 'pending') {
                                form.setFieldsValue({
                                    completion_date: null,
                                    start_date: null,
                                    dropped: false,
                                    beaten_before: false
                                });
                            } else if (value === 'playing') {
                                form.setFieldsValue({
                                    start_date: dayjs(),
                                    completion_date: null,
                                    dropped: false,
                                    beaten_before: false
                                });
                            }
                        }}
                    />
                </Form.Item>

                {(currentStatus === 'playing' ||
                    currentStatus === 'completed') && (
                    <Form.Item
                        label={t('addGame.startDate')}
                        name="start_date"
                        rules={[
                            {
                                required:
                                    currentStatus === 'playing' ||
                                    currentStatus === 'completed'
                                        ? true
                                        : false,
                                message: t('addGame.startDateRequired')
                            }
                        ]}
                    >
                        <DatePicker />
                    </Form.Item>
                )}
                {currentStatus === 'completed' && (
                    <Form.Item
                        label={t('addGame.completionDate')}
                        name="completion_date"
                        rules={[
                            {
                                required:
                                    currentStatus === 'completed'
                                        ? true
                                        : false,
                                message: t('addGame.completionDateRequired')
                            }
                        ]}
                    >
                        <DatePicker />
                    </Form.Item>
                )}
                <Form.Item label={t('addGame.notes')} name="notes">
                    <TextArea rows={4} />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 8, span: 14 }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={updateMutation.isPending}
                        block
                    >
                        {t('editGame.submit')}
                    </Button>
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 8, span: 14 }}>
                    <Button
                        type="default"
                        onClick={() => navigate({ to: '/games' })}
                        block
                    >
                        {t('editGame.cancel')}
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
};

export default EditGamePage;
