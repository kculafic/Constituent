import { useState } from 'react';
import { getRepresentativesByZip } from '../services/civicInfo';
import { Representative } from '../types';

interface ZipLookupProps {
  onRepsFound: (reps: Representative[], hasSpecificDistrict: boolean) => void;
}

export default function ZipLookup({ onRepsFound }: ZipLookupProps) {
  const [street, setStreet] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!zipCode || zipCode.length !== 5 || !/^\d{5}$/.test(zipCode)) {
      setError('Please enter a valid 5-digit ZIP code');
      setLoading(false);
      return;
    }

    try {
      const data = await getRepresentativesByZip(zipCode, street || undefined);

      if (data.senators.length === 0 && data.houseReps.length === 0) {
        setError('No federal representatives found for this ZIP code');
        setLoading(false);
        return;
      }

      // Pass all reps combined and whether we found a specific district
      onRepsFound([...data.senators, ...data.houseReps], data.hasSpecificDistrict);
    } catch (err) {
      setError('Failed to fetch representatives. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="card-slate">
        <p className="text-l text-slate-200">
          (NOTE: Constiuent is currently a Prototype for{' '}
          <u>Illinois Residents only</u>
          {' '}- More States Coming Soon!)
        </p>
        <br />
        <label htmlFor="street" className="block text-sm font-medium text-slate-200 mb-3">
          Street address (optional but improves accuracy)
        </label>
        <input
          type="text"
          id="street"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="123 Main St"
          className="w-full px-5 py-3 bg-white border-0 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg font-medium text-black mb-4"
        />

        <label htmlFor="zipCode" className="block text-sm font-medium text-slate-200 mb-3">
          ZIP code
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            id="zipCode"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="60622"
            maxLength={5}
            className="flex-1 px-5 py-3 bg-white border-0 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg font-medium text-black"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? 'Loading...' : 'Find My Representatives'}
          </button>
        </div>
        {error && (
          <p className="mt-4 text-sm text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-700/30">{error}</p>
        )}
      </form>
    </div>
  );
}
