import { Representative } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface GenerateLetterRequest {
  representatives: Representative[];
  issue: string;
  billNumber?: string;
  position: 'support' | 'oppose';
  personalNote?: string;
}

interface GenerateLetterResponse {
  letter: string;
  phoneScript: string;
}

export async function generateLetter(request: GenerateLetterRequest): Promise<GenerateLetterResponse> {
  const { representatives, issue, billNumber, position, personalNote } = request;

  const repNames = representatives.map(r => `${r.name} (${r.office})`).join(', ');
  const repPhone = representatives[0]?.phones?.[0] || '';
  const billInfo = billNumber ? ` regarding ${billNumber}` : '';
  const personalContext = personalNote ? `\n\nPersonal context from constituent: "${personalNote}"` : '';

  // DEV MODE: Set to true to use mock letters and skip API calls
  const USE_MOCK_GENERATION = true;

  if (USE_MOCK_GENERATION) {
    const mockLetter = `[Date]

Dear ${repNames},

I am writing to express my ${position === 'support' ? 'strong support for' : 'opposition to'} ${issue}${billInfo}. As your constituent, I believe this issue is critical to our community and requires immediate attention.

${position === 'support' ? 'Supporting' : 'Opposing'} this measure is essential because it directly impacts the wellbeing of families in our district. The policy implications affect healthcare access, economic opportunity, and the future of our community. I urge you to consider the long-term benefits this will bring to your constituents.

I respectfully request that you ${position === 'support' ? 'vote in favor of' : 'vote against'} this legislation and champion the interests of the people you represent. Thank you for your service and for considering my perspective on this important matter.

Sincerely,

[Your Name]
[Your Address]
[Your Phone/Email]`;

    const mockPhoneScript = `Phone: ${repPhone}

Hi, my name is [NAME] and I'm a constituent from [CITY].

I'm calling to ask ${representatives[0]?.name || 'the representative'} to ${position === 'support' ? 'support' : 'oppose'} ${issue}${billInfo}.

This is important to me because it affects our community's access to essential services and impacts families like mine. I believe ${position === 'support' ? 'supporting' : 'opposing'} this measure is the right choice for our district.

I respectfully ask that you ${position === 'support' ? 'vote yes' : 'vote no'} on this issue.

Thank you for your time and for representing our community.`;

    return { letter: mockLetter, phoneScript: mockPhoneScript };
  }

  const letterPrompt = `Write a professional, persuasive letter to ${repNames} ${position === 'support' ? 'supporting' : 'opposing'} ${issue}${billInfo}.${personalContext}

The letter should:
- Be formal and respectful
- Start with [Date] at the top (no sender address/name at the top)
- State the position clearly in the first paragraph
- Include 2-3 specific policy reasons
- Reference how this affects constituents
- Be 3-4 paragraphs maximum
- End with a clear call to action
- At the very bottom, after the closing, include placeholder lines for:
  [Your Name]
  [Your Address]
  [Your Phone/Email]

Format it as a complete letter with proper salutation and closing.`;

  const phonePrompt = `Write a concise phone script for calling ${repNames} to ${position === 'support' ? 'support' : 'oppose'} ${issue}${billInfo}.${personalContext}

The script should:
- Start with "Phone: ${repPhone}" at the very top
- Be brief (30-60 seconds when read aloud)
- Start introduction with: "Hi, my name is [NAME] and I'm a constituent from [CITY]"
- State position clearly
- Give 1-2 key reasons
- Make a specific ask
- Thank them for their time

Format as a readable script with clear sections.`;

  try {
    // Generate letter
    const letterResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: letterPrompt
          }]
        }]
      })
    });

    if (!letterResponse.ok) {
      throw new Error('Failed to generate letter');
    }

    const letterData = await letterResponse.json();
    const letter = letterData.candidates[0].content.parts[0].text;

    // Generate phone script
    const phoneResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: phonePrompt
          }]
        }]
      })
    });

    if (!phoneResponse.ok) {
      throw new Error('Failed to generate phone script');
    }

    const phoneData = await phoneResponse.json();
    const phoneScript = phoneData.candidates[0].content.parts[0].text;

    return { letter, phoneScript };
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}
