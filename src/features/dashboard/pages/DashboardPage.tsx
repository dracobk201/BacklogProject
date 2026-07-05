import React from 'react';
import { Layout, theme } from 'antd';

const DashboardPage: React.FC = () => {
    const {
        token: { colorBgContainer, borderRadiusLG }
    } = theme.useToken();

    return (
        <React.Fragment>
            <Layout
                style={{
                    marginTop: '16px',
                    padding: 24,
                    minHeight: 360,
                    background: colorBgContainer,
                    borderRadius: borderRadiusLG
                }}
            >
                Welcome to Dashboard.
            </Layout>
        </React.Fragment>
    );
};

export default DashboardPage;
