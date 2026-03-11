import { useState } from 'react';

const ISSUES = [
  'Healthcare',
  'Climate',
  'Education',
  'Immigration',
  'Housing',
  'Voting Rights',
  'Economic Policy',
  'Gun Safety',
  'Criminal Justice',
  'Foreign Policy',
  'Social Security/Medicare',
  'LGBTQ+ Rights',
  'Labor/Workers Rights',
  'Veterans Affairs',
  'Free Press/Democracy',
];

const ISSUE_PLACEHOLDERS: Record<string, string> = {
  'Healthcare': 'How does this affect you personally? Mention any specific bills (e.g. ACA, Medicare for All).',
  'Climate': 'What climate impacts concern you most? Mention specific legislation or local effects.',
  'Education': 'How does education policy affect your family or community? Reference specific programs or funding.',
  'Immigration': 'How does immigration policy affect you or your community? Mention specific reform proposals.',
  'Housing': 'How does housing affordability or policy affect you? Mention rent control, zoning, or assistance programs.',
  'Voting Rights': 'What voting access issues matter to you? Reference specific bills or restrictions.',
  'Economic Policy': 'How do economic policies affect your financial situation? Mention taxes, inflation, or specific proposals.',
  'Gun Safety': 'What gun safety measures do you support? Reference specific legislation like background checks or red flag laws.',
  'Criminal Justice': 'What criminal justice reforms matter to you? Mention sentencing, police accountability, or rehabilitation.',
  'Foreign Policy': 'What international issues concern you? Reference specific conflicts, alliances, or foreign aid.',
  'Social Security/Medicare': 'How do these programs affect you or your family? Mention benefit levels or program changes.',
  'LGBTQ+ Rights': 'What LGBTQ+ rights issues matter to you? Reference specific protections or discrimination concerns.',
  'Labor/Workers Rights': 'What labor issues affect you? Mention wages, unions, workplace safety, or worker protections.',
  'Veterans Affairs': 'How do VA policies affect you or veterans you know? Mention healthcare, benefits, or services.',
  'Free Press/Democracy': 'What threats to democracy or press freedom concern you? Reference specific legislation or incidents.',
};

interface IssueSelectorProps {
  onIssueSelect: (issue: string, notes: string, billNumber?: string) => void;
}

export default function IssueSelector({ onIssueSelect }: IssueSelectorProps) {
  const [selectedIssue, setSelectedIssue] = useState<string>('');
  const [issueNotes, setIssueNotes] = useState<string>('');
  const [billNumber, setBillNumber] = useState('');

  const handleSelect = (issue: string) => {
    setSelectedIssue(issue);
    setIssueNotes('');
    setBillNumber('');
  };

  const handleContinue = () => {
    if (selectedIssue) {
      onIssueSelect(selectedIssue, issueNotes, billNumber || undefined);
    }
  };

  return (
    <div className="card-slate">
      <h2 className="text-3xl font-bold text-white mb-4">
        What issue do you want to address?
      </h2>
      <p className="text-sm text-slate-300 mb-6 leading-relaxed">
        The most effective letters focus on a single issue. Pick the one that matters most to you right now — you can always come back for another.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {ISSUES.map((issue) => (
          <button
            key={issue}
            onClick={() => handleSelect(issue)}
            className={`px-5 py-3 rounded-full font-semibold transition-all ${selectedIssue === issue
              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
              : 'bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600'
              }`}
          >
            {issue}
          </button>
        ))}
      </div>

      {selectedIssue && (
        <div className="space-y-4 border-t border-slate-700 pt-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Why does this issue matter to you? (Optional, but highly recommended)
            </label>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              This helps us write in your voice. What's your personal connection to this issue — does it affect your family, your job, your neighborhood?
            </p>
            <textarea
              value={issueNotes}
              onChange={(e) => setIssueNotes(e.target.value)}
              placeholder="Example: I have a daughter with asthma and the air quality in our neighborhood has gotten noticeably worse over the past two years..."
              rows={4}
              className="w-full px-4 py-3 bg-[#0f1729] border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Specific Bill Number (optional)
            </label>
            <input
              type="text"
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
              placeholder="e.g., H.R. 1234 or S. 567"
              className="w-full px-4 py-3 bg-[#0f1729] border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-slate-500"
            />
          </div>

          <button
            onClick={handleContinue}
            className="w-full btn-primary"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
