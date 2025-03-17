// src/scripts/init-db.js
import { initializeDatabase } from '../lib/db';

// Initialize the database
async function init() {
    try {
        console.log('Initializing database...');
        await initializeDatabase();
        console.log('Database initialized successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

init();
