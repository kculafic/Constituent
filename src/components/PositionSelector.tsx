import { useState } from 'react';

interface PositionSelectorProps {
  onPositionSelect: (position: 'support' | 'oppose', personalNote: string) => void;
}

type StanceOption = 'stronger' | 'slow' | 'neutral';

const STANCE_MAP: Record<StanceOption, 'support' | 'oppose'> = {
  stronger: 'support',
  slow: 'oppose',
  neutral: 'support', // Maps to support but represents neutral stance
};

export default function PositionSelector({ onPositionSelect }: PositionSelectorProps) {
  const [stance, setStance] = useState<StanceOption | null>(null);
  const [personalNote, setPersonalNote] = useState('');

  const handleContinue = () => {
    if (stance) {
      const mappedPosition = STANCE_MAP[stance];
      onPositionSelect(mappedPosition, personalNote);
    }
  };

  return (
    <div className="card-slate">
      <h2 className="text-3xl font-bold text-white mb-6">
        Your Position
      </h2>

      <div className="space-y-3 mb-8">
        <button
          onClick={() => setStance('stronger')}
          className={`w-full text-left p-6 rounded-xl transition-all border-2 ${stance === 'stronger'
            ? 'bg-green-900/20 border-green-500 shadow-lg shadow-green-500/20'
            : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
            }`}
        >
          <div className="flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">🌱</div>
            <div>
              <div className="text-lg font-bold text-white mb-1">
                Take stronger action
              </div>
              <div className="text-sm text-slate-300">
                I want my representative to push harder on this issue
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setStance('slow')}
          className={`w-full text-left p-6 rounded-xl transition-all border-2 ${stance === 'slow'
            ? 'bg-red-900/20 border-red-500 shadow-lg shadow-red-500/20'
            : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
            }`}
        >
          <div className="flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">🛑</div>
            <div>
              <div className="text-lg font-bold text-white mb-1">
                Slow this down
              </div>
              <div className="text-sm text-slate-300">
                I want my representative to pump the brakes on current proposals
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setStance('neutral')}
          className={`w-full text-left p-6 rounded-xl transition-all border-2 ${stance === 'neutral'
            ? 'bg-blue-900/20 border-blue-500 shadow-lg shadow-blue-500/20'
            : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
            }`}
        >
          <div className="flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">💬</div>
            <div>
              <div className="text-lg font-bold text-white mb-1">
                Make my voice heard
              </div>
              <div className="text-sm text-slate-300">
                I don't have a strong position yet — I just want them to know this matters to me
              </div>
            </div>
          </div>
        </button>
      </div>

      <div className="mb-6">
        <label htmlFor="personalNote" className="block text-sm font-semibold text-white mb-2">
          Anything specific you want to tell your representative?
        </label>
        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          Optional — but if there's a specific bill, a local project, or something your rep has said publicly that you want to reference, add it here. This is your letter, not ours.
        </p>
        <textarea
          id="personalNote"
          value={personalNote}
          onChange={(e) => setPersonalNote(e.target.value)}
          rows={4}
          placeholder="Example: Example: I know you voted against the Clean Air Act extension last year and I'd like to understand why..."
          className="w-full px-4 py-3 bg-[#0f1729] border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-white placeholder-slate-500 leading-relaxed"
        />
      </div>

      <button
        onClick={handleContinue}
        disabled={!stance}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );
}
