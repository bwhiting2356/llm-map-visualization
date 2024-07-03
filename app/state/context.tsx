import { createContext, useState } from 'react';

type Estimates = {
    [key: string]: number;
};

interface MapStateType {
    data: {
        estimates: Estimates;

        title: string;
        legendSide1?: string;
        legendSide2?: string;
        color1?: string;
        color2?: string;
        categoryColors?: { [key: string]: string };
        confidence?: string;
        regionKey: string;
    };
    setData: any;
}

const initialData = {
    estimates: {},
    color1: '',
    color2: '',
    title: '',
    legendSide1: '',
    legendSide2: '',
    categoryColors: {},
    confidence: '',
    regionKey: ''
};

const initialContextState: MapStateType = {
    data: initialData,
    setData: () => {},
};

export const MapStateContext = createContext<MapStateType>(initialContextState);

interface MessageBotProviderProps {
    children: React.ReactNode;
}

export const MapStatsProvider = ({ children }: MessageBotProviderProps) => {
    const [data, setData] = useState(initialData);

    return (
        <MapStateContext.Provider value={{ data, setData }}>{children}</MapStateContext.Provider>
    );
};
