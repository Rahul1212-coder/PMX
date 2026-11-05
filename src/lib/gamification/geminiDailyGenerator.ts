import { getAiClient, getAiModel } from '@/lib/ai';
import { DailyChallenge, ChallengeQuestion } from '@/types/gamification';

export interface GenerateDailyChallengeOptions {
  theme?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  challengeDate?: string;
}

/**
 * Generates a high-rigor PMVerse Daily 5 Challenge using Google Gemini AI.
 * Enforces strict guidelines: all 4 options must be of similar length,
 * identical professional tone, plausible PM reasoning, with NO obvious/silly distractors.
 */
export async function generateDailyChallengeWithGemini(
  options: GenerateDailyChallengeOptions = {}
): Promise<DailyChallenge> {
  const aiClient = getAiClient();
  const model = getAiModel('gemini-3.5-flash');

  const challengeDate = options.challengeDate || new Date().toISOString().split('T')[0];
  const difficulty = options.difficulty || 'intermediate';
  const theme = options.theme || 'Metrics, Strategy, Growth, Experimentation, and Execution';

  const prompt = `You are the Principal Product Director and Head of PM Assessment at Google and Stripe.
Generate a rigorous, realistic, senior-level 5-question Daily Challenge for product managers.

Challenge Theme: ${theme}
Difficulty: ${difficulty}
Date: ${challengeDate}

CRITICAL RULES FOR MULTIPLE CHOICE OPTIONS (STRICT REQUIREMENT):
1. SIMILAR TYPE & IDENTICAL TONE: All 4 options (A, B, C, D) for EVERY question MUST be of the EXACT SAME type, grammatical structure, and approximately equal character length (between 125 and 145 characters each). The correct option must NOT be noticeably longer, more detailed, or written in higher-level jargon than the distractors.
2. EQUAL PROFESSIONAL SOPHISTICATION: All 4 options must sound like credible, well-formulated proposals that a senior PM or Director would present in an executive product review.
3. NO SILLY OR OBVIOUS DISTRACTORS: NEVER generate joke options, illegal actions, absurd operational ideas, or obviously bad proposals (e.g., NEVER generate "sue customers", "ignore users", "fire the team", "force helicopter transit", "deploy untested code secretly", etc.).
4. REALISTIC PM TRAPS & TRADE-OFFS: Distractors must represent genuine, tempting PM anti-patterns or sub-optimal trade-offs:
   - Chasing top-of-funnel vanity metrics instead of cohort retention
   - Premature scaling or automation before establishing product-market fit
   - Heavy operational band-aids instead of sustainable self-serve software
   - Local optimization that causes severe downstream bottlenecks
   - Excessive gatekeeping or upfront friction that kills bottom-up adoption
5. EXACTLY ONE OPTIMAL ANSWER: Only one option is the true best answer according to first-principles product thinking, but distinguishing it must require careful PM judgment and trade-off analysis.
6. DISTRIBUTED CORRECT OPTIONS: Across the 5 questions, distribute the correct answer across A, B, C, and D (e.g. Q1: B, Q2: D, Q3: C, Q4: A, Q5: B). Do NOT make every correct answer B.

CONCRETE EXAMPLE OF WHAT TO AVOID VS WHAT TO GENERATE:
BAD EXAMPLE (NEVER DO THIS - OBVIOUS GIVEAWAY):
A: "Shut down the app." (20 chars - obviously wrong joke)
B: "We should implement a comprehensive multi-tier machine-learning dynamic pricing and customer segmentation engine that optimizes lifetime value." (145 chars - obviously right because it is long and detailed)
C: "Sue the competitors." (20 chars - obviously wrong)
D: "Do nothing." (11 chars - obviously wrong)

GOOD EXAMPLE (ALWAYS DO THIS - EQUAL SOPHISTICATION & SIMILAR LENGTH):
A: "Standardize exclusively on proximity routing to minimize provider transit overhead and protect localized suburban supply liquidity." (133 chars)
B: "Formulate a multi-objective composite score weighing distance, ratings, and current workload, setting dynamic radius limits in peak traffic." (140 chars)
C: "Prioritize customer satisfaction scores exclusively across all match assignments, absorbing provider travel delays through subsidy bonuses." (139 chars)
D: "Match providers purely based on historical seniority on the platform, prioritizing longest-tenured contractors for all customer bookings." (138 chars)

OUTPUT FORMAT (JSON ONLY):
{
  "title": "Concise, punchy challenge title",
  "theme": "Core PM domain theme",
  "description": "1-sentence summary of the challenge scope and dilemmas",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "orderIndex": 1,
      "skillCategory": "Metrics | Strategy | Growth | Experimentation | Execution | Discovery | Prioritization",
      "difficulty": "intermediate | advanced",
      "scenario": "2-3 sentences with concrete realistic numbers, conversion rates, and business context.",
      "questionText": "Direct, actionable decision question for the PM.",
      "options": [
        { "id": "A", "text": "Balanced proposal (125-145 chars)" },
        { "id": "B", "text": "Balanced proposal (125-145 chars)" },
        { "id": "C", "text": "Balanced proposal (125-145 chars)" },
        { "id": "D", "text": "Balanced proposal (125-145 chars)" }
      ],
      "correctOption": "A | B | C | D",
      "explanation": "Clear explanation of the winning first-principles product logic.",
      "optionExplanations": {
        "A": "Why A is either correct or a sub-optimal trade-off.",
        "B": "Why B is either correct or a sub-optimal trade-off.",
        "C": "Why C is either correct or a sub-optimal trade-off.",
        "D": "Why D is either correct or a sub-optimal trade-off."
      },
      "points": 20
    }
  ]
}
Return 5 questions in total.`;

  const completion = await aiClient.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content:
          'You are a senior PM assessment evaluator. Always generate JSON without markdown code blocks. Strictly ensure all 4 multiple choice options for every question are of equal length (125-145 characters) with similar grammatical structure and professional PM tone so the correct answer is not obvious by length or style.',
      },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.5,
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  const parsed = JSON.parse(raw);

  const cleanDateId = challengeDate.replace(/-/g, '');
  const challengeId = `dc_${cleanDateId}`;

  const questions: ChallengeQuestion[] = (parsed.questions || []).map(
    (q: any, idx: number) => {
      const rawOptions = (q.options || []).map((o: any) => ({
        id: String(o.id || '').toUpperCase(),
        text: String(o.text || '').trim(),
      }));

      // Ensure valid options A, B, C, D exist
      const standardIds = ['A', 'B', 'C', 'D'];
      const options = standardIds.map((id, optIdx) => {
        const found = rawOptions.find((o: any) => o.id === id) || rawOptions[optIdx];
        return {
          id,
          text: found?.text || `Structured PM intervention proposal ${id} evaluating strategic product trade-offs.`,
        };
      });

      return {
        id: `dq_${cleanDateId}_${idx + 1}`,
        challengeId,
        orderIndex: idx + 1,
        scenario: q.scenario || '',
        questionText: q.questionText || '',
        skillCategory: q.skillCategory || 'Product Sense',
        difficulty: q.difficulty || difficulty,
        options,
        correctOption: q.correctOption || 'A',
        explanation: q.explanation || '',
        optionExplanations: q.optionExplanations || {},
        points: q.points || 20,
      };
    }
  );

  return {
    id: challengeId,
    challengeDate,
    title: parsed.title || 'Daily Product Management Challenge',
    theme: parsed.theme || theme,
    description: parsed.description || '',
    difficulty: parsed.difficulty || difficulty,
    timezone: 'UTC',
    publicationStatus: 'published',
    questions,
    createdAt: new Date().toISOString(),
  };
}
