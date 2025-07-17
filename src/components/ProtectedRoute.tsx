import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { authAtom } from '../atoms/authAtom';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const [auth] = useAtom(authAtom);

  // Verificar autenticação
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar permissão de admin quando necessário
  if (adminOnly && auth.user?.role !== 'admin') {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-error-600 mb-2">Acesso Restrito</h2>
        <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        <p className="text-gray-600 mt-2">Esta área é exclusiva para administradores.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
