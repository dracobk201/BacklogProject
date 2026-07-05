import { Button, Form, Layout, Typography, message, Skeleton } from 'antd';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    getUserScoringWeights,
    updateUserScoringWeights
} from '../../../services/backlogService';
import { WeightSlider } from '../components/WeightSlider';
import { PlatformWeightsTree } from '../components/PlatformWeightsTree';
import { GameTypeWeightsTree } from '../components/GameTypeWeightsTree';
import type { UserScoringWeights } from '../../../types/database.types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const { Title } = Typography;

const RatingConfig: React.FC = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: weights, isLoading } = useQuery({
        queryKey: ['user-scoring-weights'],
        queryFn: getUserScoringWeights
    });

    useEffect(() => {
        if (weights) {
            form.setFieldsValue({
                weight_excitement: weights.weight_excitement ?? 50,
                weight_dropped: weights.weight_dropped ?? 50,
                weight_beated_before: weights.weight_beated_before ?? 50,
                weight_recommended: weights.weight_recommended ?? 50,
                weight_release_year: weights.weight_release_year ?? 50,
                weight_rating: weights.weight_rating ?? 50,
                weight_steam_rating: weights.weight_steam_rating ?? 50,
                weight_length_hours: weights.weight_length_hours ?? 50,
                weight_game_type: weights.weight_game_type ?? {},
                weight_platform: weights.weight_platform ?? {}
            });
        }
    }, [weights, form]);

    const mutation = useMutation({
        mutationFn: updateUserScoringWeights,
        onSuccess: () => {
            message.success(
                t(
                    'ratingConfig.saveSuccess',
                    'Configuration saved successfully'
                )
            );
            queryClient.invalidateQueries({
                queryKey: ['user-scoring-weights']
            });
        },
        onError: (error) => {
            console.error(error);
            message.error(
                t('ratingConfig.saveError', 'Error saving configuration')
            );
        }
    });

    const onFinish = (values: Partial<UserScoringWeights>) => {
        mutation.mutate(values);
    };

    return (
        <Layout>
            <Layout>
                <Title level={2}>{t('ratingConfig.title')}</Title>
            </Layout>
            {isLoading ? (
                <Skeleton active paragraph={{ rows: 10 }} />
            ) : (
                <Form
                    form={form}
                    onFinish={onFinish}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    style={{ maxWidth: 600 }}
                    initialValues={{
                        weight_excitement: 50,
                        weight_dropped: 50,
                        weight_beated_before: 50,
                        weight_recommended: 50,
                        weight_release_year: 50,
                        weight_rating: 50,
                        weight_steam_rating: 50,
                        weight_length_hours: 50,
                        weight_game_type: {},
                        weight_platform: {}
                    }}
                >
                    <WeightSlider
                        name="weight_excitement"
                        label={t('ratingConfig.excitement')}
                    />
                    <WeightSlider
                        name="weight_dropped"
                        label={t('ratingConfig.dropped')}
                    />
                    <WeightSlider
                        name="weight_beated_before"
                        label={t('ratingConfig.beatenBefore')}
                    />
                    <WeightSlider
                        name="weight_recommended"
                        label={t('ratingConfig.recommended')}
                    />
                    <WeightSlider
                        name="weight_release_year"
                        label={t('ratingConfig.releaseYear')}
                        tooltip={t('ratingConfig.releaseYearInfo')}
                    />
                    <WeightSlider
                        name="weight_rating"
                        label={t('ratingConfig.ratingOpencritic')}
                    />
                    <WeightSlider
                        name="weight_steam_rating"
                        label={t('ratingConfig.steamRating')}
                    />
                    <WeightSlider
                        name="weight_length_hours"
                        label={t('ratingConfig.lengthHours')}
                        tooltip={t('ratingConfig.lengthHoursInfo')}
                    />

                    <Form.Item
                        label={t('ratingConfig.gameType')}
                        name="weight_game_type"
                    >
                        <GameTypeWeightsTree />
                    </Form.Item>

                    <Form.Item
                        label={t('ratingConfig.platform')}
                        name="weight_platform"
                    >
                        <PlatformWeightsTree />
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={mutation.isPending || isLoading}
                        >
                            {t('ratingConfig.submit')}
                        </Button>
                    </Form.Item>
                </Form>
            )}
        </Layout>
    );
};

export default RatingConfig;
