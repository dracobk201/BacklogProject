import React from 'react';
import { ButtonType, ButtonWidth } from '../types/button';
import { motion } from 'motion/react';

interface ButtonProps {
    type?: ButtonType;
    width?: ButtonWidth;
    onClick?: () => void;
    children?: React.ReactNode;
    disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    type = ButtonType.Default,
    width = ButtonWidth.Default,
    onClick,
    children,
    disabled = false
}) => {
    const standardButtonStyle = 'px-4 py-2 rounded font-roboto';

    /**
     * Determine button styles based on type
     */
    const buttonColorStyle = (() => {
        switch (type) {
            case ButtonType.Submit:
                return 'bg-success text-white';
            case ButtonType.Cancel:
                return 'bg-danger text-white';
            default:
                return 'bg-primary text-white';
        }
    })();

    /**
     * Determine button styles based on width
     */
    const buttonWidthStyle = (() => {
        switch (width) {
            case ButtonWidth.Long:
                return 'w-64';
            case ButtonWidth.Short:
                return 'w-32';
            case ButtonWidth.Full:
                return 'w-full';
            default:
                return '';
        }
    })();

    return (
        <motion.button
            className={
                standardButtonStyle +
                ' ' +
                buttonColorStyle +
                ' ' +
                buttonWidthStyle
            }
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </motion.button>
    );
};

export default Button;
