import React, { useState } from "react";
import { BriefcaseBusiness, CalendarCheck, CheckCircle2, Plus } from "lucide-react";
import { useApp } from "../../context/AppContext";

export const LearningOperationsPanel: React.FC = () => {
  const { userProgress, completeScheduledReview, createWorkplaceProject, updateWorkplaceProject } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [successMetric, setSuccessMetric] = useState("");
  const dueReviews = (userProgress.reviewSchedule || []).filter((review) => review.dueAt <= Date.now());
  const projects = userProgress.workplaceProjects || [];

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !problem.trim() || !successMetric.trim()) return;
    createWorkplaceProject({ title: title.trim(), problem: problem.trim(), successMetric: successMetric.trim(), status: "planned", linkedMissionIds: [] });
    setTitle(""); setProblem(""); setSuccessMetric(""); setShowForm(false);
  };

  return <section className="space-y-4">
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
      <div className="flex items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 text-base font-bold text-white"><CalendarCheck className="h-5 w-5 text-indigo-400" />Review schedule</h2><p className="mt-1 text-xs text-slate-400">Completed lessons return on a spaced schedule. Review completion extends the interval.</p></div><span className="rounded-lg border border-indigo-800 bg-indigo-950/50 px-2 py-1 text-xs font-mono text-indigo-200">{dueReviews.length} due</span></div>
      {dueReviews.length === 0 ? <p className="text-xs text-slate-500">No reviews are due. Finish a lesson to create its first review for tomorrow.</p> : <div className="space-y-2">{dueReviews.map((review) => <div key={review.lessonId} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3"><span className="text-xs text-slate-200">Review lesson: <span className="font-mono text-indigo-300">{review.lessonId}</span></span><button onClick={() => completeScheduledReview(review.lessonId)} className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-bold text-white">Mark reviewed</button></div>)}</div>}
    </div>
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
      <div className="flex items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 text-base font-bold text-white"><BriefcaseBusiness className="h-5 w-5 text-emerald-400" />Workplace project portfolio</h2><p className="mt-1 text-xs text-slate-400">Record an applied work problem and its measurable outcome alongside your learning evidence.</p></div><button onClick={() => setShowForm((value) => !value)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white"><Plus className="mr-1 inline h-3.5 w-3.5" />New project</button></div>
      {showForm && <form onSubmit={submit} className="grid gap-2 rounded-xl border border-slate-700 bg-slate-950/60 p-3"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white" /><textarea value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="Work problem to solve" className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white" /><input value={successMetric} onChange={(e) => setSuccessMetric(e.target.value)} placeholder="Measurable success signal" className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white" /><button className="justify-self-start rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Save project</button></form>}
      {projects.length === 0 ? <p className="text-xs text-slate-500">No workplace projects recorded yet.</p> : <div className="space-y-2">{projects.map((project) => <div key={project.id} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3"><div className="flex items-start justify-between gap-2"><div><p className="text-xs font-bold text-white">{project.title}</p><p className="mt-1 text-xs text-slate-400">{project.problem}</p><p className="mt-1 text-xs text-emerald-300">Success: {project.successMetric}</p></div>{project.status !== "complete" && <button onClick={() => updateWorkplaceProject(project.id, { status: "complete" })} className="shrink-0 rounded-md border border-emerald-700 px-2 py-1 text-xs text-emerald-300"><CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />Complete</button>}</div></div>)}</div>}
    </div>
  </section>;
};
