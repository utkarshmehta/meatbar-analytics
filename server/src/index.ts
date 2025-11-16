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
app.post('/api/v1/consumptions', (req: Request, res: Response) => {
  // Get data from the request body
  const { person_name, type, eaten_at } = req.body;

  // Simple validation
  if (!person_name || !type || !eaten_at) {
    return res.status(400).json({ 
      error: 'Missing required fields: person_name, type, eaten_at' 
    });
  }

  const sql = 'INSERT INTO meat_bars (person_name, type, eaten_at) VALUES (?, ?, ?)';
  
  // Use db.run for INSERT, UPDATE, or DELETE
  db.run(sql, [person_name, type, eaten_at], function(err) {
    if (err) {
      // This will catch foreign key errors if 'person_name' doesn't exist
      console.error('Error inserting meat bar:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Return the newly created record
    // 'this.lastID' is the 'id' of the row we just inserted
    res.status(201).json({
      id: this.lastID,
      person_name: person_name,
      type: type,
      eaten_at: eaten_at
    });
  });
});


// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});