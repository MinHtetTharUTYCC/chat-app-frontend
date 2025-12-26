import { Circle } from 'lucide-react';
import React from 'react';

function Typing() {
    return (
        <div
            className="flex items-end gap-1 ml-6 my-2"
            role="status"
            aria-label="Someone is typing"
        >
            <Circle className="w-2 h-2 animate-bounce [animation-delay:-200ms]" />
            <Circle className="w-2 h-2 animate-bounce [animation-delay:-100ms]" />
            <Circle className="w-2 h-2 animate-bounce" />
        </div>
    );
}

export default Typing;
