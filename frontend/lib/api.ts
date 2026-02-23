import axios from 'axios';
import { auth } from './firebase';
// Import the types we just created
import { Todo, CreateTodoInput, Category, CategoryCreate } from '../types'; 

// Use environment variable for API URL or fallback to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Adds Firebase Auth Token to every request
api.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// --- TODO API CALLS ---

export const getTodos = async (): Promise<Todo[]> => {
    const response = await api.get('/todos');
    return response.data;
};

export const createTodo = async (todo: CreateTodoInput): Promise<Todo> => {
    const response = await api.post('/todos', todo);
    return response.data;
};

export const updateTodo = async (id: number, data: Partial<Todo>): Promise<Todo> => {
    const response = await api.put(`/todos/${id}`, data);
    return response.data;
};

export const deleteTodo = async (id: number): Promise<void> => {
    await api.delete(`/todos/${id}`);
};

// --- CATEGORY API CALLS (NEW) ---

export const getCategories = async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
};

export const createCategory = async (category: CategoryCreate): Promise<Category> => {
    const response = await api.post('/categories', category);
    return response.data;
};

export const updateCategory = async (id: number, name: string) => {
    const response = await api.put(`/categories/${id}`, { name });
    return response.data;
};

export const deleteCategory = async (id: number) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
};