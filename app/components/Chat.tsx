import { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Message } from 'ai/react';
import { Input } from '@/components/ui/input';
import MessageComponent from './MessageComponent';
import { ArrowCircleUp, Spinner, Microphone } from '@phosphor-icons/react';
import { MapStateContext } from '../state/context';
import VoiceVisualizer, { useVoice } from './VoiceChat';

const useChat = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const { setData } = useContext(MapStateContext);

    useEffect(() => {
        const lastToolUseMessage = messages
            .slice()
            .reverse()
            .find(
                message =>
                    message?.role === 'assistant' &&
                    message?.content?.some((contentItem: any) => contentItem.type === 'tool_use'),
            );

        if (lastToolUseMessage) {
            const toolResult = lastToolUseMessage.content.find(
                (contentItem: any) => contentItem.type === 'tool_use',
            )?.input;
            setData(toolResult);
        }
    }, [messages]);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = (e?: any, query?: string) => {
        setInput('');
        setIsLoading(true);
        e?.preventDefault();

        const newMessage: any = {
            role: 'user',
            content: [{ type: 'text', text: query || input }],
        };

        const newMessages = [...messages, newMessage];
        setMessages([...newMessages]);

        fetch('/api/chat', {
            body: JSON.stringify({ messages: newMessages }),
            method: 'POST',
        })
            .then(res => res.json())
            .then((messages: Message[]) => {
                setMessages(messages);
            })
            .catch(err => setError(err))
            .finally(() => setIsLoading(false));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | string) => {
        if (typeof e === 'string') {
            setInput(e);
        } else {
            setInput(e.target.value);
        }
    };

    return {
        input,
        handleInputChange,
        messages,
        error,
        isLoading,
        handleSubmit,
    };
};

export default function Chat() {
    const { input, handleInputChange, messages, error, handleSubmit, isLoading } = useChat();
    const { audioStream, audioStatus, audioText, sttFromMic } = useVoice();

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

    const showSkeleton = useMemo(() => {
        const lastMessage = messages[messages.length - 1];
        return lastMessage?.role !== 'assistant' && isLoading;
    }, [isLoading, messages]);

    useEffect(() => {
        if (!isLoading) {
            inputRef.current?.focus();
        }
    }, [isLoading]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView();
    }, [messages]);

    return (
        <div
            className={`flex flex-col items-center justify-between gap-8 text-sm transition-width duration-300 w-96 z-50 fixed  bottom-4 right-4 rounded-lg`}
        >
            <div className="flex flex-col bg-white/70 w-full h-60 hover:h-[calc(100vh-12rem)] transition-all duration-300 px-2 rounded-lg hover:bg-white overflow-y-auto">
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

            <div className="w-full bottom-0 p-4 border-t border-gray-300 bg-white rounded-lg">
                {audioStatus !== 'recording' ? (
                    <>
                        <QuerySuggestions handleSubmit={handleSubmit} />
                        <form
                            onSubmit={onHandleSubmit}
                            className="flex w-full items-center space-x-2"
                        >
                            <Input
                                ref={inputRef}
                                disabled={isLoading}
                                className="flex-grow p-2 border border-gray-300 rounded-l"
                                value={input}
                                placeholder="What stats are you interested in?"
                                onChange={handleInputChange}
                            />
                            <button type="submit" className={`p-2 rounded text-white bg-gray-700`}>
                                {isLoading ? <Spinner size={20} /> : <ArrowCircleUp size={20} />}
                            </button>
                            <button
                                type="button"
                                className="p-2 rounded text-white bg-gray-700"
                                onClick={sttFromMic}
                            >
                                <Microphone size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <>{audioStream && <VoiceVisualizer audioStream={audioStream} />}</>
                )}
            </div>
        </div>
    );
}

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
    return (
        <button
            type="button"
            onClick={() => onClick(undefined, query)}
            className="bg-gray-100 hover:bg-gray-300 px-4 py-4 rounded-lg w-full text-left"
        >
            <p>{query}</p>
        </button>
    );
};
