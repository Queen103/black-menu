'use client';

import React, { useState, useEffect } from 'react';

interface InputDateTimeProps {
    value: string;
    onChange: (value: string) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    isFullScreen?: boolean;
    isDark?: boolean;
    disabled?: boolean;
}

export const InputDateTime = ({
    value,
    onChange,
    onKeyDown,
    isFullScreen,
    isDark,
    disabled
}: InputDateTimeProps) => {
    const [dateTime, setDateTime] = useState<string>(value || '');

    useEffect(() => {
        if (value !== dateTime) {
            setDateTime(value);
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setDateTime(newValue);
        onChange(newValue);
    };

    return (
        <input
            type="datetime-local"
            value={dateTime}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            disabled={disabled}
            className={`
                ${isFullScreen ? "text-md py-0.5" : "text-sm"} 
                ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'} 
                bg-transparent border-b text-center focus:outline-none focus:border-b focus:border-accent
                w-full px-1
            `}
            style={{
                colorScheme: isDark ? 'dark' : 'light'
            }}
        />
    );
};

export default InputDateTime;
