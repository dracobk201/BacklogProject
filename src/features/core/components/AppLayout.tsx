import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from '@tanstack/react-router';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Layout, Menu, theme, Button } from 'antd';
import {
    BarsOutlined,
    PieChartOutlined,
    SettingOutlined,
    UserOutlined
} from '@ant-design/icons';
import { supabase } from '../../../supabaseClient';
import { useTranslation } from 'react-i18next';
import { getGeneralUserPreferences } from '../../../services/backlogService';
import { useSettingsStore } from '../../../stores/settingsStore';

const { Header, Content, Footer, Sider } = Layout;

const AppLayout: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer }
    } = theme.useToken();
    const currentYear = new Date().getFullYear();
    const hydrateFromDb = useSettingsStore((state) => state.hydrateFromDb);

    const { data: preferences } = useQuery({
        queryKey: ['user-preferences'],
        queryFn: getGeneralUserPreferences
    });

    useEffect(() => {
        if (preferences) {
            hydrateFromDb({
                language: preferences.language,
                theme: preferences.theme
            });
        }
    }, [preferences, hydrateFromDb]);

    const items = [
        {
            key: '1',
            icon: <PieChartOutlined />,
            label: t('appLayout.dashboard'),
            to: '/'
        },
        {
            key: 'sub1',
            icon: <BarsOutlined />,
            label: t('appLayout.myGames'),
            children: [
                { key: '2', label: t('appLayout.allMyGames'), to: '/games' },
                {
                    key: '3',
                    label: t('appLayout.addGame'),
                    to: '/games/add-game'
                },
                {
                    key: '4',
                    label: t('appLayout.ratingConfig'),
                    to: '/games/rating-config'
                }
            ]
        },
        {
            key: 'sub2',
            icon: <UserOutlined />,
            label: t('appLayout.user'),
            to: '/profile'
        },
        {
            key: 'sub3',
            icon: <SettingOutlined />,
            label: t('appLayout.settings'),
            to: '/settings'
        }
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        queryClient.removeQueries({ queryKey: ['auth-session'] });
        navigate({ to: '/login' });
    };

    const handleMenuClick = ({ key }: { key: string }) => {
        let targetTo: string | undefined;

        for (const item of items) {
            if (item.key === key) {
                targetTo = item.to;
                break;
            }
            if (item.children) {
                const child = item.children.find((c) => c.key === key);
                if (child) {
                    targetTo = child.to;
                    break;
                }
            }
        }

        if (targetTo) {
            navigate({ to: targetTo });
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                theme={
                    useSettingsStore((state) => state.theme) as 'light' | 'dark'
                }
            >
                <div
                    style={{
                        height: 32,
                        margin: 16,
                        background: colorBgContainer,
                        borderRadius: 6
                    }}
                />
                <Menu
                    theme={
                        useSettingsStore((state) => state.theme) as
                            | 'light'
                            | 'dark'
                    }
                    defaultSelectedKeys={['1']}
                    mode="inline"
                    items={items}
                    onClick={handleMenuClick}
                />
            </Sider>
            <Layout>
                <Header
                    style={{
                        padding: '0 16px',
                        background: colorBgContainer,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center'
                    }}
                >
                    <Button type="primary" danger onClick={handleLogout}>
                        {t('appLayout.logout')}
                    </Button>
                </Header>
                <Content style={{ margin: '0 16px' }}>
                    <Outlet />
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    {t('appLayout.footer', { year: currentYear })}
                </Footer>
            </Layout>
        </Layout>
    );
};

export default AppLayout;
