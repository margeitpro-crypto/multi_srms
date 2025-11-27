import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './server';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Export the Express app for Vercel
export default app;

// For local development, start the server
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}