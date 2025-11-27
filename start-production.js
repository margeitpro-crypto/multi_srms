// Production startup script
process.env.NODE_ENV = 'production';

// Start the server
import('./backend/server.ts');
