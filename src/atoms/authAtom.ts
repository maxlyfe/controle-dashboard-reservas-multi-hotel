import { atom } from 'jotai';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

// Check if there's a token in localStorage
const token = localStorage.getItem('auth_token');
const userStr = localStorage.getItem('auth_user');
let user: User | null = null;

try {
  if (userStr) {
    user = JSON.parse(userStr);
  }
} catch (e) {
  console.error('Failed to parse user from localStorage');
}

export const authAtom = atom<AuthState>({
  isAuthenticated: !!token,
  user,
  token,
});

// Login function - versão com verificação de senha
export const login = async (email: string, password: string): Promise<{ 
  success: boolean; 
  user?: User; 
  token?: string; 
  message?: string 
}> => {
  try {
    // Buscar usuário diretamente da tabela users
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    // Handle the case where no user is found (PGRST116 error)
    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          message: 'Email ou senha incorretos',
        };
      }
      // For other types of errors, re-throw them
      throw error;
    }
    
    // Verificar se o usuário existe e se a senha está correta
    if (data && data.password === password) {
      const userProfile: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role
      };
      
      // Gerar um token simples
      const token = `manual-token-${Date.now()}`;
      
      // Store in localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(userProfile));
      
      return {
        success: true,
        user: userProfile,
        token,
      };
    }
    
    return {
      success: false,
      message: 'Email ou senha incorretos',
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro ao fazer login',
    };
  }
};

// Logout function
export const logout = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
};