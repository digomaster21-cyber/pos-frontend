// frontend/src/hooks/useApi.ts
import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';

interface UseApiOptions {
  showSuccess?: boolean;
  showError?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T = any>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (
      apiCall: () => Promise<T>,
      options: UseApiOptions = {}
    ): Promise<T | null> => {
      const { showSuccess = false, showError = true, successMessage, errorMessage } = options;

      setState({ data: null, loading: true, error: null });

      try {
        const result = await apiCall();
        setState({ data: result, loading: false, error: null });
        
        if (showSuccess) {
          message.success(successMessage || 'Operation completed successfully');
        }
        
        return result;
      } catch (error: any) {
        const errorMsg = error.response?.data?.detail || error.message || 'An error occurred';
        setState({ data: null, loading: false, error: errorMsg });
        
        if (showError) {
          message.error(errorMessage || errorMsg);
        }
        
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
    isLoading: state.loading,
    isError: !!state.error,
    hasData: !!state.data,
  };
}

export function useFetch<T = any>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = [],
  options?: UseApiOptions
) {
  const { execute, ...state } = useApi<T>();
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!hasFetched) {
      execute(fetchFn, options);
      setHasFetched(true);
    }
  }, dependencies);

  return { ...state, refetch: () => execute(fetchFn, options) };
}

export function useMutation<T = any, P = any>(
  mutationFn: (payload: P) => Promise<T>
) {
  const { execute, ...state } = useApi<T>();

  const mutate = useCallback(
    async (payload: P, options?: UseApiOptions) => {
      return execute(() => mutationFn(payload), options);
    },
    [execute, mutationFn]
  );

  return { mutate, ...state };
}