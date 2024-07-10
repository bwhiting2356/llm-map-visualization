import { useState, useContext, useEffect } from 'react';
import { MapStateContext } from '../context';
import { Message } from 'ai/react';
import { useParams } from 'next/navigation';
import { useSavedMap } from '@/lib/useSavedMapById';
import { rehydrateMessages } from '@/lib/utils';

export const useChat = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const { setData } = useContext(MapStateContext);

    const { id } = useParams();
    const { data } = useSavedMap(id as string);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (data) {
            const newMessages = rehydrateMessages(data);
            setMessages(newMessages);
            setIsLoading(true);
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
        }
    }, [data]);

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const resetThread = () => {
        setMessages([]);
        setData({});
    };

    return {
        input,
        handleInputChange,
        messages,
        error,
        isLoading,
        handleSubmit,
        resetThread,
    };
};
