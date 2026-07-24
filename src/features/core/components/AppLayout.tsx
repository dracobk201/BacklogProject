import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from '@tanstack/react-router';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Layout, Menu, theme, Button, Dropdown, Grid } from 'antd';
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
const { useBreakpoint } = Grid;

const AppLayout: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const [collapsed, setCollapsed] = useState(false);
    const screens = useBreakpoint();

    // Determine mobile view when screen width is small (< 768px / md is false)
    const isMobile = screens.md === false;

    const {
        token: {
            colorBgContainer,
            colorPrimary,
            colorTextSecondary,
            colorBorder
        }
    } = theme.useToken();
    const currentYear = new Date().getFullYear();
    const hydrateFromDb = useSettingsStore((state) => state.hydrateFromDb);
    const appTheme = useSettingsStore((state) => state.theme);

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

    const getSelectedKey = (pathname: string) => {
        if (pathname.startsWith('/games/add-game')) return '3';
        if (pathname.startsWith('/games/rating-config')) return '4';
        if (pathname.startsWith('/games')) return '2';
        if (pathname.startsWith('/profile')) return 'sub2';
        if (pathname.startsWith('/settings')) return 'sub3';
        return '1';
    };

    const selectedKey = getSelectedKey(location.pathname);

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
            {!isMobile && (
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                    theme={appTheme as 'light' | 'dark'}
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
                        theme={appTheme as 'light' | 'dark'}
                        selectedKeys={[selectedKey]}
                        mode="inline"
                        items={items}
                        onClick={handleMenuClick}
                    />
                </Sider>
            )}
            <Layout
                style={{ minHeight: '100vh', paddingBottom: isMobile ? 64 : 0 }}
            >
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
                <Content style={{ margin: '16px 16px 0 16px' }}>
                    <Outlet />
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    {t('appLayout.footer', { year: currentYear })}
                </Footer>
            </Layout>

            {/* Mobile Bottom Navigation Bar */}
            {isMobile && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 60,
                        backgroundColor: colorBgContainer,
                        borderTop: `1px solid ${colorBorder}`,
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        zIndex: 1000,
                        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.15)'
                    }}
                >
                    {items.map((item) => {
                        const isSubActive =
                            item.children &&
                            item.children.some(
                                (child) => child.key === selectedKey
                            );
                        const isActive =
                            item.key === selectedKey || isSubActive;

                        const itemContent = (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    flex: 1,
                                    padding: '6px 0',
                                    color: isActive
                                        ? colorPrimary
                                        : colorTextSecondary,
                                    fontSize: 12,
                                    fontWeight: isActive ? 600 : 400
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 18,
                                        marginBottom: 2
                                    }}
                                >
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                            </div>
                        );

                        if (item.children) {
                            const dropdownItems = item.children.map(
                                (child) => ({
                                    key: child.key,
                                    label: child.label
                                })
                            );

                            return (
                                <Dropdown
                                    key={item.key}
                                    menu={{
                                        items: dropdownItems,
                                        onClick: handleMenuClick,
                                        selectedKeys: [selectedKey]
                                    }}
                                    placement="top"
                                    trigger={['click']}
                                >
                                    {itemContent}
                                </Dropdown>
                            );
                        }

                        return (
                            <div
                                key={item.key}
                                onClick={() =>
                                    handleMenuClick({ key: item.key })
                                }
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    justifyContent: 'center'
                                }}
                            >
                                {itemContent}
                            </div>
                        );
                    })}
                </div>
            )}
        </Layout>
    );
};

export default AppLayout;
