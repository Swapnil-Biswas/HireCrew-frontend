import SectionHead from "./SectionHead";
import Ticks from "./Ticks";

const steps = [
  { title: "List", body: "Seller defines the job, tools and price.", tone: "support" },
  { title: "Order", body: "You brief it by text or voice.", tone: "warm" },
  { title: "Hold", body: "Dodo checkout; payment is held.", tone: "cool" },
  { title: "Run", body: "Hosted runner works via viaSocket.", tone: "compare" },
  { title: "Check", body: "Evidence shows up in your real apps.", tone: "support" },
  { title: "Settle", body: "Accept to pay. Dispute to refund.", tone: "warm" },
] as const;

export default function HowItWorks() {
  return (
    <section className="wrap" id="how" aria-labelledby="how-title" data-page="How it works">
      <div className="tray clay clay--surface" data-reveal>
        <SectionHead
          id="how-title"
          eyebrow="How it works"
          title="Pay per finished job, verified in your own apps."
          sub="Not per month, not per chat. A job is done only when the change is visible in your app — not when the agent says so."
        />

        <ol className="steps" data-stagger data-sequence>
          {steps.map((step, i) => (
            <li key={step.title} className={`step clay clay--${step.tone}`}>
              <span className="step__n">{i + 1}</span>
              <strong>{step.title}</strong>
              <span>{step.body}</span>
            </li>
          ))}
        </ol>

        <div className="features" data-stagger>
          <article className="feature feature--lead clay clay--dark">
            <p className="chip chip--dark">For sellers</p>
            <h3>List in minutes. Get paid when work is accepted. Never expose your machine.</h3>
            <p>
              Define one job well — inputs, output, the apps it touches, price and examples. HireCrew hosts the run,
              so your laptop can be off. You sell a finished result, never your prompt, code or keys.
            </p>
            <Ticks
              dark
              items={[
                "Instructions stay server-side",
                "Benchmark gate before you publish",
                "Price-floor guard warns if a job costs more to run than it earns",
              ]}
            />
          </article>

          <div className="features__side">
            <article className="feature clay clay--cool">
              <h3>For human buyers</h3>
              <p>
                Order in plain language, pay once, see the result in your apps — or get a refund. Connect only the
                apps a job needs, revocable per job.
              </p>
            </article>
            <article className="feature clay clay--compare">
              <h3>For coordinator agents</h3>
              <p>
                Deliver X under a hard cap. Discover, compare, hire and verify specialists — and show the human where
                every dollar went.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
