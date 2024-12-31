import React, { useRef, useState, useEffect } from 'react';

interface InputTime2NumberProps {
    hours: string;
    minutes: string;
    onHourChange: (value: string) => void;
    onMinuteChange: (value: string) => void;
    onEnter: () => void;
    isFullScreen?: boolean;
    disabled?: boolean;
}

const InputTime2Number: React.FC<InputTime2NumberProps> = ({
    hours = "",
    minutes = "",
    onHourChange,
    onMinuteChange,
    onEnter,
    isFullScreen = false,
    disabled = false,
}) => {
    const hour1Ref = useRef<HTMLInputElement>(null);
    const hour2Ref = useRef<HTMLInputElement>(null);
    const minute1Ref = useRef<HTMLInputElement>(null);
    const minute2Ref = useRef<HTMLInputElement>(null);

    // Local state để giữ giá trị khi đang nhập
    const [localValue, setLocalValue] = useState({
        h1: hours ? hours.toString().charAt(0) || "" : "",
        h2: hours ? hours.toString().charAt(1) || "" : "",
        m1: minutes ? minutes.toString().charAt(0) || "" : "",
        m2: minutes ? minutes.toString().charAt(1) || "" : ""
    });

    // Cập nhật local state khi prop value thay đổi từ bên ngoài
    useEffect(() => {
        setLocalValue({
            h1: hours ? hours.toString().charAt(0) || "" : "",
            h2: hours ? hours.toString().charAt(1) || "" : "",
            m1: minutes ? minutes.toString().charAt(0) || "" : "",
            m2: minutes ? minutes.toString().charAt(1) || "" : ""
        });
    }, [hours, minutes]);

    const commonInputProps = {
        type: "text",
        maxLength: 1,
        disabled,
        className: `w-6 h-full text-text-light text-2xl ${isFullScreen ? "py-3" : "py-1"} border-b-2 border-gray-600 text-center focus:outline-none focus:ring-2 focus:ring-accent bg-transparent mx-0.5`
    };

    const handleHourChange = (
        inputValue: string,
        position: 'h1' | 'h2'
    ) => {
        let newValue = { ...localValue };

        if (position === 'h1') {
            if (/^[0-2]$/.test(inputValue)) {
                newValue.h1 = inputValue;
                hour2Ref.current?.focus();
                onHourChange(inputValue + (localValue.h2 || "0"));
            }
        } else {
            if (/^[0-9]$/.test(inputValue)) {
                const firstDigit = localValue.h1;
                if ((firstDigit === "2" && parseInt(inputValue) <= 3) || firstDigit !== "2") {
                    newValue.h2 = inputValue;
                    minute1Ref.current?.focus();
                    onHourChange((localValue.h1 || "0") + inputValue);
                }
            }
        }

        setLocalValue(newValue);
    };

    const handleMinuteChange = (
        inputValue: string,
        position: 'm1' | 'm2'
    ) => {
        let newValue = { ...localValue };

        if (position === 'm1') {
            if (/^[0-5]$/.test(inputValue)) {
                newValue.m1 = inputValue;
                minute2Ref.current?.focus();
                onMinuteChange(inputValue + (localValue.m2 || "0"));
            }
        } else {
            if (/^[0-9]$/.test(inputValue)) {
                newValue.m2 = inputValue;
                onMinuteChange((localValue.m1 || "0") + inputValue);
            }
        }

        setLocalValue(newValue);
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        position: 'h1' | 'h2' | 'm1' | 'm2'
    ) => {
        if (e.key === "Enter") {
            onEnter();
        } else {
            const validRegex = position === 'h1' ? /^[0-2]$/ :
                position === 'm1' ? /^[0-5]$/ :
                    /^[0-9]$/;

            if (validRegex.test(e.key)) {
                e.currentTarget.select();
            }
        }
    };

    return (
        <div className="flex items-end h-full">
            <div className="flex items-center gap-1">
                <input
                    {...commonInputProps}
                    ref={hour1Ref}
                    value={localValue.h1}
                    onChange={(e) => handleHourChange(e.target.value, 'h1')}
                    onKeyDown={(e) => handleKeyDown(e, 'h1')}
                />
                <input
                    {...commonInputProps}
                    ref={hour2Ref}
                    value={localValue.h2}
                    onChange={(e) => handleHourChange(e.target.value, 'h2')}
                    onKeyDown={(e) => handleKeyDown(e, 'h2')}
                />
            </div>
            <span className="text-2xl font-bold mx-1 text-black">:</span>
            <div className="flex items-center gap-1">
                <input
                    {...commonInputProps}
                    ref={minute1Ref}
                    value={localValue.m1}
                    onChange={(e) => handleMinuteChange(e.target.value, 'm1')}
                    onKeyDown={(e) => handleKeyDown(e, 'm1')}
                />
                <input
                    {...commonInputProps}
                    ref={minute2Ref}
                    value={localValue.m2}
                    onChange={(e) => handleMinuteChange(e.target.value, 'm2')}
                    onKeyDown={(e) => handleKeyDown(e, 'm2')}
                />
            </div>
        </div>
    );
};

export default InputTime2Number;
