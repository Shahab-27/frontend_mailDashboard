import { create } from 'zustand';
import api from '../utils/api';

const persistedToken = localStorage.getItem('mmd_token');
const persistedUser = localStorage.getItem('mmd_user');

const useMailStore = create((set, get) => ({
  token: persistedToken || '',
  user: persistedUser ? JSON.parse(persistedUser) : null,
  mails: [],
  selectedMail: null,
  folder: 'inbox',
  isComposeOpen: false,
  loading: false,
  error: '',

  setToken: (token, user) => {
    if (token) {
      localStorage.setItem('mmd_token', token);
      localStorage.setItem('mmd_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mmd_token');
      localStorage.removeItem('mmd_user');
    }
    set({ token: token || '', user: user || null });
  },

  toggleCompose: (open) =>
    set((state) => ({ isComposeOpen: open ?? !state.isComposeOpen })),

  setFolder: (folder) => set({ folder, selectedMail: null }),

  fetchMails: async (folder = get().folder) => {
    set({ loading: true, error: '' });
    try {
      const { data } = await api.get('/mail', { params: { folder } });
      set({ mails: data, folder, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to load mail', loading: false });
      throw error;
    }
  },

  fetchMailById: async (id) => {
    try {
      const { data } = await api.get(`/mail/${id}`);
      set({ selectedMail: data });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch mail' });
      throw error;
    }
  },

  sendMail: async (payload) => {
    try {
      const { data } = await api.post('/mail/send', payload);
      if (get().folder === 'sent') {
        set((state) => ({ mails: [data, ...state.mails] }));
      }
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to send mail';
    }
  },

  deleteMail: async (id) => {
    try {
      const { data } = await api.patch(`/mail/delete/${id}`);
      set((state) => ({
        mails: state.mails.filter((mail) => mail._id !== id),
        selectedMail: state.selectedMail?._id === id ? null : state.selectedMail,
      }));
    } catch (error) {
      throw error.response?.data?.message || 'Unable to delete mail';
    }
  },

  restoreMail: async (id, folder = 'inbox') => {
    try {
      const { data } = await api.patch(`/mail/restore/${id}`, { folder });
      set((state) => ({
        mails: state.mails.filter((mail) => mail._id !== id),
        selectedMail: state.selectedMail?._id === id ? data : state.selectedMail,
      }));
    } catch (error) {
      throw error.response?.data?.message || 'Unable to restore mail';
    }
  },

  authenticate: async (endpoint, payload) => {
    try {
      const { data } = await api.post(`/auth/${endpoint}`, payload);
      set({ token: data.token, user: data.user });
      localStorage.setItem('mmd_token', data.token);
      localStorage.setItem('mmd_user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Authentication failed';
    }
  },

  logout: () => {
    localStorage.removeItem('mmd_token');
    localStorage.removeItem('mmd_user');
    set({
      token: '',
      user: null,
      mails: [],
      selectedMail: null,
      folder: 'inbox',
      isComposeOpen: false,
    });
  },
}));

export default useMailStore;

