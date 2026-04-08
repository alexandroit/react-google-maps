export type GoogleMapsApiLoadOptions = {
  apiKey?: string;
  version?: string;
  language?: string;
  region?: string;
  libraries?: string[];
  mapIds?: string[];
  authReferrerPolicy?: string;
  channel?: string;
  solutionChannel?: string;
  nonce?: string;
};

const DEFAULT_LIBRARIES = [] as const;

let loaderPromise: Promise<typeof google> | null = null;
let loadedOptionsKey: string | null = null;
type CallbackWindow = Window & { [key: string]: (() => void) | undefined };

export function getDefaultGoogleMapsLibraries() {
  return [...DEFAULT_LIBRARIES];
}

export function loadGoogleMapsApi(options: GoogleMapsApiLoadOptions): Promise<typeof google> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('@stackline/react-google-maps can only load the Google Maps API in a browser environment.'));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  const normalizedOptions = normalizeLoaderOptions(options);
  const nextKey = JSON.stringify(normalizedOptions);

  if (loaderPromise) {
    if (loadedOptionsKey && loadedOptionsKey !== nextKey) {
      console.warn(
        '@stackline/react-google-maps only loads the Google Maps JavaScript API once per page. ' +
          'Ignoring subsequent loader options and reusing the first loaded configuration.'
      );
    }
    return loaderPromise;
  }

  loadedOptionsKey = nextKey;

  loaderPromise = new Promise<typeof google>((resolve, reject) => {
    const callbackName = '__revivejsReactGoogleMapsInit';
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-revivejs-google-maps-loader="true"]');

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.google?.maps) {
          resolve(window.google);
        } else {
          reject(new Error('Google Maps script loaded but the google.maps namespace is still unavailable.'));
        }
      });
      existingScript.addEventListener('error', () => reject(new Error('The Google Maps JavaScript API script failed to load.')));
      return;
    }

    const params = new URLSearchParams();
    params.set('key', normalizedOptions.apiKey ?? '');
    params.set('v', normalizedOptions.version);
    params.set('loading', 'async');
    params.set('callback', callbackName);

    if (normalizedOptions.language) {
      params.set('language', normalizedOptions.language);
    }
    if (normalizedOptions.region) {
      params.set('region', normalizedOptions.region);
    }
    if (normalizedOptions.libraries.length) {
      params.set('libraries', normalizedOptions.libraries.join(','));
    }
    if (normalizedOptions.mapIds.length) {
      params.set('map_ids', normalizedOptions.mapIds.join(','));
    }
    if (normalizedOptions.authReferrerPolicy) {
      params.set('auth_referrer_policy', normalizedOptions.authReferrerPolicy);
    }
    if (normalizedOptions.channel) {
      params.set('channel', normalizedOptions.channel);
    }
    if (normalizedOptions.solutionChannel) {
      params.set('solution_channel', normalizedOptions.solutionChannel);
    }

    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.dataset.revivejsGoogleMapsLoader = 'true';
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;

    if (normalizedOptions.nonce) {
      script.nonce = normalizedOptions.nonce;
    }

    (window as unknown as CallbackWindow)[callbackName] = () => {
      delete (window as unknown as CallbackWindow)[callbackName];
      if (window.google?.maps) {
        resolve(window.google);
      } else {
        reject(new Error('Google Maps callback fired but the google.maps namespace is unavailable.'));
      }
    };

    script.onerror = () => {
      loaderPromise = null;
      loadedOptionsKey = null;
      delete (window as unknown as CallbackWindow)[callbackName];
      reject(new Error('The Google Maps JavaScript API script failed to load.'));
    };

    document.head.appendChild(script);
  });

  return loaderPromise;
}

type NormalizedGoogleMapsApiLoadOptions = Omit<
  GoogleMapsApiLoadOptions,
  'version' | 'libraries' | 'mapIds'
> & {
  version: string;
  libraries: string[];
  mapIds: string[];
};

function normalizeLoaderOptions(options: GoogleMapsApiLoadOptions): NormalizedGoogleMapsApiLoadOptions {
  return {
    ...options,
    version: options.version || 'weekly',
    libraries: Array.from(new Set([...(options.libraries || []), ...DEFAULT_LIBRARIES])).sort(),
    mapIds: Array.from(new Set(options.mapIds || [])).sort()
  };
}
