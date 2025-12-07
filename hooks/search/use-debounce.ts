import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // set value after a delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        //cleanup if value changes
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); //updates only when value/delay changes

    return debouncedValue;
}
