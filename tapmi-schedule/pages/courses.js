import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { COURSES, COURSE_COLORS } from '../lib/timetable';

// Syllabus reference from PGP Handbook 2026-28
const SYLLABUS = {
  "INB4101": {
    description: "Introduces fundamental accounting concepts, double-entry bookkeeping, and financial statement preparation.",
    topics: ["Accounting equation", "Journal entries", "Ledger posting", "Trial balance", "Financial statements"],
    evaluation: "Continuous assessment + End-term exam",
  },
  "INB4702": {
    description: "Practical Excel skills for business data analysis, modelling, and reporting.",
    topics: ["Formulas & functions", "PivotTables", "Data visualisation", "VLOOKUP / INDEX-MATCH", "Dashboard basics"],
    evaluation: "Practical assignment + In-class tests",
  },
  "INB4703": {
    description: "Understanding and applying AI tools for learning, research, and professional productivity.",
    topics: ["Generative AI overview", "Prompt engineering", "AI for research", "Ethics of AI", "Practical applications"],
    evaluation: "Project-based assessment",
  },
  "INB4901": {
    description: "Alternative learning methodologies including case studies, simulations, and experiential activities.",
    topics: ["Case method learning", "Role plays", "Group simulations", "Reflection practices"],
    evaluation: "Participation + Reflection assignments",
  },
  "INB5101": {
    description: "Comprehensive coverage of financial accounting standards, reporting, and analysis.",
    topics: ["IFRS basics", "P&L statement", "Balance sheet", "Cash flow statement", "Ratio analysis"],
    evaluation: "Assignments 30% + Mid-term 30% + End-term 40%",
  },
  "INB5201": {
    description: "Economic principles applied to managerial decision-making in domestic and international contexts.",
    topics: ["Demand & supply", "Elasticity", "Market structures", "Pricing strategy", "Macroeconomic environment"],
    evaluation: "Quizzes 20% + Mid-term 30% + End-term 50%",
  },
  "INB5401": {
    description: "Core marketing concepts, consumer behaviour, and strategy for global markets.",
    topics: ["STP framework", "4Ps of marketing", "Consumer behaviour", "Brand management", "Digital marketing"],
    evaluation: "Case analysis 30% + Mid-term 30% + End-term 40%",
  },
  "INB5502": {
    description: "Statistical methods and their application in business decision-making and data analysis.",
    topics: ["Descriptive statistics", "Probability", "Hypothesis testing", "Regression analysis", "Decision making under uncertainty"],
    evaluation: "Problem sets 20% + Mid-term 30% + End-term 50%",
  },
  "INB5802": {
    description: "Developing written and oral communication skills for professional business contexts.",
    topics: ["Business writing", "Presentations", "Report writing", "Email etiquette", "Cross-cultural communication"],
    evaluation: "Written assignments 40% + Presentation 30% + Participation 30%",
  },
  "INB5803": {
    description: "Individual and group behaviour in organisations, motivation, leadership, and culture.",
    topics: ["Individual behaviour", "Motivation theories", "Team dynamics", "Leadership styles", "Organisational culture"],
    evaluation: "Case analysis 30% + Group project 30% + End-term 40%",
  },
  "INB5901": {
    description: "Ethics, sustainability, and corporate responsibility in a global business environment.",
    topics: ["Business ethics", "CSR frameworks", "Sustainability reporting", "ESG principles", "Ethical dilemmas"],
    evaluation: "Reflection papers 40% + Group presentation 30% + Participation 30%",
  },
};

function DeadlineModal({ onClose, onSave, courses }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [courseKey, setCourseKey] = useState('');
  const [type, setType] = useState('assignment');

  const save = () => {
    if (!title || !date) return;
    onSave({ id: Date.now().toString(), title, date, courseKey, type });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end">
      <div className="bg-slate-900 rounded-t-2xl w-full max-w-lg mx-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-100">Add deadline</h2>
          <button onClick={onClose} className="text-slate-500 text-xl leading-none">×</button>
        </div>
        <div className="space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Marketing case submission"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500" />
          <select value={courseKey} onChange={e => setCourseKey(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500">
            <option value="">Select course (optional)</option>
            {courses.map(([k, c]) => <option key={k} value={k}>{c.name}</option>)}
          </select>
          <select value={type} onChange={e => setType(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500">
            <option value="assignment">Assignment</option>
            <option value="exam">Exam / Test</option>
            <option value="quiz">Quiz</option>
            <option value="project">Project</option>
            <option value="other">Other</option>
          </select>
          <button onClick={save} disabled={!title || !date}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium py-3 rounded-xl text-sm transition-colors">
            Save deadline
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [tab, setTab] = useState('courses'); // courses | deadlines
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [deadlines, setDeadlines] = useState([]);
  const [showAddDeadline, setShowAddDeadline] = useState(false);
  const today = new Date();

  useEffect(() => {
    try {
      const dl = JSON.parse(localStorage.getItem('tapmi_deadlines') || '[]');
      setDeadlines(dl);
    } catch {}
  }, []);

  const addDeadline = (dl) => {
    const updated = [...deadlines, dl];
    setDeadlines(updated);
    localStorage.setItem('tapmi_deadlines', JSON.stringify(updated));
  };

  const removeDeadline = (id) => {
    const updated = deadlines.filter(d => d.id !== id);
    setDeadlines(updated);
    localStorage.setItem('tapmi_deadlines', JSON.stringify(updated));
  };

  const sortedDeadlines = [...deadlines].sort((a, b) => new Date(a.date) - new Date(b.date));
  const courseEntries = Object.entries(COURSES).filter(([k]) => k !== 'INB5902');

  const typeColors = {
    assignment: 'bg-blue-950 text-blue-300 border-blue-900',
    exam: 'bg-red-950 text-red-300 border-red-900',
    quiz: 'bg-purple-950 text-purple-300 border-purple-900',
    project: 'bg-teal-950 text-teal-300 border-teal-900',
    other: 'bg-slate-800 text-slate-400 border-slate-700',
  };

  return (
    <Layout title="Courses & Deadlines">
      {/* Tab switcher */}
      <div className="flex bg-slate-900 rounded-xl p-1 mb-5">
        {['courses', 'deadlines'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors capitalize ${tab === t ? 'bg-slate-700 text-slate-100' : 'text-slate-500'}`}>
            {t === 'deadlines' ? `Deadlines ${deadlines.length > 0 ? `(${deadlines.length})` : ''}` : 'Courses'}
          </button>
        ))}
      </div>

      {tab === 'courses' && (
        <div className="space-y-2">
          {courseEntries.map(([key, course]) => {
            const color = COURSE_COLORS[key] || '#4F86C6';
            const isOpen = expandedCourse === key;
            const syllabus = SYLLABUS[key];
            return (
              <div key={key} className="card overflow-hidden">
                <button className="w-full p-3 flex items-center gap-3 text-left"
                  onClick={() => setExpandedCourse(isOpen ? null : key)}>
                  <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: color + '22', border: `1px solid ${color}44` }}>
                    <span className="text-[10px] font-bold font-mono" style={{ color }}>{course.credits}cr</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-100 leading-snug">{course.name}</p>
                    <p className="text-xs text-slate-500 truncate">{course.faculty}</p>
                  </div>
                  <svg className={`flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} width="14" height="14" fill="none" viewBox="0 0 24 24">
                    <path d="M6 9l6 6 6-6" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>

                {isOpen && syllabus && (
                  <div className="px-3 pb-3 border-t border-slate-800 space-y-3">
                    <p className="text-xs text-slate-400 mt-3 leading-relaxed">{syllabus.description}</p>
                    <div>
                      <p className="text-[10px] text-slate-600 mb-1.5 uppercase tracking-wider">Key Topics</p>
                      <div className="flex flex-wrap gap-1.5">
                        {syllabus.topics.map(t => (
                          <span key={t} className="text-[10px] px-2 py-1 rounded-md bg-slate-800 text-slate-400 border border-slate-700">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-600 mb-1 uppercase tracking-wider">Evaluation</p>
                      <p className="text-xs text-slate-400">{syllabus.evaluation}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] font-mono text-slate-600">{course.code}</span>
                      <span className="text-[10px] text-slate-700">·</span>
                      <span className="text-[10px] text-slate-600">{course.credits} credit{course.credits > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'deadlines' && (
        <div>
          <button onClick={() => setShowAddDeadline(true)}
            className="w-full card p-3 flex items-center justify-center gap-2 text-blue-400 hover:border-blue-900 transition-colors mb-4">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-sm font-medium">Add deadline or exam</span>
          </button>

          {sortedDeadlines.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-slate-500 text-sm">No deadlines added yet</p>
              <p className="text-xs text-slate-700 mt-1">Add assignments, exams, quiz dates</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedDeadlines.map(d => {
                const dDate = new Date(d.date + 'T00:00:00');
                const daysLeft = Math.ceil((dDate - today) / 86400000);
                const isPast = daysLeft < 0;
                const course = d.courseKey ? COURSES[d.courseKey] : null;
                return (
                  <div key={d.id} className={`card p-3 flex items-start gap-3 ${isPast ? 'opacity-50' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize ${typeColors[d.type] || typeColors.other}`}>{d.type}</span>
                        {course && <span className="text-[10px] text-slate-600 truncate">{course.name}</span>}
                      </div>
                      <p className="text-sm text-slate-100">{d.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {dDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' })}
                        {!isPast && (
                          <span className={`ml-2 font-medium ${daysLeft === 0 ? 'text-red-400' : daysLeft <= 3 ? 'text-amber-400' : 'text-slate-500'}`}>
                            {daysLeft === 0 ? '· Today!' : daysLeft === 1 ? '· Tomorrow' : `· ${daysLeft} days`}
                          </span>
                        )}
                        {isPast && <span className="ml-2 text-slate-700">· Done</span>}
                      </p>
                    </div>
                    <button onClick={() => removeDeadline(d.id)} className="text-slate-700 hover:text-red-400 transition-colors p-1">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showAddDeadline && (
        <DeadlineModal
          courses={courseEntries}
          onClose={() => setShowAddDeadline(false)}
          onSave={addDeadline}
        />
      )}
    </Layout>
  );
}
