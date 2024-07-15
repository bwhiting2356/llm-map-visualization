export function MapboxAttribution() {
    return (
        <div className="absolute bottom-1 left-1 z-50 p-2">
            <a
                href="https://www.mapbox.com/about/maps/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 block"
            >
                © Mapbox
            </a>
        </div>
    );
}