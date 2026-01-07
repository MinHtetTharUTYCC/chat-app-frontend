'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '../use-app-store';
import { useIsMobile } from '../use-mobile';

export function useTypingSound(isTyping: boolean) {
    const { isChatsOpen } = useAppStore();

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const isMobile = useIsMobile();

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio('/sounds/typing.mp3');
            audioRef.current.loop = true;
            audioRef.current.volume = 0.4;
        }

        //window is hidden OR not typing, ==> stop sound
        if (!isTyping || (isChatsOpen && isMobile)) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0; //rest position
            return;
        }

        //else, play
        audioRef.current.play().catch((err) => {
            console.log('Play sound error:', err);
        });

        return () => {
            //stop sound on unmount
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, [isTyping, isChatsOpen, isMobile]);
}
