import Anthropic from '@anthropic-ai/sdk';
import { searchWeb } from './serp-api';

const anthropic = new Anthropic();

const stateFullNames = [
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'Florida',
    'Georgia',
    'Hawaii',
    'Idaho',
    'Illinois',
    'Indiana',
    'Iowa',
    'Kansas',
    'Kentucky',
    'Louisiana',
    'Maine',
    'Maryland',
    'Massachusetts',
    'Michigan',
    'Minnesota',
    'Mississippi',
    'Missouri',
    'Montana',
    'Nebraska',
    'Nevada',
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'New York',
    'North Carolina',
    'North Dakota',
    'Ohio',
    'Oklahoma',
    'Oregon',
    'Pennsylvania',
    'Rhode Island',
    'South Carolina',
    'South Dakota',
    'Tennessee',
    'Texas',
    'Utah',
    'Vermont',
    'Virginia',
    'Washington',
    'West Virginia',
    'Wisconsin',
    'Wyoming',
];

const canadaProvinceFullNames = [
    'Alberta',
    'British Columbia',
    'Manitoba',
    'New Brunswick',
    'Newfoundland and Labrador',
    'Nova Scotia',
    'Ontario',
    'Prince Edward Island',
    'Quebec',
    'Saskatchewan',
    'Northwest Territories',
    'Nunavut',
    'Yukon',
];

const nigeriaStateFullNames = [
    'Abia',
    'Adamawa',
    'Akwa Ibom',
    'Anambra',
    'Bauchi',
    'Bayelsa',
    'Benue',
    'Borno',
    'Cross River',
    'Delta',
    'Ebonyi',
    'Edo',
    'Ekiti',
    'Enugu',
    'Gombe',
    'Imo',
    'Jigawa',
    'Kaduna',
    'Kano',
    'Katsina',
    'Kebbi',
    'Kogi',
    'Kwara',
    'Lagos',
    'Nasarawa',
    'Niger',
    'Ogun',
    'Ondo',
    'Osun',
    'Oyo',
    'Plateau',
    'Rivers',
    'Sokoto',
    'Taraba',
    'Yobe',
    'Zamfara',
    'Fct, Abuja',
];

export const stateProperties: { [key: string]: { type: string } } = {};
stateFullNames.forEach(state => {
    stateProperties[state] = { type: 'number' };
});

export const provinceProperties: { [key: string]: { type: string } } = {};
canadaProvinceFullNames.forEach(province => {
    provinceProperties[province] = { type: 'number' };
});

export const nigeriaStateProperties: { [key: string]: { type: string } } = {};
nigeriaStateFullNames.forEach(state => {
    nigeriaStateProperties[state] = { type: 'number' };
});



const systemMessage = `
  You are an assistant that helps a user estimate statistics for regions within an area and visualize them on a map, 
  You are connected to a front-end interface with a map (mapbox light mode) that is able to display these statistics. 
  This tool can be used for multiple areas and sub-regions. An upstream tool will give you a list of sub-regions for the user's requested area and populate the tool definitions with these sub-regions (for example, counties, states, provinces)
  It's understood that this is not perfect up-to-date information, and it's just an estimate based on your training data. 
  Nonetheless, it is useful for brainstorming and exploration, and you should return the confidence level of the estimates to the user.

  **Important** When providing the estimates and visualizing them on the map, simply confirm to the user that the data has been rendered on the map without over-explaining the internal process. 
  Do not mention the name of the function, this is not necessary for the user to know.

  Additionally, you can now visualize categorical statistics, such as the most common fish species in each province. 
  Ensure that the categoryColors object uses category names as keys (e.g., "Bass": "#FF5733") rather than indexes. 
  When providing categorical statistics, always return the category names rather than indexes in the estimates. Mentioning the category names to the user is unecessary as they will see it in the legend.

  It is crucial to provide accurate and consistent data based on well-known, widely accepted information. 
  Avoid introducing unnecessary variety or less common options. Base your estimates on the most popular and widely recognized statistics.
  When you respond in text format, please respond in markdown when possible. The response should be concise and mention general trends.

  Example of the correct format:
  {
    "estimates": {
      "Alabama": "Bass",
      "Alaska": "Salmon",
      ...
    },
    "title": "Estimated Most Common Fish Species in Each Province",
    "categoryColors": {
      "Bass": "#FF5733",
      "Salmon": "#33FF57",
      ...
    }
  } 
`;
export const getClaudeResponse = async (messages: any, subRegions: any) => {
    const msg = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 3000,
        temperature: 0,
        system: systemMessage,
        tools: [
            {
                name: 'continuous_stats_estimates',
                description: 'Provide estimated continous statistic for all sub-regions',
                input_schema: {
                    type: 'object',
                    properties: {
                        estimates: {
                            type: 'object',
                            description:
                                'An object with sub-region names as keys and estimated values',
                            properties: subRegions,
                        },
                        title: {
                            type: 'string',
                            description: 'Title for the map',
                        },
                        color1: {
                            type: 'string',
                            description: 'First color for the color scale (e.g., #FF0000 for red)',
                        },
                        color2: {
                            type: 'string',
                            description:
                                'Second color for the color scale (e.g., #0000FF for blue)',
                        },
                        legendSide1: {
                            type: 'string',
                            description:
                                'Description for the side of the legend corresponding to color1 (e.g., Low)',
                        },
                        legendSide2: {
                            type: 'string',
                            description:
                                'Description for the side of the legend corresponding to color2 (e.g., High)',
                        },
                        confidence: {
                            type: 'string',
                            description: 'Confidence level of the estimates (Low, Medium, High)',
                        },
                    },
                    required: [
                        'estimates',
                        'title',
                        'color1',
                        'color2',
                        'legendSide1',
                        'legendSide2',
                        'confidence',
                    ],
                },
            },
            {
                name: 'category_stats_estimates',
                description: 'Provide estimated categorical statistic for all sub-regions',
                input_schema: {
                    type: 'object',
                    properties: {
                        estimates: {
                            type: 'object',
                            description:
                                'An object with sub-region names as keys and estimated values',
                            properties: subRegions,
                        },
                        title: {
                            type: 'string',
                            description: 'Title for the map',
                        },
                        categoryColors: {
                            type: 'object',
                            description: 'An object mapping category names to colors',
                        },
                        confidence: {
                            type: 'string',
                            description: 'Confidence level of the estimates (Low, Medium, High)',
                        },
                    },
                    required: ['categories', 'title', 'categoryColors', 'confidence'],
                },
            },
        ],
        messages,
    });
    return msg;
};

export const getClaudeResponseAndHandleToolCall = async (
    messages: any,
    subRegions: any,
): Promise<any> => {
    const filteredMessages = messages.map((m: any) => {
        const { id, type, model, stop_reason, stop_sequence, usage, ...rest } = m;
        return rest;
    });
    const result = await getClaudeResponse(filteredMessages, subRegions);
    if (result.stop_reason === 'tool_use') {
        const toolCall = result.content.find(item => item.type === 'tool_use') as any;
        const { name, id } = toolCall;
        let nextMessage;
        if (name === 'continuous_stats_estimates' || name === 'category_stats_estimates') {
            nextMessage = {
                role: 'user',
                content: [
                    {
                        type: 'tool_result',
                        tool_use_id: id,
                        content: 'rendered',
                    },
                ],
            };
        } else {
            const result = await searchWeb(toolCall.input);
            nextMessage = {
                role: 'user',
                content: [
                    {
                        type: 'tool_result',
                        tool_use_id: id,
                        content: JSON.stringify(result),
                    },
                ],
            };
        }

        const allMessages = [...messages, result, nextMessage];
        // TODO: maybe keep a counter to prevent infinite loop in recursion (and not allow tool use if so on final loop)
        return getClaudeResponseAndHandleToolCall(allMessages, subRegions);
    } else {
        return [...messages, result];
    }
};
