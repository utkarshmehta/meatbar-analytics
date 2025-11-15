import sqlite3 from 'sqlite3';
import path from 'path';

// Get the path to the database file. 
// __dirname is the current folder (src/database), 
// so we go up two levels to the 'server' folder.
const dbPath = path.resolve(__dirname, '../../database.db');

// Use verbose mode for more detailed logs - utkarsh TODO
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

export default db;