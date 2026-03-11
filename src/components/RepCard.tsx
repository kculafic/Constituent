import { Representative } from '../types';

interface RepCardProps {
  rep: Representative;
}

export default function RepCard({ rep }: RepCardProps) {
  const getPartyColor = (party?: string) => {
    if (!party) return 'bg-gray-100 text-gray-800';
    if (party.toLowerCase().includes('democrat')) return 'bg-blue-100 text-blue-800';
    if (party.toLowerCase().includes('republican')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        {rep.photoUrl && (
          <img
            src={rep.photoUrl}
            alt={rep.name}
            className="w-20 h-20 rounded-full object-cover"
          />
        )}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{rep.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{rep.office}</p>
          {rep.party && (
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getPartyColor(rep.party)}`}
            >
              {rep.party}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {rep.phones && rep.phones.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <span className="font-semibold text-gray-700">Phone:</span>
            <a
              href={`tel:${rep.phones[0]}`}
              className="text-blue-900 hover:underline"
            >
              {rep.phones[0]}
            </a>
          </div>
        )}

        {rep.address && rep.address.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <span className="font-semibold text-gray-700">Office:</span>
            <span className="text-gray-600">{rep.address[0]}</span>
          </div>
        )}

        {rep.urls && rep.urls.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <span className="font-semibold text-gray-700">Website:</span>
            <a
              href={rep.urls[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-900 hover:underline"
            >
              Visit Website
            </a>
          </div>
        )}

        {rep.channels && rep.channels.length > 0 && (
          <div className="flex gap-2 mt-3">
            {rep.channels.map((channel, idx) => (
              <a
                key={idx}
                href={getSocialMediaUrl(channel.type, channel.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700"
              >
                {channel.type}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
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
