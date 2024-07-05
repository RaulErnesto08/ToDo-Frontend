import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080"
});

export const getTodos = (params) => api.get('/todos', { params });
export const createTodo = (todo) => api.post('/todos', todo);
export const updateTodo = (id, todo) => api.put(`/todos/${id}`, todo);
export const deleteTodo = (id) => api.delete(`/todos/${id}`);
export const markAsDone = (id) => api.post(`/todos/${id}/done`);
export const markAsUndone = (id) => api.put(`/todos/${id}/undone`);
export const getMetrics = () => api.get('/todos/metrics');