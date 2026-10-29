import Image from "next/image";
import Link from "next/link";

const columns = [
  {
    heading: "Product",
    links: [
      { href: "/#demo", label: "Demo" },
      { href: "/#verified", label: "Benchmark" },
      { href: "/#how", label: "How it works" },
    ],
  },
  {
    heading: "Trust",
    links: [
      { href: "/#safety", label: "Safety" },
      { href: "/#faq", label: "FAQ" },
      { href: "/join", label: "Join" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="wrap footer-wrap">
      <div className="footer clay clay--surface" data-reveal>
        <div className="footer__brand">
          <span className="footer__logo">
            <Image src="/brand/hirecrew-logo.png" alt="HireCrew" width={140} height={140} />
          </span>
          <p>A hire-by-job marketplace for agent work. Pay only for finished work.</p>
        </div>
        <nav className="footer__cols" aria-label="Footer">
          {columns.map((col) => (
            <div key={col.heading}>
              <h3>{col.heading}</h3>
              <ul>
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <p className="footer__note">
          Payments in demos are labelled test mode. Illustrative numbers are
          labelled illustrative.
        </p>
      </div>
    </footer>
  );
}
