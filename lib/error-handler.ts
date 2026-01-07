import axios from 'axios';

//backend returned a formed error response
type BackendError = {
    message?: string | string[];
};

export const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError<BackendError>(error)) {
        const data = error.response?.data;

        if (data?.message) {
            // Handle array of errors (typical in NestJS validation pipes)
            return Array.isArray(data.message) ? data.message[0] : data.message;
        }

        // Network errors (server down)
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred';
};
