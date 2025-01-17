import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
import { useState } from 'react';
import { type SpeechRecognitionResult } from 'microsoft-cognitiveservices-speech-sdk';

const speechsdk = require('microsoft-cognitiveservices-speech-sdk');

export const useVoice = () => {
    const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
    const [audioStatus, setAudioStatus] = useState<'idle' | 'recording' | 'recognized' | 'stopped'>(
        'idle',
    );
    const [audioText, setAudioText] = useState<string | null>(null);

    const speechConfig = speechsdk.SpeechConfig.fromSubscription(
        process.env.NEXT_PUBLIC_COGNITIVE_KEY!,
        process.env.NEXT_PUBLIC_COGNITIVE_REGION!,
    );
    async function sttFromMic() {
        setAudioStatus('recording');
        speechConfig.speechRecognitionLanguage = 'en-US';

        const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
        const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            setAudioStream(stream);
        } catch (err) {
            console.error('Error accessing the microphone', err);
        }

        recognizer.recognizeOnceAsync((result: SpeechRecognitionResult) => {
            if (result.reason === ResultReason.RecognizedSpeech) {
                setAudioText(result.text);
                setAudioStatus('recognized');
            } else {
                console.error(
                    'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.',
                );
            }
            if (result.reason === ResultReason.SynthesizingAudioCompleted) {
                setAudioStatus('idle');
            }
        });
    }

    return {
        audioStream,
        audioStatus,
        audioText,
        sttFromMic,
    };
};
