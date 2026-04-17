// src/services/docs.ts
import api from './api';

export const docsService = {
  // 1. Create a brand new document
  createDocument: async (title: string, content: any) => {
    const response = await api.post('/docs/', { title, content });
    return response.data;
  },

  // 2. Get all documents for the logged-in user (for the sidebar/dashboard)
  getDocuments: async () => {
    const response = await api.get('/docs/');
    return response.data;
  },

  // --- NEW: Add this function! ---
  getDocumentById: async (id: string) => {
    const response = await api.get(`/docs/${id}`);
    return response.data;
  },

  // 3. Get one specific document by its ID (when a user clicks it)
  getDocument: async (docId: string) => {
    const response = await api.get(`/docs/${docId}`);
    return response.data;
  },

  // 4. Update/Save an existing document
  updateDocument: async (docId: string, title: string, content: any) => {
    const response = await api.put(`/docs/${docId}`, { title, content });
    return response.data;
  },
  // 5. Delete a document
  deleteDocument: async (id: string) => {
    const response = await api.delete(`/docs/${id}`);
    return response.data;
  },
};