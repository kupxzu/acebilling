
import React from 'react';

const MedicalCross = ({ delay, duration, position, size, color }) => (
    <div
        className="absolute"
        style={{
            top: `${position.y}%`,
            left: `${position.x}%`,
            animation: `float ${duration}s ease-in-out ${delay}s infinite`,
            opacity: 0.6
        }}
    >
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            className={`${color} opacity-60 transform rotate-45`}
        >
            <path 
                d="M12 2C7.58172 2 4 5.58172 4 10C4 14.4183 7.58172 18 12 18C16.4183 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2ZM11 6V9H8V11H11V14H13V11H16V9H13V6H11Z"
                fill="currentColor"
            />
        </svg>
    </div>
);

const SlidingLine = ({ vertical = false, delay = 0 }) => (
    <div
        className={`absolute ${vertical ? 'h-full w-px' : 'w-full h-px'} bg-gradient-to-r from-transparent via-gray-400/20 to-transparent`}
        style={{
            animation: `slide${vertical ? 'Y' : 'X'} 15s linear ${delay}s infinite`,
            left: vertical ? `${Math.random() * 100}%` : 0,
            top: vertical ? 0 : `${Math.random() * 100}%`
        }}
    />
);

const AnimatedBackground = () => {
    const crosses = [...Array(15)].map((_, i) => ({
        id: i,
        position: {
            x: Math.random() * 100,
            y: Math.random() * 100
        },
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 4,
        size: Math.random() * 30 + 25, // Increased size
        color: [
            'text-red-500',
            'text-green-500',
            'text-yellow-500',
            'text-purple-500'
        ][Math.floor(Math.random() * 4)]
    }));

    return (
        <>
            <style jsx>{`
                @keyframes float {
                    0% {
                        transform: translateY(20px) scale(0.9);
                        opacity: 0.2;
                    }
                    50% {
                        transform: translateY(-20px) scale(1.1);
                        opacity: 0.6;
                    }
                    100% {
                        transform: translateY(20px) scale(0.9);
                        opacity: 0.2;
                    }
                }

                @keyframes slideX {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(100%); }
                }

                @keyframes slideY {
                    from { transform: translateY(-100%); }
                    to { transform: translateY(100%); }
                }

                @keyframes pulse {
                    0%, 100% { 
                        transform: scale(1);
                        opacity: 0.3;
                    }
                    50% { 
                        transform: scale(1.2);
                        opacity: 0.5;
                    }
                }
            `}</style>

            <div className="absolute inset-0 overflow-hidden">
                {/* Sliding Lines */}
                {[...Array(8)].map((_, i) => (
                    <SlidingLine key={`h-${i}`} delay={i * 2} />
                ))}
                {[...Array(8)].map((_, i) => (
                    <SlidingLine key={`v-${i}`} vertical delay={i * 2} />
                ))}

                {/* Medical Crosses */}
                {crosses.map(cross => (
                    <MedicalCross
                        key={cross.id}
                        position={cross.position}
                        delay={cross.delay}
                        duration={cross.duration}
                        size={cross.size}
                        color={cross.color}
                    />
                ))}

                {/* Grid Points */}
                <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-8">
                    {[...Array(144)].map((_, i) => (
                        <div
                            key={i}
                            className="w-2 h-2 bg-gray-400/30 rounded-full"
                            style={{
                                animation: `pulse ${Math.random() * 2 + 2}s ease-in-out infinite`
                            }}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default AnimatedBackground;

