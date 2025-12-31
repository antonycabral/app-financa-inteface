import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { authService } from '../services/api';
import { AuthState, LoginRequest, RegisterRequest } from '../types';

interface AuthStore extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  setError: (error: string | null) => void;
}

// Função auxiliar para calcular expiração (7 dias = 7 * 24 * 60 * 60 * 1000 ms)
const getTokenExpiration = () => {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
};

// Função para verificar se o token está expirado
const isTokenExpired = async (): Promise<boolean> => {
  const expiration = await AsyncStorage.getItem('tokenExpiration');
  if (!expiration) return true;
  return new Date() > new Date(expiration);
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isOffline: false,

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null, isOffline: false });
    try {
      const response = await authService.login(credentials);
      const { user, access_token } = response;

      // Calcular expiração (7 dias)
      const expiresAt = getTokenExpiration();

      // Armazenar dados no AsyncStorage para persistência offline
      await AsyncStorage.setItem('authToken', access_token);
      await AsyncStorage.setItem('authUser', JSON.stringify(user));
      await AsyncStorage.setItem('tokenExpiration', expiresAt);
      
      // Atualizar token no interceptador
      authService.setToken(access_token);

      set({
        user,
        token: access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isOffline: false,
      });
    } catch (error: any) {
      // Tentar usar dados armazenados localmente se houver erro de rede
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUserJson = await AsyncStorage.getItem('authUser');
      const isExpired = await isTokenExpired();

      // Determinar a mensagem de erro
      let errorMessage = 'Erro ao fazer login. Tente novamente.';

      console.log('❌ Erro de Login:', {
        status: error.response?.status,
        message: error.message,
        code: error.code,
        isNetworkError: !error.response,
        errorConfig: error.config?.url,
        responseData: error.response?.data,
        fullError: error,
      });

      // Log adicional para debug
      console.log('📍 URL tentada:', error.config?.baseURL + error.config?.url);

      if (error.response?.status === 401) {
        errorMessage = 'Email ou senha incorretos!';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Email ou senha inválidos!';
      } else if (error.response?.status === 404) {
        errorMessage = 'Servidor não encontrado. Verifique a URL do backend.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (
        error.message.includes('Network') ||
        error.message.includes('timeout') ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ENOTFOUND'
      ) {
        errorMessage = '⚠️ Erro de conexão com o servidor.\n\nVerifique:\n1. Se o backend está rodando\n2. Se a URL está correta\n3. Sua conexão de internet';
      } else {
        errorMessage = `Erro: ${error.message}`;
      }

      if (storedToken && storedUserJson && !isExpired) {
        // Modo offline: usar dados armazenados
        const user = JSON.parse(storedUserJson);
        set({
          user,
          token: storedToken,
          isAuthenticated: true,
          isLoading: false,
          error: '📡 Modo offline: usando dados armazenados',
          isOffline: true,
        });
      } else {
        // Sem dados locais ou token expirado
        set({
          error: errorMessage,
          isLoading: false,
          isAuthenticated: false,
          isOffline: false,
        });
        throw error;
      }
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isOffline: false,
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null, isOffline: false });
    try {
      const response = await authService.register(data);
      
      // Criar objeto user a partir da resposta
      const user: User = {
        id: response.id,
        name: response.name,
        email: response.email,
      };

      // Se houver token na resposta, usar diretamente
      if (response.access_token) {
        // Calcular expiração (7 dias)
        const expiresAt = getTokenExpiration();

        // Armazenar dados no AsyncStorage para persistência offline
        await AsyncStorage.setItem('authToken', response.access_token);
        await AsyncStorage.setItem('authUser', JSON.stringify(user));
        await AsyncStorage.setItem('tokenExpiration', expiresAt);
        
        // Atualizar token no interceptador
        authService.setToken(response.access_token);

        set({
          user,
          token: response.access_token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          isOffline: false,
        });
      } else {
        // Se não houver token, fazer login automático com as mesmas credenciais
        console.log('🔄 Fazendo login automático após registro...');
        try {
          const loginResponse = await authService.login({
            email: data.email,
            password: data.password,
          });
          
          const { user: loginUser, access_token: loginToken } = loginResponse;
          
          // Calcular expiração (7 dias)
          const expiresAt = getTokenExpiration();
          
          // Armazenar dados
          await AsyncStorage.setItem('authToken', loginToken);
          await AsyncStorage.setItem('authUser', JSON.stringify(loginUser));
          await AsyncStorage.setItem('tokenExpiration', expiresAt);
          
          // Atualizar token no interceptador
          authService.setToken(loginToken);
          
          set({
            user: loginUser,
            token: loginToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            isOffline: false,
          });
        } catch (loginError: any) {
          // Se o login automático falhar, apenas armazenar usuário e deixar fazer login manual
          console.log('⚠️ Login automático falhou, usuário precisará fazer login manualmente');
          await AsyncStorage.setItem('authUser', JSON.stringify(user));
          
          set({
            user,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Conta criada! Faça login com suas credenciais.',
            isOffline: false,
          });
          throw loginError;
        }
      }
    } catch (error: any) {
      let errorMessage = 'Erro ao criar conta. Tente novamente.';

      console.log('❌ Erro de Registro:', {
        status: error.response?.status,
        message: error.message,
        responseData: error.response?.data,
      });

      if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Email ou dados inválidos!';
      } else if (error.response?.status === 409) {
        errorMessage = 'Este email já está cadastrado!';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (
        error.message.includes('Network') ||
        error.message.includes('timeout') ||
        error.code === 'ECONNREFUSED'
      ) {
        errorMessage = 'Erro de conexão com o servidor.';
      }

      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
        isOffline: false,
      });
      throw error;
    }
  },

  loadStoredAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userJson = await AsyncStorage.getItem('authUser');
      const isExpired = await isTokenExpired();

      if (token && userJson && !isExpired) {
        const user = JSON.parse(userJson);
        // Atualizar token no interceptador
        authService.setToken(token);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          isOffline: false,
        });
      } else if (token && userJson && isExpired) {
        // Token expirou, limpar dados
        authService.setToken(null);
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('authUser');
        await AsyncStorage.removeItem('tokenExpiration');
        set({
          isLoading: false,
          isAuthenticated: false,
          isOffline: false,
        });
      } else {
        set({ isLoading: false, isOffline: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
