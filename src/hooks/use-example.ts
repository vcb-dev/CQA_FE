import { useState, useEffect } from 'react';

export const useExample = () => {
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    // Demo hook logic
    setData('Hello from example hook');
  }, []);

  return { data };
};
