import React from 'react';

const SkylineIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <svg
            viewBox="0 0 1200 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M0 350C100 350 150 330 200 330C250 330 300 360 400 360C500 360 550 320 600 320C650 320 700 350 800 350C900 350 950 310 1000 310C1050 310 1100 340 1200 340"
                stroke="black"
                strokeWidth="1"
                strokeOpacity="0.2"
            />
            {/* Abstract Buildings/Skyline Elements */}
            <path d="M150 330V280H180V310H200V330" stroke="black" strokeWidth="1.5" />
            <path d="M220 335H260V250L280 230L300 250V335" stroke="black" strokeWidth="1.5" />
            <path d="M350 360V290H420V360" stroke="black" strokeWidth="1.5" />
            <path d="M480 340V220H510V180H530V220H560V340" stroke="black" strokeWidth="1.5" />
            <circle cx="680" cy="300" r="30" stroke="black" strokeWidth="1.5" />
            <path d="M680 270V240" stroke="black" strokeWidth="1.5" />
            <path d="M750 350V250H780V350" stroke="black" strokeWidth="1.5" />
            <path d="M850 345C850 310 880 280 920 280C960 280 990 310 990 345" stroke="black" strokeWidth="1.5" />
        </svg>
    );
};

export default SkylineIllustration;
