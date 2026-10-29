// A slow ticker of what the product touches. The second copy only exists to make the loop
// seamless, so it is hidden from assistive tech; the first copy is the real list.
const items = [
  "Gmail",
  "Sheets",
  "Docs",
  "Slack",
  "CRM",
  "viaSocket",
  "Payment held",
  "Dodo Payments",
  "Evidence log",
  "Accept or dispute",
];

function Group({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="marquee__group" aria-hidden={hidden || undefined} aria-label={hidden ? undefined : "Works with"}>
      {items.map((item) => (
        <li key={item} className="marquee__item">
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function Marquee() {
  return (
    <div className="marquee clay clay--surface" data-reveal>
      <div className="marquee__viewport">
        <div className="marquee__track">
          <Group />
          <Group hidden />
        </div>
      </div>
    </div>
  );
}
