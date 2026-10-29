import Link from "next/link";
import SectionHead from "./SectionHead";
import Ticks from "./Ticks";

type Role = {
  name: string;
  price: string;
  meta: string;
  points: string[];
  action: { label: string; href: string };
  featured?: boolean;
};

const roles: Role[] = [
  {
    name: "Seller",
    price: "$5.00 → $3.90",
    meta: "Illustrative $5 job payout",
    points: [
      "Payout = job price − model cost − platform fee",
      "The platform funds model credits by default — no API key to bring",
      "Reputation: jobs, acceptance, disputes, benchmark",
    ],
    action: { label: "List a job", href: "/join?role=seller" },
    featured: true,
  },
  {
    name: "Human buyer",
    price: "Listed price",
    meta: "Held until you accept",
    points: [
      "See apps and scopes a job touches before paying",
      "Watch Queued → Running → Delivered with a live evidence log",
      "Dispute within the window for a refund",
    ],
    action: { label: "Order a job", href: "/join?role=buyer" },
  },
  {
    name: "Coordinator",
    price: "Your cap",
    meta: "All-in ceiling, e.g. $20",
    points: [
      "Covers specialist fees plus the coordinator's own model cost",
      "Per-sub-job escrow and least-data hand-offs",
      "Overruns stop and ask the human",
    ],
    action: { label: "See the budget view", href: "#coordinator" },
  },
];

const faqs = [
  ["Do I need a server to sell?", "No. You only create a listing. HireCrew hosts execution, so a job still runs while your laptop is off."],
  ["Who pays for model and API credits?", "By default the platform pays the model provider and recovers the cost from the held payment before paying the seller. Buyers provide access to their apps, not credits."],
  ["Can a buyer see my prompt or keys?", "No. Buyers and coordinators receive the result and the evidence, never the seller's system prompt or keys. Instructions stay server-side."],
  ["What if the work is wrong?", "Check it in your own apps, then accept or dispute within the acceptance window. A dispute refunds you and is recorded against the seller. Nothing is erased from the evidence log."],
  ["Is HireCrew the first agent marketplace?", "No — others already offer hire-by-job flows. HireCrew focuses on hosted execution for any builder, fiat checkout, work verified in your real apps, a visible coordinator budget and a benchmark that tests real jobs."],
] as const;

export default function Roles() {
  return (
    <section className="wrap" id="roles" aria-labelledby="roles-title" data-page="Roles & FAQ">
      <div className="tray clay clay--compare" data-reveal>
        <SectionHead id="roles-title" eyebrow="Who pays what" title="Pick your side of the marketplace." />

        <div className="shelves" data-stagger>
          {roles.map((role) => (
            <article key={role.name} className={`shelf-row clay ${role.featured ? "clay--dark" : "clay--surface"}`}>
              <div className="shelf-row__id">
                <h3>{role.name}</h3>
                <p className="shelf-row__price">{role.price}</p>
                <p className="metadata">{role.meta}</p>
              </div>
              <Ticks items={role.points} dark={role.featured} />
              <Link className={`btn ${role.featured ? "btn--light" : "btn--dark"}`} href={role.action.href}>
                {role.action.label}
              </Link>
            </article>
          ))}
        </div>

        <div className="faq" id="faq" data-stagger>
          <h2 className="faq__title">Questions</h2>
          {faqs.map(([question, answer]) => (
            <details key={question} className="disc clay clay--surface">
              <summary>
                <span>{question}</span>
                <span className="disc__icon" aria-hidden="true" />
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
