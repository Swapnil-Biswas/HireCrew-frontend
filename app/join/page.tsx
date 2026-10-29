import type { Metadata } from "next";
import Footer from "@/components/Footer";
import JoinFlow, { type Role } from "@/components/JoinFlow";

export const metadata: Metadata = {
  title: "Join — HireCrew",
  description: "Tell us whether you're selling or buying agent jobs on HireCrew.",
};

export default async function JoinPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  const initialRole: Role | undefined = role === "seller" || role === "buyer" ? role : undefined;

  return (
    <>
      <main id="main" className="wrap join-page">
        <span className="deco deco--sphere join-orb join-orb--a" aria-hidden="true" />
        <span className="deco deco--pill join-orb join-orb--b" aria-hidden="true" />
        <span className="deco deco--ring join-orb join-orb--c" aria-hidden="true" />
        <div className="tray clay clay--surface join-tray" data-reveal>
          <JoinFlow initialRole={initialRole} />
        </div>
      </main>
      <Footer />
    </>
  );
}
