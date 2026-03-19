import { useState, useEffect } from 'react';
import { 
  Calculator, FlaskConical, Monitor, Code2, Network, BrainCircuit, 
  BarChart3, Globe, ShieldCheck, Cpu, Puzzle, Languages, Server, 
  Database, Leaf, Briefcase 
} from 'lucide-react';
import { DOMAINS as STATIC_DOMAINS } from '../utils/domains';
import { BACKEND_API } from '../lib/apiConfig';

// Map string names to actual components
const ICON_MAP = {
  'Calculator': Calculator,
  'FlaskConical': FlaskConical,
  'Monitor': Monitor,
  'Code2': Code2,
  'Network': Network,
  'BrainCircuit': BrainCircuit,
  'BarChart3': BarChart3,
  'Globe': Globe,
  'ShieldCheck': ShieldCheck,
  'Cpu': Cpu,
  'Puzzle': Puzzle,
  'Languages': Languages,
  'Server': Server,
  'Database': Database,
  'Leaf': Leaf,
  'Briefcase': Briefcase
};

export const useDomains = () => {
  const [domains, setDomains] = useState(STATIC_DOMAINS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await fetch(`${BACKEND_API}/api/domains`);
        if (!response.ok) throw new Error('Failed to fetch domains');
        
        const result = await response.json();
        
        if (result.data && Array.isArray(result.data)) {
          // Transform API data to match frontend structure (map icon string to component)
          const liveDomains = result.data.map(d => ({
            ...d,
            icon: ICON_MAP[d.icon] || Calculator // Fallback icon
          }));
          
          setDomains(liveDomains);
        }
      } catch (err) {
        console.error("Error loading domains:", err);
        setError(err);
        // We keep STATIC_DOMAINS as fallback if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchDomains();
  }, []);

  return { domains, loading, error };
};
