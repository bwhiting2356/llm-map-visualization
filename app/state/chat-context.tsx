import { createContext } from 'react';
import { useChat } from './hooks/use-chat';
import { useVoice } from './hooks/use-voice';

interface ChatState {
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    messages: any[];
    error: Error | null;
    isLoading: boolean;
    handleSubmit: (e?: any, query?: string) => void;
    resetThread: () => void;
}

interface AudioState {
    audioStatus: string;
    audioStream: MediaStream | null;
    audioText: string | null;
    sttFromMic: () => Promise<void>;
}

export const ChatContext = createContext<ChatState & AudioState>({
    input: '',
    handleInputChange: () => {},
    messages: [],
    error: null,
    isLoading: false,
    handleSubmit: () => {},
    resetThread: () => {},
    audioStatus: 'idle',
    audioStream: null,
    audioText: null,
    sttFromMic: async () => {},
});

interface ChatProviderProps {
    children: React.ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
    const { input, handleInputChange, messages, error, handleSubmit, isLoading, resetThread } = useChat();
    const { audioStream, audioStatus, audioText, sttFromMic } = useVoice();

    const value = {
        input,
        handleInputChange,
        messages,
        error,
        isLoading,
        handleSubmit,
        audioStatus,
        audioStream,
        audioText,  
        sttFromMic,
        resetThread,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
