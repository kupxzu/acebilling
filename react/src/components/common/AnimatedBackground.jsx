import React, { useMemo, useEffect, useState } from 'react';

const MedicalCross = React.memo(({ delay, duration, position, size, color }) => (
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
));

const SlidingLine = React.memo(({ vertical = false, delay = 0, position }) => (
    <div
        className={`absolute ${vertical ? 'h-full w-px' : 'w-full h-px'} bg-gradient-to-r from-transparent via-gray-400/20 to-transparent`}
        style={{
            animation: `slide${vertical ? 'Y' : 'X'} 15s linear ${delay}s infinite`,
            left: vertical ? `${position}%` : 0,
            top: vertical ? 0 : `${position}%`
        }}
    />
));

const GridPoint = React.memo(({ animationDuration }) => (
    <div
        className="w-2 h-2 bg-gray-400/30 rounded-full"
        style={{
            animation: `pulse ${animationDuration}s ease-in-out infinite`
        }}
    />
));

const AnimatedBackground = () => {
    // Use state to store the generated elements, initialized to empty arrays
    const [elements, setElements] = useState({
        crosses: [],
        horizontalLines: [],
        verticalLines: [],
        gridPoints: []
    });
    
    // Generate elements only once when the component mounts
    useEffect(() => {
        // Generate crosses
        const crosses = [...Array(15)].map((_, i) => ({
            id: i,
            position: {
                x: Math.random() * 100,
                y: Math.random() * 100
            },
            delay: Math.random() * 5,
            duration: Math.random() * 3 + 4,
            size: Math.random() * 30 + 25,
            color: [
                'text-red-500',
                'text-green-500',
                'text-yellow-500',
                'text-purple-500'
            ][Math.floor(Math.random() * 4)]
        }));
        
        // Generate horizontal lines
        const horizontalLines = [...Array(8)].map((_, i) => ({
            id: i,
            delay: i * 2,
            position: Math.random() * 100
        }));
        
        // Generate vertical lines
        const verticalLines = [...Array(8)].map((_, i) => ({
            id: i,
            delay: i * 2,
            position: Math.random() * 100
        }));
        
        // Generate grid points
        const gridPoints = [...Array(144)].map((_, i) => ({
            id: i,
            animationDuration: Math.random() * 2 + 2
        }));
        
        // Set all generated elements to state
        setElements({
            crosses,
            horizontalLines,
            verticalLines,
            gridPoints
        });
    }, []); // Empty dependency array means this runs once on mount

    return (
        <>
            <style jsx="true">{`
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
                {/* Sliding Lines - Horizontal */}
                {elements.horizontalLines.map(line => (
                    <SlidingLine 
                        key={`h-${line.id}`} 
                        delay={line.delay} 
                        position={line.position} 
                    />
                ))}
                
                {/* Sliding Lines - Vertical */}
                {elements.verticalLines.map(line => (
                    <SlidingLine 
                        key={`v-${line.id}`} 
                        vertical 
                        delay={line.delay} 
                        position={line.position}
                    />
                ))}
                
                {/* Medical Crosses */}
                {elements.crosses.map(cross => (
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
                    {elements.gridPoints.map(point => (
                        <GridPoint
                            key={point.id}
                            animationDuration={point.animationDuration}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

// Export a memoized version of the component to prevent unnecessary re-renders
export default React.memo(AnimatedBackground);