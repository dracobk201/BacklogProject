import { Button, Form, Layout, Typography, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    getUserScoringWeights,
    updateUserScoringWeights
} from '../../../services/backlogService';
import { WeightSlider } from '../components/WeightSlider';
import { PlatformWeightsTree } from '../components/PlatformWeightsTree';
import { GameTypeWeightsTree } from '../components/GameTypeWeightsTree';
import type { UserScoringWeights } from '../../../types/database.types';

const { Title } = Typography;

const RatingConfig: React.FC = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchWeights = async () => {
            try {
                const data = await getUserScoringWeights();
                if (data) {
                    form.setFieldsValue({
                        weight_excitement: data.weight_excitement ?? 50,
                        weight_dropped: data.weight_dropped ?? 50,
                        weight_beated_before: data.weight_beated_before ?? 50,
                        weight_recommended: data.weight_recommended ?? 50,
                        weight_release_year: data.weight_release_year ?? 50,
                        weight_rating: data.weight_rating ?? 50,
                        weight_steam_rating: data.weight_steam_rating ?? 50,
                        weight_length_hours: data.weight_length_hours ?? 50,
                        weight_game_type: data.weight_game_type ?? {},
                        weight_platform: data.weight_platform ?? {}
                    });
                }
            } catch (error) {
                console.error(error);
                message.error(
                    t('ratingConfig.loadError', 'Error loading configuration')
                );
            }
        };
        fetchWeights();
    }, [form, t]);

    const onFinish = async (values: Partial<UserScoringWeights>) => {
        try {
            setLoading(true);
            await updateUserScoringWeights(values);
            message.success(
                t(
                    'ratingConfig.saveSuccess',
                    'Configuration saved successfully'
                )
            );
        } catch (error) {
            console.error(error);
            message.error(
                t('ratingConfig.saveError', 'Error saving configuration')
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Layout>
                <Title level={2}>{t('ratingConfig.title')}</Title>
            </Layout>
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
                    <Button type="primary" htmlType="submit" loading={loading}>
                        {t('ratingConfig.submit')}
                    </Button>
                </Form.Item>
            </Form>
        </Layout>
    );
};

export default RatingConfig;
