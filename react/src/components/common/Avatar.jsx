const Avatar = ({ name, size = 40, className = '' }) => {
    const getInitials = (name) => {
        if (!name) return '';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRandomColor = (name) => {
        const colors = [
            '#4F46E5', // indigo-600
            '#7C3AED', // violet-600
            '#2563EB', // blue-600
            '#059669', // emerald-600
            '#DC2626', // red-600
            '#D97706', // amber-600
            '#4338CA', // indigo-700
        
            // additional vibrant colors
            '#10B981', // green-500
            '#3B82F6', // blue-500
            '#EC4899', // pink-500
            '#8B5CF6', // purple-500
            '#F59E0B', // yellow-500
            '#EF4444', // rose-500
            '#14B8A6', // teal-500
            '#6366F1', // indigo-500
            '#0EA5E9', // sky-500
            '#F43F5E', // rose-600
        ];
        
        
        const index = name
            .split('')
            .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        
        return colors[index % colors.length];
    };

    const backgroundColor = getRandomColor(name);
    const initials = getInitials(name);

    return (
        <div
            className={`flex items-center justify-center rounded-full text-white font-medium ${className}`}
            style={{
                backgroundColor,
                width: size,
                height: size,
                fontSize: `${size * 0.4}px`,
            }}
        >
            {initials}
        </div>
    );
};

export default Avatar;