"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = __importDefault(require("./database"));
const analytics_service_1 = require("./services/analytics.service");
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3001');
// --- Middleware ---
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// --- Routes ---
/**
 * GET /api/v1/health
 * Health check endpoint.
 */
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
/**
 * GET /api/v1/people
 * Returns all people from the database.
 */
app.get('/api/v1/people', (req, res) => {
    const sql = 'SELECT * FROM people';
    database_1.default.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching people:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.status(200).json(rows);
    });
});
/**
 * GET /api/v1/consumptions
 * Returns all meat bar consumptions from the database.
 */
app.get('/api/v1/consumptions', (req, res) => {
    const sql = 'SELECT * FROM meat_bars';
    database_1.default.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching meat bars:', err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.status(200).json(rows);
    });
});
/**
 * POST /api/v1/consumptions
 * Adds a new meat bar consumption to the database.
 */
app.post('/api/v1/consumptions', (req, res) => {
    const { person_name, type, eaten_at } = req.body;
    if (!person_name || !type || !eaten_at) {
        return res.status(400).json({
            error: 'Missing required fields: person_name, type, eaten_at'
        });
    }
    const sql = 'INSERT INTO meat_bars (person_name, type, eaten_at) VALUES (?, ?, ?)';
    database_1.default.run(sql, [person_name, type, eaten_at], function (err) {
        if (err) {
            console.error('Error inserting meat bar:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json({
            id: this.lastID,
            person_name: person_name,
            type: type,
            eaten_at: eaten_at
        });
    });
});
/**
 * GET /api/v1/analytics/streaks
 * Returns all consumption streaks.
 */
app.get('/api/v1/analytics/streaks', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const streaks = yield (0, analytics_service_1.getConsumptionStreaks)();
        res.status(200).json(streaks);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
/**
 * GET /api/v1/analytics/monthly-most
 * For each month, returns the day with the most consumptions.
 */
app.get('/api/v1/analytics/monthly-most', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const monthlyMost = yield (0, analytics_service_1.getMonthlyMostEaten)();
        res.status(200).json(monthlyMost);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
