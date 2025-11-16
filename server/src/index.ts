import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import db from './database';
import { 
  getConsumptionStreaks, 
  getMonthlyMostEaten, 
  addConsumption 
} from './services/analytics.service';

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '3001');

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---

/**
 * GET /
 * Default root endpoint for welcome message.
 */
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ 
    message: "Welcome to the MeatBar Analytics API!",
    endpoints: "Check /api/v1/health or the README for full list."
  });
});

/**
 * GET /api/v1/health
 * Health check endpoint.
 */
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

/**
 * GET /api/v1/people
 * Returns all people from the database.
 */
app.get('/api/v1/people', (req: Request, res: Response) => {
  const sql = 'SELECT * FROM people';

  db.all(sql, [], (err: Error | null, rows: any[]) => {
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
app.get('/api/v1/consumptions', (req: Request, res: Response) => {
  const sql = 'SELECT * FROM meat_bars';

  db.all(sql, [], (err: Error | null, rows: any[]) => {
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
app.post('/api/v1/consumptions', async (req: Request, res: Response) => {
  const { person_name, type, eaten_at } = req.body;

  if (!person_name || !type || !eaten_at) {
    return res.status(400).json({ 
      error: 'Missing required fields: person_name, type, eaten_at' 
    });
  }

  try {
    const newConsumption = await addConsumption(person_name, type, eaten_at);
    
    res.status(201).json({
      id: newConsumption.id,
      person_name: person_name,
      type: type,
      eaten_at: eaten_at
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/v1/analytics/streaks
 * Returns all consumption streaks.
 */
app.get('/api/v1/analytics/streaks', async (req: Request, res: Response) => {
  try {
    const streaks = await getConsumptionStreaks();
    res.status(200).json(streaks);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/v1/analytics/monthly-most
 * For each month, returns the day with the most consumptions.
 */
app.get('/api/v1/analytics/monthly-most', async (req: Request, res: Response) => {
  try {
    const monthlyMost = await getMonthlyMostEaten();
    res.status(200).json(monthlyMost);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running. Check health at http://localhost:${PORT}/api/v1/health`);
});