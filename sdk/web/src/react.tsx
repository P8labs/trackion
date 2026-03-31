import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  Component,
  type ErrorInfo,
} from "react";
import {
  createTrackionClient,
  TrackionClient,
  type RuntimePayload,
  type TrackionClientOptions,
  type TrackionJSON,
  type ErrorContext,
} from "./core";

const TrackionContext = createContext<TrackionClient | null>(null);

export interface TrackionProviderProps {
  options: TrackionClientOptions;
  children: ReactNode;
}

export function TrackionProvider({ options, children }: TrackionProviderProps) {
  const clientRef = useRef<TrackionClient | null>(null);

  if (!clientRef.current) {
    clientRef.current = createTrackionClient(options);
  }

  useEffect(() => {
    return () => {
      clientRef.current?.shutdown();
    };
  }, []);

  return (
    <TrackionContext.Provider value={clientRef.current}>
      {children}
    </TrackionContext.Provider>
  );
}

export function useTrackion(): TrackionClient {
  const client = useContext(TrackionContext);
  if (!client) {
    throw new Error("useTrackion must be used inside <TrackionProvider>");
  }
  return client;
}

export function useFeatureFlag(flagKey: string): boolean {
  const client = useTrackion();
  const [enabled, setEnabled] = useState(() => client.isEnabled(flagKey));

  useEffect(() => {
    setEnabled(client.isEnabled(flagKey));
    const unsubscribe = client.subscribeRuntime((runtime) => {
      setEnabled(Boolean(runtime.flags[flagKey]));
    });
    return unsubscribe;
  }, [client, flagKey]);

  return enabled;
}

export function useRemoteConfig<T extends TrackionJSON = TrackionJSON>(
  configKey: string,
  fallback?: T,
): T | undefined {
  const client = useTrackion();
  const [value, setValue] = useState<T | undefined>(() =>
    client.getConfig<T>(configKey, fallback),
  );

  useEffect(() => {
    setValue(client.getConfig<T>(configKey, fallback));
    const unsubscribe = client.subscribeRuntime((runtime) => {
      if (Object.prototype.hasOwnProperty.call(runtime.config, configKey)) {
        setValue(runtime.config[configKey] as T);
      } else {
        setValue(fallback);
      }
    });
    return unsubscribe;
  }, [client, configKey, fallback]);

  return value;
}

export async function refreshTrackionRuntime(
  client: TrackionClient,
): Promise<RuntimePayload> {
  return client.refreshRuntime({ force: true });
}

/**
 * Hook to get the captureError function
 * Usage: const captureError = useCaptureError();
 *        captureError(new Error("Something went wrong"), { userId: "123" });
 */
export function useCaptureError() {
  const client = useTrackion();
  return (error: Error | string | unknown, context?: ErrorContext) => {
    void client.captureError(error, context);
  };
}

/**
 * ErrorBoundary component props
 */
export interface TrackionErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  context?: ErrorContext;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React ErrorBoundary that automatically captures errors to Trackion
 * 
 * Usage:
 * ```tsx
 * <TrackionErrorBoundary fallback={<ErrorFallback />}>
 *   <App />
 * </TrackionErrorBoundary>
 * ```
 */
export class TrackionErrorBoundary extends Component<
  TrackionErrorBoundaryProps,
  ErrorBoundaryState
> {
  static contextType = TrackionContext;
  declare context: TrackionClient | null;

  constructor(props: TrackionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Capture error to Trackion
    if (this.context) {
      const context: ErrorContext = {
        ...this.props.context,
        componentStack: errorInfo.componentStack || "unknown",
        errorBoundary: true,
      };
      void this.context.captureError(error, context);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props;

      if (typeof fallback === "function") {
        return fallback(this.state.error, this.resetError);
      }

      if (fallback) {
        return fallback;
      }

      // Default fallback
      return (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h2>Something went wrong</h2>
          <button onClick={this.resetError}>Try again</button>
        </div>
      );
    }

    return this.props.children;
  }
}
