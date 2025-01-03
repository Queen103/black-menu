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
    const [inputValues, setInputValues] = useState({
        day: dateTime.split('-')[2] || '',
        month: dateTime.split('-')[1] || '',
        year: dateTime.split('-')[0] || '',
    });

    useEffect(() => {
        if (value !== dateTime) {
            setDateTime(value);
        }
    }, [value]);

    // Hàm xử lý sự kiện nhấn phím Enter
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: string) => {
        if (e.key === 'Enter') {
            let newDate = '';
            let day = inputValues.day;
            let month = inputValues.month;
            let year = inputValues.year;

            // Kiểm tra giá trị nhập vào khi nhấn Enter
            if (field === 'day') {
                day = validateDay(day);
            } else if (field === 'month') {
                month = validateMonth(month);
            } else if (field === 'year') {
                year = validateYear(year);
            }

            // Cập nhật giá trị mới
            newDate = `${year}-${month}-${day}`;
            setDateTime(newDate);
            onChange(newDate);
        }
    };

    // Hàm kiểm tra và giới hạn giá trị cho ngày
    const validateDay = (day: string) => {
        if (+day < 1) return '01';
        if (+day > 31) return '31';
        return day.padStart(2, '0');
    };

    // Hàm kiểm tra và giới hạn giá trị cho tháng
    const validateMonth = (month: string) => {
        if (+month < 1) return '01';
        if (+month > 12) return '12';
        return month.padStart(2, '0');
    };

    // Hàm kiểm tra và giới hạn giá trị cho năm
    const validateYear = (year: string) => {
        const currentYear = new Date().getFullYear();
        if (+year < 1900) return '1900';
        if (+year > currentYear) return `${currentYear}`;
        return year.padStart(4, '0');
    };

    // Hàm thay đổi giá trị khi nhập vào
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const newValue = e.target.value;

        setInputValues((prev) => ({
            ...prev,
            [field]: newValue,
        }));
    };

    return (
        <div className="flex items-center space-x-1">
            {[
                { value: inputValues.day, placeholder: 'DD', maxLength: 2, onChange: (e) => handleChange(e, 'day'), width: 'w-10' },
                { value: inputValues.month, placeholder: 'MM', maxLength: 2, onChange: (e) => handleChange(e, 'month'), width: 'w-10' },
                { value: inputValues.year, placeholder: 'YYYY', maxLength: 4, onChange: (e) => handleChange(e, 'year'), width: 'w-16' },
            ].map((field, index) => (
                <React.Fragment key={index}>
                    {index > 0 && <span>/</span>}
                    <input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                        onKeyDown={(e) => handleKeyDown(e as React.KeyboardEvent<HTMLInputElement>, field.placeholder.toLowerCase())}
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                        className={`${field.width} text-center border-b-2 focus:border-accent ${isDark ? 'text-white' : 'text-black'} ${disabled ? 'opacity-50' : ''
                            } bg-transparent outline-none`}
                        disabled={disabled}
                    />
                </React.Fragment>
            ))}
        </div>
    );
};

export default InputDateTime;
