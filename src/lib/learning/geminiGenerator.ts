import { getAiClient, getAiModel, isGeminiActive } from '@/lib/ai';
import {
  LearningItem,
  LearningItemType,
  LearningCategory,
  LearningDifficulty,
  GenerateMaterialRequest,
} from '@/types/learning';

/**
 * Generate a complete, professionally rigorous PM learning item using Google Gemini AI.
 */
export async function generateLearningMaterialWithGemini(
  request: GenerateMaterialRequest
): Promise<{ material: LearningItem; source: 'gemini' | 'openai' | 'fallback' }> {
  const { type, topic, category = 'Product Thinking', difficulty = 'intermediate', contextOrNotes } = request;

  const itemSlug = topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const itemId = `lm_${type}_${Date.now()}`;

  try {
    const aiClient = getAiClient();
    const model = getAiModel('gemini-3.5-flash');

    let systemInstructions = '';
    let jsonSchemaInstructions = '';

    if (type === 'concept') {
      systemInstructions = `You are a Principal Product Manager and elite PM educator.
Create a comprehensive, practical, and highly detailed Product Management Concept guide on: "${topic}".
Target Category: ${category}
Target Difficulty: ${difficulty}
Additional Context: ${contextOrNotes || 'None'}

Your job is to teach an aspiring Product Manager with real-world scenarios, concrete trade-offs, and zero corporate fluff.`;

      jsonSchemaInstructions = `Return valid JSON matching this schema:
{
  "title": "${topic} (or refined authoritative title)",
  "summary": "Punchy 1-2 sentence definition explaining what this is and why it matters.",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "readTimeMinutes": 5,
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "conceptDetail": {
    "simpleExplanation": "Layman intuition: how you would explain this to a 10-year-old or non-tech friend.",
    "pmScenario": "Concrete daily PM operational scenario: specific data, meeting situation, or trade-off.",
    "industryExample": "Real famous company battle story (e.g. Uber, Netflix, Figma, Spotify, Stripe) demonstrating this.",
    "whenToUse": "Specific phase, roadmap moment, or team situation when you should apply this.",
    "whenNotToUse": "When applying this framework causes harm, creates blindspots, or fails.",
    "interviewQuestion": "The exact question an interviewer at Google, Meta, or a high-growth startup will ask regarding this.",
    "pitfalls": [
      "Common mistake 1",
      "Common mistake 2",
      "Common mistake 3"
    ],
    "relatedKeys": ["related-topic-1", "related-topic-2"]
  }
}`;
    } else if (type === 'case_study') {
      systemInstructions = `You are an executive Product Director and interviewer designing a real-world PM case study on: "${topic}".
Target Category: ${category}
Target Difficulty: ${difficulty}
Additional Context: ${contextOrNotes || 'None'}

Design a realistic product problem case with real metrics, root cause diagnosis, trade-off evaluation, and model answer for an aspiring PM.`;

      jsonSchemaInstructions = `Return valid JSON matching this schema:
{
  "title": "Case Study: ${topic}",
  "summary": "1-2 sentence overview of the business challenge and dilemma.",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "readTimeMinutes": 8,
  "tags": ["Case Study", "RCA", "Interview", "${category}"],
  "caseStudyDetail": {
    "company": "Company name (e.g., Airbnb, DoorDash, Linear, Shopify, or realistic company)",
    "product": "Product / Feature area",
    "businessModel": "How it monetizes and key unit economics",
    "backgroundScenario": "Realistic paragraph explaining the crisis, problem context, or strategic crossroad.",
    "keyMetrics": {
      "Primary Metric": "e.g. Drop from 72% to 48%",
      "Counter Metric": "e.g. Churn up 12%",
      "Volume": "e.g. 500k monthly transactions"
    },
    "coreChallengeQuestion": "The central PM question the candidate must solve.",
    "hypotheses": [
      {
        "hypothesis": "Root cause hypothesis 1",
        "validationMethod": "How to validate using analytics, user tests, or database logs",
        "dataSignal": "What specific signal in the data proves or disproves it"
      },
      {
        "hypothesis": "Root cause hypothesis 2",
        "validationMethod": "How to validate",
        "dataSignal": "Data signal"
      }
    ],
    "frameworkUsed": "The structured framework to approach the problem (e.g., Funnel Diagnostics + User Journey Segmentation)",
    "recommendedAction": "The prioritized 3-step action plan to resolve the crisis and improve the product.",
    "tradeOffAnalysis": "What are you intentionally sacrificing or risking with this decision?",
    "interviewerRubric": [
      "Evaluation criterion 1 for top-tier candidates",
      "Evaluation criterion 2",
      "Evaluation criterion 3"
    ]
  }
}`;
    } else {
      // teardown
      systemInstructions = `You are a Principal PM and product craft expert performing a deep-dive Product Teardown of: "${topic}".
Target Category: ${category}
Target Difficulty: ${difficulty}
Additional Context: ${contextOrNotes || 'None'}

Deconstruct why this product wins, its growth loop, UX micro-interactions, business model, and what an aspiring PM should learn from it.`;

      jsonSchemaInstructions = `Return valid JSON matching this schema:
{
  "title": "Product Teardown: ${topic}",
  "summary": "1-2 sentence breakdown of why this product is special and its core strategic wedge.",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "readTimeMinutes": 8,
  "tags": ["Teardown", "PLG", "UX", "Product Strategy"],
  "teardownDetail": {
    "company": "Company name",
    "productName": "Product name",
    "heroTagline": "Official or deconstructed value proposition",
    "targetPersona": "Primary ideal customer profile (ICP)",
    "coreJtbd": "When [situation], I want to [motivation], so I can [expected outcome].",
    "growthLoopOrWedge": "Step-by-step description of the self-reinforcing viral or retention loop.",
    "uxFlowBreakdown": [
      {
        "stepTitle": "Step 1: First-time UX / Hook",
        "userGoal": "What user wants to achieve",
        "screenDescription": "What happens on the interface",
        "pmInsight": "Why this design choice matters from a product standpoint"
      },
      {
        "stepTitle": "Step 2: Core Value Delivery / Aha Moment",
        "userGoal": "User goal",
        "screenDescription": "Screen description",
        "pmInsight": "PM insight"
      },
      {
        "stepTitle": "Step 3: Expansion / Habit Formation",
        "userGoal": "User goal",
        "screenDescription": "Screen description",
        "pmInsight": "PM insight"
      }
    ],
    "monetizationEngine": "How the product captures value (pricing tiers, expansion triggers, usage limits).",
    "keyMetricsTheyTrack": [
      "Key North Star metric 1",
      "Retention metric 2",
      "Monetization metric 3"
    ],
    "pmLessonsLearned": [
      "Tactical takeaway 1 for aspiring PMs",
      "Tactical takeaway 2",
      "Tactical takeaway 3"
    ],
    "areasForImprovement": [
      "Blindspot or competitive vulnerability 1",
      "UX flaw or retention leakage 2"
    ]
  }
}`;
    }

    const prompt = `${systemInstructions}\n\n${jsonSchemaInstructions}\n\nEnsure your output is strictly valid JSON only without markdown codeblocks or extra text.`;

    let completion: any = null;
    let lastErr: any = null;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        completion = await aiClient.chat.completions.create({
          model,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.6,
        });
        if (completion?.choices?.[0]?.message?.content) {
          break;
        }
      } catch (err: any) {
        lastErr = err;
        if (attempt < 2 && (err?.status === 503 || err?.status === 429)) {
          // Wait 1 second before retry
          await new Promise((res) => setTimeout(res, 1000));
          continue;
        }
        throw err;
      }
    }

    if (!completion) {
      throw lastErr || new Error('No completion returned from Gemini');
    }

    const raw = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw);

    const generatedItem: LearningItem = {
      id: itemId,
      slug: itemSlug || `material-${Date.now()}`,
      title: parsed.title || topic,
      type,
      category: parsed.category || category,
      difficulty: parsed.difficulty || difficulty,
      readTimeMinutes: Number(parsed.readTimeMinutes) || 6,
      summary: parsed.summary || `Comprehensive learning breakdown on ${topic}.`,
      tags: Array.isArray(parsed.tags) ? parsed.tags : [topic, category],
      conceptDetail: parsed.conceptDetail,
      caseStudyDetail: parsed.caseStudyDetail,
      teardownDetail: parsed.teardownDetail,
      publishedAt: new Date().toISOString(),
      isPublished: true,
      isCustom: true,
      author: {
        name: 'VerseAI',
        role: 'AI Product Mentor',
        isAi: true,
      },
    };

    return {
      material: generatedItem,
      source: isGeminiActive() ? 'gemini' : 'openai',
    };
  } catch (error) {
    console.warn('Gemini AI generation failed, using intelligent high-yield fallback:', error);
    const fallbackMaterial = createFallbackLearningMaterial(request, itemId, itemSlug);
    return {
      material: fallbackMaterial,
      source: 'fallback',
    };
  }
}

/**
 * High-quality deterministic fallback if API keys are missing or offline
 */
function createFallbackLearningMaterial(
  request: GenerateMaterialRequest,
  id: string,
  slug: string
): LearningItem {
  const { type, topic, category = 'Product Thinking', difficulty = 'intermediate' } = request;

  if (type === 'concept') {
    return {
      id,
      slug,
      title: topic,
      type: 'concept',
      category,
      difficulty,
      readTimeMinutes: 5,
      summary: `A foundational Product Management framework exploring the core mechanisms and trade-offs of ${topic}.`,
      tags: [topic, category, 'Framework', 'Best Practices'],
      publishedAt: new Date().toISOString(),
      isPublished: true,
      isCustom: true,
      author: { name: 'PMVerse Curriculum', role: 'Staff PM Mentor', isAi: true },
      conceptDetail: {
        simpleExplanation: `${topic} describes how product teams systematically solve user pain points while driving business outcomes. Think of it as aligning team energy around measurable customer value.`,
        pmScenario: `During sprint planning, the cross-functional team must decide how to deploy engineering capacity to optimize ${topic}. The PM analyzes user analytics, segments cohorts, and structures an A/B test.`,
        industryExample: `Industry leaders like Stripe, Airbnb, and Spotify utilize ${topic} to protect core habit loops and eliminate user drop-off across critical journeys.`,
        whenToUse: `Apply ${topic} when aligning quarterly goals, diagnosing funnel leakage, or presenting business trade-offs to executive stakeholders.`,
        whenNotToUse: `Avoid applying ${topic} blindly without counter-metrics and guardrail indicators to ensure long-term trust is preserved.`,
        interviewQuestion: `How would you explain your strategy for optimizing ${topic} during your most recent product release?`,
        pitfalls: [
          `Optimizing for vanity numbers instead of true retention.`,
          `Failing to communicate technical constraints to business stakeholders.`,
          `Relying on assumptions rather than talking directly to users.`,
        ],
        relatedKeys: ['concept-nsm', 'concept-activation'],
      },
    };
  }

  if (type === 'case_study') {
    return {
      id,
      slug,
      title: `Case Study: Diagnosing ${topic}`,
      type: 'case_study',
      category,
      difficulty,
      readTimeMinutes: 7,
      summary: `An end-to-end root-cause analysis and strategic recovery roadmap tackling ${topic}.`,
      tags: ['Case Study', 'RCA', topic, category],
      publishedAt: new Date().toISOString(),
      isPublished: true,
      isCustom: true,
      author: { name: 'PMVerse Case Squad', role: 'Staff PM Mentor', isAi: true },
      caseStudyDetail: {
        company: 'Fast-Growing Tech Enterprise',
        product: `${topic} Operational Engine`,
        businessModel: 'Subscription & Transactional SaaS',
        backgroundScenario: `The team observed an abrupt 24% dip in core engagement metrics related to ${topic} following a recent release. Leadership demands an immediate diagnostic and corrective action plan.`,
        keyMetrics: {
          'Core Funnel Conversion': 'Dropped 24%',
          'Cohort Retention': 'Down 8%',
          'Support Escalations': 'Up 3.2x',
        },
        coreChallengeQuestion: `As the Lead PM, how would you structure your diagnostic to isolate the root cause of this dip and prioritize the fix?`,
        hypotheses: [
          {
            hypothesis: 'Friction in the newly introduced user verification step.',
            validationMethod: 'Inspect drop-off funnel telemetry per screen step.',
            dataSignal: '78% of drop-offs concentrated on the third step.',
          },
          {
            hypothesis: 'Unintended latency regression in third-party API response.',
            validationMethod: 'Review backend p95 and p99 response time logs.',
            dataSignal: 'API latency spiked from 180ms to 4,200ms.',
          },
        ],
        frameworkUsed: 'Issue Tree Decomposition (Technical Latency vs UX Friction vs Cohort Misalignment)',
        recommendedAction: '1. Roll back the problematic microservice endpoint immediately to restore baseline conversion.\n2. Redesign the user interaction with asynchronous optimistic states.\n3. Implement synthetic latency alerts to catch regressions before users are impacted.',
        tradeOffAnalysis: 'Rolling back delays the new feature rollout by one sprint, but saves approximately $180k in weekly lost revenue.',
        interviewerRubric: [
          'Candidate immediately segmented data by device, browser, and user tenure.',
          'Candidate distinguished between technical regression vs user behavior change.',
          'Candidate communicated clearly with empathy for both users and engineering constraints.',
        ],
      },
    };
  }

  // teardown
  return {
    id,
    slug,
    title: `Product Teardown: ${topic}`,
    type: 'teardown',
    category,
    difficulty,
    readTimeMinutes: 8,
    summary: `A tactical UX and business teardown dissecting the product strategy and growth engine of ${topic}.`,
    tags: ['Teardown', 'PLG', topic, category],
    publishedAt: new Date().toISOString(),
    isPublished: true,
    author: { name: 'PMVerse Teardown Lab', role: 'Staff PM Mentor', isAi: true },
    isCustom: true,
    teardownDetail: {
      company: topic,
      productName: topic,
      heroTagline: `Empowering users through seamless modern software craft.`,
      targetPersona: 'Modern professionals, engineers, and product builders seeking speed and clarity.',
      coreJtbd: `When I need to accomplish complex workflows, I want an intuitive and fast tool, so that I can focus on high-impact work.`,
      growthLoopOrWedge: `Delightful self-serve onboarding -> Organic team invite loop -> Viral product expansion -> Enterprise upgrade.`,
      uxFlowBreakdown: [
        {
          stepTitle: 'Step 1: Seamless Onboarding & Fast TTFV',
          userGoal: 'Experience value in under 2 minutes.',
          screenDescription: 'Minimalist sign-up with immediate interactive workspace generation.',
          pmInsight: 'Cuts cognitive load and deposits user directly into the core editor.',
        },
        {
          stepTitle: 'Step 2: Collaborative Multi-Player Loop',
          userGoal: 'Share work effortlessly with colleagues.',
          screenDescription: 'Real-time presence, deep-linking, and frictionless invite modals.',
          pmInsight: 'Drives virality without paid advertising costs.',
        },
        {
          stepTitle: 'Step 3: Enterprise Upgrade Trigger',
          userGoal: 'Manage team security, compliance, and custom roles.',
          screenDescription: 'Administrative dashboard with SSO and compliance controls.',
          pmInsight: 'Captures willingness-to-pay from enterprise procurement teams.',
        },
      ],
      monetizationEngine: 'Tiered SaaS with usage-based expansion tiers and enterprise security add-ons.',
      keyMetricsTheyTrack: [
        'Time-to-First-Value (TTFV)',
        'Weekly Collaborative Teams (2+ seats)',
        'Net Dollar Retention (NDR)',
      ],
      pmLessonsLearned: [
        'Speed is an underappreciated product feature that directly drives user love.',
        'Design micro-interactions that reward users with tangible feedback and momentum.',
        'Align your pricing model with how customers naturally receive ongoing value.',
      ],
      areasForImprovement: [
        'Mobile web companion experience needs feature parity with desktop.',
        'Search and historical indexing can slow down as workspaces scale to 100k+ assets.',
      ],
    },
  };
}
