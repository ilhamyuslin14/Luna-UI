import { useState, useEffect } from 'react';
import { searchUniversal } from '../../services/searchService.js';

export default function useUniversalSearch(companyId) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('kandidat');
  const [results, setResults] = useState({ kandidat: [], seleksi: [], departemen: [] });

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults({ kandidat: [], seleksi: [], departemen: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchUniversal(companyId, q);
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, companyId]);

  return { query, setQuery, isLoading, activeTab, setActiveTab, results };
}
