import React from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, id, ...props }) => {
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-gray-300 ml-1">
                    {label}
                </label>
            )}
            <input
                id={id}
                className={twMerge(
                    "px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all bg-white text-gray-900 placeholder-gray-400",
                    error ? "border-red-500 focus:ring-red-500" : "",
                    className
                )}
                {...props}
            />
            {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
        </div>
    );
};
