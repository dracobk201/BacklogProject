import React from 'react';
import { Card, Select, Switch, Typography, Form, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../../stores/settingsStore';

const { Title, Text } = Typography;

const SettingsPage: React.FC = () => {
    const { t } = useTranslation();
    const { language, theme, setLanguage, setTheme } = useSettingsStore();

    return (
        <Space
            orientation="vertical"
            style={{ width: '100%', padding: '24px 0' }}
        >
            <Title level={2}>{t('appLayout.settings')}</Title>

            <Card style={{ maxWidth: 600 }}>
                <Form layout="vertical">
                    <Form.Item
                        label={<Text strong>{t('settings.language')}</Text>}
                    >
                        <Select
                            value={language}
                            onChange={(val) => setLanguage(val)}
                            options={[
                                { value: 'en', label: t('settings.english') },
                                { value: 'es', label: t('settings.spanish') },
                                { value: 'it', label: t('settings.italian') }
                            ]}
                            style={{ width: 200 }}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<Text strong>{t('settings.darkMode')}</Text>}
                    >
                        <Switch
                            checked={theme === 'dark'}
                            onChange={(checked) =>
                                setTheme(checked ? 'dark' : 'light')
                            }
                            checkedChildren={t('settings.darkMode')}
                            unCheckedChildren={t('settings.lightMode')}
                        />
                    </Form.Item>
                </Form>
            </Card>
        </Space>
    );
};

export default SettingsPage;
