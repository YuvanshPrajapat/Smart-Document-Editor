// src/services/ai.ts
import api from './api';

// Helper function to handle the FormData wrapping
const createFormData = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return formData;
};

// The config object required for sending files
const uploadConfig = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
};

export const aiService = {
  // 1. Extract standard text (OCR)
  extractText: async (imageFile: File) => {
    const formData = createFormData(imageFile);
    const response = await api.post('/ai/ocr', formData, uploadConfig);
    return response.data;
  },

  // 2. Extract LaTeX Math Formulas
  extractFormula: async (imageFile: File) => {
    const formData = createFormData(imageFile);
    const response = await api.post('/ai/formula', formData, uploadConfig);
    return response.data;
  },

  // 3. Extract Handwriting
  extractHandwriting: async (imageFile: File) => {
    const formData = createFormData(imageFile);
    const response = await api.post('/ai/handwriting', formData, uploadConfig);
    return response.data;
  }
};