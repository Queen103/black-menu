import React, { useRef, useState, useEffect } from 'react';

interface InputTime4NumberProps {
    value: string;
    onChange: (value: string) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    isFullScreen?: boolean;
    isDark?: boolean;
    disabled?: boolean;
}

const InputTime4Number: React.FC<InputTime4NumberProps> = ({
    value = "",
    onChange,
    onKeyDown,
    isFullScreen = false,
    isDark = false,
    disabled = false,
}) => {
    const hour1Ref = useRef<HTMLInputElement>(null);
    const hour2Ref = useRef<HTMLInputElement>(null);
    const minute1Ref = useRef<HTMLInputElement>(null);
    const minute2Ref = useRef<HTMLInputElement>(null);

    // Local state để giữ giá trị khi đang nhập
    const [localValue, setLocalValue] = useState({
        h1: value ? value.split(":")[0]?.charAt(0) || "" : "",
        h2: value ? value.split(":")[0]?.charAt(1) || "" : "",
        m1: value ? value.split(":")[1]?.charAt(0) || "" : "",
        m2: value ? value.split(":")[1]?.charAt(1) || "" : ""
    });

    // Cập nhật local state khi prop value thay đổi từ bên ngoài
    useEffect(() => {
        if (value) {
            setLocalValue({
                h1: value.split(":")[0]?.charAt(0) || "",
                h2: value.split(":")[0]?.charAt(1) || "",
                m1: value.split(":")[1]?.charAt(0) || "",
                m2: value.split(":")[1]?.charAt(1) || ""
            });
        } else {
            setLocalValue({ h1: "", h2: "", m1: "", m2: "" });
        }
    }, [value]);

    const commonInputProps = {
        type: "text",
        maxLength: 1,
        disabled,
        className: `w-4 ${isFullScreen ? "text-md py-0.5" : "text-sm"} ${isDark ? 'text-text-dark border-border-dark' : 'text-text-light border-border-light'
            } bg-transparent border-b-2 text-center focus:outline-none focus:border-b-2 focus:border-accent mx-0.5`
    };

    const handleChange = (
        inputValue: string,
        position: 'h1' | 'h2' | 'm1' | 'm2'
    ) => {
        let newValue = { ...localValue };

        switch (position) {
            case 'h1':
                if (/^[0-2]$/.test(inputValue)) {
                    newValue.h1 = inputValue;
                    hour2Ref.current?.focus();
                }
                break;
            case 'h2':
                if (/^[0-9]$/.test(inputValue)) {
                    const firstDigit = newValue.h1 || "0";
                    if ((firstDigit === "2" && parseInt(inputValue) <= 4) || firstDigit !== "2") {
                        newValue.h2 = inputValue;
                        minute1Ref.current?.focus();
                    }
                }
                break;
            case 'm1':
                if (/^[0-5]$/.test(inputValue)) {
                    newValue.m1 = inputValue;
                    minute2Ref.current?.focus();
                }
                break;
            case 'm2':
                if (/^[0-9]$/.test(inputValue)) {
                    newValue.m2 = inputValue;
                }
                break;
        }

        setLocalValue(newValue);

        // Nếu có ít nhất một giá trị được nhập, điền 0 cho các ô còn lại
        if (newValue.h1 || newValue.h2 || newValue.m1 || newValue.m2) {
            const timeString = `${newValue.h1 || "0"}${newValue.h2 || "0"}:${newValue.m1 || "0"}${newValue.m2 || "0"}`;
            onChange(timeString);
        } else {
            onChange("");
        }
    };

    const handleLocalKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        position: 'h1' | 'h2' | 'm1' | 'm2'
    ) => {
        const validRegex = position === 'h1' ? /^[0-2]$/ :
            position === 'm1' ? /^[0-5]$/ :
                /^[0-9]$/;

        if (validRegex.test(e.key)) {
            e.currentTarget.select();
        }

        if (e.key === "Enter") {
            // Tự động điền 0 cho các giá trị rỗng
            const newValue = {
                h1: localValue.h1 || "0",
                h2: localValue.h2 || "0",
                m1: localValue.m1 || "0",
                m2: localValue.m2 || "0"
            };
            setLocalValue(newValue);
            const timeString = `${newValue.h1}${newValue.h2}:${newValue.m1}${newValue.m2}`;
            onChange(timeString);

            // Gọi onKeyDown sau khi đã cập nhật giá trị
            if (onKeyDown) {
                onKeyDown(e);
            }
            return;
        }

        if (onKeyDown) {
            onKeyDown(e);
        }
    };

    return (
        <div className="flex items-center">
            <div className="flex items-center gap-1">
                <input
                    {...commonInputProps}
                    ref={hour1Ref}
                    value={localValue.h1}
                    onChange={(e) => handleChange(e.target.value, 'h1')}
                    onKeyDown={(e) => handleLocalKeyDown(e, 'h1')}
                />
                <input
                    {...commonInputProps}
                    ref={hour2Ref}
                    value={localValue.h2}
                    onChange={(e) => handleChange(e.target.value, 'h2')}
                    onKeyDown={(e) => handleLocalKeyDown(e, 'h2')}
                />
            </div>
            <span className="mx-1 font-bold">:</span>
            <div className="flex items-center gap-1">
                <input
                    {...commonInputProps}
                    ref={minute1Ref}
                    value={localValue.m1}
                    onChange={(e) => handleChange(e.target.value, 'm1')}
                    onKeyDown={(e) => handleLocalKeyDown(e, 'm1')}
                />
                <input
                    {...commonInputProps}
                    ref={minute2Ref}
                    value={localValue.m2}
                    onChange={(e) => handleChange(e.target.value, 'm2')}
                    onKeyDown={(e) => handleLocalKeyDown(e, 'm2')}
                />
            </div>
        </div>
    );
};

export default InputTime4Number;
