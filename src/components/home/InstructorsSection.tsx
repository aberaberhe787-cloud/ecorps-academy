import React from "react";
import { Users } from "lucide-react";

const INSTRUCTORS = [
  { name: "Dr. Elena Vance", role: "Chief Prompt Architect", bio: "Former research lead focusing on structured output and LLM reasoning loops." },
  { name: "Marcus Thorne", role: "AI Systems Engineer", bio: "Specializes in building autonomous agent frameworks and evaluation harnesses." },
  { name: "Sarah Jenkins", role: "AI Ethics & Adoption Lead", bio: "Helps teams navigate responsible AI deployment and corporate governance." },
];

export const InstructorsSection: React.FC = () => {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-white text-center">Meet Your Instructors</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {INSTRUCTORS.map((instructor) => (
          <div key={instructor.name} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
            <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{instructor.name}</h3>
              <p className="text-sm text-blue-400 font-semibold">{instructor.role}</p>
            </div>
            <p className="text-sm text-slate-400">{instructor.bio}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
