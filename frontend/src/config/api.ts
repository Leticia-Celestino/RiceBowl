import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    headers: {
        'Content-Type': 'application/json',
    },
});

let csrfRequest: Promise<unknown> | null = null;

api.interceptors.request.use(
    async (config) => {
        const method = config.method?.toUpperCase() || 'GET';
        const isMutation = !['GET', 'HEAD', 'OPTIONS'].includes(method);
        if (isMutation) {
            csrfRequest ??= axios.get(`${api.defaults.baseURL}/auth/csrf`, {
                withCredentials: true,
            }).finally(() => {
                csrfRequest = null;
            });
            await csrfRequest;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
