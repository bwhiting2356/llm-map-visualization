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

const stateProperties: { [key: string]: { type: string } } = {};
stateFullNames.forEach(state => {
    stateProperties[state] = { type: 'number' };
});

const systemMessage = `
  You are an assistant that helps a user estimate statistics and visualize them on a map. 
  You are connected to a front-end interface with a map that is able to display these statistics. 
  You are asked to take the user's request and estimate the statistic for each US state to the best of your ability.
  It's understood that this is not perfect up-to-date information, and it's just an estimate based on your training data. 
  Nonetheless, it is useful for brainstorming and exploration. 

  The visualization will be rendered in Mapbox Light mode.

  When providing the estimates and visualizing them on the map, simply confirm to the user that the data has been rendered on the map without over-explaining the internal process. Do not mention the name of the function, this is not necessary for the user to know.

  Additionally, you can now visualize categorical statistics, such as the most common fish species in each state. 
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
    "title": "Most Common Fish Species in Each State",
    "categoryColors": {
      "Bass": "#FF5733",
      "Salmon": "#33FF57",
      ...
    }
  } 
`;
export const getClaudeResponse = async (messages: any) => {
    const msg = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 3000,
        temperature: 0,
        system: systemMessage,
        tools: [
            // {
            //     name: 'web_search',
            //     description:
            //         'Retrieve search results from the web using SerpApi based on the provided query',
            //     input_schema: {
            //         type: 'object',
            //         properties: {
            //             query: {
            //                 type: 'string',
            //                 description: 'The search query to retrieve information for',
            //             },
            //         },
            //         required: ['query'],
            //     },
            // },
            // {
            //     name: 'wikipedia_get_full_page',
            //     description: 'Retrieve the full content of a Wikipedia article based on its title',
            //     input_schema: {
            //         type: 'object',
            //         properties: {
            //             title: {
            //                 type: 'string',
            //                 description: 'The title of the Wikipedia article, e.g., "Artificial Intelligence". This parameter is required to specify the article to retrieve.',
            //             },
            //             language: {
            //                 type: 'string',
            //                 description: 'The language of the Wikipedia site, e.g., "en" for English. This parameter is optional and defaults to "en".',
            //                 default: 'en',
            //             },
            //         },
            //         required: ['title'],
            //     },
            // },
            {
                name: 'state_stats_estimates',
                description: 'Provide estimated continous statistic for all US states',
                input_schema: {
                    type: 'object',
                    properties: {
                        estimates: {
                            type: 'object',
                            description:
                                'An object with US state names as keys and estimated values as values',
                            properties: stateProperties,
                            // required: stateFullNames,
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
                    },
                    required: [
                        'estimates',
                        'title',
                        'color1',
                        'color2',
                        'legendSide1',
                        'legendSide2',
                    ],
                },
            },
            {
                name: 'state_categorical_stats',
                description: 'Provide estimated categorical statistic for all US states',
                input_schema: {
                    type: 'object',
                    properties: {
                        estimates: {
                            type: 'object',
                            description:
                                'An object with US state names as keys and estimated categorical values as values',
                            properties: stateProperties,
                            // required: stateFullNames,
                        },
                        title: {
                            type: 'string',
                            description: 'Title for the map',
                        },
                        categoryColors: {
                            type: 'object',
                            description: 'An object mapping category names to colors',
                        },
                    },
                    required: ['categories', 'title', 'categoryColors'],
                },
            },
        ],
        messages,
    });
    return msg;
};

export const getClaudeResponseAndHandleToolCall = async (messages: any): Promise<any> => {
    const filteredMessages = messages.map((m: any) => {
        const { id, type, model, stop_reason, stop_sequence, usage, ...rest } = m;
        return rest;
    });
    const result = await getClaudeResponse(filteredMessages);
    if (result.stop_reason === 'tool_use') {
        const toolCall = result.content.find(item => item.type === 'tool_use') as any;
        const { name, id } = toolCall;
        let nextMessage;
        if (name === 'state_stats_estimates' || name === 'state_categorical_stats') {
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
        return getClaudeResponseAndHandleToolCall(allMessages);
    } else {
        return [...messages, result];
    }
};
