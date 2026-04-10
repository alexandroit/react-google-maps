import type { Cluster, ClusterStats, Renderer } from '@googlemaps/markerclusterer';

export type ClusterRendererContext = {
  cluster: Cluster;
  stats: ClusterStats;
  map: google.maps.Map;
  count: number;
  position: google.maps.LatLng;
  color: string;
  isAdvancedMarkerAvailable: boolean;
};

export type CreateClusterRendererOptions = {
  className?: string;
  useAdvancedMarker?: boolean;
  zIndexBase?: number;
  title?: string | ((context: ClusterRendererContext) => string);
  render?: (context: ClusterRendererContext) => HTMLElement | string;
  fallbackTextColor?: string;
  fallbackBorderColor?: string;
  color?: string | ((context: ClusterRendererContext) => string);
};

export function createClusterRenderer(options: CreateClusterRendererOptions = {}): Renderer {
  return {
    render(cluster, stats, map) {
      const count = cluster.count;
      const position = cluster.position;
      const contextBase = {
        cluster,
        stats,
        map,
        count,
        position,
        color: '',
        isAdvancedMarkerAvailable: false
      } satisfies Omit<ClusterRendererContext, 'color' | 'isAdvancedMarkerAvailable'> & {
        color: string;
        isAdvancedMarkerAvailable: boolean;
      };

      const color =
        typeof options.color === 'function'
          ? options.color(contextBase)
          : options.color || getDefaultClusterColor(count, stats);

      const isAdvancedMarkerAvailable =
        options.useAdvancedMarker !== false &&
        !!google.maps.marker?.AdvancedMarkerElement &&
        !!map.get('mapId');

      const context: ClusterRendererContext = {
        ...contextBase,
        color,
        isAdvancedMarkerAvailable
      };

      const title = typeof options.title === 'function' ? options.title(context) : options.title || `Cluster with ${count} markers`;
      const zIndex = (options.zIndexBase || 1000) + count;

      if (isAdvancedMarkerAvailable) {
        return new google.maps.marker.AdvancedMarkerElement({
          position,
          title,
          zIndex,
          content: buildAdvancedClusterContent(context, options)
        });
      }

      return new google.maps.Marker({
        position,
        title,
        zIndex,
        label: {
          text: String(count),
          color: options.fallbackTextColor || '#ffffff',
          fontSize: '12px',
          fontWeight: '700'
        },
        icon: {
          url: buildFallbackClusterSvg(
            color,
            options.fallbackBorderColor || 'rgba(255,255,255,0.92)'
          ),
          scaledSize: new google.maps.Size(46, 46)
        }
      });
    }
  };
}

function buildAdvancedClusterContent(
  context: ClusterRendererContext,
  options: CreateClusterRendererOptions
) {
  const customContent = options.render?.(context);
  if (customContent instanceof HTMLElement) {
    return customContent;
  }

  const element = document.createElement('div');
  element.className = options.className || 'stackline-cluster-badge';
  element.style.display = 'grid';
  element.style.gap = '2px';
  element.style.minWidth = '52px';
  element.style.padding = '10px 12px';
  element.style.borderRadius = '999px';
  element.style.background = context.color;
  element.style.color = '#ffffff';
  element.style.boxShadow = '0 12px 24px rgba(16, 32, 51, 0.18)';
  element.style.border = '2px solid rgba(255,255,255,0.88)';
  element.style.textAlign = 'center';
  element.style.fontFamily = 'Avenir Next, Segoe UI, sans-serif';

  const countNode = document.createElement('strong');
  countNode.textContent = String(context.count);
  countNode.style.fontSize = '14px';
  countNode.style.lineHeight = '1';

  const labelNode = document.createElement('span');
  labelNode.textContent = typeof customContent === 'string' ? customContent : 'markers';
  labelNode.style.fontSize = '10px';
  labelNode.style.opacity = '0.92';
  labelNode.style.lineHeight = '1';

  element.append(countNode, labelNode);
  return element;
}

function getDefaultClusterColor(count: number, stats: ClusterStats) {
  return count > Math.max(10, stats.clusters.markers.mean) ? '#d94b2b' : '#0d5c9e';
}

function buildFallbackClusterSvg(fill: string, stroke: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="28" fill="${fill}" stroke="${stroke}" stroke-width="4" />
    </svg>
  `;

  return `data:image/svg+xml;base64,${window.btoa(svg)}`;
}
