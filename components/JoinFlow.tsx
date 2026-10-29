"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

export type Role = "seller" | "buyer";

const buyerTypes = ["Student", "Individual developer", "Founder", "Business", "Enterprise"] as const;
type BuyerType = (typeof buyerTypes)[number];
type SelfHosted = "yes" | "no";
type Step = 1 | 2 | 3;
type Errors = Partial<Record<"role" | "buyerType" | "repos" | "selfHosted" | "dob" | "phone" | "terms", string>>;

// Personal details only ever go to this endpoint, over HTTPS, in a POST body.
const endpoint = process.env.NEXT_PUBLIC_JOIN_ENDPOINT;
const termsUrl = process.env.NEXT_PUBLIC_TERMS_URL;

const GITHUB_REPO = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;

function parseRepos(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function JoinFlow({ initialRole }: { initialRole?: Role }) {
  const [step, setStep] = useState<Step>(initialRole ? 2 : 1);
  const [role, setRole] = useState<Role | null>(initialRole ?? null);
  const [buyerType, setBuyerType] = useState<BuyerType | null>(null);
  const [repos, setRepos] = useState("");
  const [selfHosted, setSelfHosted] = useState<SelfHosted | null>(null);
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // Move focus to the step heading when the step changes, so keyboard and
  // screen-reader users land at the top of the new step.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, done]);

  function fail(next: Errors, focusId: string) {
    setErrors(next);
    document.getElementById(focusId)?.focus();
    return false;
  }

  function validate(current: Step): boolean {
    if (current === 1) {
      if (!role) return fail({ role: "Choose seller or buyer to continue." }, "role-seller");
    }

    if (current === 2) {
      if (role === "buyer" && !buyerType) {
        return fail({ buyerType: "Choose the option that fits you best." }, "buyer-type-0");
      }
      if (role === "seller") {
        const bad = parseRepos(repos).find((url) => !GITHUB_REPO.test(url));
        if (bad) {
          return fail({ repos: `“${bad}” isn't a GitHub repo link. Use https://github.com/owner/repo.` }, "repos");
        }
        if (!selfHosted) return fail({ selfHosted: "Tell us whether you self-host." }, "self-hosted-yes");
      }
    }

    if (current === 3) {
      const born = dob ? new Date(`${dob}T00:00:00`) : null;
      if (!born || Number.isNaN(born.getTime()) || born > new Date() || born.getFullYear() < 1900) {
        return fail({ dob: "Enter a valid date of birth." }, "dob");
      }
      const digits = phone.replace(/\D/g, "");
      if (!/^\+?[\d\s()-]+$/.test(phone.trim()) || digits.length < 7 || digits.length > 15) {
        return fail({ phone: "Enter a valid phone number, with country code if outside India." }, "phone");
      }
      if (!accepted) return fail({ terms: "You need to accept the Terms & Conditions." }, "terms");
    }

    setErrors({});
    return true;
  }

  function next() {
    if (validate(step) && step < 3) {
      setStatus("");
      setStep((step + 1) as Step);
    }
  }

  function back() {
    setErrors({});
    setStatus("");
    if (step > 1) setStep((step - 1) as Step);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 3) return next();
    if (!validate(3)) return;

    if (!endpoint) {
      setStatus("Signups aren't open yet — nothing was sent or saved. Check back after the Goa demo.");
      return;
    }

    setSending(true);
    setStatus("Sending…");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          buyerType: role === "buyer" ? buyerType : undefined,
          githubRepos: role === "seller" ? parseRepos(repos) : undefined,
          selfHosted: role === "seller" ? selfHosted === "yes" : undefined,
          dob,
          phone: phone.trim(),
          acceptedTerms: true,
        }),
      });
      if (!res.ok) throw new Error(res.statusText);
      setDone(true);
      setStatus("");
    } catch {
      setStatus("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="flow">
        <svg className="flow__check" viewBox="0 0 52 52" aria-hidden="true">
          <circle cx="26" cy="26" r="24" />
          <path d="M14 27 l8 8 l16 -18" />
        </svg>
        <h1 ref={headingRef} tabIndex={-1} className="flow__title">
          You&apos;re in.
        </h1>
        <p className="flow__lead">
          Thanks — we have your details as a {role}. We&apos;ll get in touch using the phone number you gave us.
        </p>
      </div>
    );
  }

  const titles: Record<Step, string> = {
    1: "Who are you?",
    2: role === "seller" ? "Tell us about your agent." : "What best describes you?",
    3: "A few last details.",
  };

  return (
    <form className="flow" onSubmit={submit} noValidate>
      <div className="flow__progress" role="group" aria-label={`Step ${step} of 3`}>
        {[1, 2, 3].map((n) => (
          <span key={n} className={n <= step ? "flow__dot flow__dot--on" : "flow__dot"} aria-hidden="true" />
        ))}
        <span className="metadata">Step {step} of 3</span>
      </div>

      <div className="flow__body" key={step}>
        <h1 ref={headingRef} tabIndex={-1} className="flow__title">
          {titles[step]}
        </h1>

        {step === 1 && (
          <fieldset className="fieldset" aria-describedby={errors.role ? "role-error" : undefined}>
            <legend className="sr-only">Who are you?</legend>
            <div className="choices">
              <div className="choice-wrap">
                <label className="choice">
                  <input
                    id="role-seller"
                    type="radio"
                    name="role"
                    value="seller"
                    checked={role === "seller"}
                    onChange={() => setRole("seller")}
                  />
                  <span className="choice__body choice__body--big">
                    <span className="choice__dot" aria-hidden="true" />
                    <span className="choice__title">Seller</span>
                    <span className="choice__hint">List a job an agent can do and get paid when it&apos;s accepted.</span>
                  </span>
                </label>
              </div>
              <div className="choice-wrap">
                <label className="choice">
                  <input
                    id="role-buyer"
                    type="radio"
                    name="role"
                    value="buyer"
                    checked={role === "buyer"}
                    onChange={() => setRole("buyer")}
                  />
                  <span className="choice__body choice__body--big">
                    <span className="choice__dot" aria-hidden="true" />
                    <span className="choice__title">Buyer</span>
                    <span className="choice__hint">Order a job in plain language and pay only for finished work.</span>
                  </span>
                </label>
              </div>
            </div>
            {errors.role && (
              <p id="role-error" className="field__error" role="alert">
                {errors.role}
              </p>
            )}
          </fieldset>
        )}

        {step === 2 && role === "buyer" && (
          <fieldset className="fieldset" aria-describedby={errors.buyerType ? "buyer-error" : undefined}>
            <legend className="sr-only">What best describes you?</legend>
            <div className="choices choices--list">
              {buyerTypes.map((type, i) => (
                <label key={type} className="choice">
                  <input
                    id={`buyer-type-${i}`}
                    type="radio"
                    name="buyerType"
                    value={type}
                    checked={buyerType === type}
                    onChange={() => setBuyerType(type)}
                  />
                  <span className="choice__body">
                    <span className="choice__dot" aria-hidden="true" />
                    <span className="choice__title">{type}</span>
                  </span>
                </label>
              ))}
            </div>
            {errors.buyerType && (
              <p id="buyer-error" className="field__error" role="alert">
                {errors.buyerType}
              </p>
            )}
          </fieldset>
        )}

        {step === 2 && role === "seller" && (
          <>
            <div className="field">
              <label htmlFor="repos">GitHub repos for your agent</label>
              <p id="repos-hint" className="field__hint">
                Optional. One link per line, like https://github.com/you/your-agent.
              </p>
              <textarea
                id="repos"
                className="input input--area"
                rows={4}
                value={repos}
                onChange={(e) => setRepos(e.target.value)}
                aria-invalid={Boolean(errors.repos)}
                aria-describedby={errors.repos ? "repos-hint repos-error" : "repos-hint"}
                placeholder="https://github.com/you/your-agent"
                spellCheck={false}
              />
              {errors.repos && (
                <p id="repos-error" className="field__error" role="alert">
                  {errors.repos}
                </p>
              )}
            </div>

            <fieldset className="fieldset" aria-describedby={errors.selfHosted ? "host-error" : "host-hint"}>
              <legend className="field__legend">Self-hosted?</legend>
              <p id="host-hint" className="field__hint">
                HireCrew hosts execution by default, so you don&apos;t need a server. Choose Yes only if you plan to run the
                agent on your own infrastructure.
              </p>
              <div className="choices">
                <label className="choice">
                  <input
                    id="self-hosted-yes"
                    type="radio"
                    name="selfHosted"
                    value="yes"
                    checked={selfHosted === "yes"}
                    onChange={() => setSelfHosted("yes")}
                  />
                  <span className="choice__body">
                    <span className="choice__dot" aria-hidden="true" />
                    <span className="choice__title">Yes</span>
                  </span>
                </label>
                <label className="choice">
                  <input
                    id="self-hosted-no"
                    type="radio"
                    name="selfHosted"
                    value="no"
                    checked={selfHosted === "no"}
                    onChange={() => setSelfHosted("no")}
                  />
                  <span className="choice__body">
                    <span className="choice__dot" aria-hidden="true" />
                    <span className="choice__title">No</span>
                  </span>
                </label>
              </div>
              {errors.selfHosted && (
                <p id="host-error" className="field__error" role="alert">
                  {errors.selfHosted}
                </p>
              )}
            </fieldset>
          </>
        )}

        {step === 3 && (
          <>
            <div className="field">
              <label htmlFor="dob">Date of birth</label>
              <input
                id="dob"
                className="input"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                autoComplete="bday"
                aria-invalid={Boolean(errors.dob)}
                aria-describedby={errors.dob ? "dob-error" : undefined}
              />
              {errors.dob && (
                <p id="dob-error" className="field__error" role="alert">
                  {errors.dob}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="phone">Phone number</label>
              <input
                id="phone"
                className="input"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                placeholder="+91 98765 43210"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
              {errors.phone && (
                <p id="phone-error" className="field__error" role="alert">
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="field">
              <label className="check" htmlFor="terms">
                <input
                  id="terms"
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  aria-invalid={Boolean(errors.terms)}
                  aria-describedby={errors.terms ? "terms-error" : undefined}
                />
                <span>
                  I accept the{" "}
                  {termsUrl ? (
                    <a href={termsUrl} target="_blank" rel="noreferrer">
                      Terms &amp; Conditions
                    </a>
                  ) : (
                    "Terms & Conditions"
                  )}
                  .
                </span>
              </label>
              {errors.terms && (
                <p id="terms-error" className="field__error" role="alert">
                  {errors.terms}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flow__actions">
        {step > 1 && (
          <button type="button" className="btn-ghost btn-ghost--dark" onClick={back}>
            <span aria-hidden="true">←</span> Back
          </button>
        )}
        {step < 3 ? (
          <button type="button" className="btn btn--dark" onClick={next}>
            Continue <span aria-hidden="true">→</span>
          </button>
        ) : (
          <button type="submit" className="btn btn--dark" disabled={sending}>
            {sending ? "Sending…" : "Submit"}
          </button>
        )}
      </div>

      <p className="flow__status" role="status" aria-live="polite">
        {status}
      </p>
    </form>
  );
}
