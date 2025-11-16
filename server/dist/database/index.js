"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
// Get the path to the database file. 
// __dirname is the current folder (src/database), 
// so we go up two levels to the 'server' folder.
const dbPath = path_1.default.resolve(__dirname, '../../database.db');
// Use verbose mode for more detailed logs - utkarsh TODO
const db = new sqlite3_1.default.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    }
    else {
        console.log('Connected to the SQLite database.');
    }
});
exports.default = db;
