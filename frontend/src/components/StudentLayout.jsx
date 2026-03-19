import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
// Removed GameProvider import since it's in App.jsx now

const StudentLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    // Removed <GameProvider> wrapper
    <div className="flex min-h-[calc(100vh-80px)]"> 
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;