import { useAtom } from 'jotai';
import { Link, useNavigate } from 'react-router-dom';
import { authAtom, logout } from '../atoms/authAtom';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
  const [auth, setAuth] = useAtom(authAtom);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setAuth({
      isAuthenticated: false,
      user: null,
      token: null
    });
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Central de Reservas
              </span>
            </Link>
          </div>
          
          <div className="flex items-center">
            {auth.isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">{auth.user?.name}</span>
                  <span className="ml-1 text-xs text-gray-500">({auth.user?.role === 'admin' ? 'Admin' : 'Usuário'})</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <LogOut size={14} className="mr-1" />
                  Sair
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <User size={14} className="mr-1" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
