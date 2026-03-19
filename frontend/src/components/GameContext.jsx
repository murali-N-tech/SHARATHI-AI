import { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  // Load from localStorage or use defaults
  const [userStats, setUserStats] = useState(() => {
    const saved = localStorage.getItem('skillForge_stats');
    return saved ? JSON.parse(saved) : {
      xp: 12450,
      level: 5,
      coins: 450,
      streak: 12,
      badges: ['Fast Learner', 'Code Ninja', 'Bug Hunter'],
      name: 'Aditya Satvik Annapantula',
      avatar: 'https://i.pravatar.cc/150?u=1',
      notifications: true,
      darkMode: false
    };
  });

  // Save to localStorage whenever stats change
  useEffect(() => {
    localStorage.setItem('skillForge_stats', JSON.stringify(userStats));
  }, [userStats]);

  const addXp = (amount) => {
    setUserStats(prev => {
      const newXp = prev.xp + amount;
      const newLevel = Math.floor(newXp / 3000) + 1;
      return { ...prev, xp: newXp, level: newLevel };
    });
  };

  const updateProfile = (updates) => {
    setUserStats(prev => ({ ...prev, ...updates }));
  };

  return (
    <GameContext.Provider value={{ userStats, addXp, updateProfile }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);