import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { BACKEND_BASE_URL } from '@/config';
import { getValidatedToken, removeToken, removeUserData, setToken } from '@/utils/cookies';
import { PATH_AUTH_LOGIN } from '@/router/routes';
import { AxiosError } from 'axios';

const apiClient: AxiosInstance = axios.create({
    baseURL: BACKEND_BASE_URL,
    timeout: 7000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true, // required to send/receive the HttpOnly refresh token cookie
});

// 1. Request interceptor — attach JWT access token to every request
apiClient.interceptors.request.use((config) => {
    const token = getValidatedToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = [];

function processQueue(error: unknown, token: string | null) {
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
    failedQueue = [];
}

// 2. Response interceptor — on 401, attempt token refresh then retry
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as typeof error.config & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest?._retry) {
            if (isRefreshing) {
                // Queue requests that come in while a refresh is already in progress
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest!.headers!.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest!);
                });
            }

            originalRequest!._retry = true;
            isRefreshing = true;

            try {
                // Cookie with refresh token is sent automatically (withCredentials: true)
                const { data } = await axios.post(
                    `${BACKEND_BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                setToken(data.token);
                processQueue(null, data.token);
                originalRequest!.headers!.Authorization = `Bearer ${data.token}`;
                return apiClient(originalRequest!);
            } catch (refreshError) {
                processQueue(refreshError, null);
                removeToken();
                removeUserData();
                window.location.href = PATH_AUTH_LOGIN;
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
