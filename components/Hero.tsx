import Link from "next/link";
import VideoFrame from "./VideoFrame";
import Marquee from "./Marquee";
import { videos } from "@/lib/media";

type Fact = { title: string; body: string; tone: "support" | "warm" | "cool" | "compare" };

const facts: Fact[] = [
  { title: "Payment held", body: "Seller is paid only when you accept.", tone: "support" },
  { title: "Real apps", body: "Work lands in Gmail, Sheets, Docs via viaSocket.", tone: "warm" },
  { title: "Fiat checkout", body: "Dodo Payments as Merchant of Record.", tone: "cool" },
  { title: "No server to sell", body: "HireCrew hosts execution for every listing.", tone: "compare" },
];

export default function Hero() {
  return (
    <section className="wrap hero-wrap" id="top" data-page="Overview">
      <div className="hero clay clay--dark">
        <div className="hero__copy" data-stagger>
          <p className="chip chip--dark">Hacker House Goa 2026 · In build</p>
          <h1 className="hero__title" data-split>Hire a crew, not just an agent.</h1>
          <p className="hero__lead">Pay only for finished work.</p>
          <p className="hero__body">
            Sellers list a job an agent can do. You order it in plain language or by voice. Payment is held until
            the work is checked, and the agent does real work in your real apps through viaSocket.
          </p>
          <div className="hero__actions">
            <Link className="btn btn--cta" href="/join" data-magnetic>
              Join <span aria-hidden="true">→</span>
            </Link>
            <a className="btn-ghost btn-ghost--light" href="#demo">
              Watch it run <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        <div className="hero__video" data-reveal>
          <span className="deco deco--sphere" aria-hidden="true" data-speed="0.8" />
          <span className="deco deco--pill" aria-hidden="true" data-speed="1.25" />
          <span className="deco deco--ring" aria-hidden="true" data-speed="0.9" />
          <span className="deco deco--dot" aria-hidden="true" data-speed="1.15" />
          <VideoFrame src={videos.hero} title="HireCrew overview video" placeholder="Overview video coming soon" />
        </div>
      </div>

      <ul className="facts" aria-label="Key facts" data-stagger>
        {facts.map((fact) => (
          <li key={fact.title} className={`fact clay clay--${fact.tone}`}>
            <strong>{fact.title}</strong>
            <span>{fact.body}</span>
          </li>
        ))}
      </ul>

      <Marquee />
    </section>
  );
}
