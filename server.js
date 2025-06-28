/**
 * Imports
 */
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

//import routes
import indexRoutes from './src/routes/index.js'; 

/**
 * Global Variables
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config()
const mode = process.env.NODE_ENV;
const port = process.env.PORT;
const app = express();

//global middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(express.static(path.join(__dirname, 'public')));

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Routes
 */
app.use('/', indexRoutes);

// When in development mode, start a WebSocket server for live reloading
if (mode === ('development')) {
    const ws = await import('ws');

    try {
        const wsPort = parseInt(port) + 1;
        const wsServer = new ws.WebSocketServer({ port: wsPort });

        wsServer.on('listening', () => {
            console.log(`WebSocket server is running on port ${wsPort}`);
        });

        wsServer.on('error', (error) => {
            console.error('WebSocket server error:', error);
        });
    } catch (error) {
        console.error('Failed to start WebSocket server:', error);
    }
}

// Start the Express server
app.listen(port, async () => {
    // await testDatabase();
    console.log(`Server running on http://127.0.0.1:${port}`);
});