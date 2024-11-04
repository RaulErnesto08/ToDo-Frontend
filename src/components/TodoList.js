import React, { useEffect, useState, useCallback, useMemo } from "react";
import Select from 'react-select';
import { FaClock, FaFlag } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import { deleteTodo, getTodos, markAsDone, markAsUndone, getMetrics } from "../services/api";
import TodoForm from "./TodoForm";
import MetricCard from "./common/MetricCard";
import 'react-toastify/dist/ReactToastify.css';

const TodoList = () => {
    const priorityOptions = useMemo(() => [
        { value: '', label: 'All Priorities' },
        { value: 'HIGH', label: 'High' },
        { value: 'MEDIUM', label: 'Medium' },
        { value: 'LOW', label: 'Low' }
    ], []);

    const statusOptions = useMemo(() => [
        { value: '', label: 'All Statuses' },
        { value: 'true', label: 'Done' },
        { value: 'false', label: 'Undone' }
    ], []);

    const [todos, setTodos] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState(null);
    const [sorting, setSorting] = useState({ key: 'creationDate', direction: 'asc' });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({ textFilter: '', priorityFilter: '', doneFilter: '' });
    const [metrics, setMetrics] = useState({ averageTimeForAllTasks: 0, averageTimeByPriority: {} });
    const [loading, setLoading] = useState(false);

    const showToast = (type, message) => {
        type === 'success' ? toast.success(message) : toast.error(message);
    };

    const fetchTodos = useCallback(async (page = 1, filters = {}) => {
        setLoading(true);
        try {
            const response = await getTodos({ page: page - 1, size: 10, sortBy: sorting.key, sortOrder: sorting.direction, ...filters });
            setTodos(response.data);
            setTotalPages(Math.ceil(response.headers['x-total-count'] / 10));
        } catch (error) {
            console.error(error);
            showToast('error', "Failed to fetch todos.");
        } finally {
            setLoading(false);
        }
    }, [sorting]);

    const fetchMetrics = useCallback(async () => {
        try {
            const response = await getMetrics();
            setMetrics(response.data);
        } catch (error) {
            console.error(error);
            showToast('error', "Failed to fetch metrics.");
        }
    }, []);

    useEffect(() => {
        fetchTodos(page, filters);
        fetchMetrics();
    }, [page, filters, fetchTodos, fetchMetrics]);

    const handleSave = () => {
        fetchTodos(page, filters);
        fetchMetrics();
        setEditingTodo(null);
        showToast('success', "Todo saved successfully!");
    };

    const handleDelete = async (id) => {
        try {
            await deleteTodo(id);
            fetchTodos(page, filters);
            fetchMetrics();
            showToast('success', "Todo deleted successfully!");
        } catch (error) {
            console.error(error);
            showToast('error', "Failed to delete the todo.");
        }
    };

    const handleDone = async (todo) => {
        try {
            if (!todo.done) {
                await markAsDone(todo.id);
                showToast('success', "Todo marked as done.");
            } else {
                await markAsUndone(todo.id);
                showToast('success', "Todo marked as undone.");
            }
            fetchTodos(page, filters);
            fetchMetrics();
        } catch (error) {
            console.error(error);
            showToast('error', "Failed to update the todo status.");
        }
    };

    const handleAllDone = async (event) => {
        const { checked } = event.target;
        try {
            const changeAllTodos = todos.map(todo => checked ? markAsDone(todo.id) : markAsUndone(todo.id));
            await Promise.all(changeAllTodos);
            fetchTodos(page, filters);
            fetchMetrics();
            showToast('success', checked ? "All todos marked as done." : "All todos marked as undone.");
        } catch (error) {
            console.error(error);
            showToast('error', "Failed to update all todos.");
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sorting.key === key && sorting.direction === 'asc') {
            direction = 'desc';
        }

        setSorting({ key, direction });
        setPage(1);
        fetchTodos(1, { sortBy: key, sortOrder: direction, ...filters });
    };

    const handleFilterChange = (name, selectedOption) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: selectedOption ? selectedOption.value : ''
        }));
        setPage(1);
    };

    const todoBackgroundColor = (dueDate) => {
        if (!dueDate) { return ''; }

        const today = new Date();
        const todoDate = new Date(dueDate);
        const diff = todoDate - today;

        const days = Math.ceil(diff / (1000 * 3600 * 24));

        if (days <= 7) { return "bg-red-100"; }
        if (days <= 14) { return "bg-yellow-100"; }

        return "bg-green-100";
    };

    const formatAverageTime = (seconds) => {
        seconds = Math.floor(seconds);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secondsLeft = seconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;
    };

    return (
        <div className="p-4">
            <ToastContainer />
            <h1 className="text-2xl font-bold mb-4" data-testid="todo-list-title">Todo List</h1>
            <button 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
                onClick={() => setIsModalOpen(true)}
                data-testid="new-todo-button"
            >
                + New To Do
            </button>
            <div className="flex gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by text"
                    name="textFilter"
                    value={filters.textFilter}
                    onChange={(e) => handleFilterChange('textFilter', { value: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring"
                    data-testid="text-filter"
                    aria-label="Search todos by text"
                />
                <Select
                    options={priorityOptions}
                    value={priorityOptions.find(option => option.value === filters.priorityFilter)}
                    onChange={(option) => handleFilterChange('priorityFilter', option)}
                    className="w-full"
                    classNamePrefix="select"
                    data-testid="priority-filter"
                    placeholder="Select priority"
                    aria-label="Filter by priority"
                />
                <Select
                    options={statusOptions}
                    value={statusOptions.find(option => option.value === filters.doneFilter)}
                    onChange={(option) => handleFilterChange('doneFilter', option)}
                    className="w-full"
                    classNamePrefix="select"
                    data-testid="done-filter"
                    placeholder="Select status"
                    aria-label="Filter by status"
                />
            </div>
            {loading ? (
                <div className="text-center py-4">Loading...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">
                                    <input 
                                        type="checkbox"
                                        onChange={handleAllDone}
                                        className="form-checkbox"
                                        data-testid="select-all-checkbox"
                                        aria-label="Select all todos"
                                    />
                                </th>
                                <th className="py-2 px-4 border-b">Text</th>
                                <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('priority')} data-testid="priority-sort">
                                    Priority {sorting.key === 'priority' && (sorting.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort('dueDate')} data-testid="duedate-sort">
                                    Due Date {sorting.key === 'dueDate' && (sorting.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="py-2 px-4 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {todos.length > 0 ? (
                                todos.map((todo) => (
                                    <tr key={todo.id} className={`${todoBackgroundColor(todo.dueDate)}`} data-testid={`todo-${todo.id}`}>
                                        <td className="py-2 px-4 border-b text-center">
                                            <input
                                                type="checkbox"
                                                checked={todo.done}
                                                onChange={() => handleDone(todo)}
                                                className="form-checkbox"
                                                data-testid={`checkbox-${todo.id}`}
                                                aria-label={`Mark todo ${todo.text} as done/undone`}
                                            />
                                        </td>
                                        <td 
                                            className={`py-2 px-4 border-b ${todo.done ? 'line-through' : ''}`} 
                                            data-testid={`text-${todo.id}`}
                                        >
                                            {todo.text}
                                        </td>
                                        <td className="py-2 px-4 border-b" data-testid={`priority-${todo.id}`}>
                                            {todo.priority}
                                        </td>
                                        <td className="py-2 px-4 border-b" data-testid={`duedate-${todo.id}`}>
                                            {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString('es-MX', { timeZone: 'UTC' }) : 'No date'}
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            <button
                                                className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2"
                                                onClick={() => setEditingTodo(todo)}
                                                data-testid={`edit-button-${todo.id}`}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                                onClick={() => handleDelete(todo.id)}
                                                data-testid={`delete-button-${todo.id}`}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-4">No todos available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="flex justify-center mt-4">
                <div className="flex space-x-2">
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index}
                            className={`px-4 py-2 rounded ${page === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                            onClick={() => setPage(index + 1)}
                            aria-label={`Go to page ${index + 1}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
            <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MetricCard
                        title="Average Time to Finish Tasks"
                        icon={FaClock}
                        value={formatAverageTime(metrics.averageTimeForAllTasks)}
                        bgColor="bg-blue-100"
                        textColor="text-blue-600"
                    />
                    {Object.entries(metrics.averageTimeByPriority).map(([priority, averageTime]) => (
                        <MetricCard
                            key={priority}
                            title={`${priority} Priority Average Time`}
                            icon={FaFlag}
                            value={formatAverageTime(averageTime)}
                            bgColor={
                                priority === 'HIGH' ? 'bg-red-100' : priority === 'MEDIUM' ? 'bg-yellow-100' : 'bg-green-100'
                            }
                            textColor={
                                priority === 'HIGH' ? 'text-red-600' : priority === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'
                            }
                        />
                    ))}
                </div>
            </div>
            <TodoForm
                isOpen={isModalOpen || !!editingTodo}
                onRequestClose={() => {
                    setIsModalOpen(false);
                    setEditingTodo(null);
                }}
                todo={editingTodo}
                onSave={handleSave}
            />
        </div>
    );
};

export default TodoList;
