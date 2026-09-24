import React from "react";
import { motion } from "motion/react";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Sarah Jenkins",
    role: "Senior Product Manager",
    feedback: "The pilot program completely transformed how I structure product requirements. I now use structured XML delimiters for everything.",
    company: "TechFlow Solutions"
  },
  {
    name: "Marcus Thorne",
    role: "Lead Software Engineer",
    feedback: "Mastering ReAct agent loops was the missing piece for our team's AI automation pipeline. High-precision and practical.",
    company: "DataCorp Industries"
  },
  {
    name: "Elena Rodriguez",
    role: "AI Ethics Specialist",
    feedback: "Finally, a curriculum that tackles the 'why' behind prompt failures, not just the 'what'. Essential for responsible AI.",
    company: "SafeAI Systems"
  },
  {
    name: "David Chen",
    role: "Engineering Manager",
    feedback: "The structured outputs section saved our team weeks of custom parser development. An absolute game-changer.",
    company: "InnovateLabs"
  }
];

export const TestimonialsCarousel: React.FC = () => {
  return (
    <section className="py-16 bg-slate-900/30 border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <h2 className="text-3xl font-bold text-white text-center">
          Proven outcomes from our pilot graduates
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="text-slate-300 text-sm italic">"{t.feedback}"</p>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-800">
                <div className="font-bold text-white text-sm">{t.name}</div>
                <div className="text-blue-400 text-xs">{t.role}</div>
                <div className="text-slate-500 text-xs mt-1">{t.company}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
