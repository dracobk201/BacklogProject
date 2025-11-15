import { motion } from 'motion/react';
import React from 'react';

const Dashboard: React.FC = () => {
    return (
        <div className="flex h-full min-h-screen w-full flex-col gap-4 p-10">
            <motion.div
                className="mx-auto flex min-w-[95dvw] flex-col justify-center gap-4 rounded-lg bg-slate-800 px-12 py-8 shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <h1 className="font-faustina text-2xl font-bold text-white">
                    Dashboard Page
                </h1>
                <p className="font-roboto text-white">
                    Welcome to the dashboard! You are successfully logged in.
                </p>
            </motion.div>
        </div>
    );
}

export default Dashboard;
