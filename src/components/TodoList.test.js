import React from 'react';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import TodoList from './TodoList';

jest.mock('axios');

const todosMock = [
    {
        id: 1,
        text: 'Test Todo 1',
        priority: 'HIGH',
        creationDate: '2024-07-01T10:00:00',
        done: false,
        dueDate: '2024-07-10'
    },
    {
        id: 2,
        text: 'Test Todo 2',
        priority: 'MEDIUM',
        creationDate: '2024-07-01T11:00:00',
        done: true,
        dueDate: '2024-07-12'
    }
];

const metricsMock = {
    averageTimeForAllTasks: 3600,
    averageTimeByPriority: {
        HIGH: 3600, 
        MEDIUM: 3600,
        LOW: 3600
    }
};

test('renders TodoList component', async () => {
        axios.get.mockImplementation((url) => {
            if (url.includes('/todos')) {
                return Promise.resolve({ data: todosMock, headers: { 'x-total-count' : 2 } });
            } else if (url.includes('/metrics')) {
                return Promise.resolve({ data: metricsMock });
            } else {
                return Promise.reject(new Error('not found'));
            }
        });

        render(<TodoList />);

        await waitFor(() => {
            expect(screen.queryByTestId('todo-1')).toBeInTheDocument();
            expect(screen.queryByTestId('todo-2')).toBeInTheDocument();
        });
});

test('adds a new todo', async () => {

  fireEvent.click(screen.queryByTestId('new-todo-button'));
  fireEvent.change(screen.getByLabelText('Text'), { target: { value: 'New Todo' } });
  fireEvent.change(screen.getByLabelText('Priority'), { target: { value: 'LOW' } });
  fireEvent.change(screen.getByLabelText('Due Date'), { target: { value: '2024-07-15' } });

  fireEvent.click(screen.queryByTestId('save-button'));

  await waitFor(() => {
    expect(screen.queryByTestId('todo-1')).toBeInTheDocument();
  });
});