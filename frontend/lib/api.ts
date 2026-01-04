import axios from 'axios';
import { auth } from './firebase';

const API_URL = 'http://localhost:8000'; 

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// The “Interceptor” will run before every request.
// This retrieves the current token from Firebase and adds it to the request header.
api.interceptors.request.use(async (config) => {
    const user = auth.currentUser;

    if (user) {
    // Get a fresh token from Firebase (refreshes if expired)
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});