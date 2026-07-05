import React, { useState } from 'react';
import { useNavigate, Outlet } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Layout, Menu, theme, Button } from 'antd';
import {
    BarsOutlined,
    PieChartOutlined,
    SettingOutlined,
    UserOutlined
} from '@ant-design/icons';
import { supabase } from '../../../supabaseClient';

const { Header, Content, Footer, Sider } = Layout;

const items = [
    {
        key: '1',
        icon: <PieChartOutlined />,
        label: 'Dashboard',
        to: '/'
    },
    {
        key: 'sub1',
        icon: <BarsOutlined />,
        label: 'My Games',
        children: [
            { key: '2', label: 'All My Games', to: '/games' },
            { key: '3', label: 'Add Game', to: '/games/add-game' },
            { key: '4', label: 'Rating Config', to: '/games/rating-config' }
        ]
    },
    {
        key: 'sub2',
        icon: <UserOutlined />,
        label: 'User',
        to: '/profile'
    },
    {
        key: 'sub3',
        icon: <SettingOutlined />,
        label: 'Settings',
        to: '/settings'
    }
];

const AppLayout: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer }
    } = theme.useToken();
    const currentYear = new Date().getFullYear();

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
                    theme="dark"
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
                        Log Out
                    </Button>
                </Header>
                <Content style={{ margin: '0 16px' }}>
                    <Outlet />
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    Backlog Project ©{currentYear}
                </Footer>
            </Layout>
        </Layout>
    );
};

export default AppLayout;
