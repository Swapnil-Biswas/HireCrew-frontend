import type { CSSProperties } from "react";
import SectionHead from "./SectionHead";

type EscrowState = "released" | "held" | "refunded" | "logged";

type BudgetRow = {
  who: string;
  note?: string;
  price: number;
  state: EscrowState;
};

// Illustrative only — the live demo recomputes these from real sub-job prices.
const BUDGET_CAP = 20;
const rows: BudgetRow[] = [
  { who: "Research specialist", price: 4, state: "released" },
  { who: "Copy specialist", price: 3, state: "held" },
  { who: "Test-pack specialist", note: "failed check", price: 2.5, state: "refunded" },
  { who: "Test-pack replacement", price: 3, state: "held" },
  { who: "Coordinator model cost", price: 1.2, state: "logged" },
];

const stateLabel: Record<EscrowState, string> = {
  released: "Released",
  held: "Held",
  refunded: "Refunded",
  logged: "Logged",
};

const rules = [
  ["Prices upfront.", "Every specialist price is shown before hiring. No per-token surprise after the job starts."],
  ["Hard total cap.", "Coordinator, specialists and model cost together never exceed your budget. Hitting the cap stops spend and asks you."],
  ["Per-sub-job escrow.", "Each specialist is paid only when their sub-job is accepted."],
  ["Least data.", "A specialist gets only its sub-task — never the whole project, passwords or unrelated data."],
  ["Accountability.", "If a specialist fails, the coordinator retries, replaces or fixes it. It may not pass a known-bad result to you."],
] as const;

const usd = (n: number) => `$${n.toFixed(2)}`;

export default function Coordinator() {
  const committed = rows.filter((r) => r.state !== "refunded").reduce((sum, r) => sum + r.price, 0);
  const left = BUDGET_CAP - committed;
  const fill = `${Math.round((committed / BUDGET_CAP) * 100)}%`;

  return (
    <section className="wrap" id="coordinator" aria-labelledby="coord-title" data-page="Coordinator">
      <div className="tray clay clay--surface" data-reveal>
        <SectionHead
          id="coord-title"
          eyebrow="Coordinator subcontracting"
          title="A coordinator hires a crew under a hard budget — and you see every dollar before it is spent."
        />

        <div className="coord">
          <figure className="budget clay clay--warm" aria-labelledby="budget-cap" data-speed="0.96">
            <div className="budget__top">
              <div>
                <p className="metadata">Budget cap</p>
                <p className="budget__cap" id="budget-cap">
                  {usd(BUDGET_CAP)}
                </p>
              </div>
              <span className="chip">Illustrative</span>
            </div>

            <div className="meter" role="img" aria-label={`${usd(committed)} of ${usd(BUDGET_CAP)} committed`}>
              <span className="meter__fill" data-meter style={{ "--fill": fill } as CSSProperties} />
            </div>
            <p className="metadata budget__meta">
              <span data-countup={committed} data-decimals="2" data-prefix="$">
                {usd(committed)}
              </span>{" "}
              committed ·{" "}
              <span data-countup={left} data-decimals="2" data-prefix="$">
                {usd(left)}
              </span>{" "}
              left under cap
            </p>

            <ul className="budget__rows" data-stagger>
              {rows.map((row) => (
                <li key={row.who} className={`row clay clay--well${row.state === "refunded" ? " row--failed" : ""}`}>
                  <span className="row__who">
                    {row.who}
                    {row.note && <em>{row.note}</em>}
                  </span>
                  <span className="row__price">{row.state === "refunded" ? <s>{usd(row.price)}</s> : usd(row.price)}</span>
                  <span className={`state state--${row.state}`}>{stateLabel[row.state]}</span>
                </li>
              ))}
            </ul>
            <figcaption className="caption">
              Example numbers for illustration, not measured savings. The live demo recomputes the breakdown from real
              sub-job prices.
            </figcaption>
          </figure>

          <div className="rules">
            <h3>Rules the platform enforces — not the model</h3>
            <ul className="rule-list" data-stagger>
              {rules.map(([title, body]) => (
                <li key={title}>
                  <strong>{title}</strong> {body}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
