import React, { useState, useEffect } from "react";
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createTodo, updateTodo } from "../services/api";
import InputField from './common/InputField';

const priorityOptions = [
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' }
];

const TodoForm = ({ isOpen, onRequestClose, todo, onSave }) => {
    const [text, setText] = useState('');
    const [priority, setPriority] = useState('LOW');
    const [dueDate, setDueDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (todo) {
            setText(todo.text);
            setPriority(todo.priority);
            setDueDate(todo.dueDate ? todo.dueDate : '');
        } else {
            setText('');
            setPriority('LOW');
            setDueDate('');
        }
    }, [todo]);

    const validateForm = () => {
        const newErrors = {};
        if (!text.trim()) {
            newErrors.text = 'Text field cannot be blank.';
        } else if (text.length > 120) {
            newErrors.text = 'Text must be 120 characters or less.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        const todoData = { text, priority, dueDate: dueDate || null };

        try {
            if (todo) {
                await updateTodo(todo.id, todoData);
            } else {
                await createTodo(todoData);
            }
            onSave();
            onRequestClose();
        } catch (error) {
            console.error("Error saving todo:", error);
            alert("An error occurred while saving the todo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDateChange = (date) => {
        setDueDate(date ? date.toISOString().split('T')[0] : '');
    };

    return (
        isOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                    <h2 className="text-xl font-semibold mb-4">{todo ? 'Edit Todo' : 'New Todo'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <InputField
                            label="Text"
                            id="text-input"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            error={errors.text}
                            required
                            maxLength={120}
                            data-testid="text-input"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Priority</label>
                            <Select
                                options={priorityOptions}
                                value={priorityOptions.find(option => option.value === priority)}
                                onChange={(selectedOption) => setPriority(selectedOption.value)}
                                className="mb-4"
                                classNamePrefix="select"
                                data-testid="priority-select"
                                aria-label="Select priority"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Due Date</label>
                            <DatePicker
                                selected={dueDate ? new Date(dueDate) : null}
                                onChange={handleDateChange}
                                aria-label="Due date"
                                aria-describedby="due-date-error"
                                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring focus:border-blue-500"
                                dateFormat="yyyy-MM-dd"
                                placeholderText="Select a date"
                                data-testid="due-date-input"
                            />
                            <button
                                type="button"
                                onClick={() => setDueDate('')}
                                aria-label="Clear due date"
                                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 ml-2"
                            >
                                Clear Date
                            </button>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={onRequestClose}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                                data-testid="cancel-button"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`bg-blue-500 text-white px-4 py-2 rounded ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                                disabled={isSubmitting}
                                data-testid="save-button"
                            >
                                {isSubmitting ? 'Saving...' : (todo ? 'Update' : 'Add') + ' Todo'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    );
};

export default TodoForm;
