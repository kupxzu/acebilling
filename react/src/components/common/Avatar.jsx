import React from 'react';

const getRandomColor = (name) => {
    if (!name) return '#6B7280'; // Default gray color if no name provided
    
    const colors = [
        '#F87171', // red
        '#FB923C', // orange
        '#FBBF24', // amber
        '#34D399', // emerald
        '#60A5FA', // blue
        '#A78BFA', // purple
        '#F472B6', // pink
    ];
    
    const charCode = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[charCode % colors.length];
};

const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return '?';
    
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    
    return `${firstInitial}${lastInitial}`;
};

const Avatar = ({ firstName = '', lastName = '', size = 40, className = '' }) => {
    const bgColor = getRandomColor(`${firstName}${lastName}`);
    const initials = getInitials(firstName, lastName);
    
    return (
        <div
            className={`flex items-center justify-center rounded-full ${className}`}
            style={{
                backgroundColor: bgColor,
                width: size,
                height: size,
                fontSize: `${size * 0.4}px`
            }}
        >
            <span className="font-medium text-white">
                {initials}
            </span>
        </div>
    );
};

export default Avatar;