
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3001;

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increase payload size for base64 images

// Create directories if they don't exist
const pendingDir = path.join(__dirname, 'photos', 'pending');
const approvedDir = path.join(__dirname, 'photos', 'approved');

if (!fs.existsSync(path.join(__dirname, 'photos'))) {
  fs.mkdirSync(path.join(__dirname, 'photos'));
}

if (!fs.existsSync(pendingDir)) {
  fs.mkdirSync(pendingDir);
}

if (!fs.existsSync(approvedDir)) {
  fs.mkdirSync(approvedDir);
}

// Helper function to read photo metadata
const readPhotoMetadata = (directory) => {
  try {
    const files = fs.readdirSync(directory);
    const metadata = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(directory, file);
        const data = fs.readFileSync(filePath, 'utf8');
        metadata.push(JSON.parse(data));
      }
    }
    
    // Sort by timestamp, newest first
    return metadata.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error(`Error reading metadata from ${directory}:`, error);
    return [];
  }
};

// Helper function to save base64 image to file
const saveImage = (dataUrl, directory, id) => {
  try {
    // Extract the base64 data from the dataUrl
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid data URL');
    }
    
    const imageBuffer = Buffer.from(matches[2], 'base64');
    const imageExt = matches[1].split('/')[1];
    
    const filename = `${id}.${imageExt}`;
    const imagePath = path.join(directory, filename);
    
    fs.writeFileSync(imagePath, imageBuffer);
    return filename;
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
};

// API Routes
// Get all approved photos
app.get('/photos/approved', (req, res) => {
  try {
    const photos = readPhotoMetadata(approvedDir);
    res.json(photos);
  } catch (error) {
    console.error('Error fetching approved photos:', error);
    res.status(500).json({ error: 'Failed to fetch approved photos' });
  }
});

// Get all pending photos
app.get('/photos/pending', (req, res) => {
  try {
    const photos = readPhotoMetadata(pendingDir);
    res.json(photos);
  } catch (error) {
    console.error('Error fetching pending photos:', error);
    res.status(500).json({ error: 'Failed to fetch pending photos' });
  }
});

// Upload a new photo
app.post('/photos/upload', (req, res) => {
  try {
    const { dataUrl } = req.body;
    if (!dataUrl) {
      return res.status(400).json({ error: 'No image data provided' });
    }
    
    const id = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Save the image
    const filename = saveImage(dataUrl, pendingDir, id);
    
    // Create metadata
    const photo = {
      id,
      dataUrl: dataUrl,
      timestamp,
      approved: false
    };
    
    // Save metadata
    fs.writeFileSync(path.join(pendingDir, `${id}.json`), JSON.stringify(photo, null, 2));
    
    res.status(201).json(photo);
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Approve a photo
app.put('/photos/:id/approve', (req, res) => {
  try {
    const { id } = req.params;
    
    // Read metadata
    const metadataPath = path.join(pendingDir, `${id}.json`);
    
    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    const photoData = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    
    // Find the image file
    const files = fs.readdirSync(pendingDir);
    const imageFile = files.find(file => file.startsWith(id) && file !== `${id}.json`);
    
    if (!imageFile) {
      return res.status(404).json({ error: 'Image file not found' });
    }
    
    const imagePath = path.join(pendingDir, imageFile);
    
    // Update metadata
    photoData.approved = true;
    
    // Move files to approved directory
    fs.writeFileSync(path.join(approvedDir, `${id}.json`), JSON.stringify(photoData, null, 2));
    fs.copyFileSync(imagePath, path.join(approvedDir, imageFile));
    
    // Delete from pending directory
    fs.unlinkSync(metadataPath);
    fs.unlinkSync(imagePath);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error approving photo:', error);
    res.status(500).json({ error: 'Failed to approve photo' });
  }
});

// Reject a photo
app.delete('/photos/:id/reject', (req, res) => {
  try {
    const { id } = req.params;
    
    // Find files
    const metadataPath = path.join(pendingDir, `${id}.json`);
    
    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    const files = fs.readdirSync(pendingDir);
    const imageFile = files.find(file => file.startsWith(id) && file !== `${id}.json`);
    
    if (!imageFile) {
      return res.status(404).json({ error: 'Image file not found' });
    }
    
    const imagePath = path.join(pendingDir, imageFile);
    
    // Delete files
    fs.unlinkSync(metadataPath);
    fs.unlinkSync(imagePath);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error rejecting photo:', error);
    res.status(500).json({ error: 'Failed to reject photo' });
  }
});

// Delete a photo
app.delete('/photos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.query;
    
    const directory = isApproved === 'true' ? approvedDir : pendingDir;
    
    // Find files
    const metadataPath = path.join(directory, `${id}.json`);
    
    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    const files = fs.readdirSync(directory);
    const imageFile = files.find(file => file.startsWith(id) && file !== `${id}.json`);
    
    if (!imageFile) {
      return res.status(404).json({ error: 'Image file not found' });
    }
    
    const imagePath = path.join(directory, imageFile);
    
    // Delete files
    fs.unlinkSync(metadataPath);
    fs.unlinkSync(imagePath);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// Clear all photos
app.delete('/photos/all', (req, res) => {
  try {
    // Delete all files in pending directory
    fs.readdirSync(pendingDir).forEach(file => {
      fs.unlinkSync(path.join(pendingDir, file));
    });
    
    // Delete all files in approved directory
    fs.readdirSync(approvedDir).forEach(file => {
      fs.unlinkSync(path.join(approvedDir, file));
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing all photos:', error);
    res.status(500).json({ error: 'Failed to clear all photos' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Pending photos directory: ${pendingDir}`);
  console.log(`Approved photos directory: ${approvedDir}`);
});
