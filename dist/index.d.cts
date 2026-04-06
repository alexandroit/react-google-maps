import * as react_jsx_runtime from 'react/jsx-runtime';
import * as react from 'react';
import { ReactNode, HTMLAttributes, CSSProperties } from 'react';
import { Cluster, ClusterStats, Renderer, Algorithm, MarkerClusterer } from '@googlemaps/markerclusterer';

type GoogleMapsApiLoadOptions = {
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
declare function getDefaultGoogleMapsLibraries(): never[];
declare function loadGoogleMapsApi(options: GoogleMapsApiLoadOptions): Promise<typeof google>;

type GoogleMapsProviderProps = GoogleMapsApiLoadOptions & {
    children: ReactNode;
};
declare function GoogleMapsProvider({ children, ...options }: GoogleMapsProviderProps): react_jsx_runtime.JSX.Element;

type ClusterRendererContext = {
    cluster: Cluster;
    stats: ClusterStats;
    map: google.maps.Map;
    count: number;
    position: google.maps.LatLng;
    color: string;
    isAdvancedMarkerAvailable: boolean;
};
type CreateClusterRendererOptions = {
    className?: string;
    useAdvancedMarker?: boolean;
    zIndexBase?: number;
    title?: string | ((context: ClusterRendererContext) => string);
    render?: (context: ClusterRendererContext) => HTMLElement | string;
    fallbackTextColor?: string;
    fallbackBorderColor?: string;
    color?: string | ((context: ClusterRendererContext) => string);
};
declare function createClusterRenderer(options?: CreateClusterRendererOptions): Renderer;

type GoogleMapsStatus = 'idle' | 'loading' | 'ready' | 'error';
type MarkerLike = google.maps.Marker | google.maps.marker.AdvancedMarkerElement;

type LatLngLike = google.maps.LatLngLiteral | google.maps.LatLng;

type GoogleMapHandle = {
    map: google.maps.Map | null;
    fitBounds: (bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral) => void;
    panBy: (x: number, y: number) => void;
    panTo: (position: google.maps.LatLng | google.maps.LatLngLiteral) => void;
    panToBounds: (bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral, padding?: number | google.maps.Padding) => void;
    setZoom: (zoom: number) => void;
    setCenter: (position: google.maps.LatLng | google.maps.LatLngLiteral) => void;
    setOptions: (options: google.maps.MapOptions) => void;
    getBounds: () => google.maps.LatLngBounds | null;
    getCenter: () => google.maps.LatLng | undefined;
    getClickableIcons: () => boolean | undefined;
    getHeading: () => number | undefined;
    getMapTypeId: () => google.maps.MapTypeId | string | undefined;
    getProjection: () => google.maps.Projection | null;
    getStreetView: () => google.maps.StreetViewPanorama | null;
    getTilt: () => number | undefined;
    getZoom: () => number | undefined;
    controls: () => google.maps.MVCArray<Node>[] | null;
    data: () => google.maps.Data | null;
    mapTypes: () => google.maps.MapTypeRegistry | null;
    overlayMapTypes: () => google.maps.MVCArray<google.maps.MapType | null> | null;
};
type GoogleMapProps = Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> & {
    children?: ReactNode;
    center?: LatLngLike;
    zoom?: number;
    mapId?: string;
    options?: google.maps.MapOptions;
    width?: CSSProperties['width'];
    height?: CSSProperties['height'];
    loadingFallback?: ReactNode;
    errorFallback?: ReactNode;
    onMapLoad?: (map: google.maps.Map) => void;
    onMapUnmount?: (map: google.maps.Map) => void;
    onClick?: (event: google.maps.MapMouseEvent | google.maps.IconMouseEvent) => void;
    onDblClick?: (event: google.maps.MapMouseEvent) => void;
    onDrag?: () => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    onIdle?: () => void;
    onBoundsChanged?: () => void;
    onCenterChanged?: () => void;
    onHeadingChanged?: () => void;
    onMapTypeIdChanged?: () => void;
    onMouseMove?: (event: google.maps.MapMouseEvent) => void;
    onMouseOut?: (event: google.maps.MapMouseEvent) => void;
    onMouseOver?: (event: google.maps.MapMouseEvent) => void;
    onProjectionChanged?: () => void;
    onRightClick?: (event: google.maps.MapMouseEvent) => void;
    onTilesLoaded?: () => void;
    onTiltChanged?: () => void;
    onZoomChanged?: () => void;
};
declare const GoogleMap: react.ForwardRefExoticComponent<Omit<HTMLAttributes<HTMLDivElement>, "onClick"> & {
    children?: ReactNode;
    center?: LatLngLike;
    zoom?: number;
    mapId?: string;
    options?: google.maps.MapOptions;
    width?: CSSProperties["width"];
    height?: CSSProperties["height"];
    loadingFallback?: ReactNode;
    errorFallback?: ReactNode;
    onMapLoad?: (map: google.maps.Map) => void;
    onMapUnmount?: (map: google.maps.Map) => void;
    onClick?: (event: google.maps.MapMouseEvent | google.maps.IconMouseEvent) => void;
    onDblClick?: (event: google.maps.MapMouseEvent) => void;
    onDrag?: () => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    onIdle?: () => void;
    onBoundsChanged?: () => void;
    onCenterChanged?: () => void;
    onHeadingChanged?: () => void;
    onMapTypeIdChanged?: () => void;
    onMouseMove?: (event: google.maps.MapMouseEvent) => void;
    onMouseOut?: (event: google.maps.MapMouseEvent) => void;
    onMouseOver?: (event: google.maps.MapMouseEvent) => void;
    onProjectionChanged?: () => void;
    onRightClick?: (event: google.maps.MapMouseEvent) => void;
    onTilesLoaded?: () => void;
    onTiltChanged?: () => void;
    onZoomChanged?: () => void;
} & react.RefAttributes<GoogleMapHandle>>;

type MapMarkerHandle = {
    marker: google.maps.Marker | null;
    getAnimation: () => google.maps.Animation | null | undefined;
    getClickable: () => boolean | undefined;
    getDraggable: () => boolean | undefined;
    getIcon: () => string | google.maps.Icon | google.maps.Symbol | null | undefined;
    getLabel: () => string | google.maps.MarkerLabel | null | undefined;
    getPosition: () => google.maps.LatLng | null | undefined;
    getTitle: () => string | null | undefined;
    getVisible: () => boolean | undefined;
    getZIndex: () => number | null | undefined;
    setAnimation: (animation: google.maps.Animation | null) => void;
    setOptions: (options: google.maps.MarkerOptions) => void;
    setPosition: (position: google.maps.LatLng | google.maps.LatLngLiteral) => void;
    setTitle: (title: string) => void;
    setVisible: (visible: boolean) => void;
    setZIndex: (zIndex: number) => void;
};
type MapAdvancedMarkerHandle = {
    marker: google.maps.marker.AdvancedMarkerElement | null;
    content: HTMLElement | null;
    setMap: (map: google.maps.Map | null) => void;
    setPosition: (position: google.maps.LatLng | google.maps.LatLngLiteral) => void;
    setZIndex: (zIndex: number) => void;
};
type MapInfoWindowHandle = {
    infoWindow: google.maps.InfoWindow | null;
    open: (anchor?: MarkerLike | null) => void;
    close: () => void;
    getContent: () => string | Node | null | undefined;
    getPosition: () => google.maps.LatLng | null | undefined;
    getZIndex: () => number | undefined;
    setContent: (content: string | Element | Text) => void;
    setPosition: (position: google.maps.LatLng | google.maps.LatLngLiteral) => void;
    setZIndex: (zIndex: number) => void;
};
type MapMarkerClustererHandle = {
    clusterer: MarkerClusterer | null;
    addMarker: (marker: MarkerLike, noDraw?: boolean) => void;
    addMarkers: (markers: MarkerLike[], noDraw?: boolean) => void;
    removeMarker: (marker: MarkerLike, noDraw?: boolean) => boolean;
    clearMarkers: (noDraw?: boolean) => void;
    render: () => void;
};
type MapMarkerProps = {
    position: LatLngLike;
    title?: string;
    label?: string | google.maps.MarkerLabel;
    clickable?: boolean;
    draggable?: boolean;
    icon?: string | google.maps.Icon | google.maps.Symbol;
    visible?: boolean;
    zIndex?: number;
    animation?: google.maps.Animation;
    options?: google.maps.MarkerOptions;
    onLoad?: (marker: google.maps.Marker) => void;
    onUnmount?: (marker: google.maps.Marker) => void;
    onClick?: (event: google.maps.MapMouseEvent) => void;
    onDblClick?: (event: google.maps.MapMouseEvent) => void;
    onDrag?: (event: google.maps.MapMouseEvent) => void;
    onDragEnd?: (event: google.maps.MapMouseEvent) => void;
    onDragStart?: (event: google.maps.MapMouseEvent) => void;
    onMouseDown?: (event: google.maps.MapMouseEvent) => void;
    onMouseOut?: (event: google.maps.MapMouseEvent) => void;
    onMouseOver?: (event: google.maps.MapMouseEvent) => void;
    onMouseUp?: (event: google.maps.MapMouseEvent) => void;
    onRightClick?: (event: google.maps.MapMouseEvent) => void;
};
type MapAdvancedMarkerProps = {
    position: LatLngLike;
    title?: string;
    zIndex?: number;
    gmpClickable?: boolean;
    gmpDraggable?: boolean;
    options?: google.maps.marker.AdvancedMarkerElementOptions;
    collisionBehavior?: google.maps.CollisionBehavior;
    children?: ReactNode;
    onLoad?: (marker: google.maps.marker.AdvancedMarkerElement) => void;
    onUnmount?: (marker: google.maps.marker.AdvancedMarkerElement) => void;
    onClick?: (event: google.maps.MapMouseEvent) => void;
    onDragStart?: (event: google.maps.MapMouseEvent) => void;
    onDrag?: (event: google.maps.MapMouseEvent) => void;
    onDragEnd?: (event: google.maps.MapMouseEvent) => void;
};
type MapInfoWindowProps = {
    anchor?: MarkerLike | null;
    open?: boolean;
    position?: LatLngLike;
    zIndex?: number;
    options?: google.maps.InfoWindowOptions;
    children?: ReactNode;
    onLoad?: (infoWindow: google.maps.InfoWindow) => void;
    onUnmount?: (infoWindow: google.maps.InfoWindow) => void;
    onCloseClick?: () => void;
    onDomReady?: () => void;
    onContentChanged?: () => void;
    onPositionChanged?: () => void;
    onZIndexChanged?: () => void;
};
type MapMarkerClustererProps = {
    children?: ReactNode;
    algorithm?: Algorithm;
    renderer?: Renderer;
    onLoad?: (clusterer: MarkerClusterer) => void;
    onUnmount?: (clusterer: MarkerClusterer) => void;
    onClusterClick?: (event: google.maps.MapMouseEvent, cluster: Cluster, map: google.maps.Map) => void;
};
declare const MapMarker: react.ForwardRefExoticComponent<MapMarkerProps & react.RefAttributes<MapMarkerHandle>>;
declare const MapAdvancedMarker: react.ForwardRefExoticComponent<MapAdvancedMarkerProps & react.RefAttributes<MapAdvancedMarkerHandle>>;
declare const MapInfoWindow: react.ForwardRefExoticComponent<MapInfoWindowProps & react.RefAttributes<MapInfoWindowHandle>>;
declare const MapMarkerClusterer: react.ForwardRefExoticComponent<MapMarkerClustererProps & react.RefAttributes<MapMarkerClustererHandle>>;

type ShapeBaseProps<T> = {
    options?: T;
    onLoad?: (instance: any) => void;
    onUnmount?: (instance: any) => void;
    onClick?: (event: google.maps.MapMouseEvent) => void;
    onDblClick?: (event: google.maps.MapMouseEvent) => void;
    onMouseDown?: (event: google.maps.MapMouseEvent) => void;
    onMouseMove?: (event: google.maps.MapMouseEvent) => void;
    onMouseOut?: (event: google.maps.MapMouseEvent) => void;
    onMouseOver?: (event: google.maps.MapMouseEvent) => void;
    onMouseUp?: (event: google.maps.MapMouseEvent) => void;
    onRightClick?: (event: google.maps.MapMouseEvent) => void;
    onDrag?: (event: google.maps.MapMouseEvent) => void;
    onDragEnd?: (event: google.maps.MapMouseEvent) => void;
    onDragStart?: (event: google.maps.MapMouseEvent) => void;
};
type MapPolylineProps = ShapeBaseProps<google.maps.PolylineOptions> & {
    path: LatLngLike[];
};
type MapPolygonProps = ShapeBaseProps<google.maps.PolygonOptions> & {
    paths: LatLngLike[] | LatLngLike[][];
};
type MapRectangleProps = ShapeBaseProps<google.maps.RectangleOptions> & {
    bounds: google.maps.LatLngBoundsLiteral;
};
type MapCircleProps = ShapeBaseProps<google.maps.CircleOptions> & {
    center: LatLngLike;
    radius: number;
};
type MapGroundOverlayProps = {
    url: string;
    bounds: google.maps.LatLngBoundsLiteral;
    opacity?: number;
    clickable?: boolean;
    onLoad?: (overlay: google.maps.GroundOverlay) => void;
    onUnmount?: (overlay: google.maps.GroundOverlay) => void;
    onClick?: (event: google.maps.MapMouseEvent) => void;
};
type MapControlProps = {
    position: google.maps.ControlPosition;
    children: ReactNode;
    index?: number;
};
type MapPolylineHandle = {
    polyline: google.maps.Polyline | null;
    getPath: () => google.maps.MVCArray<google.maps.LatLng> | null;
    getVisible: () => boolean | undefined;
    getDraggable: () => boolean | undefined;
    getEditable: () => boolean | undefined;
    setPath: (path: LatLngLike[]) => void;
    setOptions: (options: google.maps.PolylineOptions) => void;
};
type MapPolygonHandle = {
    polygon: google.maps.Polygon | null;
    getPath: () => google.maps.MVCArray<google.maps.LatLng> | null;
    getPaths: () => google.maps.MVCArray<google.maps.MVCArray<google.maps.LatLng>> | null;
    getVisible: () => boolean | undefined;
    getDraggable: () => boolean | undefined;
    getEditable: () => boolean | undefined;
    setPaths: (paths: LatLngLike[] | LatLngLike[][]) => void;
    setOptions: (options: google.maps.PolygonOptions) => void;
};
type MapRectangleHandle = {
    rectangle: google.maps.Rectangle | null;
    getBounds: () => google.maps.LatLngBounds | null;
    getVisible: () => boolean | undefined;
    getDraggable: () => boolean | undefined;
    getEditable: () => boolean | undefined;
    setBounds: (bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral) => void;
    setOptions: (options: google.maps.RectangleOptions) => void;
};
type MapCircleHandle = {
    circle: google.maps.Circle | null;
    getBounds: () => google.maps.LatLngBounds | null;
    getCenter: () => google.maps.LatLng | null;
    getRadius: () => number | undefined;
    getVisible: () => boolean | undefined;
    getDraggable: () => boolean | undefined;
    getEditable: () => boolean | undefined;
    setCenter: (center: google.maps.LatLng | google.maps.LatLngLiteral) => void;
    setRadius: (radius: number) => void;
    setOptions: (options: google.maps.CircleOptions) => void;
};
type MapGroundOverlayHandle = {
    overlay: google.maps.GroundOverlay | null;
    getBounds: () => google.maps.LatLngBounds | null;
    getOpacity: () => number | null | undefined;
    getUrl: () => string | undefined;
    setOpacity: (opacity: number) => void;
    setMap: (map: google.maps.Map | null) => void;
};
declare const MapPolyline: react.ForwardRefExoticComponent<ShapeBaseProps<google.maps.PolylineOptions> & {
    path: LatLngLike[];
} & react.RefAttributes<MapPolylineHandle>>;
declare const MapPolygon: react.ForwardRefExoticComponent<ShapeBaseProps<google.maps.PolygonOptions> & {
    paths: LatLngLike[] | LatLngLike[][];
} & react.RefAttributes<MapPolygonHandle>>;
declare const MapRectangle: react.ForwardRefExoticComponent<ShapeBaseProps<google.maps.RectangleOptions> & {
    bounds: google.maps.LatLngBoundsLiteral;
} & react.RefAttributes<MapRectangleHandle>>;
declare const MapCircle: react.ForwardRefExoticComponent<ShapeBaseProps<google.maps.CircleOptions> & {
    center: LatLngLike;
    radius: number;
} & react.RefAttributes<MapCircleHandle>>;
declare const MapGroundOverlay: react.ForwardRefExoticComponent<MapGroundOverlayProps & react.RefAttributes<MapGroundOverlayHandle>>;
declare function MapControl({ position, children, index }: MapControlProps): react.ReactPortal | null;

type HeatmapDatum = LatLngLike | google.maps.visualization.WeightedLocation | {
    location: LatLngLike;
    weight: number;
};
type MapTrafficLayerHandle = {
    layer: google.maps.TrafficLayer | null;
    setMap: (map: google.maps.Map | null) => void;
    setOptions: (options: google.maps.TrafficLayerOptions) => void;
};
type MapTransitLayerHandle = {
    layer: google.maps.TransitLayer | null;
    setMap: (map: google.maps.Map | null) => void;
};
type MapBicyclingLayerHandle = {
    layer: google.maps.BicyclingLayer | null;
    setMap: (map: google.maps.Map | null) => void;
};
type MapKmlLayerHandle = {
    layer: google.maps.KmlLayer | null;
    getDefaultViewport: () => google.maps.LatLngBounds | null;
    getMetadata: () => google.maps.KmlLayerMetadata | null;
    getStatus: () => google.maps.KmlLayerStatus | null;
    getUrl: () => string | null;
    setMap: (map: google.maps.Map | null) => void;
    setOptions: (options: google.maps.KmlLayerOptions) => void;
    setUrl: (url: string) => void;
};
type MapHeatmapLayerHandle = {
    layer: google.maps.visualization.HeatmapLayer | null;
    getData: () => google.maps.MVCArray<google.maps.LatLng | google.maps.visualization.WeightedLocation> | null;
    setData: (data: HeatmapDatum[]) => void;
    setMap: (map: google.maps.Map | null) => void;
    setOptions: (options: google.maps.visualization.HeatmapLayerOptions) => void;
};
type MapKmlLayerProps = {
    url: string;
    options?: google.maps.KmlLayerOptions;
    onLoad?: (layer: google.maps.KmlLayer) => void;
    onUnmount?: (layer: google.maps.KmlLayer) => void;
};
type MapHeatmapLayerProps = {
    data: HeatmapDatum[];
    options?: google.maps.visualization.HeatmapLayerOptions;
    onLoad?: (layer: google.maps.visualization.HeatmapLayer) => void;
    onUnmount?: (layer: google.maps.visualization.HeatmapLayer) => void;
};
declare const MapTrafficLayer: react.ForwardRefExoticComponent<{
    options?: google.maps.TrafficLayerOptions;
    onLoad?: (layer: google.maps.TrafficLayer) => void;
    onUnmount?: (layer: google.maps.TrafficLayer) => void;
} & react.RefAttributes<MapTrafficLayerHandle>>;
declare const MapTransitLayer: react.ForwardRefExoticComponent<{
    onLoad?: (layer: google.maps.TransitLayer) => void;
    onUnmount?: (layer: google.maps.TransitLayer) => void;
} & react.RefAttributes<MapTransitLayerHandle>>;
declare const MapBicyclingLayer: react.ForwardRefExoticComponent<{
    onLoad?: (layer: google.maps.BicyclingLayer) => void;
    onUnmount?: (layer: google.maps.BicyclingLayer) => void;
} & react.RefAttributes<MapBicyclingLayerHandle>>;
declare const MapKmlLayer: react.ForwardRefExoticComponent<MapKmlLayerProps & react.RefAttributes<MapKmlLayerHandle>>;
declare const MapHeatmapLayer: react.ForwardRefExoticComponent<MapHeatmapLayerProps & react.RefAttributes<MapHeatmapLayerHandle>>;

type DirectionsServiceResult = {
    status: google.maps.DirectionsStatus;
    result: google.maps.DirectionsResult | null;
};
type MapDirectionsRendererHandle = {
    renderer: google.maps.DirectionsRenderer | null;
    getDirections: () => google.maps.DirectionsResult | null | undefined;
    getPanel: () => Node | null | undefined;
    getRouteIndex: () => number | undefined;
    setDirections: (directions: google.maps.DirectionsResult | null) => void;
    setOptions: (options: google.maps.DirectionsRendererOptions) => void;
    setRouteIndex: (routeIndex: number) => void;
};
type MapDirectionsRendererProps = {
    directions?: google.maps.DirectionsResult | null;
    options?: google.maps.DirectionsRendererOptions;
    onLoad?: (renderer: google.maps.DirectionsRenderer) => void;
    onUnmount?: (renderer: google.maps.DirectionsRenderer) => void;
    onDirectionsChanged?: () => void;
};
declare const MapDirectionsRenderer: react.ForwardRefExoticComponent<MapDirectionsRendererProps & react.RefAttributes<MapDirectionsRendererHandle>>;
declare function MapDirectionsService({ request, onResult, onError }: {
    request?: google.maps.DirectionsRequest | null;
    onResult: (response: DirectionsServiceResult) => void;
    onError?: (error: Error) => void;
}): null;

declare function useGoogleMapsApi(): {
    isLoaded: boolean;
    status: GoogleMapsStatus;
    error: Error | null;
    google: typeof google | null;
    options: GoogleMapsApiLoadOptions | null;
};
declare function useGoogleMap(): google.maps.Map | null;
declare function useMapGeocoder(): google.maps.Geocoder | null;
declare function useDirectionsService(): google.maps.DirectionsService | null;

export { type ClusterRendererContext, type CreateClusterRendererOptions, type DirectionsServiceResult, GoogleMap, type GoogleMapHandle, type GoogleMapProps, type GoogleMapsApiLoadOptions, GoogleMapsProvider, type GoogleMapsProviderProps, type GoogleMapsStatus, type HeatmapDatum, MapAdvancedMarker, type MapAdvancedMarkerHandle, type MapAdvancedMarkerProps, MapBicyclingLayer, type MapBicyclingLayerHandle, MapCircle, type MapCircleHandle, type MapCircleProps, MapControl, type MapControlProps, MapDirectionsRenderer, type MapDirectionsRendererHandle, type MapDirectionsRendererProps, MapDirectionsService, MapGroundOverlay, type MapGroundOverlayHandle, type MapGroundOverlayProps, MapHeatmapLayer, type MapHeatmapLayerHandle, MapInfoWindow, type MapInfoWindowHandle, type MapInfoWindowProps, MapKmlLayer, type MapKmlLayerHandle, MapMarker, MapMarkerClusterer, type MapMarkerClustererHandle, type MapMarkerClustererProps, type MapMarkerHandle, type MapMarkerProps, MapPolygon, type MapPolygonHandle, type MapPolygonProps, MapPolyline, type MapPolylineHandle, type MapPolylineProps, MapRectangle, type MapRectangleHandle, type MapRectangleProps, MapTrafficLayer, type MapTrafficLayerHandle, MapTransitLayer, type MapTransitLayerHandle, createClusterRenderer, getDefaultGoogleMapsLibraries, loadGoogleMapsApi, useDirectionsService, useGoogleMap, useGoogleMapsApi, useMapGeocoder };
