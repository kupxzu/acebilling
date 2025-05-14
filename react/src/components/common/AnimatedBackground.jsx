import React from 'react';

const AnimatedLine = ({ delay, duration, yPosition, opacity }) => (
    <div
        className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-red-200 to-transparent"
        style={{
            top: `${yPosition}%`,
            opacity: opacity,
            animation: `slideRight ${duration}s linear ${delay}s infinite`
        }}
    />
);

const AnimatedBackground = () => {
    return (
        <>
            {/* Global styles for animations */}
            <style jsx>{`
                @keyframes slideRight {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                
                @keyframes slideDown {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
                
                @keyframes diagonalMove {
                    0% { transform: translate(-200%, -200%) rotate(45deg); }
                    100% { transform: translate(200%, 200%) rotate(45deg); }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 0.1; }
                    50% { opacity: 0.3; }
                }
            `}</style>

            <div className="absolute inset-0">
                {/* Horizontal lines */}
                <AnimatedLine delay={0} duration={8} yPosition={10} opacity={1} />
                <AnimatedLine delay={2} duration={10} yPosition={25} opacity={1} />
                <AnimatedLine delay={4} duration={12} yPosition={40} opacity={1} />
                <AnimatedLine delay={1} duration={9} yPosition={55} opacity={1} />
                <AnimatedLine delay={3} duration={11} yPosition={70} opacity={1} />
                <AnimatedLine delay={5} duration={13} yPosition={85} opacity={1} />
                
                {/* Vertical lines */}
                <div
                    className="absolute inset-y-0 w-0.5 bg-gradient-to-b from-transparent via-green-200 to-transparent"
                    style={{
                        left: '20%',
                        animation: 'slideDown 15s linear infinite',
                        opacity: 1
                    }}
                />
                <div
                    className="absolute inset-y-0 w-0.5 bg-gradient-to-b from-transparent via-gray-200 to-transparent"
                    style={{
                        left: '50%',
                        animation: 'slideDown 12s linear 3s infinite',
                        opacity: 1
                    }}
                />
                <div
                    className="absolute inset-y-0 w-0.5 bg-gradient-to-b from-transparent via-orange-200 to-transparent"
                    style={{
                        left: '80%',
                        animation: 'slideDown 18s linear 5s infinite',
                        opacity: 1
                    }}
                />
                
                {/* Diagonal lines */}
                <div
                    className="absolute w-0.5 h-96 bg-gradient-to-t from-transparent via-yellow-200 to-transparent"
                    style={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(45deg)',
                        animation: 'diagonalMove 20s linear infinite',
                        opacity: 1
                    }}
                />
                <div
                    className="absolute w-0.5 h-96 bg-gradient-to-t from-transparent via-gray-200 to-transparent"
                    style={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(-45deg)',
                        animation: 'diagonalMove 25s linear 10s infinite reverse',
                        opacity: 1
                    }}
                />

                {/* Grid dots */}
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-gray-300 rounded-full"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animation: `pulse ${Math.random() * 3 + 2}s ease-in-out infinite`
                        }}
                    />
                ))}
            </div>
        </>
    );
};

export default AnimatedBackground;