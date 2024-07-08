import React from 'react';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import TodoList from './TodoList';

jest.mock('axios');

const todosMock = [
    {
        id: 1,
        text: 'Hello',
        priority: 'HIGH',
        creationDate: '2024-07-01T10:00:00',
        done: false,
        dueDate: '2024-07-10'
    },
    {
        id: 2,
        text: 'Dinner',
        priority: 'MEDIUM',
        creationDate: '2024-07-01T11:00:00',
        done: true,
        dueDate: '2024-07-12'
    }
];

test('adds a new todo', async () => {
    axios.get.mockResolvedValueOnce({ data: todosMock, headers: { 'x-total-count': '2' } });
    axios.post.mockResolvedValueOnce({
        data: {
            id: 3,
            text: 'New Todo',
            priority: 'LOW',
            creationDate: '2024-07-15T10:00:00',
            done: false,
            dueDate: '2024-07-15'
        }
    });

    render(<TodoList />);

    fireEvent.click(screen.getByTestId('new-todo-button'));

    fireEvent.change(screen.getByTestId('text-input'), { target: { value: 'New Todo' } });

    fireEvent.mouseDown(screen.getByTestId('priority-select').firstChild);
    const listbox = await screen.findByRole('listbox');
    const option = await screen.findByRole('option', { name: 'LOW' });
    fireEvent.click(option);

    fireEvent.change(screen.getByTestId('due-date-input'), { target: { value: '2024-07-15' } });

    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
        expect(screen.getByText('New Todo')).toBeInTheDocument();
    });
});