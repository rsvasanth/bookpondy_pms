import React from 'react';

interface BrandLogoProps {
    className?: string;
    variant?: 'white' | 'dark' | 'color';
}

const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', variant = 'color' }) => {
    return (
        <div className={`flex items-center ${className}`}>
            <img
                src="/Logo.svg"
                alt="BookPondy"
                className={`h-8 w-auto ${variant === 'white' ? 'invert brightness-0' : ''}`}
            />
        </div>
    );
};

export default BrandLogo;
