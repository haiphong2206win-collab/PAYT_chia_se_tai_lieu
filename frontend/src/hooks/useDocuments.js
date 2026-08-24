// Phase 1 Mock Documents Hook - Retrieves mock documents
import { useState } from 'react';
import { MOCK_DOCUMENTS } from '../mock/documents';

export const useDocuments = () => {
  const [documents] = useState(MOCK_DOCUMENTS);
  const [loading] = useState(false);
  const [error] = useState(null);

  return { documents, loading, error };
};
