import { useState, useEffect } from 'react';
import Landing from './components/Landing';
import ZipLookup from './components/ZipLookup';
import IssueSelector from './components/IssueSelector';
import PositionSelector from './components/PositionSelector';
import ProgressStepper from './components/ProgressStepper';
import RepCard from './components/RepCard';
import { Representative } from './types';
import { generateLetter } from './services/gemini';

type Step = 'landing' | 'zip' | 'reps' | 'issue' | 'position' | 'generate';

const TIPS = [
  "Tip: For issues tied to a specific bill or vote, call the DC office. For local impact stories, call the district office — both matter",
  "Tip: Staffers read constituent mail and report back to the Member — your letter matters",
  "Tip: Personalizing your letter makes it stand out from form mail, which can often become lost in the mix.",
  "Tip: Following up once, about two weeks later, reinforces your message"
];

function TipCarousel() {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <p className="text-sm text-slate-300 italic mt-4">
      {TIPS[tipIndex]}
    </p>
  );
}

function App() {
  const [step, setStep] = useState<Step>('landing');
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [selectedRep, setSelectedRep] = useState<Representative | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<string>('');
  const [issueNotes, setIssueNotes] = useState<string>('');
  const [billNumber, setBillNumber] = useState<string>('');
  const [position, setPosition] = useState<'support' | 'oppose' | null>(null);
  const [personalNote, setPersonalNote] = useState<string>('');
  const [generatedLetter, setGeneratedLetter] = useState<string>('');
  const [generatedPhoneScript, setGeneratedPhoneScript] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(false);
  const [repBios, setRepBios] = useState<Map<string, string>>(new Map());
  const [loadingBios, setLoadingBios] = useState(false);

  const handleRepsFound = async (reps: Representative[]) => {
    setRepresentatives(reps);
    setStep('reps');

    // Pre-load all bios
    setLoadingBios(true);
    const biosMap = new Map<string, string>();

    // Load cached bios from localStorage
    const cachedBios = localStorage.getItem('repBios');
    const bioCache: Record<string, string> = cachedBios ? JSON.parse(cachedBios) : {};

    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_KEY;
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    // DEV MODE: Set to true to use mock bios and skip API calls
    const USE_MOCK_BIOS = false;

    console.log('Fetching bios for', reps.length, 'representatives');

    await Promise.all(
      reps.map(async (rep) => {
        // Check cache first
        if (bioCache[rep.name]) {
          console.log('Using cached bio for:', rep.name);
          biosMap.set(rep.name, bioCache[rep.name]);
          return;
        }

        // Mock bio for development
        if (USE_MOCK_BIOS) {
          const mockBio = `${rep.name} has served in ${rep.office} representing their constituents on key issues including healthcare, infrastructure, and economic policy. Known for bipartisan collaboration and constituent services. They have been a vocal advocate for their district's priorities in Congress.`;
          console.log('Using mock bio for:', rep.name);
          biosMap.set(rep.name, mockBio);
          bioCache[rep.name] = mockBio;
          return;
        }

        try {
          console.log('Fetching bio for:', rep.name);
          const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `In 3-4 sentences, summarize ${rep.name}'s political background, notable positions, and general voting record. Write for a general audience with no jargon.`
                }]
              }]
            })
          });

          console.log('Response for', rep.name, ':', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('Data for', rep.name, ':', data);
            const bio = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (bio) {
              console.log('Setting bio for', rep.name);
              biosMap.set(rep.name, bio);
              // Cache the bio
              bioCache[rep.name] = bio;
            } else {
              console.error('No bio text for', rep.name);
            }
          } else {
            const errorText = await response.text();
            console.error(`API error for ${rep.name}:`, response.status, errorText);
            // If rate limited, add placeholder so UI still works
            if (response.status === 429) {
              biosMap.set(rep.name, `${rep.name} represents ${rep.office}. [Bio temporarily unavailable due to API rate limits]`);
            }
          }
        } catch (error) {
          console.error(`Failed to fetch bio for ${rep.name}:`, error);
        }
      })
    );

    // Save updated cache to localStorage
    localStorage.setItem('repBios', JSON.stringify(bioCache));

    console.log('All bios fetched. Map size:', biosMap.size);
    console.log('Map contents:', Array.from(biosMap.entries()));
    setRepBios(biosMap);
    setLoadingBios(false);
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
    await generateContent(pos, note);
  };

  const generateContent = async (pos: 'support' | 'oppose', note: string) => {
    setGenerating(true);
    setGenerationError(false);
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
      setGenerationError(true);
    } finally {
      setGenerating(false);
    }
  };

  const handleRetryGeneration = () => {
    if (position) {
      generateContent(position, personalNote);
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
                    <RepCard
                      key={index}
                      rep={rep}
                      onClick={() => setSelectedRep(rep)}
                      selected={selectedRep === rep}
                    />
                  ))}
                </div>

                {selectedRep && (
                  <div className="mt-6 p-5 bg-slate-800/50 rounded-lg border border-slate-700">
                    {loadingBios ? (
                      <div className="flex items-center gap-3 text-slate-300">
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                        <span className="text-sm">Loading representative info...</span>
                      </div>
                    ) : (
                      <>
                        {repBios.get(selectedRep.name) && (
                          <div className="mb-4">
                            <p className="text-sm text-slate-200 leading-relaxed">{repBios.get(selectedRep.name)}</p>
                          </div>
                        )}
                        {selectedRep.urls && selectedRep.urls.length > 0 && (
                          <a
                            href={selectedRep.urls[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 mb-4"
                          >
                            View official website →
                          </a>
                        )}
                        <button
                          onClick={handleContinueToIssue}
                          className="w-full py-3 px-6 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors mt-4"
                        >
                          Continue with {selectedRep.name} →
                        </button>
                      </>
                    )}
                  </div>
                )}
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
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-lg mb-2">Writing your letter... this usually takes 10–15 seconds</p>
                    <TipCarousel />
                  </div>
                )}

                {!generating && generationError && (
                  <div className="text-center py-12">
                    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 max-w-md mx-auto">
                      <p className="text-slate-200 mb-4">
                        We're experiencing high demand right now — please try again in a few minutes.
                      </p>
                      <button
                        onClick={handleRetryGeneration}
                        className="w-full py-3 px-6 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}

                {!generating && !generationError && generatedLetter && (
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
