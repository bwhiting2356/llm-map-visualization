import { useContext, useEffect, useMemo, useRef } from 'react';

import { Message } from 'ai/react';
import { Input } from '@/components/ui/input';
import MessageComponent from './MessageComponent';
import { ArrowCircleUp, Spinner, Microphone } from '@phosphor-icons/react';
import VoiceVisualizer from './VoiceChat';
import { ChatContext } from '../state/chat-context';
import { useParams } from 'next/navigation';
import { useSavedMap } from '@/lib/useSavedMapById';

export default function Chat() {
    const {
        input,
        handleInputChange,
        messages,
        error,
        handleSubmit,
        isLoading,
        audioStatus,
        audioStream,
        sttFromMic,
        audioText,
        resetThread,
    } = useContext(ChatContext);

    const onHandleSubmit = (e: any) => {
        e.preventDefault();
        handleSubmit(e);
    };
    useEffect(() => {
        if (audioStatus === 'recognized' && audioText) {
            handleSubmit(undefined, audioText);
        }
    }, [audioStatus, audioText]);

    const inputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isLoading) {
            inputRef.current?.focus();
        }
    }, [isLoading]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView();
    }, [messages]);

    const activeThread = messages.length > 0;

    return (
        <div
            className={`flex flex-col items-center justify-between gap-8 text-sm transition-all duration-300 w-96 z-50 fixed  bottom-4 right-4 rounded-lg `}
        >
            <div className="w-full bottom-0 p-4 bg-white rounded-lg">
                {audioStatus !== 'recording' ? (
                    <>
                        {activeThread ? (
                            <>
                                <ChatHistory />
                                <ActionButtons />
                            </>
                        ) : (
                            <QuerySuggestions handleSubmit={handleSubmit} />
                        )}
                        <form
                            onSubmit={onHandleSubmit}
                            className="flex w-full items-center space-x-2"
                        >
                            <Input
                                ref={inputRef}
                                disabled={isLoading}
                                className="flex-grow p-2 border border-gray-300 rounded-l focus-visible:ring-offset-0"
                                value={input}
                                placeholder={`${activeThread ? 'Get more insights or add a new query' : 'What would you like to visualize?'}`}
                                onChange={handleInputChange}
                            />
                            <button
                                type="submit"
                                className={`p-2 rounded text-white bg-gray-900`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Spinner className="animate-spin" size={20} />
                                ) : (
                                    <ArrowCircleUp size={20} />
                                )}
                            </button>
                            <button
                                type="button"
                                className=" rounded text-black "
                                onClick={sttFromMic}
                                disabled={isLoading}
                            >
                                <Microphone size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        {audioStream && (
                            <>
                                <VoiceVisualizer audioStream={audioStream} />
                                <div>Recording</div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

const ChatHistory = () => {
    const { messages, error, isLoading } = useContext(ChatContext);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const showSkeleton = useMemo(() => {
        const lastMessage = messages[messages.length - 1];
        return lastMessage?.role !== 'assistant' && isLoading;
    }, [isLoading, messages]);
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages]);
    return (
        <div
            ref={containerRef}
            className="flex flex-col bg-white/70 w-full h-[calc(100vh-28rem)] transition-all duration-300 px-2 rounded-lg hover:bg-white overflow-y-auto mb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        >
            <div className="my-4">
                <h2 className="font-bold text-xl">Chat</h2>
            </div>
            {error != null && (
                <div className="relative px-6 py-4 text-white bg-red-500 rounded-md">
                    <span className="block sm:inline">Error: {(error as any).toString()}</span>
                </div>
            )}
            {messages.map((m: Message) => (
                <MessageComponent key={m.id} message={m} />
            ))}
            {showSkeleton && <MessageComponent />}
            <div ref={messagesEndRef} />
        </div>
    );
};

const ActionButtons = () => {
    const { resetThread, isLoading } = useContext(ChatContext);
    return (
        <div className="flex justify-between mb-2">
            <button disabled={isLoading} className="underline text-gray-500" onClick={resetThread}>
                Reset thread
            </button>
        </div>
    );
};

const QuerySuggestions = ({
    handleSubmit,
}: {
    handleSubmit: (e?: any, query?: string) => void;
}) => {
    const queries = [
        'What is the population distribution of Canada?',
        'What is the weather distribution in US?',
    ];
    return (
        <div className="flex flex-col gap-2 mb-4">
            <h3 className="font-bold">Popular searches</h3>
            <div className="flex flex-col gap-2">
                {queries.map((query, index) => (
                    <QuerySuggestion key={index} onClick={handleSubmit} query={query} />
                ))}
            </div>
        </div>
    );
};

const QuerySuggestion = ({
    query,
    onClick,
}: {
    query: string;
    onClick: (e?: React.ChangeEvent<HTMLInputElement>, query?: string) => void;
}) => {
    const { isLoading } = useContext(ChatContext);
    return (
        <button
            type="button"
            onClick={() => onClick(undefined, query)}
            disabled={isLoading}
            className="bg-gray-100 hover:bg-gray-300 px-4 py-4 rounded-lg w-full text-left"
        >
            <p>{query}</p>
        </button>
    );
};
