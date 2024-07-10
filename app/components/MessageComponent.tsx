import React from 'react';
import Markdown from 'react-markdown';
import { Robot } from '@phosphor-icons/react';

interface MessageComponentProps {
    message?: any;
}

const MessageComponent: React.FC<MessageComponentProps> = ({ message }) => {
    const { text } = message?.content[0] || '';
    if (text?.includes('[Automated]')) return null;
    if (message?.role === 'user' && !text) return null;
    return (
        <div
            className={`py-1 my-1 text-left ${message?.role === 'user' ? 'self-end' : 'text-left self-start'} ${message?.role === 'user' ? 'bg-gray-200 rounded px-2 py-1' : ''}`}
            style={{
                maxWidth: '75%',
                backgroundColor: message?.role === 'assistant' ? 'transparent' : undefined,
            }}
        >
            <div className="flex space-x-1 items-start">
                {' '}
                {message?.role !== 'user' && (
                    <div className="mt-0.5">
                        <Robot size={14} />
                    </div>
                )}
                <div className="markdown" style={{ flex: 1 }}>
                    {text ? <Markdown>{text}</Markdown> : 'Thinking...'}
                </div>
            </div>
        </div>
    );
};

export default MessageComponent;
