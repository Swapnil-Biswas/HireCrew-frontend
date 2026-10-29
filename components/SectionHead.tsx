type SectionHeadProps = {
  id: string;
  eyebrow: string;
  title: string;
  sub?: string;
  className?: string;
};

export default function SectionHead({ id, eyebrow, title, sub, className }: SectionHeadProps) {
  return (
    <header className={className ? `section-head ${className}` : "section-head"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} data-split>{title}</h2>
      {sub && <p className="section-head__sub">{sub}</p>}
    </header>
  );
}
