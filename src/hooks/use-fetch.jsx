// hooks/use-fetch.jsx
import { useState, useEffect } from 'react';

export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url, options);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchData();
    }
  }, [url]);

  return { data, loading, error, refetch: () => {
    // Re-run the effect if needed
    useEffect(() => {}, [url]);
  } };
};

// For Supabase specific fetches
export const useSupabaseFetch = (table, query = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // We'll complete this after setting up Supabase
        // const { data: result, error } = await supabase
        //   .from(table)
        //   .select(query.select || '*')
        //   .eq(query.eq || {});
        
        // if (error) throw error;
        // setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [table, JSON.stringify(query)]);

  return { data, loading, error };
};