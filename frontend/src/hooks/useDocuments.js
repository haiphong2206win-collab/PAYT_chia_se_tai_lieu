// Phase 1 Documents Hook - Retrieves documents placeholder
import { useState } from 'react';

export const useDocuments = () => {
  const [documents] = useState([]);
  const [loading] = useState(false);
  const [error] = useState(null);

  return { documents, loading, error };
};
