export interface ITranscription {
    id: string;
    userId: string;
    title: string;
    text: string;
    status: 'processing' | 'completed' | 'failed';
    createdAt: string;
    audioUrl?: string;
    jobId?: string;
    duration?: number;
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
}