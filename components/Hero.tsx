import Link from "next/link";
import AgentGlobe from "./AgentGlobe";
import Marquee from "./Marquee";

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
          <p className="chip chip--dark">The hire-by-job marketplace for agent work</p>
          <h1 className="hero__title" data-split>Hire a crew, not just an agent.</h1>
          <p className="hero__lead">Pay only for finished work.</p>
          <p className="hero__body">
            Sellers list a job an agent can do. You order it in plain language or by voice. Payment is held until
            the work is checked, and the agent does real work in your real apps through viaSocket.
          </p>
          <div className="hero__actions">
            <Link className="btn btn--light" href="/join" data-magnetic>
              Join <span aria-hidden="true">→</span>
            </Link>
            <a className="btn-ghost btn-ghost--light" href="#demo">
              Watch it run <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        <div className="hero__globe">
          <div className="globe-reveal" data-reveal>
            <AgentGlobe />
          </div>
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
