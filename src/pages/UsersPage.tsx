import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { authAtom } from '../atoms/authAtom';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, Loader2, Eye, EyeOff } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  password?: string;
  created_at: string;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

const initialFormData: UserFormData = {
  name: '',
  email: '',
  password: '',
  role: 'user'
};

const UsersPage = () => {
  const [auth] = useAtom(authAtom);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      setError(null);
    } catch (err) {
      setError('Falha ao carregar usuários');
      console.error('Erro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (editingUserId) {
        // Atualizar usuário existente
        const updateData: any = {
          name: formData.name,
          role: formData.role
        };
        
        // Só atualiza a senha se uma nova senha foi fornecida
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        const { error: updateError } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', editingUserId);

        if (updateError) throw updateError;
      } else {
        // Criar novo usuário diretamente na tabela users
        // Gerar um UUID para o usuário
        const userId = crypto.randomUUID();
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role
          });

        if (insertError) throw insertError;
      }

      setShowForm(false);
      setFormData(initialFormData);
      setEditingUserId(null);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro');
      console.error('Erro:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Não preencher a senha atual por segurança
      role: user.role
    });
    setEditingUserId(user.id);
    setShowForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      // Verificar se não está tentando excluir o próprio usuário
      if (userId === auth.user?.id) {
        throw new Error('Você não pode excluir seu próprio usuário');
      }
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao excluir usuário');
      console.error('Erro:', err);
    }
  };

  // Verificar se o usuário é admin
  if (auth.user?.role !== 'admin') {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-error-600 mb-2">Acesso Restrito</h2>
        <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        <p className="text-gray-600 mt-2">Esta área é exclusiva para administradores.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-600">
            Gerenciamento de Usuários
          </h1>
          <p className="text-sm text-gray-500">Gerencie usuários do sistema e suas permissões</p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setFormData(initialFormData);
              setEditingUserId(null);
              setShowForm(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Adicionar Usuário</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-error-50 text-error-700 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">
            {editingUserId ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="label">Nome</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>

            {!editingUserId && (
              <div>
                <label htmlFor="email" className="label">Email</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="label">
                {editingUserId ? 'Nova Senha (deixe em branco para manter a atual)' : 'Senha'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input pr-10"
                  required={!editingUserId}
                  minLength={4}
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {!editingUserId && (
                <p className="text-xs text-gray-500 mt-1">Mínimo de 4 caracteres</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="label">Função</label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                className="select"
                required
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData(initialFormData);
                  setEditingUserId(null);
                }}
                className="btn-outline"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Processando...
                  </span>
                ) : (
                  editingUserId ? 'Atualizar Usuário' : 'Criar Usuário'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">Nenhum usuário encontrado</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Função
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Criação
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-primary-100 text-primary-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-error-600 hover:text-error-900"
                        title="Excluir"
                        disabled={user.id === auth.user?.id}
                      >
                        <Trash2 size={16} className={user.id === auth.user?.id ? 'opacity-30' : ''} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
