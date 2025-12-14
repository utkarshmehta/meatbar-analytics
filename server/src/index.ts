import express, { Express, Request, Response } from 'express';
import { Person, Consumption } from './types/models';
import cors from 'cors';
import db from './database';
import {
  getConsumptionStreaks,
  getMonthlyMostEaten,
  addConsumption,
} from './services/analytics.service';

import chalk from 'chalk';

// --- ADD SWAGGER IMPORTS ---
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '3001');

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- SWAGGER SETUP ---
// Load the OpenAPI spec file
const swaggerPath = path.resolve(__dirname, '../swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);

// Host the Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// --- END SWAGGER SETUP ---

// --- Routes ---
/**
 * GET /
 * Default root endpoint for welcome message and API discovery.
 */
app.get('/', (req: Request, res: Response) => {
  const ALL_ENDPOINTS = [
    {
      method: 'GET',
      path: '/api/v1/people',
      description: 'Returns a list of all unique people.',
    },
    {
      method: 'GET',
      path: '/api/v1/consumptions',
      description: 'Returns all consumption events.',
    },
    {
      method: 'POST',
      path: '/api/v1/consumptions',
      description: 'Adds a new consumption event.',
    },
    {
      method: 'GET',
      path: '/api/v1/analytics/streaks',
      description: 'Calculates consumption streaks.',
    },
    {
      method: 'GET',
      path: '/api/v1/analytics/monthly-most',
      description: 'Finds the day with the most consumption per month.',
    },
    {
      method: 'GET',
      path: '/api/v1/health',
      description: 'Checks server status.',
    },
  ];

  res.status(200).json({
    message: 'Welcome to the MeatBar Analytics API!',
    available_routes: ALL_ENDPOINTS,
    documentation: 'See /api-docs or README.md for full details.',
  });
});

/**
 * GET /api/v1/health
 * Health check endpoint.
 */
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK' });
});

/**
 * GET /api/v1/people
 * Returns all people from the database.
 */
app.get('/api/v1/people', (req: Request, res: Response) => {
  const sql = 'SELECT * FROM people';

  db.all(sql, [], (err: Error | null, rows: Person[]) => {
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

  db.all(sql, [], (err: Error | null, rows: Consumption[]) => {
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
      error: 'Missing required fields: person_name, type, eaten_at',
    });
  }

  const dateValue = Date.parse(eaten_at);
  if (isNaN(dateValue)) {
     return res.status(400).json({
      error: 'Invalid date format. Please use ISO-8601 (e.g. 2025-01-15T00:00:00Z)',
    });
  }


  try {
    const newConsumption = await addConsumption(person_name, type, eaten_at);

    res.status(201).json({
      id: newConsumption.id,
      person_name: person_name,
      type: type,
      eaten_at: eaten_at,
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
app.get(
  '/api/v1/analytics/monthly-most',
  async (req: Request, res: Response) => {
    try {
      const monthlyMost = await getMonthlyMostEaten();
      res.status(200).json(monthlyMost);
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(chalk.bold.green(`\nServer is running on port ${PORT}`));
  console.log(
    `  ${chalk.bold('Health Check:')} ${chalk.cyan(`http://localhost:${PORT}/api/v1/health`)}`,
  );
  console.log(
    `  ${chalk.bold('API Docs:')}     ${chalk.cyan(`http://localhost:${PORT}/api-docs`)}\n`,
  );
});
