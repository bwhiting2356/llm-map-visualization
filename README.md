# LLM Map Visualization

## Introduction

Welcome to the LLM Map Visualization project! This is a proof-of-concept prototype that demonstrates the integration of a Large Language Model (LLM) with map visualizations. Users can ask statistical questions about different regions and see the estimates visualized on a map. The statistics can be either continuous or categorical, making this tool useful for market research, exploration, and querying information that would otherwise require extensive data gathering.

[Access the Prototype](https://llm-map-visualization.vercel.app/)

## Project Overview

### Key Features

- **Interactive Map Visualizations**: Users can visualize estimated statistics on a map based on their queries.
- **Versatile Statistical Queries**: Supports both continuous and categorical data.
- **Region Recognition**: Implements a Retrieval-Augmented Generation (RAG) process to identify the region in question and find the corresponding GeoJSON file from the database.
- **LLM Integration**: Uses Claude to process user queries and generate statistical estimates.
- **Tool Call Integration**: Feeds identified regions into tool calls for accurate data visualization.
- **Multimodal Query Inputs**: Users can query with both voice and text.

### Use Cases

- **Market Research**: Quickly gather and visualize market data for different regions.
- **Data Exploration**: Explore statistical data without the need for extensive manual research.
- **Information Retrieval**: Ask questions that require complex data retrieval and visualization.

## Technologies Used

- **React**: Front-end UI library
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Vercel**: Platform for deployment and hosting front end and serverless functions
- **Mapbox and DeckGL**: WebGL-powered frameworks for mapping and data analysis
- **Neon**: Serverless Postgres database to store saved map visualizations
- **Pinecone**: Vector database for similarity search
- **Claude**: Anthropic's large language model (using both haiku for simple queries and sonnet 3.5 for more complex reasoning)
- **Voyage**: Embeddings ABI


## Future Enhancements

- **Streaming Responses**: Implementing streaming to enhance response times.
- **Enhanced Accuracy**: Adding web search and Wikipedia search tools to improve the accuracy of responses.
- **Expanded GeoJSON Database**: Incorporating more GeoJSON files and storing them in an external bucket to overcome Vercel's file size limitations.
- **Bug Fixes**: Ongoing improvements and bug resolutions. (please give us feedback!)


## Build With Claude Competition

This project was built for the [Build With Claude competition](https://docs.anthropic.com/en/build-with-claude-contest/overview). 

## Demo and Examples
![Demo](https://github.com/bwhiting2356/llm-map-visualization/assets/16016903/4026c285-d822-40bb-8228-d890d64906ad)
<div>
    <img width="200" alt="Brooklyn neighborhoods by income" src="https://github.com/bwhiting2356/llm-map-visualization/assets/16016903/898a9cf9-1c36-433d-8177-a2fa0ae677aa">
    <img width="200" alt="Regions of italy by avg temperature in july" src="https://github.com/bwhiting2356/llm-map-visualization/assets/16016903/2a5a8807-f38a-4113-9bf1-521fe74307cd">
    <img width="200" alt="German states by favorite sausage" src="https://github.com/bwhiting2356/llm-map-visualization/assets/16016903/24bae422-d543-406c-bb0f-a2e9b4b82c0f">
    <img width="200" alt="California counties by most common industry" src="https://github.com/bwhiting2356/llm-map-visualization/assets/16016903/cca57f85-619b-4f37-90d2-09b341782342">
</div>

## Collaborators

This project was developed by:

- [Brendan Whiting](https://github.com/bwhiting2356)
- [David Ubanyi](https://github.com/davidubanyi)

## Feedback

We welcome your feedback! Feel free to [open an issue](https://github.com/bwhiting2356/llm-map-visualization/issues/new) on this repo.
