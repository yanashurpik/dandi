import { showCreateToast, showDeleteToast, showSuccessToast } from './toasts';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  userId: string;
  type?: string;
  usage?: number;
}

export const createApiKey = async (
  name: string,
  type: 'production' | 'development',
  usageLimit: number | null,
  setApiKeys: (value: ApiKey[] | ((prev: ApiKey[]) => ApiKey[])) => void,
  setIsSubmitting: (value: boolean) => void,
  resetForm: () => void,
  setError: (error: string | null) => void
) => {
  if (!name.trim()) return;
  
  setIsSubmitting(true);
  
  try {
    const response = await fetch('/api/apikeys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        type,
        usageLimit,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const newKey = await response.json();
    const fullKey = newKey.key;
    newKey.key = fullKey.slice(0, 8) + '...' + fullKey.slice(-4);
    newKey.type = type === 'production' ? 'production' : 'dev';
    newKey.usage = 0;
    
    setApiKeys((prevKeys: ApiKey[]) => [...prevKeys, newKey]);
    resetForm();
    showCreateToast('API Key successfully created');
  } catch (err) {
    console.error('Failed to create API key:', err);
    setError('Failed to create API key. Please try again later.');
  } finally {
    setIsSubmitting(false);
  }
};

export const deleteApiKey = async (
  id: string,
  setApiKeys: (value: ApiKey[] | ((prev: ApiKey[]) => ApiKey[])) => void,
  setIsSubmitting: (value: boolean) => void,
  setError: (error: string | null) => void
) => {
  if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    const response = await fetch(`/api/apikeys/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    setApiKeys((prevKeys: ApiKey[]) => prevKeys.filter((key: ApiKey) => key.id !== id));
    showDeleteToast('API Key successfully deleted');
  } catch (err) {
    console.error('Failed to delete API key:', err);
    setError('Failed to delete API key. Please try again later.');
  } finally {
    setIsSubmitting(false);
  }
};

export const updateApiKey = async (
  editingKey: ApiKey,
  setApiKeys: (value: ApiKey[] | ((prev: ApiKey[]) => ApiKey[])) => void,
  setIsSubmitting: (value: boolean) => void,
  setEditingKey: (key: ApiKey | null) => void,
  setError: (error: string | null) => void
) => {
  if (!editingKey || !editingKey.name.trim()) return;
  
  setIsSubmitting(true);
  
  try {
    const response = await fetch(`/api/apikeys/${editingKey.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: editingKey.name }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const updatedKey = await response.json();
    
    // Preserve the original key and other fields
    setApiKeys((prevKeys: ApiKey[]) => 
      prevKeys.map((key: ApiKey) => 
        key.id === updatedKey.id 
          ? {
              ...key,
              name: updatedKey.name, // Only update the name
              createdAt: updatedKey.createdAt,
              lastUsed: updatedKey.lastUsed
            }
          : key
      )
    );
    setEditingKey(null);
  } catch (err) {
    console.error('Failed to update API key:', err);
    setError('Failed to update API key. Please try again later.');
  } finally {
    setIsSubmitting(false);
  }
};

export const copyApiKey = async (
  id: string,
  setCopiedKeyId: (id: string | null) => void,
  setError: (error: string | null) => void
) => {
  try {
    // Fetch the full key first
    const response = await fetch(`/api/apikeys/${id}?showFull=true`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch API key');
    }
    
    const data = await response.json();
    
    // Copy the full key to clipboard
    await navigator.clipboard.writeText(data.key);
    setCopiedKeyId(id);
    showSuccessToast('Copied API Key to clipboard');
    setTimeout(() => setCopiedKeyId(null), 2000);
  } catch (err) {
    console.error('Failed to copy API key:', err);
    setError('Failed to copy API key. Please try again.');
  }
};

export const viewApiKey = async (
  id: string,
  setLoadingKeyView: (value: boolean) => void,
  setFullApiKey: (key: string | null) => void,
  setViewingKeyId: (id: string | null) => void,
  setError: (error: string | null) => void
) => {
  setLoadingKeyView(true);
  
  try {
    const response = await fetch(`/api/apikeys/${id}?showFull=true`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    setFullApiKey(data.key);
    setViewingKeyId(id);
    
    setTimeout(() => {
      setViewingKeyId(null);
      setFullApiKey(null);
    }, 30000);
    
  } catch (err) {
    console.error('Failed to retrieve full API key:', err);
    setError('Failed to retrieve API key. Please try again later.');
  } finally {
    setLoadingKeyView(false);
  }
}; 