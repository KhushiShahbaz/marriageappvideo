import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = `${process.env.REACT_APP_API_URL}/chat`;
const APIPayment = `${process.env.REACT_APP_API_URL}/payments`;
const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const GetSession = createAsyncThunk(
  'chat/getSession',
  async ({ agencyId, userId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, agencyId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch session');
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const ReadMessages = createAsyncThunk(
  'chat/read-msg',
  async ({ sessionId, reader }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/mark-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId, reader }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch session');
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);


export const fetchSessions = createAsyncThunk(
  'chat/fetchSession',
  async ({ role, id }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/sessions/unread-agency/${role}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch session');
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);


export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ sessionId }, { getState }) => {
    const token = getState().auth.token;
    const { data } = await axios.get(`${API}/messages/${sessionId}`, getAuthConfig(token));
    return data;
  }
);

export const fetchLatestPayment = createAsyncThunk(
  'chat/fetchLatestPayment',
  async (sessionId, { getState }) => {
    const token = getState().auth.token;
    const res = await fetch(`${APIPayment}/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    return data;
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (payload, { getState }) => {
    const token = getState().auth.token;
    const formData = new FormData();

    // Append all text fields
    Object.keys(payload).forEach(key => {
      if (key !== 'files') {
        formData.append(key, payload[key]);
      }
    });

    // Append files if they exist
    if (payload.files && payload.files.length > 0) {
      payload.files.forEach(file => {
        formData.append('files', file);
      });
    }

    const config = {
      ...getAuthConfig(token),
      headers: {
        ...getAuthConfig(token).headers,
        'Content-Type': 'multipart/form-data',
      },
    };

    const { data } = await axios.post(`${API}/messages`, formData, config);
    return data;
  }
);

export const createPayment = createAsyncThunk(
  'chat/createPayment',
  async (payload, { getState }) => {
    const token = getState().auth.token;
    const { data } = await axios.post(`${APIPayment}/`, payload, getAuthConfig(token));
    return data;
  }
);

export const updatePayment = createAsyncThunk(
  'chat/updatePayment',
  async ({ paymentId,formData }, { getState }) => {
    console.log(paymentId,)
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    const token = getState().auth.token;
    const { data } = await axios.put(`${APIPayment}/${paymentId}/upload-proof`, formData, getAuthConfig(token));
    return data;
  }
);

export const updatePaymentStatus = createAsyncThunk(
  'chat/updatePayment',
  async ({ paymentId,status }, { getState }) => {
    console.log(paymentId,)
   
    const token = getState().auth.token;
    const { data } = await axios.put(`${APIPayment}/${paymentId}/${status}`,  getAuthConfig(token));
    return data;
  }
);

export const fetchPaymentByUserId = createAsyncThunk(
  'chat/fetchPaymentByUserId',
  async (userId, { getState }) => {
    const token = getState().auth.token;
    const res = await fetch(`${APIPayment}/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    return data;
  }
);

export const fetchPaymentById = createAsyncThunk(
  'chat/fetchPaymentById',
  async (id, { getState }) => {
    const token = getState().auth.token;
    const res = await fetch(`${APIPayment}/payment/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    return data;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    sessions: [],
    current: null, // selected session
    messages: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    clearMessages(state) {
      state.messages = [];
    },
    setCurrentSession(state, action) {
      state.current = action.payload;
    },
    // setMessages(state, action) {
    //   state.messages = action.payload;
    // },
    addMessage(state, action) {
      state.messages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(GetSession.fulfilled, (state, action) => {
        state.sessions.push(action.payload); // or filter + push if you want to avoid duplicates
      })
      // Fetch Sessions
      .addCase(fetchSessions.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(fetchSessions.fulfilled, (s, { payload }) => {
        s.status = 'succeeded';
        s.sessions = payload;
      })
      .addCase(fetchSessions.rejected, (s, { payload }) => {
        s.status = 'failed';
        s.error = payload;
      })

      // Fetch Messages
      .addCase(fetchMessages.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(fetchMessages.fulfilled, (s, { payload }) => {
        s.status = 'succeeded';
        s.messages = payload;
      })
      .addCase(fetchMessages.rejected, (s, { payload }) => {
        s.status = 'failed';
        s.error = payload;
      })

      // Send Message
      .addCase(sendMessage.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(sendMessage.fulfilled, (s, { payload }) => {
        s.status = 'succeeded';
        s.messages.push(payload);
      })
      .addCase(sendMessage.rejected, (s, { payload }) => {
        s.status = 'failed';
        s.error = payload;
      });
  },
});

export const { clearMessages, setCurrentSession } = chatSlice.actions;
export default chatSlice.reducer;
