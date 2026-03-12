interface LandingProps {
  onBegin: () => void;
}

export default function Landing({ onBegin }: LandingProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="card-slate text-center">
        <p className="text-lg text-slate-200 leading-relaxed mb-4">
          Your representatives hear from lobbyists every day.
        </p>
        <p className="text-base text-slate-200 leading-relaxed mb-8">
          Not sure how to contact Congress? We'll find your representatives, learn what you care about, and write a message on your behalf — ready to send in minutes.
        </p>
        <button
          onClick={onBegin}
          className="btn-primary text-lg px-8 py-4"
        >
          Get Started →
        </button>
      </div>
    </div>
  );
}
