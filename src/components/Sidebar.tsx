import { Link } from 'react-router-dom';
import { useAtom } from 'jotai';
import { authAtom } from '../atoms/authAtom';
import { LayoutDashboard, Users, ChevronRight, ChevronLeft } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const [auth] = useAtom(authAtom);
  const [isHovering, setIsHovering] = useState(false);
  
  const handleMouseEnter = () => {
    setIsHovering(true);
    if (collapsed) {
      // Pequeno atraso para evitar expansão acidental
      setTimeout(() => {
        if (isHovering) {
          setCollapsed(false);
        }
      }, 300);
    }
  };
  
  const handleMouseLeave = () => {
    setIsHovering(false);
    if (!collapsed) {
      setTimeout(() => {
        if (!isHovering) {
          setCollapsed(true);
        }
      }, 300);
    }
  };
  
  return (
    <aside 
      className={`bg-white shadow-md h-screen fixed top-16 left-0 transition-all duration-300 z-10 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="h-full px-3 py-4 overflow-y-auto relative">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-5 bg-white rounded-full p-1 shadow-md text-gray-500 hover:text-blue-600"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        
        <ul className="space-y-2 font-medium">
          <li>
            <Link
              to="/"
              className={`flex items-center p-3 text-gray-900 rounded-lg hover:bg-gray-100 group ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <LayoutDashboard className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-blue-600" />
              {!collapsed && <span className="ml-3">Dashboard</span>}
            </Link>
          </li>
          
          {auth.isAuthenticated && auth.user?.role === 'admin' && (
            <li>
              <Link
                to="/users"
                className={`flex items-center p-3 text-gray-900 rounded-lg hover:bg-gray-100 group ${
                  collapsed ? 'justify-center' : ''
                }`}
              >
                <Users className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-blue-600" />
                {!collapsed && <span className="ml-3">Usuários</span>}
              </Link>
            </li>
          )}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
