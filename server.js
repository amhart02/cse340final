/**
 * Imports
 */
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { setupDatabase, testConnection } from './src/models/setup.js';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import db from './src/models/db.js';

//import routes
import indexRoutes from './src/routes/index.js'; 
import accountRoutes from './src/routes/account/index.js';

/**
 * Global Variables
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config()
const mode = process.env.NODE_ENV || development;
const port = process.env.PORT || 3000;
const app = express();

//global middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.locals.req = req;
    res.locals.user = req.session?.user || null;
    next()
});

//Session Middleware 
const PostgresStore = pgSession(session);

app.use(session({
    store: new PostgresStore({
        pool: db, 
        tableName: 'sessions', 
        createTableIfMissing: true 
    }),
    secret: process.env.SESSION_SECRET || "default-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: {
        secure: false, 
        httpOnly: true, 
        maxAge: 30 * 24 * 60 * 60 * 1000 
    }
}));

/**
 * Routes
 */
app.use('/', indexRoutes);
app.use('/account', accountRoutes);

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
    try {
        await testConnection();
        await setupDatabase();
    } catch (error) {
        console.error('Database setup failed:', error);
        process.exit(1);
    }
    console.log(`Server running on http://127.0.0.1:${port}`);
});