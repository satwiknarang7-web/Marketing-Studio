import { useState } from 'react';

interface UseGenerateOptions<TParams, TResult> {
  apiCall: (params: TParams) => Promise<TResult>;
  onSuccess?: (result: TResult) => void;
  onError?: (error: Error) => void;
}

export function useGenerate<TParams, TResult>({ apiCall, onSuccess, onError }: UseGenerateOptions<TParams, TResult>) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<TResult | null>(null);

  const generate = async (params: TParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiCall(params);
      setResult(res);
      if (onSuccess) onSuccess(res);
      return res;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Unknown error');
      setError(e);
      if (onError) onError(e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return { generate, isLoading, error, result, setResult };
}
