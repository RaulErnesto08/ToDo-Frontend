import React, { useEffect, useState } from "react";
import { deleteTodo, getTodos, markAsDone, markAsUndone, getMetrics } from "../services/api";
import { Box, Button, Checkbox, FormControl, Input, InputLabel, Menu, MenuItem, Pagination, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TextField } from "@mui/material";
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
        fetchTodos(page, filters);
    };

    const handleFilter = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
        setPage(1);
    };

    const sortedTodos = [...todos].sort((a, b) => {
        if(a[sorting.key] < b[sorting.key]) {
            return sorting.direction === 'asc' ? -1 : 1;
        } else {
            return sorting.direction === 'desc' ? -1 : 1;
        }
    });

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
            <h1>Todo List</h1>
            <Button variant="contained" color="primary" onClick={() => setIsModalOpen(true)}>
                +New To Do
            </Button>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                    label="Search by text"
                    name="textFilter"
                    value={filters.textFilter}
                    onChange={handleFilter} fullWidth
                />
                <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select name="priorityFilter" value={filters.priorityFilter} onChange={handleFilter} fullWidth >
                        <MenuItem value=""><em>All</em></MenuItem>
                        <MenuItem value="HIGH">High</MenuItem>
                        <MenuItem value="MEDIUM">Medium</MenuItem>
                        <MenuItem value="LOW">Low</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel>Done Status</InputLabel>
                    <Select name="doneFilter" value={filters.doneFilter} onChange={handleFilter} fullWidth >
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
                                <Checkbox onChange={handleAllDone}/>
                            </TableCell>
                            <TableCell>Text</TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sorting.key === 'priority'}
                                    direction={sorting.direction}
                                    onClick={() => handleSort('priority')}
                                >
                                    Priority
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sorting.key === 'dueDate'}
                                    direction={sorting.direction}
                                    onClick={() => handleSort('dueDate')}
                                >
                                    Due Date
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        { sortedTodos.length > 0 ? (
                            sortedTodos.map((todo) => (
                                <TableRow key={todo.id} style={{ backgroundColor: todoBackgroundColor(todo.dueDate) }}>
                                    <TableCell>
                                        <Checkbox 
                                            checked={todo.done}
                                            onChange={() => { handleDone(todo) }}
                                        ></Checkbox>
                                    </TableCell>
                                    <TableCell style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>{ todo.text }</TableCell>
                                    <TableCell>{ todo.priority }</TableCell>
                                    <TableCell>{ todo.dueDate ? new Date(todo.dueDate).toLocaleDateString('es-MX', {timeZone: 'UTC'}) :'No date' }</TableCell>
                                    <TableCell>
                                        <Button variant="contained" color="secondary" onClick={() => setEditingTodo(todo)}>
                                            Edit
                                        </Button>
                                        <Button variant="contained" color="error" onClick={() => handleDelete(todo.id)} sx={{ ml: 1 }}>
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
                <p>{ metrics.averageTimeForAllTasks }</p>
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