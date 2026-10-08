import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const { term, userRole, questionType } = await request.json();

    if (!term) {
      return NextResponse.json({ error: 'Term or concept is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      const openai = new OpenAI({ apiKey });
      const prompt = `You are a Principal Product Manager and PM Coach.
Explain the product management term or concept: "${term}".
Target audience: ${userRole || 'Aspiring or Current Product Manager'}.
Request type: ${questionType || 'comprehensive breakdown'}.

Return a JSON response with the following keys:
- summary: A punchy 1-2 sentence overview of the concept.
- inDepth: Detailed explanation, how it works in practice.
- formulaOrSteps: Step-by-step formula or checklist if applicable (or string "N/A").
- realWorldExample: Concrete example from a known product (e.g. Spotify, Uber, Slack, Stripe).
- pitfalls: 2-3 common traps PMs fall into when using this concept.
- interviewAdvice: How to bring this up effectively in a PM interview question.
Ensure your response is valid JSON only.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const raw = completion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(raw);
      return NextResponse.json({ success: true, data: parsed, source: 'openai' });
    }

    // High quality intelligent fallback if OPENAI_API_KEY is not set yet
    const fallbackData = {
      summary: `"${term}" is a fundamental product management concept used to align cross-functional teams, make disciplined trade-offs, and ensure customer value creation.`,
      inDepth: `In day-to-day PM practice, "${term}" serves as a decision-making rubric. Rather than relying on gut feelings or executive mandates, high-performing product squads use this concept to de-risk investments before writing code.`,
      formulaOrSteps: '1. Problem Discovery → 2. Hypothesis Formulation → 3. Metric Definition → 4. Iterative Rollout → 5. Retrospective Review',
      realWorldExample: `Leading tech organizations like Linear, Spotify, and Figma apply this to bridge the gap between business objectives (retention, ARR) and real customer user journeys.`,
      pitfalls: '1. Over-indexing on the theory without talking to actual users.\n2. Treating frameworks as dogmatic rules rather than alignment tools.\n3. Failing to measure downstream retention and engagement.',
      interviewAdvice: `Frame your answer around: "Context → Action → Metric Impact". Explain why you chose this framework and what trade-offs you navigated.`,
    };

    return NextResponse.json({
      success: true,
      data: fallbackData,
      source: 'offline-preview',
      note: 'Add OPENAI_API_KEY in .env.local to activate live OpenAI GPT-4o-mini generation.',
    });
  } catch (error: any) {
    console.error('Error generating AI explanation:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate explanation' },
      { status: 500 }
    );
  }
}
