import express, { Express, Request, Response } from 'express';
import cors from 'cors';

const app: Express = express();
// Use a port from environment variables if available, otherwise default to 3001
const PORT: number = parseInt(process.env.PORT || '3001');

// --- Middleware ---
app.use(cors());
app.use(express.json()); // Built-in middleware to parse JSON bodies

// --- Routes ---

// Health check route
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});