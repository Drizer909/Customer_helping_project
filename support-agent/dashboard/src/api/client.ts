import axios from 'axios';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    headers: { 'Content-Type': 'application/json' }
});

export interface RecentTicket {
    id: number;
    email: string;
    query: string;
    status: string;
    confidence_score: number | null;
    created_at: string;
}

export const supportApi = {
    async getMetrics(startDate: string, endDate: string) {
        return client.get(`/dashboard/metrics?start_date=${startDate}&end_date=${endDate}`);
    },
    async getRecentTickets(limit = 50, offset = 0, search = "", status = "", signal?: AbortSignal) {
        return client.get<RecentTicket[]>("/dashboard/recent-tickets", {
            params: { limit, offset, search, status: status || undefined }, signal
        });
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
