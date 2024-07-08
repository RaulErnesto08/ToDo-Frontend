import React from 'react';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoList from './TodoList';
import { getMetrics, getTodos, createTodo, markAsDone } from '../services/api';

jest.mock("../services/api");

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

const metricsMock = {
    averageTimeForAllTasks: 3600,
    averageTimeByPriority: {
        HIGH: 3600,
        MEDIUM: 3600,
        LOW: 3600
    }
};

test("renders TodoList component", async () => {
    await getTodos.mockImplementation(() => {
        return Promise.resolve({ data: todosMock, headers: { "x-total-count": 2 }, });
    });
    await getMetrics.mockImplementation(() => {
        return Promise.resolve({ data: metricsMock });
    });

    await act(async () => {
        render(<TodoList />);
    });

    const todo1 = screen.getByTestId("todo-1");
    const todo2 = screen.getByTestId("todo-2");
    expect(todo1).toBeVisible();
    expect(todo2).toBeVisible();
});

test('adds a new todo', async () => {
    const newTodo = {
        id: 3,
        text: 'New Todo',
        priority: 'LOW',
        creationDate: '2024-07-07T10:00:00',
        done: false,
        dueDate: '2024-07-20'
    };

    await getTodos.mockImplementationOnce(() => {
        return Promise.resolve({ data: todosMock, headers: { "x-total-count": 2 } });
    });
    
    await getMetrics.mockImplementationOnce(() => {
        return Promise.resolve({ data: metricsMock });
    });

    await createTodo.mockImplementation(() => {
        return Promise.resolve({ data: newTodo });
    });

    await getTodos.mockImplementationOnce(() => {
        return Promise.resolve({ data: [...todosMock, newTodo], headers: { "x-total-count": 3 } });
    });

    await getMetrics.mockImplementationOnce(() => {
        return Promise.resolve({ data: metricsMock });
    });

    await act(async () => {
        render(<TodoList />);
    });

    fireEvent.click(screen.getByTestId('new-todo-button'));

    fireEvent.change(screen.getByTestId('text-input'), { target: { value: 'New Todo' } });

    fireEvent.mouseDown(screen.getByTestId('priority-select').firstChild);
    const option = await screen.findByRole('option', { name: 'LOW' });
    fireEvent.click(option);

    fireEvent.change(screen.getByTestId('due-date-input'), { target: { value: '2024-07-15' } });

    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
        expect(screen.getByText('New Todo')).toBeInTheDocument();
    });
});

// test('marks a todo as done', async () => {
//     await getTodos.mockImplementationOnce(() => {
//         return Promise.resolve({ data: todosMock, headers: { "x-total-count": 2 } });
//     });

//     await getMetrics.mockImplementationOnce(() => {
//         return Promise.resolve({ data: metricsMock });
//     });

//     markAsDone.mockImplementation(() => {
//         const updatedTodo = todosMock.find(todo => todo.id === 1);
//         if (updatedTodo) {
//             updatedTodo.done = true;
//         }
//         return Promise.resolve({ data: updatedTodo });
//     });

//     await getTodos.mockImplementationOnce(() => {
//         const updatedTodos = todosMock.map(todo =>
//             todo.id === 1 ? { ...todo, done: true } : todo
//         );
//         return Promise.resolve({ data: updatedTodos, headers: { "x-total-count": 2 } });
//     });

//     await act(async () => {
//         render(<TodoList />);
//     });

//     fireEvent.click(screen.getByTestId('checkbox-1'));

//     await waitFor(() => {
//         const checkbox = screen.getByTestId('checkbox-1').querySelector('input');
//         expect(checkbox).toBeChecked();
//     });

//     const todo1Text = screen.getByTestId('text-1');
//     expect(todo1Text).toHaveStyle('text-decoration: line-through');
// });