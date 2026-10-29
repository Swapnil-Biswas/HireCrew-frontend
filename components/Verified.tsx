import SectionHead from "./SectionHead";

const dimensions = [
  { icon: "✓", tone: "cool", title: "Task success", body: "Read back the real app — sheet rows, sent email, doc content — and compare to a rubric. Never the agent's self-report." },
  { icon: "$", tone: "warm", title: "Cost per job", body: "Tokens, tool calls and model cost logged per run. Exposes a $2 agent that costs $3 to run." },
  { icon: "⏱", tone: "compare", title: "Time and steps", body: "Wall time and tool-call count per task." },
  { icon: "↻", tone: "support", title: "Reliability", body: "The same task, run repeatedly. Pass only on consistent success." },
  { icon: "⛨", tone: "cool", title: "Safety", body: "Adversarial variants try to push the agent outside its allowlist. Any violation caps the score." },
] as const;

const tiers = [
  { name: "Verified", tone: "dark", body: "Passes the suite incl. adversarial tasks, no safety violations, cost within price. Lists at full price with a badge." },
  { name: "Provisional", tone: "compare", body: "Passes clean tasks, fails an edge case or is single-run. Lists with a label and a price cap." },
  { name: "Not verified", tone: "warm", body: "Fails task success or any safety task. Cannot charge premium; a safety failure blocks the listing." },
] as const;

// Format example from the PRD, not a measured result.
type SampleStat = {
  label: string;
  text: string;
  count?: { end: number; decimals?: number; prefix?: string; suffix?: string };
};

const sampleStats: SampleStat[] = [
  { label: "Avg cost", text: "$0.80", count: { end: 0.8, decimals: 2, prefix: "$" } },
  { label: "Avg time", text: "3 min", count: { end: 3, suffix: " min" } },
  { label: "Safety violations", text: "0" },
];

// The format example's 23 of 25 runs, one dot per run.
const sampleRuns = Array.from({ length: 25 }, (_, i) => i < 23);

export default function Verified() {
  return (
    <section className="wrap" id="verified" aria-labelledby="verified-title" data-page="Benchmark">
      <div className="tray clay clay--surface" data-reveal>
        <SectionHead
          id="verified-title"
          eyebrow="HireCrew Verified"
          title="A benchmark that tests real jobs in real apps — not quiz answers."
        />

        <div className="shelf">
          <article className="lead clay clay--support">
            <div className="scorecard clay clay--dark" data-speed="0.95">
              <div className="scorecard__head">
                <span className="scorecard__job">Inbox-to-Sheet</span>
                <span className="chip chip--dark">Format example</span>
              </div>
              <p className="scorecard__score">
                <span data-countup="92">92</span>
                <span className="unit">%</span>
              </p>
              <p className="scorecard__runs">success · 23 / 25 runs</p>
              <ul className="runs" role="img" aria-label="23 of 25 runs passed" data-stagger data-stagger-each="0.035">
                {sampleRuns.map((passed, i) => (
                  <li key={i} className={passed ? "run run--pass" : "run run--fail"} />
                ))}
              </ul>
              <dl className="scorecard__stats">
                {sampleStats.map((stat) => (
                  <div key={stat.label}>
                    <dt>{stat.label}</dt>
                    <dd>
                      {stat.count ? (
                        <span
                          data-countup={stat.count.end}
                          data-decimals={stat.count.decimals}
                          data-prefix={stat.count.prefix}
                          data-suffix={stat.count.suffix}
                        >
                          {stat.text}
                        </span>
                      ) : (
                        stat.text
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="scorecard__config">harness v1 · Oct 2026</p>
            </div>
            <h3>Scores print their configuration</h3>
            <p>
              Model, harness version, tool set, token budget and date sit beside every score — a score without its
              configuration is not comparable. This card shows the format only; live scores replace it after real
              benchmark runs.
            </p>
          </article>

          <ul className="dims" data-stagger>
            {dimensions.map((dim) => (
              <li key={dim.title} className="dim">
                <span className={`dim__icon clay clay--${dim.tone}`} aria-hidden="true">
                  {dim.icon}
                </span>
                <div>
                  <h3>{dim.title}</h3>
                  <p>{dim.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="tiers" data-stagger>
          {tiers.map((tier) => (
            <div key={tier.name} className={`tier clay clay--${tier.tone}`}>
              <strong>{tier.name}</strong>
              <span>{tier.body}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
