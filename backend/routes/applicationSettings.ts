import { Router, Request, Response } from 'express';
import { getSetting, setSetting, getSettings, getAllSettings } from '../services/applicationSettingsService';

const router = Router();

// GET /api/application-settings - Get all application settings
router.get('/', async (req: Request, res: Response) => {
  try {
    const settings = await getAllSettings();
    res.json(settings);
  } catch (err) {
    console.error('Error fetching application settings:', err);
    res.status(500).json({ error: 'Failed to fetch application settings' });
  }
});

// GET /api/application-settings/:key - Get a specific application setting by key
router.get('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const value = await getSetting(key);
    
    if (value === null) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    res.json({ key, value });
  } catch (err) {
    console.error(`Error fetching application setting with key ${req.params.key}:`, err);
    res.status(500).json({ error: 'Failed to fetch application setting' });
  }
});

// POST /api/application-settings - Set application settings
router.post('/', async (req: Request, res: Response) => {
  try {
    const { settings } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings format' });
    }
    
    // Save all settings
    const savePromises = Object.entries(settings).map(([key, value]) => 
      setSetting(key, value)
    );
    
    await Promise.all(savePromises);
    
    res.json({ message: 'Settings saved successfully' });
  } catch (err) {
    console.error('Error saving application settings:', err);
    res.status(500).json({ error: 'Failed to save application settings' });
  }
});

// PUT /api/application-settings/:key - Set a specific application setting
router.put('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }
    
    await setSetting(key, value, description);
    
    res.json({ message: 'Setting saved successfully' });
  } catch (err) {
    console.error(`Error saving application setting with key ${req.params.key}:`, err);
    res.status(500).json({ error: 'Failed to save application setting' });
  }
});

export default router;