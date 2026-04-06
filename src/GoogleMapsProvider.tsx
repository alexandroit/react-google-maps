import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { GoogleMapsApiContext, type GoogleMapsStatus } from './internal';
import { loadGoogleMapsApi, type GoogleMapsApiLoadOptions } from './loadGoogleMapsApi';

export type GoogleMapsProviderProps = GoogleMapsApiLoadOptions & {
  children: ReactNode;
};

export function GoogleMapsProvider({ children, ...options }: GoogleMapsProviderProps) {
  const [status, setStatus] = useState<GoogleMapsStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [googleApi, setGoogleApi] = useState<typeof google | null>(() =>
    typeof window !== 'undefined' && window.google?.maps ? window.google : null
  );

  const serializedOptions = JSON.stringify({
    ...options,
    libraries: options.libraries || [],
    mapIds: options.mapIds || []
  });

  useEffect(() => {
    let cancelled = false;

    setStatus((current) => (current === 'ready' ? current : 'loading'));
    setError(null);

    loadGoogleMapsApi(options)
      .then((googleNamespace) => {
        if (cancelled) {
          return;
        }
        setGoogleApi(googleNamespace);
        setStatus('ready');
      })
      .catch((nextError) => {
        if (cancelled) {
          return;
        }
        setError(nextError instanceof Error ? nextError : new Error(String(nextError)));
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [serializedOptions]);

  const value = useMemo(
    () => ({
      status,
      error,
      google: googleApi,
      options
    }),
    [status, error, googleApi, serializedOptions]
  );

  return <GoogleMapsApiContext.Provider value={value}>{children}</GoogleMapsApiContext.Provider>;
}
