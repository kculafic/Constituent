interface LandingProps {
  onBegin: () => void;
}

export default function Landing({ onBegin }: LandingProps) {
  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      {/* <h1 className="text-5xl font-bold text-white mb-6">
        Make Your Voice Count
      </h1> */}
      <p className="text-xl text-slate-200 leading-relaxed mb-12 max-w-xl mx-auto">
        Your representatives hear from lobbyists every day.
        <br />
        Hearing from YOU, a real constituent — is rarer than you think, and more powerful. Let's make it count.
      </p>
      <button
        onClick={onBegin}
        className="btn-primary text-lg px-8 py-4"
      >
        Get Started →
      </button>
    </div>
  );
}
