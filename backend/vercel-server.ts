import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './server';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files in production (for Vercel)
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  // Don't interfere with API routes
  if (req.path.startsWith('/api/')) {
    return;
  }
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// Export the Express app for Vercel
export default app;

// For local development, start the server
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}