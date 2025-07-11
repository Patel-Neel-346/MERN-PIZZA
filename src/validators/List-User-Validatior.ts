import { checkSchema } from 'express-validator';

export default checkSchema(
    {
        q: {
            trim: true,
            customSanitizer: {
                options: (value: unknown) => {
                    return value ? value : '';
                },
            },
        },
        role: {
            customSanitizer: {
                options: (value: unknown) => {
                    return value ? value : '';
                },
            },
        },

        currentPage: {
            customSanitizer: {
                options: (value: unknown) => {
                    const parsedValude = Number(value);
                    return Number.isNaN(parsedValude) ? 1 : parsedValude;
                },
            },
        },
        perPage: {
            customSanitizer: {
                options: (value: unknown) => {
                    const parsedValude = Number(value);
                    return Number.isNaN(parsedValude) ? 6 : parsedValude;
                },
            },
        },
    },
    ['query'],
);
