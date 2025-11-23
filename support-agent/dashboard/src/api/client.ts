import axios from 'axios';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    headers: { 'Content-Type': 'application/json' }
});

export const supportApi = {
    async getMetrics(startDate: string, endDate: string) {
        return client.get(`/dashboard/metrics?start_date=${startDate}&end_date=${endDate}`);
    },
    async getRecentTickets(limit: number = 50) {
        return client.get(`/dashboard/recent-tickets?limit=${limit}`);
    },
    async ingestDocument(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        return client.post('/knowledge/ingest', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },
    async getKbStats() {
        return client.get('/dashboard/kb-stats');
    },
    async testAgent(query: string) {
        return client.post('/support', { email: 'test@admin.com', query });
    }
};
