type ApiClientConfig = {
  baseUrl: string;
  getAuthToken?: () => string | null;
  fetchFn?: typeof fetch;
};

export function createApiClient(config: ApiClientConfig) {
  const fetchFn = config.fetchFn ?? fetch;

  const apiCall = async <T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> => {
    const token = config.getAuthToken?.();

    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const res = await fetchFn(`${config.baseUrl}${endpoint}`, {
      method,
      ...options,
      headers,
    });

    const data = await res.json();

    if (!data.status) {
      throw new Error(data.message);
    }

    return data.data;
  };

  return {
    apiCall,
  };
}
