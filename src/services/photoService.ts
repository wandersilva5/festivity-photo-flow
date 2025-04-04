
import axios from 'axios';
import { Photo } from '@/types/photo';

// Base API URL - this should be changed to your actual API endpoint in production
const API_URL = 'http://localhost:3001';

export const photoService = {
  // Fetch all approved photos
  fetchApprovedPhotos: async (): Promise<Photo[]> => {
    try {
      const response = await axios.get(`${API_URL}/photos/approved`);
      return response.data;
    } catch (error) {
      console.error('Error fetching approved photos:', error);
      return [];
    }
  },

  // Fetch all pending photos
  fetchPendingPhotos: async (): Promise<Photo[]> => {
    try {
      const response = await axios.get(`${API_URL}/photos/pending`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending photos:', error);
      return [];
    }
  },

  // Upload a new photo
  uploadPhoto: async (dataUrl: string): Promise<Photo | null> => {
    try {
      const response = await axios.post(`${API_URL}/photos/upload`, { dataUrl });
      return response.data;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  },

  // Approve a pending photo
  approvePhoto: async (id: string): Promise<boolean> => {
    try {
      await axios.put(`${API_URL}/photos/${id}/approve`);
      return true;
    } catch (error) {
      console.error('Error approving photo:', error);
      return false;
    }
  },

  // Reject a pending photo
  rejectPhoto: async (id: string): Promise<boolean> => {
    try {
      await axios.delete(`${API_URL}/photos/${id}/reject`);
      return true;
    } catch (error) {
      console.error('Error rejecting photo:', error);
      return false;
    }
  },

  // Delete a photo (both approved or pending)
  deletePhoto: async (id: string, isApproved: boolean): Promise<boolean> => {
    try {
      await axios.delete(`${API_URL}/photos/${id}?isApproved=${isApproved}`);
      return true;
    } catch (error) {
      console.error('Error deleting photo:', error);
      return false;
    }
  },

  // Clear all photos
  clearAllPhotos: async (): Promise<boolean> => {
    try {
      await axios.delete(`${API_URL}/photos/all`);
      return true;
    } catch (error) {
      console.error('Error clearing all photos:', error);
      return false;
    }
  },
};
