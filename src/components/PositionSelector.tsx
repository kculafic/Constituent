import { useState } from 'react';

interface PositionSelectorProps {
  onPositionSelect: (position: 'support' | 'oppose', personalNote: string) => void;
}

export default function PositionSelector({ onPositionSelect }: PositionSelectorProps) {
  const [position, setPosition] = useState<'support' | 'oppose' | null>(null);
  const [personalNote, setPersonalNote] = useState('');

  const handleContinue = () => {
    if (position) {
      onPositionSelect(position, personalNote);
    }
  };

  return (
    <div className="card-slate">
      <h2 className="text-3xl font-bold text-white mb-6">
        Your Position
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setPosition('support')}
          className={`p-8 rounded-xl font-bold text-lg transition-all ${
            position === 'support'
              ? 'bg-green-600 text-white shadow-lg shadow-green-600/30 scale-105'
              : 'bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600'
          }`}
        >
          <div className="text-4xl mb-3">✓</div>
          <div>Support</div>
        </button>

        <button
          onClick={() => setPosition('oppose')}
          className={`p-8 rounded-xl font-bold text-lg transition-all ${
            position === 'oppose'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105'
              : 'bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600'
          }`}
        >
          <div className="text-4xl mb-3">✗</div>
          <div>Oppose</div>
        </button>
      </div>

      <div className="mb-6">
        <label htmlFor="personalNote" className="block text-sm font-medium text-slate-200 mb-3">
          Why does this matter to you? (Optional, 1-2 sentences)
        </label>
        <textarea
          id="personalNote"
          value={personalNote}
          onChange={(e) => setPersonalNote(e.target.value)}
          rows={4}
          placeholder="e.g., As a teacher in your district, I see how this affects my students every day..."
          className="w-full px-4 py-3 bg-[#0f1729] border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-white placeholder-slate-500 leading-relaxed"
        />
        <p className="text-xs text-slate-500 mt-2">
          Personal stories make your message more impactful
        </p>
      </div>

      <button
        onClick={handleContinue}
        disabled={!position}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );
}
