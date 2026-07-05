import { useEffect } from 'react';
import { Card } from 'antd';
import { useNavigate } from '@tanstack/react-router';
import { motion } from 'motion/react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../../supabaseClient';
import { useQueryClient } from '@tanstack/react-query';
import { authQueryOptions } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(event, session);
            if (event === 'SIGNED_IN') {
                await queryClient.invalidateQueries({
                    queryKey: authQueryOptions.queryKey
                });
                navigate({ to: '/' });
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate, queryClient]);

    return (
        <div
            style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <Card
                    style={{
                        width: '100%',
                        minWidth: 400,
                        borderRadius: 12,
                        boxShadow:
                            '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <Auth
                        supabaseClient={supabase}
                        appearance={{ theme: ThemeSupa }}
                        providers={['google']}
                        localization={{
                            variables: {
                                sign_in: {
                                    email_label: 'Email',
                                    password_label: 'Password',
                                    button_label: 'Sign in'
                                },
                                sign_up: {
                                    email_label: 'Email',
                                    password_label: 'Password',
                                    button_label: 'Sign up'
                                }
                            }
                        }}
                    />
                </Card>
            </motion.div>
        </div>
    );
};

export default LoginPage;
