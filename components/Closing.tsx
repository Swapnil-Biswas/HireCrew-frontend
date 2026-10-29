import Link from "next/link";

export default function Closing() {
  return (
    <section className="wrap" id="join" aria-labelledby="join-title" data-page="Join">
      <div className="closing clay clay--dark" data-reveal>
        <div className="closing__copy">
          <h2 id="join-title" data-split>
            Three jobs that really work beat thirty broken listings.
          </h2>
          <p>
            We&apos;re starting narrow: inbox-to-sheet, lead follow-ups and launch-post packs. Tell us whether
            you&apos;re selling or buying — it takes three short steps.
          </p>
        </div>
        <div className="closing__cta">
          <Link className="btn btn--light btn--lg" href="/join" data-magnetic>
            Join <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
