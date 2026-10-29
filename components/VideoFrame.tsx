type VideoFrameProps = {
  src?: string;
  title: string;
  placeholder: string;
};

export default function VideoFrame({ src, title, placeholder }: VideoFrameProps) {
  return (
    <div className="video-well">
      {src ? (
        <div className="video">
          <video controls preload="metadata" playsInline aria-label={title} src={src} />
        </div>
      ) : (
        <div className="video video--empty" role="img" aria-label={`${title} — coming soon`}>
          <span className="video__stage" aria-hidden="true">
            <span className="video__pulse" />
            <span className="video__pulse video__pulse--late" />
            <span className="video__play glass" />
          </span>
          <span className="video__label">{placeholder}</span>
        </div>
      )}
    </div>
  );
}
