import { AxiosError } from 'axios';

export const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
        //our backend returned a formed error response
        if (error.response?.data?.message) {
            // Handle array of errors (typical in NestJS validation pipes)
            if (Array.isArray(error.response.data.message)) {
                return error.response.data.message[0];
            }
            return error.response.data.message;
        }

        // Network errors (server down)
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred';
};
