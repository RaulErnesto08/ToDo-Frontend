import React, { useState, useEffect } from "react";
import { createTodo, updateTodo } from "../services/api";
import { Box, Button, Dialog, DialogTitle, DialogContent, TextField, FormControl, InputLabel, Select, MenuItem, DialogActions } from "@mui/material";

const TodoForm = ({ isOpen, onRequestClose, todo, onSave }) => {
    const [text, setText] = useState('');
    const [priority, setPriority] = useState('LOW');
    const [dueDate, setDueDate] = useState('');

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const todoData = { text, priority, dueDate: dueDate || null };

        if (todo) {
            await updateTodo(todo.id, todoData);
        } else {
            await createTodo(todoData);
        }

        onSave();
        onRequestClose();
    };

    return (
        <Dialog open={isOpen} onClose={onRequestClose}>
            <DialogTitle>
                {todo ? 'Edit Todo' : 'New Todo'}
            </DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={handleSubmit} data-testid="todo-form">
                    <TextField 
                        label="Text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        required
                        fullWidth
                        margin="normal"
                        inputProps={{ maxLength: 120, 'data-testid': "text-input" }}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel htmlFor="priority-select">Priority</InputLabel>
                        <Select 
                        labelId="priority-select-label"
                        id="priority-select"
                        value={priority} 
                        onChange={(e) => setPriority(e.target.value)} 
                        data-testid="priority-select">
                            <MenuItem value="HIGH">HIGH</MenuItem>
                            <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                            <MenuItem value="LOW">LOW</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField 
                        label="Due Date"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ "data-testid": "due-date-input" }}
                    />
                    <DialogActions>
                        <Button onClick={onRequestClose} data-testid="cancel-button">Cancel</Button>
                        <Button type="submit" variant="contained" color="primary" data-testid="save-button">
                            {todo ? 'Update' : 'Add'} Todo
                        </Button>
                    </DialogActions>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default TodoForm;