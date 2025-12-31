import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';
import { LoginRequest, LoginResponse } from '../types';

// ✅ IP CONFIGURADO: 10.0.0.188
// Se precisar alterar, atualize aqui
const API_URL = 'http://10.0.0.188:3000';

let authToken: string | null = null;

// Carregar token do storage ao iniciar
AsyncStorage.getItem('authToken').then((token) => {
  authToken = token;
});

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para adicionar token em cada requisição
api.interceptors.request.use(
  (config) => {
    // Usar token em cache ao invés de fazer await async
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor para lidar com erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      authToken = null;
      AsyncStorage.removeItem('authToken');
      AsyncStorage.removeItem('authUser');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    console.log('📤 Enviando login para:', API_URL + '/auth/login');
    console.log('📋 Credenciais:', { email: credentials.email, password: '***' });
    
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      console.log('✅ Login bem-sucedido!');
      
      // Atualizar token em cache
      authToken = response.data.access_token;
      
      // Normalizar a resposta: access_token -> token
      const data = response.data;
      return {
        user: data.user,
        access_token: data.access_token,
      };
    } catch (error: any) {
      console.log('❌ Erro no login:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        data: error.response?.data,
      });
      throw error;
    }
  },

  logout: async () => {
    authToken = null;
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('authUser');
    await AsyncStorage.removeItem('tokenExpiration');
  },

  // Atualizar token quando ele é salvo
  setToken: (token: string | null) => {
    authToken = token;
  },
};

export default api;
