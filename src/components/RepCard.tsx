import { Representative } from '../types';
import { useState } from 'react';

interface RepCardProps {
  rep: Representative;
  onClick?: () => void;
  selected?: boolean;
}

export default function RepCard({ rep, onClick, selected }: RepCardProps) {
  const [imageError, setImageError] = useState(false);

  // Debug logging
  console.log('RepCard data:', {
    name: rep.name,
    bioguideId: rep.bioguideId,
    firstTermStart: rep.firstTermStart,
  });

  const getPartyColor = (party?: string) => {
    if (!party) return 'bg-gray-500/10 text-gray-400';
    if (party.toLowerCase().includes('democrat')) return 'bg-blue-500/10 text-blue-400';
    if (party.toLowerCase().includes('republican')) return 'bg-red-500/10 text-red-400';
    return 'bg-gray-500/10 text-gray-400';
  };

  const getPartyDotColor = (party?: string) => {
    if (!party) return 'bg-gray-500';
    if (party.toLowerCase().includes('democrat')) return 'bg-blue-500';
    if (party.toLowerCase().includes('republican')) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const calculateYearsInOffice = (firstTermStart?: string) => {
    if (!firstTermStart) return null;
    const start = new Date(firstTermStart);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    return years;
  };

  const getRoleLabel = (office?: string) => {
    if (!office) return null;
    if (office.includes('Senator')) return 'U.S. Senator';
    if (office.includes('Representative')) return 'U.S. Representative';
    return null;
  };

  const photoUrl = rep.bioguideId && !imageError
    ? `https://unitedstates.github.io/images/congress/225x275/${rep.bioguideId}.jpg`
    : null;

  const yearsInOffice = calculateYearsInOffice(rep.firstTermStart);
  const roleLabel = getRoleLabel(rep.office);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg p-5 border-2 transition-all ${
        selected
          ? 'border-blue-500 bg-blue-900/20'
          : 'border-slate-700 bg-[#0f1729] hover:border-slate-600'
      }`}
    >
      <div className="flex items-start gap-4">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={rep.name}
            onError={() => setImageError(true)}
            className="w-16 h-20 rounded object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-20 rounded bg-slate-700 flex items-center justify-center flex-shrink-0">
            <svg className="w-8 h-8 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white mb-1">{rep.name}</h3>

          {roleLabel && (
            <p className="text-xs text-slate-400 mb-2">{roleLabel}</p>
          )}

          <p className="text-sm text-slate-200 mb-2">{rep.office}</p>

          <div className="flex flex-wrap items-center gap-3">
            {rep.party && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getPartyColor(rep.party)}`}>
                <div className={`w-2 h-2 rounded-full ${getPartyDotColor(rep.party)}`}></div>
                {rep.party}
              </span>
            )}

            {yearsInOffice !== null && yearsInOffice > 0 && (
              <span className="text-xs text-slate-400">
                {yearsInOffice} {yearsInOffice === 1 ? 'year' : 'years'} in office
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function getSocialMediaUrl(type: string, id: string): string {
  const typeLower = type.toLowerCase();
  if (typeLower === 'twitter' || typeLower === 'x') {
    return `https://twitter.com/${id}`;
  }
  if (typeLower === 'facebook') {
    return `https://facebook.com/${id}`;
  }
  if (typeLower === 'youtube') {
    return `https://youtube.com/${id}`;
  }
  return '#';
}
