import React from 'react';

const InputField = ({ label, value, onChange, error, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            id={id}
            value={value}
            onChange={onChange}
            aria-invalid={!!error}
            aria-describedby={`${id}-error`}
            className={`w-full border p-2 rounded ${error ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring focus:border-blue-500`}
            {...props}
        />
        {error && <p id={`${id}-error`} className="text-red-500 text-sm">{error}</p>}
    </div>
);

export default InputField;
