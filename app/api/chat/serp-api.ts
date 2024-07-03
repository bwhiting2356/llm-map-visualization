const apiKey = process.env.SERP_API_KEY || '';

export const searchWeb = async (input: any) => {
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(input.query)}&api_key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching search results: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return { error };
    }
};
