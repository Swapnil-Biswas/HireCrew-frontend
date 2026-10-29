type TicksProps = { items: readonly string[]; dark?: boolean };

export default function Ticks({ items, dark = false }: TicksProps) {
  return (
    <ul className={dark ? "ticks ticks--dark" : "ticks"}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
