'use client';

import React, { useState, useEffect } from 'react';
import { AssessmentQuestion, AssessmentLevelId, CompetencyCategory } from '@/types/assessment';
import {
  ShieldAlert,
  Search,
  Filter,
  Plus,
  Edit2,
  Eye,
  CheckCircle2,
  XCircle,
  BarChart3,
  Layers,
  Award,
  AlertCircle,
  X,
  Save,
  Trash2,
  RotateCcw,
} from 'lucide-react';

interface AssessmentAdminViewProps {
  adminEmail: string;
  onClose: () => void;
}

export const AssessmentAdminView: React.FC<AssessmentAdminViewProps> = ({
  adminEmail,
  onClose,
}) => {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'questions' | 'analytics'>('questions');

  // Filters
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [competencyFilter, setCompetencyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [previewQuestion, setPreviewQuestion] = useState<AssessmentQuestion | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<AssessmentQuestion | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [adminEmail]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [qRes, sRes] = await Promise.all([
        fetch(`/api/assessment/admin/questions?adminEmail=${encodeURIComponent(adminEmail)}`),
        fetch(`/api/assessment/admin/stats?adminEmail=${encodeURIComponent(adminEmail)}`),
      ]);

      const qData = await qRes.json();
      const sData = await sRes.json();

      if (qData.success) {
        setQuestions(qData.questions || []);
      }
      if (sData.success) {
        setStats(sData.stats);
      }
    } catch (err) {
      console.error('Failed to load admin assessment data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/assessment/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail,
          question: editingQuestion,
        }),
      });

      const json = await res.json();
      if (json.success) {
        alert('Question saved successfully!');
        setEditingQuestion(null);
        loadData();
      } else {
        alert(json.error || 'Failed to save question');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving question');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (levelFilter !== 'all' && q.levelId !== levelFilter) return false;
    if (competencyFilter !== 'all' && q.competency !== competencyFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        q.title.toLowerCase().includes(query) ||
        q.questionText.toLowerCase().includes(query) ||
        (q.scenario && q.scenario.toLowerCase().includes(query))
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 overflow-y-auto">
      <div className="bg-[#f3f2f2] border-2 border-[#201e1d] max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl relative text-left animate-in fade-in zoom-in-95 my-6">
        {/* Header */}
        <div className="p-6 pb-4 border-b-2 border-[rgba(32,30,29,0.15)] flex items-start justify-between bg-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="tag bg-purple-100 text-purple-900 border border-purple-300 font-bold text-[10px] uppercase">
                Administrator Control Center
              </span>
              <span className="tag bg-slate-100 text-slate-700 text-[10px] font-mono">
                {adminEmail}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#201e1d] m-0">
              Assessment Bank & Governance
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 border border-[#201e1d] hover:bg-[#201e1d] hover:text-[#f3f2f2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b-2 border-[rgba(32,30,29,0.15)] bg-slate-50 text-xs font-bold px-6">
          <button
            onClick={() => setActiveTab('questions')}
            className={`py-3 px-4 border-b-2 -mb-[2px] transition-colors ${
              activeTab === 'questions'
                ? 'border-[#ec3013] text-[#ec3013]'
                : 'border-transparent text-slate-600 hover:text-[#201e1d]'
            }`}
          >
            Question Bank ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-4 border-b-2 -mb-[2px] transition-colors ${
              activeTab === 'analytics'
                ? 'border-[#ec3013] text-[#ec3013]'
                : 'border-transparent text-slate-600 hover:text-[#201e1d]'
            }`}
          >
            Platform Performance & Analytics
          </button>
        </div>

        {/* Tab 1: Question Bank Manager */}
        {activeTab === 'questions' && (
          <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
            {/* Filter bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="relative sm:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search questions by title, scenario, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#201e1d] text-xs font-medium outline-none"
                />
              </div>

              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="bg-white border border-[#201e1d] p-2 text-xs font-bold"
              >
                <option value="all">All Levels (3)</option>
                <option value="beginner">Beginner (15 Qs)</option>
                <option value="intermediate">Intermediate (15 Qs)</option>
                <option value="advanced">Advanced (10 Qs)</option>
              </select>

              <select
                value={competencyFilter}
                onChange={(e) => setCompetencyFilter(e.target.value)}
                className="bg-white border border-[#201e1d] p-2 text-xs font-bold"
              >
                <option value="all">All Competencies (5)</option>
                <option value="Product Sense & User Empathy">Product Sense</option>
                <option value="Data & Analytical Thinking">Data & Analytics</option>
                <option value="Prioritization & Execution">Prioritization</option>
                <option value="Strategy & Business Thinking">Strategy & Business</option>
                <option value="Communication & Decision-Making">Communication</option>
              </select>
            </div>

            {/* Questions Table */}
            <div className="bg-white border-2 border-[#201e1d] overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#201e1d] text-white text-[10px] uppercase font-bold tracking-wider">
                    <th className="p-3">#</th>
                    <th className="p-3">Level / Difficulty</th>
                    <th className="p-3">Title & Question</th>
                    <th className="p-3">Competency</th>
                    <th className="p-3">Format</th>
                    <th className="p-3">Answer Key</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {filteredQuestions.map((q, idx) => (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-bold text-[#201e1d]">
                        <span className="capitalize">{q.levelId}</span>
                        <span className="block text-[10px] font-normal text-slate-500 uppercase">{q.difficulty}</span>
                      </td>
                      <td className="p-3 max-w-xs">
                        <span className="font-bold text-[#201e1d] block truncate">{q.title}</span>
                        <span className="text-[11px] text-slate-500 line-clamp-1">{q.questionText}</span>
                      </td>
                      <td className="p-3">
                        <span className="tag bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {q.competency}
                        </span>
                      </td>
                      <td className="p-3 uppercase text-[10px] font-bold text-slate-600">
                        {q.format.replace('_', ' ')}
                      </td>
                      <td className="p-3 font-mono font-bold">
                        {q.correctOption ? (
                          <span className="tag bg-emerald-100 text-emerald-900 border border-emerald-300">
                            Key: {q.correctOption}
                          </span>
                        ) : (
                          <span className="tag bg-blue-100 text-blue-900 border border-blue-300">
                            Rubric ({q.rubric?.length || 5} Dims)
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-1 shrink-0">
                        <button
                          onClick={() => setPreviewQuestion(q)}
                          className="p-1 border border-slate-300 hover:border-[#201e1d] hover:bg-slate-100 transition-colors"
                          title="Preview Question"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingQuestion(q)}
                          className="p-1 border border-slate-300 hover:border-[#201e1d] hover:bg-slate-100 transition-colors"
                          title="Edit Question"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Analytics & Performance */}
        {activeTab === 'analytics' && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            {stats ? (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-white border border-[#201e1d]/20">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Question Bank</span>
                    <span className="text-2xl font-black text-[#201e1d]">{stats.totalQuestions} Questions</span>
                    <span className="text-[10px] text-slate-500 block mt-1">15 Beginner · 15 Intermediate · 10 Advanced</span>
                  </div>

                  <div className="p-4 bg-white border border-[#201e1d]/20">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Assessment Attempts</span>
                    <span className="text-2xl font-black text-[#ec3013]">{stats.totalAttempts} Attempts</span>
                    <span className="text-[10px] text-slate-500 block mt-1">{stats.totalCompleted} Completed</span>
                  </div>

                  <div className="p-4 bg-white border border-[#201e1d]/20">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Benchmark Certification Bar</span>
                    <span className="text-2xl font-black text-emerald-700">70% Pass Rule</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Prerequisite required to unlock higher tiers</span>
                  </div>
                </div>

                {/* Level Completion Breakdown */}
                <div className="bg-white border-2 border-[#201e1d] p-5">
                  <h3 className="text-sm font-black text-[#201e1d] mb-4">Level Performance & Pass Rates</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {Object.entries(stats.levelStats || {}).map(([lvl, s]: [string, any]) => (
                      <div key={lvl} className="p-3 bg-slate-50 border border-slate-200 space-y-1">
                        <span className="font-bold text-xs uppercase text-[#201e1d] block">{lvl}</span>
                        <div className="flex justify-between text-[11px] pt-1">
                          <span className="text-slate-500">Completions:</span>
                          <span className="font-bold">{s.completions}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Pass Rate:</span>
                          <span className="font-bold text-emerald-700">{s.passRate}%</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Average Score:</span>
                          <span className="font-bold text-[#ec3013]">{s.avgScore}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Common Missed Questions */}
                {stats.commonIncorrectQuestions && stats.commonIncorrectQuestions.length > 0 && (
                  <div className="bg-white border-2 border-[#201e1d] p-5">
                    <h3 className="text-sm font-black text-[#201e1d] mb-3">
                      Most Common Question Drop-offs / Incorrect Selections
                    </h3>
                    <div className="space-y-2">
                      {stats.commonIncorrectQuestions.map((q: any) => (
                        <div key={q.questionId} className="p-2.5 bg-rose-50/50 border border-rose-200 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-[#201e1d]">{q.title}</span>
                            <span className="text-[10px] font-mono text-slate-500 ml-2 capitalize">({q.levelId})</span>
                          </div>
                          <span className="font-bold text-rose-700 font-mono">
                            {q.misses} / {q.totalAttempts} missed ({Math.round((q.misses / q.totalAttempts) * 100)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center text-slate-500">Loading platform stats...</div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t-2 border-[rgba(32,30,29,0.15)] bg-slate-50 flex justify-end">
          <button onClick={onClose} className="btn btn-secondary text-xs font-bold px-6 py-2">
            Close Admin View
          </button>
        </div>

        {/* -------------------------------------------------------------------
            MODAL: PREVIEW QUESTION
        ------------------------------------------------------------------- */}
        {previewQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
            <div className="bg-white border-2 border-[#201e1d] max-w-2xl w-full p-6 shadow-2xl relative text-left max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-start pb-3 border-b border-slate-200 mb-4">
                <div>
                  <span className="tag tag-accent text-[9px] font-bold uppercase">{previewQuestion.levelId}</span>
                  <h3 className="text-lg font-black text-[#201e1d] mt-1 m-0">{previewQuestion.title}</h3>
                </div>
                <button onClick={() => setPreviewQuestion(null)} className="p-1 hover:bg-slate-100">
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {previewQuestion.scenario && (
                <div className="p-3 bg-slate-50 border border-slate-200 font-serif text-slate-800 text-xs mb-4">
                  {previewQuestion.scenario}
                </div>
              )}

              <p className="font-bold text-sm text-[#201e1d] mb-4">{previewQuestion.questionText}</p>

              {previewQuestion.options && (
                <div className="space-y-2 mb-4">
                  {previewQuestion.options.map((opt) => (
                    <div
                      key={opt.key}
                      className={`p-3 border text-xs ${
                        opt.key === previewQuestion.correctOption
                          ? 'bg-emerald-50 border-emerald-400 font-bold'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <span className="font-bold">{opt.key}. {opt.text}</span>
                      {opt.key === previewQuestion.correctOption && (
                        <span className="tag bg-emerald-600 text-white ml-2 text-[9px]">CORRECT KEY</span>
                      )}
                      {previewQuestion.optionExplanations?.[opt.key] && (
                        <p className="text-[11px] text-slate-600 mt-1 font-normal pl-2 border-l border-slate-300">
                          {previewQuestion.optionExplanations[opt.key]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="p-3 bg-emerald-50 text-emerald-950 border border-emerald-300 text-xs">
                <span className="font-bold block mb-1">Authoritative Explanation:</span>
                <p>{previewQuestion.explanation}</p>
              </div>

              <div className="pt-4 flex justify-end mt-4">
                <button
                  onClick={() => setPreviewQuestion(null)}
                  className="btn btn-secondary text-xs font-bold py-1.5 px-4"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            MODAL: EDIT QUESTION
        ------------------------------------------------------------------- */}
        {editingQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
            <form
              onSubmit={handleSaveQuestion}
              className="bg-white border-2 border-[#201e1d] max-w-2xl w-full p-6 shadow-2xl relative text-left max-h-[85vh] overflow-y-auto text-xs space-y-4"
            >
              <div className="flex justify-between items-start pb-3 border-b border-slate-200">
                <h3 className="text-base font-black text-[#201e1d] m-0">Edit Question ({editingQuestion.id})</h3>
                <button type="button" onClick={() => setEditingQuestion(null)} className="p-1 hover:bg-slate-100">
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Title</label>
                <input
                  type="text"
                  value={editingQuestion.title}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, title: e.target.value })}
                  className="w-full p-2 border border-[#201e1d] font-bold text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Scenario (Optional Context)</label>
                <textarea
                  value={editingQuestion.scenario || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, scenario: e.target.value })}
                  rows={2}
                  className="w-full p-2 border border-[#201e1d] text-xs font-serif"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Question Prompt</label>
                <textarea
                  value={editingQuestion.questionText}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                  rows={2}
                  className="w-full p-2 border border-[#201e1d] text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-slate-700">Correct Option Key</label>
                  <select
                    value={editingQuestion.correctOption || 'A'}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, correctOption: e.target.value as any })}
                    className="w-full p-2 border border-[#201e1d] font-bold"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700">Scoring Weight</label>
                  <input
                    type="number"
                    value={editingQuestion.scoringWeight}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, scoringWeight: Number(e.target.value) || 1 })}
                    className="w-full p-2 border border-[#201e1d] font-bold"
                    min={1}
                    max={10}
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Authoritative Explanation</label>
                <textarea
                  value={editingQuestion.explanation}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  rows={3}
                  className="w-full p-2 border border-[#201e1d] text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="btn btn-secondary text-xs font-bold py-1.5 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary text-xs font-bold py-1.5 px-5 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
