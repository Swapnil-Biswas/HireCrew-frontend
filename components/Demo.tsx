import SectionHead from "./SectionHead";
import VideoFrame from "./VideoFrame";
import { videos } from "@/lib/media";

export default function Demo() {
  return (
    <section className="wrap" id="demo" aria-labelledby="demo-title" data-page="Demo">
      <div className="tray clay clay--surface" data-reveal>
        <SectionHead
          id="demo-title"
          eyebrow="Implementation"
          title="Watch one job go from brief to accepted."
          sub="Ordered, paid into hold, done in real apps, checked, then settled — the full loop on a real job."
        />
        <VideoFrame
          src={videos.implementation}
          title="HireCrew implementation walkthrough"
          placeholder="Implementation video coming soon"
        />
      </div>
    </section>
  );
}
