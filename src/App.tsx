import { useState } from 'react';
import Landing from './components/Landing';
import ZipLookup from './components/ZipLookup';
import IssueSelector from './components/IssueSelector';
import PositionSelector from './components/PositionSelector';
import ProgressStepper from './components/ProgressStepper';
import { Representative } from './types';
import { generateLetter } from './services/gemini';

type Step = 'landing' | 'zip' | 'reps' | 'issue' | 'position' | 'generate';

function App() {
  const [step, setStep] = useState<Step>('landing');
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [selectedRep, setSelectedRep] = useState<Representative | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<string>('');
  const [issueNotes, setIssueNotes] = useState<string>('');
  const [billNumber, setBillNumber] = useState<string>('');
  const [position, setPosition] = useState<'support' | 'oppose' | null>(null);
  const [personalNote, setPersonalNote] = useState<string>('');
  const [hasSpecificDistrict, setHasSpecificDistrict] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<string>('');
  const [generatedPhoneScript, setGeneratedPhoneScript] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  const handleRepsFound = (reps: Representative[], hasDistrict: boolean) => {
    setRepresentatives(reps);
    setHasSpecificDistrict(hasDistrict);
    setStep('reps');
  };

  const handleContinueToIssue = () => {
    setStep('issue');
  };

  const handleIssueSelect = (issue: string, notes: string, bill?: string) => {
    setSelectedIssue(issue);
    setIssueNotes(notes);
    if (bill) {
      setBillNumber(bill);
    }
    setStep('position');
  };

  const handlePositionSelect = async (pos: 'support' | 'oppose', note: string) => {
    setPosition(pos);
    setPersonalNote(note);
    setStep('generate');

    // Auto-generate on reaching this step
    setGenerating(true);
    try {
      const result = await generateLetter({
        representatives: selectedRep ? [selectedRep] : [],
        issue: selectedIssue,
        billNumber: billNumber || undefined,
        position: pos,
        personalNote: `${issueNotes}\n\n${note}`.trim() || undefined,
      });
      setGeneratedLetter(result.letter);
      setGeneratedPhoneScript(result.phoneScript);
    } catch (error) {
      console.error('Failed to generate content:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = () => {
    setStep('landing');
    setRepresentatives([]);
    setSelectedRep(null);
    setSelectedIssue('');
    setIssueNotes('');
    setBillNumber('');
    setPosition(null);
    setPersonalNote('');
    setHasSpecificDistrict(false);
  };

  return (
    <div className="min-h-screen bg-[#0f1729]">
      <div className="container mx-auto px-4 py-12 max-w-[800px]">
        <header className="text-center mb-4">
          <h1 className="text-6xl font-bold text-white mb-3">
            Constituent.
          </h1>
          <p className="text-2xl text-slate-200">
            Make your voice count.
          </p>
        </header>

        <div className="space-y-6">
          {step === 'landing' && (
            <Landing onBegin={() => setStep('zip')} />
          )}

          {step === 'zip' && (
            <div>
              <ProgressStepper currentStep={step} />
              <ZipLookup onRepsFound={handleRepsFound} />
            </div>
          )}

          {step === 'reps' && representatives.length > 0 && (
            <div>
              <ProgressStepper currentStep={step} />
              <div className="card-slate">
                <h2 className="text-2xl font-bold text-white mb-3">
                  Select Your Representative
                </h2>
                <p className="text-sm text-slate-300 mb-6">
                  Choose which representative you'd like to contact
                </p>
                <div className="space-y-3 mb-6">
                  {representatives.map((rep, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedRep(rep)}
                      className={`w-full text-left rounded-lg p-5 border-2 transition-all ${selectedRep === rep
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-slate-700 bg-[#0f1729] hover:border-slate-600'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1">{rep.name}</h3>
                          <p className="text-sm text-slate-200 mb-2">{rep.office}</p>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${rep.party?.includes('Democratic') ? 'bg-blue-500' : rep.party?.includes('Republican') ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                            <p className="text-sm text-slate-200">{rep.party}</p>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleContinueToIssue}
                  disabled={!selectedRep}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${selectedRep
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                >
                  Continue to Select Issue
                </button>
              </div>
            </div>
          )}

          {step === 'issue' && (
            <div>
              <ProgressStepper currentStep={step} />
              <IssueSelector onIssueSelect={handleIssueSelect} />
            </div>
          )}

          {step === 'position' && (
            <div>
              <ProgressStepper currentStep={step} />
              <div className="space-y-4">
                <div className="card-slate">
                  <p className="text-sm text-slate-200">
                    <span className="font-semibold text-white">Selected Issue:</span> {selectedIssue}
                    {billNumber && ` (${billNumber})`}
                  </p>
                </div>
                <PositionSelector onPositionSelect={handlePositionSelect} />
              </div>
            </div>
          )}

          {step === 'generate' && (
            <div>
              <ProgressStepper currentStep={step} />
              <div className="card-slate">
                <h2 className="text-3xl font-bold text-white mb-6">
                  Your Generated Messages
                </h2>

                {generating && (
                  <div className="text-center text-slate-200 py-12">
                    <p className="text-lg mb-4">Generating your personalized messages...</p>
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                )}

                {!generating && generatedLetter && (
                  <div className="space-y-6">
                    {/* Letter Section */}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">Letter</h3>
                      <div className="bg-[#0f1729] p-5 rounded-lg border border-slate-700">
                        <pre className="text-slate-200 whitespace-pre-wrap font-sans text-sm leading-relaxed">{generatedLetter}</pre>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(generatedLetter)}
                        className="mt-3 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
                      >
                        Copy Letter
                      </button>
                    </div>

                    {/* Phone Script Section */}
                    <div>
                      <h3 className="text-xl font-bold text-white mb-3">Phone Script</h3>
                      <div className="bg-[#0f1729] p-5 rounded-lg border border-slate-700">
                        <pre className="text-slate-200 whitespace-pre-wrap font-sans text-sm leading-relaxed">{generatedPhoneScript}</pre>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(generatedPhoneScript)}
                        className="mt-3 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
                      >
                        Copy Phone Script
                      </button>
                    </div>

                    {/* How to Send Section */}
                    <div className="bg-blue-900/20 p-5 rounded-lg border border-blue-700/30">
                      <h3 className="text-lg font-bold text-white mb-3">How to Send Effectively</h3>
                      <ul className="text-sm text-slate-200 space-y-2 list-disc list-inside">
                        <li>Call during business hours (9 AM - 5 PM local time)</li>
                        <li>Email and physical mail both work - mail has more impact</li>
                        <li>Be polite and professional with staff members</li>
                        <li>Include your full name and address to verify you're a constituent</li>
                        <li>Follow up if you don't receive a response within 2 weeks</li>
                      </ul>
                    </div>

                    <button
                      onClick={handleReset}
                      className="w-full btn-secondary mt-6"
                    >
                      Start Over
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
