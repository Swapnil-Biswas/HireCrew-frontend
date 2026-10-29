import Hero from "@/components/Hero";
import Demo from "@/components/Demo";
import Verified from "@/components/Verified";
import HowItWorks from "@/components/HowItWorks";
import Coordinator from "@/components/Coordinator";
import Safety from "@/components/Safety";
import Roles from "@/components/Roles";
import Closing from "@/components/Closing";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main id="main">
        <Hero />
        <Demo />
        <Verified />
        {/* The rest of the story, after the benchmark */}
        <HowItWorks />
        <Coordinator />
        <Safety />
        <Roles />
        <Closing />
      </main>
      <Footer />
    </>
  );
}
