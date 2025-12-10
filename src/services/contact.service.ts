import api from '../utils/api';

export interface ContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export const contactService = {
  createContact: async (data: ContactData): Promise<ContactResponse> => {
    return api.post('/contact', data);
  },
  
  getAllContacts: async () => {
    return api.get('/contact');
  },
  
  getContactById: async (id: string) => {
    return api.get(`/contact/${id}`);
  },
};

