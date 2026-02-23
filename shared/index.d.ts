export interface ITranscription {
    id: string;
    userId: string;
    title: string;
    text: string;
    status: 'processing' | 'completed' | 'failed';
    createdAt: string;
    audioUrl?: string;
}
export interface ApiResponse<T> {
    data: T;
    message?: string;
}
