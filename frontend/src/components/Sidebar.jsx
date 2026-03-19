import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Trophy, 
  Award, 
  Settings, 
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';

const Sidebar = ({ isOpen, toggle }) => {
  
  const links = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
    // "Learning Path" has been removed here
    { icon: Users, label: 'Workspace', path: '/student/workspace' },
    { icon: Trophy, label: 'Leaderboard', path: '/student/leaderboard' },
    { icon: Award, label: 'Certificates', path: '/student/certificates' },
    { icon: Settings, label: 'Settings', path: '/student/settings' },
  ];

  return (
    <aside 
      className={`fixed left-0 top-20 h-[calc(100vh-80px)] bg-brand-900 text-white flex flex-col z-40 transition-all duration-300 shadow-xl ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar pt-8">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium duration-200
              ${isActive 
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50 translate-x-1' 
                : 'text-brand-200 hover:bg-brand-800 hover:text-white hover:translate-x-1'}
              ${!isOpen ? 'justify-center' : ''}
            `}
            title={!isOpen ? link.label : ''}
          >
            {({ isActive }) => (
              <>
                <link.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {isOpen && <span className="text-sm tracking-wide">{link.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Toggle Button */}
      <button
        onClick={toggle}
        className="absolute -right-3 top-6 bg-brand-500 text-white p-1.5 rounded-full hover:bg-brand-400 transition-all shadow-lg border-2 border-brand-900"
      >
        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>
    </aside>
  );
};

export default Sidebar;