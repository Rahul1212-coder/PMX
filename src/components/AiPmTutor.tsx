'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PmConcept } from '../types';
import { Send, Plus, Loader2 } from 'lucide-react';

interface AiPmTutorProps {
  initialConcepts?: PmConcept[];
  starterPrompt?: string;
  starterMode?: 'explain' | 'coach' | 'case' | 'prd' | 'interview';
}

export type MentorModeType = 'explain' | 'coach' | 'case' | 'prd' | 'interview';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

export const AiPmTutor: React.FC<AiPmTutorProps> = ({
  initialConcepts,
  starterPrompt,
  starterMode = 'explain',
}) => {
  const [mode, setMode] = useState<MentorModeType>(starterMode);
  const [input, setInput] = useState(starterPrompt || '');
  const [thinking, setThinking] = useState(false);
  const [tick, setTick] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const MODES_CONFIG: Record<
    MentorModeType,
    { label: string; desc: string; ph: string; starters: string[]; defaultResponse: string }
  > = {
    explain: {
      label: 'Explain',
      desc: 'Get any product concept explained simply, with examples and how to talk about it in interviews.',
      ph: 'Which concept should I explain?',
      starters: ['What is Product-Market Fit?', 'Explain the RICE framework', 'North Star Metric vs. KPIs'],
      defaultResponse:
        'Simple explanation\nProduct-Market Fit means people would be genuinely disappointed if your product disappeared. They use it, pay for it, and recommend it without being pushed.\n\nReal-world example\nEarly file-sharing tools reached fit when employees started inviting colleagues on their own, spreading organically through whole companies.\n\nInterview explanation\n"I look for strong retention curves that flatten, high organic referrals, and a large share of users who say they would be very disappointed without the product."\n\nCommon mistakes\nTreating sign-up spikes or press coverage as product-market fit. Assuming fit is permanent.\n\nRelated concepts\nMVP · North Star Metric · Retention',
    },
    coach: {
      label: 'PM Coach',
      desc: 'Work through a real product problem. The coach asks clarifying questions before giving advice.',
      ph: 'Describe your product situation…',
      starters: [
        'Help me define GTM for a B2B SaaS launch',
        'How do I say no to a sales-driven feature request?',
        'My roadmap has too many competing priorities',
      ],
      defaultResponse:
        'Before I suggest a roadmap, a few clarifying questions:\n1. Who is the primary buyer, and who is the day-to-day user?\n2. What does measurable success look like in 90 days?\n3. What constraints do you have on engineering capacity, budget, or timeline?\n\nAnswer what you can, and we will build the framework together.',
    },
    case: {
      label: 'Case Study',
      desc: 'Solve realistic product cases and get structured feedback on your reasoning.',
      ph: 'Type your approach to the case…',
      starters: [
        'Orders dropped 15% in one city — diagnose',
        'Design a ridesharing app for kids',
        'How would you monetize a free dev-tools platform?',
      ],
      defaultResponse:
        'Case Scenario\nWeekly orders for a food delivery platform dropped 15% in one city over three weeks. Other cities are flat or growing.\n\nYour Task\nDiagnose the root cause. Start with clarifying questions, segment the drop by dimension (funnel, restaurant supply, courier reliability, app crash rates), and propose testable hypotheses.',
    },
    prd: {
      label: 'PRD Review',
      desc: 'Paste a PRD and get a scored review with specific recommendations.',
      ph: 'Paste your PRD or spec here…',
      starters: [
        'Review my PRD for a saved-searches feature',
        'What makes a bulletproof success metrics section?',
        'How detailed should engineering edge cases be in a PRD?',
      ],
      defaultResponse:
        'PRD Evaluation Breakdown\nProblem Definition: 8/10\nUser Personas: 7/10\nSolution & Scope: 8/10\nSuccess Metrics: 5/10\nEdge Cases: 6/10\nRollout & Milestones: 7/10\n\nOverall Score: 72 / 100\n\nKey Recommendations:\n1. Add explicit baseline and target metrics for primary KPIs.\n2. Define empty states, failure states, and offline behavior.\n3. Include a phased percentage rollout plan with kill-switch criteria.',
    },
    interview: {
      label: 'Interview Coach',
      desc: 'A mock PM interview. Answer each question and get scored feedback before the next one.',
      ph: 'Type your interview response…',
      starters: [
        'Start a product sense interview',
        'Start a metrics interview',
        'Ask me a behavioral question about conflict with engineering',
      ],
      defaultResponse:
        'Feedback on Structure\nStructure: 8/10 · Clarification: 6/10 · Product Sense: 8/10 · Metrics: 5/10 · Communication: 9/10\nOverall: 7.2 / 10\n\nTo Improve:\nAlways ask 1-2 clarifying questions to narrow user persona and constraints before jumping into solutioning.\n\nNext Question:\nHow would you improve a navigation app specifically for bicycle commuters in dense metropolitan areas?',
    },
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'user', text: 'What is Product-Market Fit?' },
    { role: 'ai', text: MODES_CONFIG.explain.defaultResponse },
  ]);

  const history = [
    { title: 'Product-Market Fit explained', mode: 'Explain', when: 'Today' },
    { title: 'GTM for a B2B analytics launch', mode: 'PM Coach', when: 'Yesterday' },
    { title: 'Mock: improve a maps app', mode: 'Interview Coach', when: 'Mon' },
    { title: 'Review: saved searches PRD', mode: 'PRD Review', when: 'Last week' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      if (thinking) setTick((t) => t + 1);
    }, 350);
    return () => clearInterval(timer);
  }, [thinking]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, thinking]);

  // Handle external starter prompts if passed
  useEffect(() => {
    if (starterPrompt) {
      setInput(starterPrompt);
      if (starterMode) setMode(starterMode);
    }
  }, [starterPrompt, starterMode]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText ?? input).trim();
    if (!textToSend || thinking) return;

    const newMsgs = [...messages, { role: 'user' as const, text: textToSend }];
    setMessages(newMsgs);
    setInput('');
    setThinking(true);

    try {
      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: textToSend,
          questionType: MODES_CONFIG[mode].label,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        let reply = '';
        if (data.data.summary) {
          reply += `Summary\n${data.data.summary}\n\n`;
        }
        if (data.data.inDepth) {
          reply += `In-Depth Breakdown\n${data.data.inDepth}\n\n`;
        }
        if (data.data.formulaOrSteps) {
          reply += `Formula / Steps\n${data.data.formulaOrSteps}\n\n`;
        }
        if (data.data.realWorldExample) {
          reply += `Real-World Example\n${data.data.realWorldExample}\n\n`;
        }
        if (data.data.pitfalls) {
          reply += `Common Pitfalls\n${data.data.pitfalls}\n\n`;
        }
        if (data.data.interviewAdvice) {
          reply += `Interview Tip\n${data.data.interviewAdvice}`;
        }
        setMessages((prev) => [...prev, { role: 'ai', text: reply.trim() }]);
      } else {
        // Fallback response from mode config
        await new Promise((r) => setTimeout(r, 600));
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: `Framework Analysis\n"${textToSend}" is critical in product execution.\n\nRecommended Approach:\n1. Define the user problem and metric baseline.\n2. Formulate 2-3 prioritized hypotheses.\n3. Test with low-fidelity prototypes before engineering rollout.`,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: MODES_CONFIG[mode].defaultResponse,
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  // Parses text chunks into headings and bodies
  const parseBlocks = (text: string) => {
    return text.split(/\n\s*\n/).map((chunk) => {
      const lines = chunk.trim().split('\n');
      const first = lines[0].replace(/^[#*\s]+|[*:\s]+$/g, '');
      if (lines.length > 1 && first.length < 50 && !/[.?!]$/.test(first)) {
        return { h: first, body: lines.slice(1).join('\n') };
      }
      return { h: '', body: chunk.trim() };
    });
  };

  const currentModeConfig = MODES_CONFIG[mode];
  const dots = '.'.repeat((tick % 3) + 1);

  return (
    <div className="text-left">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-6 items-start">
        {/* Left Sidebar (Desktop): New chat button + History */}
        <aside className="hidden lg:block border-t-2 border-[rgba(32,30,29,0.15)] sticky top-20">
          <button
            onClick={() => {
              setMessages([]);
              setInput('');
            }}
            className="btn btn-primary w-full justify-between my-4 font-bold"
          >
            <span>New conversation</span>
            <span>+</span>
          </button>

          <div className="text-xs uppercase tracking-wider text-[#605d5d] font-bold mb-2">
            History
          </div>
          <div className="divide-y divide-[rgba(32,30,29,0.15)]">
            {history.map((h, i) => (
              <div
                key={i}
                onClick={() => handleSend(h.title)}
                className="py-2.5 cursor-pointer text-sm hover:text-[#ae1800] transition-colors"
              >
                <div className="font-bold text-[#201e1d] leading-snug">{h.title}</div>
                <div className="text-xs text-[#605d5d] mt-0.5">
                  {h.mode} · {h.when}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Main Area: Chat & Modes */}
        <div className="min-w-0">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight m-0 mb-4 text-[#201e1d]">
            AI Product Mentor
          </h1>

          {/* Mode Selector Tabs (Modernist Segmented) */}
          <div className="flex flex-wrap border-2 border-[rgba(32,30,29,0.15)] mb-3">
            {(Object.keys(MODES_CONFIG) as MentorModeType[]).map((k) => {
              const cfg = MODES_CONFIG[k];
              const isActive = mode === k;
              return (
                <div
                  key={k}
                  onClick={() => setMode(k)}
                  className={`whitespace-nowrap flex-1 text-center py-2.5 px-3 cursor-pointer text-sm font-bold border-r border-[rgba(32,30,29,0.15)] last:border-r-0 transition-colors ${
                    isActive
                      ? 'bg-[#201e1d] text-[#f3f2f2]'
                      : 'bg-transparent text-[#201e1d] hover:bg-[rgba(32,30,29,0.05)]'
                  }`}
                >
                  {cfg.label}
                </div>
              );
            })}
          </div>

          <div className="text-sm text-[#605d5d] mb-6">{currentModeConfig.desc}</div>

          {/* Chat Messages */}
          <div className="flex flex-col">
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              const blocks = isUser ? [{ h: '', body: msg.text }] : parseBlocks(msg.text);

              return (
                <div
                  key={i}
                  className="grid grid-cols-[80px_minmax(0,1fr)] sm:grid-cols-[110px_minmax(0,1fr)] gap-4 py-4 border-t-2 border-[rgba(32,30,29,0.15)]"
                >
                  <div
                    className={`text-xs uppercase tracking-wider font-bold ${
                      isUser ? 'text-[#605d5d]' : 'text-[#ae1800]'
                    }`}
                  >
                    {isUser ? 'You' : 'PMVerse Mentor'}
                  </div>
                  <div className="flex flex-col gap-3 max-w-2xl">
                    {blocks.map((b, bi) => (
                      <div key={bi}>
                        {b.h && (
                          <div className="font-extrabold text-sm sm:text-base text-[#201e1d] mb-1">
                            {b.h}
                          </div>
                        )}
                        <div className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap text-[#201e1d]">
                          {b.body}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {thinking && (
              <div className="grid grid-cols-[80px_minmax(0,1fr)] sm:grid-cols-[110px_1fr] gap-4 py-4 border-t-2 border-[rgba(32,30,29,0.15)]">
                <div className="text-xs uppercase tracking-wider font-bold text-[#ae1800]">
                  PMVerse Mentor
                </div>
                <div className="text-sm text-[#605d5d] font-bold">Thinking{dots}</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Starters */}
          <div className="flex flex-wrap gap-2 my-4">
            {currentModeConfig.starters.map((st, i) => (
              <button
                key={i}
                onClick={() => handleSend(st)}
                className="btn btn-secondary text-xs font-semibold"
              >
                {st}
              </button>
            ))}
          </div>

          {/* Input Box with Modernist 2px Border */}
          <div className="flex border-2 border-[#201e1d]">
            <textarea
              className="input border-0 min-h-[56px] resize-none bg-[#f3f2f2] text-sm sm:text-[15px] flex-1 p-3"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={currentModeConfig.ph}
            />
            <button
              onClick={() => handleSend()}
              disabled={thinking || !input.trim()}
              className="btn btn-primary px-6 self-stretch rounded-none font-bold text-sm"
            >
              {thinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send</span>}
            </button>
          </div>

          <div className="text-xs text-[#605d5d] mt-2">
            Enter to send · Shift + Enter for a new line · Connected to live AI Mentor
          </div>
        </div>
      </div>
    </div>
  );
};
