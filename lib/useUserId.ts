import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useUserId = () => {
    const [userId, setUserId] = useState('');

    useEffect(() => {
        let storedUserId = localStorage.getItem('userId');
        if (!storedUserId) {
            storedUserId = uuidv4();
            localStorage.setItem('userId', storedUserId);
        }
        setUserId(storedUserId);
    }, []);

    return userId;
};
