import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/button';
import { ButtonType, ButtonWidth } from '../types/button';
import { motion } from 'motion/react';

interface LoginProps {
    isAuthenticated: boolean;
    onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ isAuthenticated, onLoginSuccess }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [rememberMe, setRememberMe] = useState<boolean>(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = () => {
        // Simulate a successful login
        onLoginSuccess();
    };

    return (
        <div className="flex h-full min-h-screen w-full flex-col gap-4 p-10">
            <motion.div
                className="mx-auto flex flex-col justify-center gap-4 rounded-lg bg-white px-12 py-8 shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <h1 className="font-faustina text-2xl font-bold">Login Page</h1>
                <div className="flex w-full flex-col justify-center">
                    <motion.input
                        type="text"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.05 }}
                        className="font-roboto w-full rounded-md border p-2"
                    />
                </div>
                <div className="flex w-full flex-col justify-center">
                    <motion.input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.05 }}
                        className="font-roboto w-full rounded-md border p-2"
                    />
                </div>
                <div>
                    <label className="font-roboto mr-2 flex items-center">
                        <input
                            type="checkbox"
                            className="font-roboto mr-1 h-4 w-4"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        Remember Me
                    </label>
                </div>
                <Button
                    type={ButtonType.Submit}
                    width={ButtonWidth.Full}
                    onClick={handleLogin}
                    disabled={!email || !password}
                >
                    Login
                </Button>
                <div className="flex flex-row gap-1">
                    <p className="font-roboto">Don't have an account?</p>
                    <p
                        className="font-roboto block text-blue-500 hover:underline"
                        onClick={() => navigate('/register')}
                    >
                        Register here
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
