import sqlite3 from 'sqlite3';
import path from 'path';

// Use require for chalk to ensure Jest compatibility
const chalk = require('chalk');

let db: sqlite3.Database;

// Check if Jest is running (Jest automatically sets this env variable)
if (process.env.NODE_ENV === 'test') {
  // If we are in a test, export a blank object.
  // This stops any test from making a real database connection
  // and fixes the "Cannot log after tests are done" error.
  db = {} as sqlite3.Database;
} else {
  // This is the normal code that runs when you start your server
  const dbPath = path.resolve(__dirname, '../../database.db');

  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error(chalk.red('Error opening database'), err.message);
    } else {
      console.error(chalk.green('Connected to the SQLite database.'));
    }
  });
}

export default db;
