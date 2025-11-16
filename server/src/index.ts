import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import db from './database';

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '3001');

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---

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

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});