import SectionHead from "./SectionHead";
import GatewayFlow from "./GatewayFlow";

const controls = [
  ["Allowlist", "A research agent gets search and sheet-write only. No email-send, delete or shell tool to abuse."],
  ["Gateway", "Every tool call is checked by code. Destructive or out-of-scope calls are blocked or sent to you."],
  ["Vault", "Keys and OAuth tokens are injected per tool call. The model never sees them."],
  ["Isolation", "Each job runs fresh, with no memory of other jobs or other buyers' data."],
  ["Scoped data", "App access is a per-job grant you can revoke at any time."],
  ["Caps and audit", "Limits on calls, tokens, time and cost, plus a complete evidence log."],
] as const;

export default function Safety() {
  return (
    <section className="wrap" id="safety" aria-labelledby="safety-title" data-page="Safety">
      <div className="tray clay clay--surface" data-reveal>
        <div className="safety">
          <div className="safety__left">
            <SectionHead
              id="safety-title"
              className="safety__head"
              eyebrow="Security and privacy"
              title="The model proposes. Code decides."
              sub="Buyer text is untrusted data. Controls live around the model, not inside a hopeful prompt. HireCrew reduces injection impact to what the allowlist and gateway permit — it does not claim to be injection-proof."
            />
            <GatewayFlow />
          </div>
          <dl className="sec clay clay--cool" data-stagger>
            {controls.map(([term, detail]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
