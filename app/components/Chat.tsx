import { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Message } from 'ai/react';
import { Input } from '@/components/ui/input';
import MessageComponent from './MessageComponent';
import { ArrowCircleUp, Spinner } from '@phosphor-icons/react';
import { MapStateContext } from '../state/context';

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
                    message?.content?.some(contentItem => contentItem.type === 'tool_use'),
            );

        if (lastToolUseMessage) {
            const toolResult = lastToolUseMessage.content.find(
                contentItem => contentItem.type === 'tool_use',
            )?.input;
            setData(toolResult);
        }
    }, [messages]);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = (e: any) => {
        setInput('');
        setIsLoading(true);
        e.preventDefault();

        const newMessage: any = {
            role: 'user',
            content: [{ type: 'text', text: input }],
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
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

    const onHandleSubmit = (e: any) => {
        e.preventDefault();
        handleSubmit(e);
    };

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
            className={`flex flex-col overflow-y-scroll items-center justify-between max-h-screen text-sm w-1/2 h-full border-r transition-width duration-300 relative`}
        >
            {
                <div className="flex flex-col w-full mx-auto flex-grow px-2">
                    <div className="my-4">
                        <h2 className="font-bold text-xl">Chat</h2>
                    </div>
                    {error != null && (
                        <div className="relative px-6 py-4 text-white bg-red-500 rounded-md">
                            <span className="block sm:inline">
                                Error: {(error as any).toString()}
                            </span>
                        </div>
                    )}
                    {messages.map((m: Message) => (
                        <MessageComponent key={m.id} message={m} />
                    ))}
                    {showSkeleton && <MessageComponent />}
                    <div ref={messagesEndRef} />
                </div>
            }
            <div className="w-full sticky bottom-0 p-2 border-t border-gray-300 bg-white">
                <form onSubmit={onHandleSubmit} className="flex w-full items-center space-x-2">
                    <Input
                        ref={inputRef}
                        disabled={isLoading}
                        className="flex-grow p-2 border border-gray-300 rounded-l shadow-xl"
                        value={input}
                        placeholder="What do you want to chat about today?"
                        onChange={handleInputChange}
                    />
                    <button type="submit" className={`p-2 rounded text-white bg-gray-700`}>
                        {isLoading ? <Spinner size={20} /> : <ArrowCircleUp size={20} />}
                    </button>
                </form>
            </div>
        </div>
    );
}
