import { motion } from 'motion/react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/button';
import { ButtonType, ButtonWidth } from '../types/button';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [userName, setUserName] = useState<string>('');

    const handleRegister = () => {
        // Simulate a successful registration
        navigate('/login');
    };

    return (
        <div className="flex h-full min-h-screen w-full flex-col gap-4 p-10">
            <motion.div
                className="mx-auto flex min-w-[30dvw] flex-col justify-center gap-4 rounded-lg bg-white px-12 py-8 shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <h1 className="font-faustina text-2xl font-bold">
                    Register Page
                </h1>
                <div className="flex w-full flex-col justify-center">
                    <motion.input
                        type="text"
                        placeholder="Username"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.05 }}
                        className="font-roboto w-full rounded-md border p-2"
                    />
                </div>
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
                        minLength={8}
                        className="font-roboto w-full rounded-md border p-2"
                    />
                </div>
                <div className="flex w-full flex-col justify-center">
                    <motion.input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.05 }}
                        minLength={8}
                        className="font-roboto w-full rounded-md border p-2"
                    />
                </div>
                <Button
                    type={ButtonType.Submit}
                    width={ButtonWidth.Full}
                    onClick={handleRegister}
                    disabled={!email || !password || password !== confirmPassword || !userName}
                >
                    Register
                </Button>
                <div className="flex flex-row gap-1">
                    <p className="font-roboto">Already have an account?</p>
                    <p
                        className="font-roboto block text-blue-500 hover:underline"
                        onClick={() => navigate('/login')}
                    >
                        Sign in
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
