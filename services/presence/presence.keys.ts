export const presenceKeys = {
    all: ['presence'] as const,

    bulk: (userIds:string[]) => [...presenceKeys.all,"bulk",[...userIds].sort()] as const,

}