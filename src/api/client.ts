export interface HealthResponse {
    status: string;
    last_frame_timestamp: string;
    last_audio_timestamp: string;
    last_ui_timestamp: null;
    frame_status: string;
    audio_status: string;
    ui_status: string;
    message: string;
    verbose_instructions: null;
}

export class HealthClient {
    private baseUrl: string = 'http://localhost:3030';

    async getHealth(): Promise<HealthResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to fetch health status: ${error}`);
        }
    }
}

export const healthClient = new HealthClient(); 