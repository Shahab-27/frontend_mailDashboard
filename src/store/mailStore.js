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
  composeDraft: null,
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

  toggleCompose: (open, draft = null) =>
    set((state) => ({
      isComposeOpen: typeof open === 'boolean' ? open : !state.isComposeOpen,
      composeDraft: draft,
    })),

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

  saveDraft: async (payload) => {
    try {
      const { data } = await api.post('/mail/draft', payload);
      set((state) => {
        const updates = { composeDraft: data };
        if (state.folder === 'drafts') {
          const existingIndex = state.mails.findIndex((mail) => mail._id === data._id);
          let nextMails = state.mails;
          if (existingIndex >= 0) {
            nextMails = [...state.mails];
            nextMails[existingIndex] = data;
          } else {
            nextMails = [data, ...state.mails];
          }
          updates.mails = nextMails;
        }
        return updates;
      });
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to save draft';
    }
  },

  sendMail: async (payload, draftId) => {
    try {
      const { data } = await api.post('/mail/send', { ...payload, draftId });
      set((state) => {
        const updates = {};
        if (state.folder === 'sent') {
          updates.mails = [data, ...state.mails];
        }

        if (state.folder === 'drafts' && payload.draftId) {
          const filtered = state.mails.filter((mail) => mail._id !== payload.draftId);
          updates.mails = filtered;
          if (state.selectedMail?._id === payload.draftId) {
            updates.selectedMail = null;
          }
        }

        return updates;
      });
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

  emptyTrash: async () => {
    try {
      await api.delete('/mail/trash');
      set((state) => {
        if (state.folder === 'trash') {
          return {
            mails: [],
            selectedMail: null,
          };
        }
        return state;
      });
    } catch (error) {
      throw error.response?.data?.message || 'Unable to empty trash';
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

