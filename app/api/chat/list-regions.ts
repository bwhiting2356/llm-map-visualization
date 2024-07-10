import { promises as fs } from 'fs';
import path from 'path';

export const listAvailableGeojsons = async (): Promise<string[]> => {
    const dataDirectory = path.join(process.cwd(), 'data');
    try {
        const files = await fs.readdir(dataDirectory);
        return files.filter(file => file.endsWith('.json')).map(file => file.replace('.json', ''));
    } catch (error) {
        console.error('Error reading data directory:', error);
        return [];
    }
};
