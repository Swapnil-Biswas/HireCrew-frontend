// SVG filter behind the liquid-glass refraction. `backdrop-filter: url(#liquid-glass)` is only
// honoured by Chromium; other browsers ignore the url() and keep the blur-and-highlight glass.
//
// The displacement map is a tiny generated image: red encodes horizontal push, green vertical.
// Both sit at mid-grey (no shift) in the middle and ramp toward the edges, so content under the
// rim of a glass element bends like it would through a thick lens.
const ramp = (channel: "r" | "g") => {
  const c = (v: number) => (channel === "r" ? `rgb(${v},0,0)` : `rgb(0,${v},0)`);
  return `<stop offset='0' stop-color='${c(255)}'/><stop offset='.16' stop-color='${c(128)}'/><stop offset='.84' stop-color='${c(128)}'/><stop offset='1' stop-color='${c(0)}'/>`;
};

const mapSvg =
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'>` +
  `<defs>` +
  `<linearGradient id='x' x1='0' y1='0' x2='1' y2='0'>${ramp("r")}</linearGradient>` +
  `<linearGradient id='y' x1='0' y1='0' x2='0' y2='1'>${ramp("g")}</linearGradient>` +
  `</defs>` +
  `<rect width='100' height='100' fill='black'/>` +
  `<rect width='100' height='100' fill='url(#x)'/>` +
  `<rect width='100' height='100' fill='url(#y)' style='mix-blend-mode:screen'/>` +
  `</svg>`;

const mapUri = `data:image/svg+xml,${encodeURIComponent(mapSvg)}`;

export default function LiquidGlassFilter() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <defs>
        <filter id="liquid-glass" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feImage href={mapUri} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale="34" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}
