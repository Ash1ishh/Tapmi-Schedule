import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { COURSES, COURSE_COLORS } from '../lib/timetable';

const SYLLABUS = {
  "INB4101": { description: "Introduces fundamental accounting concepts, double-entry bookkeeping, and financial statement preparation.", topics: ["Accounting equation","Journal entries","Ledger posting","Trial balance","Financial statements"], evaluation: "Continuous assessment + End-term exam" },
  "INB4702": { description: "Practical Excel skills for business data analysis, modelling, and reporting.", topics: ["Formulas & functions","PivotTables","Data visualisation","VLOOKUP / INDEX-MATCH","Dashboard basics"], evaluation: "Practical assignment + In-class tests" },
  "INB4703": { description: "Understanding and applying AI tools for learning, research, and professional productivity.", topics: ["Generative AI overview","Prompt engineering","AI for research","Ethics of AI","Practical applications"], evaluation: "Project-based assessment" },
  "INB4901": { description: "Alternative learning methodologies including case studies, simulations, and experiential activities.", topics: ["Case method learning","Role plays","Group simulations","Reflection practices"], evaluation: "Participation + Reflection assignments" },
  "INB5101": { description: "Comprehensive coverage of financial accounting standards, reporting, and analysis.", topics: ["IFRS basics","P&L statement","Balance sheet","Cash flow statement","Ratio analysis"], evaluation: "Assignments 30% + Mid-term 30% + End-term 40%" },
  "INB5201": { description: "Economic principles applied to managerial decision-making in domestic and international contexts.", topics: ["Demand & supply","Elasticity","Market structures","Pricing strategy","Macroeconomic environment"], evaluation: "Quizzes 20% + Mid-term 30% + End-term 50%" },
  "INB5401": { description: "Core marketing concepts, consumer behaviour, and strategy for global markets.", topics: ["STP framework","4Ps of marketing","Consumer behaviour","Brand management","Digital marketing"], evaluation: "Case analysis 30% + Mid-term 30% + End-term 40%" },
  "INB5502": { description: "Statistical methods and their application in business decision-making and data analysis.", topics: ["Descriptive statistics","Probability","Hypothesis testing","Regression analysis","Decision making under uncertainty"], evaluation: "Problem sets 20% + Mid-term 30% + End-term 50%" },
  "INB5802": { description: "Developing written and oral communication skills for professional business contexts.", topics: ["Business writing","Presentations","Report writing","Email etiquette","Cross-cultural communication"], evaluation: "Written assignments 40% + Presentation 30% + Participation 30%" },
  "INB5803": { description: "Individual and group behaviour in organisations, motivation, leadership, and culture.", topics: ["Individual behaviour","Motivation theories","Team dynamics","Leadership styles","Organisational culture"], evaluation: "Case analysis 30% + Group project 30% + End-term 40%" },
  "INB5901": { description: "Ethics, sustainability, and corporate responsibility in a global business environment.", topics: ["Business ethics","CSR frameworks","Sustainability reporting","ESG principles","Ethical dilemmas"], evaluation: "Reflection papers 40% + Group presentation 30% + Participation 30%" },
};

function DeadlineModal({ onClose, onSave, courses }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('23:59');
  const [courseKey, setCourseKey] = useState('');
  const [type, setType] = useState('assignment');

  const save = () => {
    if (!title || !date) return;
    onSave({ id: Date.now().toString(), title, date, time, courseKey, type });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
          <h2 style={{ fontWeight:700, color:'var(--text)' }}>Add Deadline</h2>
          <button onClick={onClose} style={{ color:'var(--text3)', fontSize:'1.5rem', lineHeight:1, background:'none', border:'none', cursor:'pointer' }}>×</button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Marketing case submission" />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            <div>
              <label style={{ fontSize:'0.65rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:4 }}>Date</label>
              <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize:'0.65rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:4 }}>Time</label>
              <input className="input" type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>
          <select className="input" value={courseKey} onChange={e => setCourseKey(e.target.value)}>
            <option value="">No specific course</option>
            {courses.map(([k, c]) => <option key={k} value={k}>{c.name}</option>)}
          </select>
          <select className="input" value={type} onChange={e => setType(e.target.value)}>
            <option value="assignment">Assignment</option>
            <option value="exam">Exam / Test</option>
            <option value="quiz">Quiz</option>
            <option value="project">Project</option>
            <option value="other">Other</option>
          </select>
          <button onClick={save} disabled={!title || !date} className="btn-primary" style={{ width:'100%' }}>
            Save Deadline
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  const [tab, setTab] = useState('courses');
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [deadlines, setDeadlines] = useState([]);
  const [showAddDeadline, setShowAddDeadline] = useState(false);
  const today = new Date();

  useEffect(() => {
    try { const dl = JSON.parse(localStorage.getItem('tapmi_deadlines') || '[]'); setDeadlines(dl); } catch {}
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

  const sortedDeadlines = [...deadlines].sort((a, b) => new Date(a.date+'T'+(a.time||'23:59')) - new Date(b.date+'T'+(b.time||'23:59')));
  const courseEntries = Object.entries(COURSES).filter(([k]) => k !== 'INB5902');

  const typeColors = {
    assignment: { bg:'rgba(59,130,246,0.15)', color:'#60a5fa', border:'rgba(59,130,246,0.3)' },
    exam:       { bg:'rgba(155,27,27,0.2)',   color:'var(--redlt)', border:'rgba(192,57,43,0.4)' },
    quiz:       { bg:'rgba(139,92,246,0.15)', color:'#a78bfa', border:'rgba(139,92,246,0.3)' },
    project:    { bg:'rgba(20,184,166,0.15)', color:'#2dd4bf', border:'rgba(20,184,166,0.3)' },
    other:      { bg:'var(--bg3)',            color:'var(--text3)', border:'var(--border)' },
  };

  return (
    <Layout title="Courses & Deadlines">
      {/* Tab */}
      <div style={{ display:'flex', background:'var(--bg3)', borderRadius:10, padding:3, marginBottom:'1rem', border:'1px solid var(--border)' }}>
        {['courses','deadlines'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex:1, padding:'0.5rem', borderRadius:8, fontSize:'0.8rem', fontWeight:700, cursor:'pointer', border:'none', textTransform:'capitalize',
              background: tab===t ? 'var(--red)' : 'transparent',
              color: tab===t ? '#fff' : 'var(--text3)' }}>
            {t === 'deadlines' ? `Deadlines${deadlines.length > 0 ? ` (${deadlines.length})` : ''}` : 'Courses'}
          </button>
        ))}
      </div>

      {tab === 'courses' && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {courseEntries.map(([key, course]) => {
            const color = COURSE_COLORS[key] || '#B8960C';
            const isOpen = expandedCourse === key;
            const syllabus = SYLLABUS[key];
            return (
              <div key={key} className="card" style={{ overflow:'hidden' }}>
                <button style={{ width:'100%', padding:'0.75rem', display:'flex', alignItems:'center', gap:'0.75rem', background:'none', border:'none', cursor:'pointer', textAlign:'left' }}
                  onClick={() => setExpandedCourse(isOpen ? null : key)}>
                  <div style={{ width:36, height:36, borderRadius:8, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background: color+'22', border:`1px solid ${color}44` }}>
                    <span style={{ fontSize:'0.65rem', fontWeight:800, fontFamily:'monospace', color }}>{course.credits}cr</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text)', lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{course.name}</p>
                    <p style={{ fontSize:'0.7rem', color:'var(--text2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{course.faculty}</p>
                  </div>
                  <span style={{ color:'var(--text3)', transform: isOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.2s', fontSize:'1rem', flexShrink:0 }}>⌄</span>
                </button>
                {isOpen && syllabus && (
                  <div style={{ padding:'0 0.75rem 0.75rem', borderTop:'1px solid var(--border)' }}>
                    <p style={{ fontSize:'0.75rem', color:'var(--text2)', marginTop:'0.75rem', lineHeight:1.6 }}>{syllabus.description}</p>
                    <p style={{ fontSize:'0.6rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0.75rem 0 0.4rem' }}>Key Topics</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {syllabus.topics.map(t => (
                        <span key={t} style={{ fontSize:'0.65rem', padding:'3px 8px', borderRadius:6, background:'var(--bg3)', color:'var(--text2)', border:'1px solid var(--border2)' }}>{t}</span>
                      ))}
                    </div>
                    <p style={{ fontSize:'0.6rem', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0.75rem 0 0.25rem' }}>Evaluation</p>
                    <p style={{ fontSize:'0.75rem', color:'var(--text2)' }}>{syllabus.evaluation}</p>
                    <div style={{ display:'flex', gap:8, marginTop:'0.5rem' }}>
                      <span style={{ fontSize:'0.6rem', color:'var(--text3)', fontFamily:'monospace' }}>{course.code}</span>
                      <span style={{ fontSize:'0.6rem', color:'var(--text3)' }}>· {course.credits} credit{course.credits>1?'s':''}</span>
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
          <button onClick={() => setShowAddDeadline(true)} className="card"
            style={{ width:'100%', padding:'0.75rem', display:'flex', alignItems:'center', justifyContent:'center', gap:8, color:'var(--gold)', background:'none', border:'1px solid var(--border)', cursor:'pointer', borderRadius:12, marginBottom:'1rem' }}>
            <span style={{ fontSize:'1.2rem' }}>+</span>
            <span style={{ fontSize:'0.875rem', fontWeight:600 }}>Add deadline or exam</span>
          </button>

          {sortedDeadlines.length === 0 ? (
            <div className="card" style={{ padding:'2rem', textAlign:'center' }}>
              <p style={{ color:'var(--text2)', fontSize:'0.875rem' }}>No deadlines yet</p>
              <p style={{ color:'var(--text3)', fontSize:'0.7rem', marginTop:'0.25rem' }}>Add assignments, exams, quiz dates</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {sortedDeadlines.map(d => {
                const dDate = new Date(d.date + 'T' + (d.time || '23:59'));
                const daysLeft = Math.ceil((dDate - today) / 86400000);
                const isPast = daysLeft < 0;
                const course = d.courseKey ? COURSES[d.courseKey] : null;
                const tc = typeColors[d.type] || typeColors.other;
                return (
                  <div key={d.id} className="card" style={{ padding:'0.75rem', display:'flex', alignItems:'flex-start', gap:'0.75rem', opacity: isPast ? 0.5 : 1 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                        <span style={{ fontSize:'0.6rem', padding:'2px 6px', borderRadius:5, background:tc.bg, color:tc.color, border:`1px solid ${tc.border}`, fontWeight:700, textTransform:'uppercase' }}>{d.type}</span>
                        {course && <span style={{ fontSize:'0.65rem', color:'var(--text3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{course.name}</span>}
                      </div>
                      <p style={{ fontSize:'0.875rem', color:'var(--text)', fontWeight:600 }}>{d.title}</p>
                      <p style={{ fontSize:'0.7rem', color:'var(--text2)', marginTop:2 }}>
                        {dDate.toLocaleDateString('en-IN', { day:'numeric', month:'short', weekday:'short' })}
                        {d.time && <span style={{ color:'var(--text3)' }}> · {d.time}</span>}
                        {!isPast && (
                          <span style={{ marginLeft:6, fontWeight:700,
                            color: daysLeft === 0 ? 'var(--redlt)' : daysLeft <= 3 ? 'var(--goldlt)' : 'var(--text3)' }}>
                            {daysLeft === 0 ? '· Today!' : daysLeft === 1 ? '· Tomorrow' : `· ${daysLeft} days`}
                          </span>
                        )}
                        {isPast && <span style={{ marginLeft:6, color:'var(--text3)' }}>· Done</span>}
                      </p>
                    </div>
                    <button onClick={() => removeDeadline(d.id)}
                      style={{ color:'var(--text3)', background:'none', border:'none', cursor:'pointer', padding:4, fontSize:'1rem' }}>×</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showAddDeadline && (
        <DeadlineModal courses={courseEntries} onClose={() => setShowAddDeadline(false)} onSave={addDeadline} />
      )}
    </Layout>
  );
}
