# LocateAI

LocateAI is a full-stack web application that leverages artificial intelligence to help users explore addresses in the USA. It utilizes OpenAI's GPT-4 to interpret user queries and provide address information, and then uses Puppeteer to capture a screenshot of the address on Google Maps.

## Project Structure

```
LocateAI/
├── server/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── screenshots/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── ChatWindow.js
│   │   └── ChatWindow.css
│   └── package.json
├── README.md
└── .gitignore
```

## Technologies Used

- Backend:
  - Node.js
  - Express.js
  - Puppeteer
  - Axios
  - dotenv
- Frontend:
  - React
  - Axios
- APIs:
  - OpenAI GPT-4
  - Google Maps

## Setup and Installation

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- OpenAI API key

### Server Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the server directory and add your OpenAI API key:
   ```
   PORT=5000
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Start the server:
   ```
   npm start
   ```

   The server will run on `http://localhost:5000`.

### Client Setup

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the React development server:
   ```
   npm start
   ```

   The client will run on `http://localhost:3000`.

## Features

1. AI-powered address interpretation:
   - Uses GPT-4 to understand and process user queries about USA addresses.

2. Interactive chat interface:
   - Users can input queries and receive responses in a chat-like format.

3. Google Maps integration:
   - Automatically captures a screenshot of the queried address on Google Maps.

4. Address copying:
   - Users can easily copy the full address with a single click.

5. Direct Google Maps link:
   - Provides a button to open the full Google Maps page for the address.

## Usage

1. Open your web browser and go to `http://localhost:3000`.
2. In the chat input, enter an address or a query about an address in the USA.
3. LocateAI will interpret your query, provide the full address, and display a screenshot of the location on Google Maps.
4. You can copy the address text using the "Copy" button.
5. Click "Open in Google Maps" to view the full Google Maps page for the address.

## Code Overview

### Server (server.js)

- Sets up an Express server with CORS and JSON parsing middleware.
- Implements a POST endpoint `/api/chat` that:
  1. Receives user messages
  2. Sends queries to OpenAI's GPT-4
  3. Interprets the response to extract an address
  4. Uses Puppeteer to capture a Google Maps screenshot of the address
  5. Returns the address, screenshot URL, and Google Maps URL to the client

### Client (src/App.js, src/ChatWindow.js)

- `App.js`: Sets up the main structure of the application with a header and the ChatWindow component.
- `ChatWindow.js`: 
  1. Implements the chat interface using React hooks (useState)
  2. Manages the state of messages and user input
  3. Handles sending requests to the server and processing responses
  4. Renders messages, including address text and map screenshots
  5. Provides functionality for copying addresses and opening Google Maps

## Styling

The application uses custom CSS for styling, defined in `src/ChatWindow.css`. This includes styles for the chat window, messages, input form, and buttons.

## Error Handling

- Server-side errors are logged to the console and return a 500 status code with an error message.
- Client-side error handling captures and displays error messages in the chat interface.

## Future Improvements

1. Implement user authentication
2. Add support for international addresses
3. Improve error handling and user feedback
4. Optimize performance for handling large numbers of requests
5. Add unit and integration tests

## Contributing

Contributions to LocateAI are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).