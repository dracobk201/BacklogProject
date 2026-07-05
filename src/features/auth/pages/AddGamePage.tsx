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
    Image,
    AutoComplete,
    Spin
} from 'antd';
import { Typography } from 'antd';
import React, { useState, useRef } from 'react';
import { platformCascaderOptions } from '../../../data/platforms';
import {
    searchGamesFromIGDB,
    getEnrichedGameData
} from '../../../services/gameApiService';
import { addGameToBacklog } from '../../../services/backlogService';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import type { OpenCriticResults } from '../../../types/database.types';

const { Title } = Typography;
const { TextArea } = Input;

const AddGamePage: React.FC = () => {
    const [form] = Form.useForm();
    const [loadingSearchGame, setLoadingSearchGame] = useState<boolean>(false);
    const [coverImageUrl, setCoverImageUrl] = useState<string>('');
    const [searchResults, setSearchResults] = useState<OpenCriticResults[]>([]);
    const [options, setOptions] = useState<
        { value: string; label: string; key: string }[]
    >([]);
    const [selectedGameMeta, setSelectedGameMeta] = useState<{
        game_id: string;
        steam_app_id: string | null;
    }>({ game_id: '', steam_app_id: null });
    const [currentStatus, setCurrentStatus] = useState<string>('pending');
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    const onSearchGame = (value: string) => {
        if (!value) {
            setOptions([]);
            return;
        }

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        searchTimeout.current = setTimeout(async () => {
            setLoadingSearchGame(true);
            try {
                const results = await searchGamesFromIGDB(value);
                setSearchResults(results);
                setOptions(
                    results.map((g: OpenCriticResults) => ({
                        value: g.game_title,
                        label: `${g.game_title} (${g.release_year || 'N/A'})`,
                        key: g.game_id
                    }))
                );
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingSearchGame(false);
            }
        }, 500); // 500ms
    };

    const onSelectGame = async (value: string, option: any) => {
        const gameId = option.key;
        const game = searchResults.find(
            (g: OpenCriticResults) => g.game_id === gameId
        );
        if (!game) return;

        setCoverImageUrl(game.cover_url || '');
        form.setFieldsValue({
            game: game.game_title,
            release_year: game.release_year
                ? dayjs().year(game.release_year)
                : null
        });

        setLoadingSearchGame(true);
        try {
            const enriched = await getEnrichedGameData(gameId, game.game_title);
            form.setFieldsValue({
                rating: enriched.rating,
                steam_rating: enriched.steam_rating,
                length_hours: enriched.length_hours
            });
            setSelectedGameMeta({
                game_id: enriched.game_id || gameId,
                steam_app_id: enriched.steam_app_id || game.steam_app_id || null
            });
            if (enriched.notes) {
                const currentNotes = form.getFieldValue('notes') || '';
                form.setFieldsValue({
                    notes: currentNotes + '\n' + enriched.notes
                });
            }
        } catch (error) {
            console.error('Error enriching data:', error);
        } finally {
            setLoadingSearchGame(false);
        }
    };

    const onFinish = async (values: any) => {
        try {
            setLoadingSearchGame(true);
            const gameData = {
                game_id: selectedGameMeta.game_id || crypto.randomUUID(),
                game_title: values.game,
                steam_app_id: selectedGameMeta.steam_app_id,
                excitement: values.excitement || 0,
                dropped: values.dropped || false,
                beaten_before: values.beaten_before || false,
                recommended: values.recommended || false,
                length_hours: values.length_hours || null,
                release_year: values.release_year
                    ? values.release_year.year()
                    : null,
                rating: values.rating || null,
                steam_rating: values.steam_rating || null,
                platform: values.platform ? values.platform.join(' ') : null,
                game_type: values.game_type,
                status: values.status || 'pending',
                start_date: values.start_date
                    ? values.start_date.toISOString()
                    : null,
                completion_date: values.completion_date
                    ? values.completion_date.toISOString()
                    : null,
                notes: values.notes || null
            };

            await addGameToBacklog(gameData as any);
            toast.success('Game added to your backlog!');
            form.resetFields();
            setCoverImageUrl('');
            setSelectedGameMeta({ game_id: '', steam_app_id: null });
        } catch (error: any) {
            console.error('Submit error:', error);
            toast.error(error.message || 'Failed to add game');
        } finally {
            setLoadingSearchGame(false);
        }
    };

    return (
        <>
            <Layout>
                <Title level={2}>Add a new Game to your backlog</Title>
            </Layout>

            <Form
                form={form}
                onFinish={onFinish}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 14 }}
                layout="horizontal"
                style={{ maxWidth: 600 }}
                initialValues={{ status: 'pending', excitement: 2.5 }}
            >
                <Form.Item
                    label="Game Name"
                    name="game"
                    rules={[
                        {
                            required: true,
                            message: 'Please input the game name!'
                        }
                    ]}
                >
                    <AutoComplete
                        options={options}
                        onSearch={onSearchGame}
                        onSelect={onSelectGame}
                        placeholder="Type a game (e.g. Mario)"
                        notFoundContent={
                            loadingSearchGame ? <Spin size="small" /> : null
                        }
                    />
                </Form.Item>

                {coverImageUrl && (
                    <Image width={200} alt="Game" src={coverImageUrl} />
                )}
                <Form.Item label="Excitement" name="excitement">
                    <Rate allowHalf />
                </Form.Item>
                <Form.Item
                    label="Dropped"
                    name="dropped"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>
                <Form.Item
                    label="Beaten Before"
                    name="beaten_before"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>
                <Form.Item
                    label="Recommended"
                    name="recommended"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>
                <Form.Item
                    label="Platform"
                    name="platform"
                    rules={[
                        { required: true, message: 'Please select a platform!' }
                    ]}
                >
                    <Cascader options={platformCascaderOptions} />
                </Form.Item>
                <Form.Item label="Release Year" name="release_year">
                    <DatePicker picker="year" disabled />
                </Form.Item>
                <Form.Item label="Rating (OpenCritic)" name="rating">
                    <InputNumber disabled />
                </Form.Item>
                <Form.Item label="Steam Rating" name="steam_rating">
                    <InputNumber disabled />
                </Form.Item>
                <Form.Item label="Length (Hours)" name="length_hours">
                    <InputNumber disabled />
                </Form.Item>
                <Form.Item
                    label="Game Type"
                    name="game_type"
                    rules={[
                        {
                            required: true,
                            message: 'Please select a game type!'
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
                <Form.Item label="Status" name="status">
                    <Select
                        options={[
                            { label: 'Pending', value: 'pending' },
                            { label: 'Playing', value: 'playing' },
                            { label: 'Completed', value: 'completed' },
                            { label: 'Dropped', value: 'dropped' }
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
                            setCurrentStatus(value);
                        }}
                    />
                </Form.Item>

                {/* Only show these fields based on the status selected*/}
                {(currentStatus === 'playing' ||
                    currentStatus === 'completed') && (
                    <Form.Item
                        label="Start Date"
                        name="start_date"
                        rules={[
                            {
                                required:
                                    currentStatus === 'playing' ||
                                    currentStatus === 'completed'
                                        ? true
                                        : false,
                                message: 'Please input the start date!'
                            }
                        ]}
                    >
                        <DatePicker />
                    </Form.Item>
                )}
                {currentStatus === 'completed' && (
                    <Form.Item
                        label="Completion Date"
                        name="completion_date"
                        rules={[
                            {
                                required:
                                    currentStatus === 'completed'
                                        ? true
                                        : false,
                                message: 'Please input the completion date!'
                            }
                        ]}
                    >
                        <DatePicker />
                    </Form.Item>
                )}
                <Form.Item label="Notes" name="notes">
                    <TextArea rows={4} />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
};

export default AddGamePage;
