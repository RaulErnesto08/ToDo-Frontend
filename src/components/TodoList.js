import React, { useEffect, useState } from "react";
import { deleteTodo, getTodos, markAsDone, markAsUndone, getMetrics } from "../services/api";
import { Box, Button, Checkbox, FormControl, InputLabel, MenuItem, Pagination, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TextField } from "@mui/material";
import TodoForm from "./TodoForm";

const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState(null);
    const [sorting, setSorting] = useState({ key: 'creationDate', direction: 'asc' });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({ textFilter: '', priorityFilter: '', doneFilter: '' });
    const [metrics, setMetrics] = useState({ averageTimeForAllTasks: 0, averageTimeByPriority: {} });

    const fetchTodos = async (page = 1, filters = {}) => {
        try {
            const response = await getTodos({ page: page - 1, size: 10, sortBy: sorting.key, sortOrder: sorting.direction, ...filters });
            setTodos(response.data);
            setTotalPages(Math.ceil(response.headers['x-total-count'] / 10));
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMetrics = async () => {
        try {
            const response = await getMetrics();
            setMetrics(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchTodos(page, filters);
        fetchMetrics();
    }, [page, filters]);


    const handleSave = () => {
        fetchTodos(page, filters);
        fetchMetrics();
        setEditingTodo(null);
    };

    const handleDelete = async (id) => {
        try {
            await deleteTodo(id);
            fetchTodos(page, filters);
            fetchMetrics();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDone = async (todo) => {
        try {
            if (!todo.done) {
                await markAsDone(todo.id);
            } else {
                await markAsUndone(todo.id);
            }
            fetchTodos(page, filters);
            fetchMetrics();
        } catch (error) {
            console.error(error);
        }
    };

    const handleAllDone = async (event) => {
        const { checked } = event.target;
        try {
            const changeAllTodos = todos.map(todo => checked ? markAsDone(todo.id) : markAsUndone(todo.id));
            await Promise.all(changeAllTodos);
            fetchTodos(page, filters);
            fetchMetrics();
        } catch (error) {
            console.error(error);
        }
    }

    const handleSort = (key) => {
        let direction = 'asc';
        if(sorting.key === key && sorting.direction === 'asc') {
            direction = 'desc';
        }

        setSorting({ key, direction });
        setPage(1);
        fetchTodos(1, { sortBy: key, sortOrder: direction, ...filters });
    };

    const handleFilter = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
        setPage(1);
    };

    const todoBackgroundColor = (dueDate) => {
        if (!dueDate) { return '';   }

        const today = new Date();
        const todoDate = new Date(dueDate);
        const diff = todoDate - today;

        const days = Math.ceil(diff / (1000 * 3600 * 24));

        if (days <= 7) { return "red"; }
        if (days <= 14) { return "yellow"; }

        return "green";
    }

    const formatAverageTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secondsLeft = seconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;
    }

    return (
        <Box sx={{ padding: 2 }}>
            <h1 data-testid="todo-list-title">Todo List</h1>
            <Button variant="contained" color="primary" onClick={() => setIsModalOpen(true)} data-testid="new-todo-button">
                +New To Do
            </Button>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                    label="Search by text"
                    name="textFilter"
                    value={filters.textFilter}
                    onChange={handleFilter} fullWidth
                    data-testid="text-filter"
                />
                <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select name="priorityFilter" value={filters.priorityFilter} onChange={handleFilter} fullWidth data-testid="priority-filter">
                        <MenuItem value=""><em>All</em></MenuItem>
                        <MenuItem value="HIGH">High</MenuItem>
                        <MenuItem value="MEDIUM">Medium</MenuItem>
                        <MenuItem value="LOW">Low</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel>Done Status</InputLabel>
                    <Select name="doneFilter" value={filters.doneFilter} onChange={handleFilter} fullWidth data-testid="done-filter">
                        <MenuItem value=""><em>All</em></MenuItem>
                        <MenuItem value="true">Done</MenuItem>
                        <MenuItem value="false">Undone</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <TableContainer sx={{ marginTop: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Checkbox onChange={handleAllDone} data-testid="select-all-checkbox"/>
                            </TableCell>
                            <TableCell>Text</TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sorting.key === 'priority'}
                                    direction={sorting.direction}
                                    onClick={() => handleSort('priority')}
                                    data-testid="priority-sort"
                                >
                                    Priority
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sorting.key === 'dueDate'}
                                    direction={sorting.direction}
                                    onClick={() => handleSort('dueDate')}
                                    data-testid="duedate-sort"
                                >
                                    Due Date
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { todos.length > 0 ? (
                            todos.map((todo) => (
                                <TableRow key={todo.id} style={{ backgroundColor: todoBackgroundColor(todo.dueDate) }} data-testid={`todo-${todo.id}`}>
                                    <TableCell>
                                        <Checkbox 
                                            checked={todo.done}
                                            onChange={() => { handleDone(todo) }}
                                            data-testid={`checkbox-${todo.id}`}
                                        ></Checkbox>
                                    </TableCell>
                                    <TableCell style={{ textDecoration: todo.done ? 'line-through' : 'none' }} data-testid={`text-${todo.id}`}>{ todo.text }</TableCell>
                                    <TableCell data-testid={`priority-${todo.id}`}>{ todo.priority }</TableCell>
                                    <TableCell data-testid={`duedate-${todo.id}`}>{ todo.dueDate ? new Date(todo.dueDate).toLocaleDateString('es-MX', {timeZone: 'UTC'}) :'No date' }</TableCell>
                                    <TableCell>
                                        <Button variant="contained" color="secondary" onClick={() => setEditingTodo(todo)} data-testid={`edit-button-${todo.id}`}>
                                            Edit
                                        </Button>
                                        <Button variant="contained" color="error" onClick={() => handleDelete(todo.id)} sx={{ ml: 1 }} data-testid={`delete-button-${todo.id}`}>
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No todos available
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination 
                    count={totalPages}
                    page={page}
                    onChange={(event, value) => setPage(value)}
                />
            </Box>
            <Box sx={{ marginTop: 4 }}>
                <h2>Metrics</h2>
                <h3>Average time to finish tasks:</h3>
                <p>{ formatAverageTime(metrics.averageTimeForAllTasks) }</p>
                <h3>Average time to finish tasks by priority:</h3>
                {Object.entries(metrics.averageTimeByPriority).map(([priority, averageTime]) => (
                    <p key={priority}>
                        {priority}: {formatAverageTime(averageTime)}
                    </p>
                ))}
            </Box>
            <TodoForm
                isOpen={isModalOpen || !!editingTodo}
                onRequestClose={() => {
                    setIsModalOpen(false);
                    setEditingTodo(null);
                }}
                todo={editingTodo}
                onSave={handleSave}
            />
        </Box>
    );
};

export default TodoList;