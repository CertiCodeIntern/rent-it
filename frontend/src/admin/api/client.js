/**
 * Admin API Client
 * Wraps fetch() with base URL and credential forwarding for PHP session cookies.
 *
 * In dev:
 *   BASE_URL -> `/api/rent-it/admin/api` (proxied by Vite to XAMPP)
 * In production:
 *   BASE_URL -> `/rent-it/admin/api`
 */

const ROOT_BASE = import.meta.env.DEV ? '/api/rent-it' : '/rent-it';
const BASE_URL = `${ROOT_BASE}/admin/api`;

async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;

    const config = {
        credentials: 'include', // send PHP session cookie
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...options.headers,
        },
        ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();
    return { response, data };
}

const api = {
    get: (endpoint) => request(endpoint, { method: 'GET' }),

    post: (endpoint, body) =>
        request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        }),
};

export default api;
