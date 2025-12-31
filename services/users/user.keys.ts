export const userKeys = {
    all: ['users'],
    search: (q: string) => [...userKeys.all, q],
};
