'use client';

import { Search } from 'lucide-react';
import React, { useState } from 'react';
import SearchMessageDialog from './search-message-dialog';
import { Button } from '@/components/ui/button';

function SearchMessage({ chatId,onCloseSheet }: { chatId: string,onCloseSheet: ()=> void }) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <>
            <Button
                className="mt-4 flex items-center justify-center p-2 cursor-pointer"
                onClick={() => setIsSearchOpen(true)}
            >
                <Search className="h-5 w-5" />
                Search Messages
            </Button>
            <SearchMessageDialog isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} chatId={chatId} closeSheet={onCloseSheet}/>
        </>
    );
}

export default SearchMessage;
