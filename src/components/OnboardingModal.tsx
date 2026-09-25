import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, BookOpen, BrainCircuit, Terminal } from "lucide-react";
import { Button } from "./ui/Button";

interface OnboardingModalProps {
  onClose: () => void;
}

const STEPS = [
  {
    title: "1. What is Prompt Engineering?",
    description: "It's the art and science of guiding LLMs to generate high-precision, structured outputs by crafting optimal inputs, delimiters, and reasoning contexts.",
    icon: BrainCircuit,
  },
  {
    title: "2. Why It Matters",
    description: "Well-structured prompts drastically reduce hallucination rates, eliminate boilerplate, and enable deterministic outputs suitable for production pipelines.",
    icon: BookOpen,
  },
  {
    title: "3. Start Your Journey",
    description: "Master causal token distribution, XML delimiters, and ReAct agent loops. Choose your learning path to begin building.",
    icon: Terminal,
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const Icon = STEPS[step].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="h-6 w-6" />
        </button>
        
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="p-4 bg-blue-950 rounded-full text-blue-400">
            <Icon className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-white">{STEPS[step].title}</h2>
          <p className="text-slate-300 text-lg">{STEPS[step].description}</p>
          
          <div className="w-full pt-6 flex justify-between items-center">
            <div className="flex gap-2">
              {STEPS.map((_, i) => (
                <div key={i} className={`h-2 w-2 rounded-full ${i === step ? 'bg-blue-500' : 'bg-slate-700'}`} />
              ))}
            </div>
            <Button onClick={handleNext} className="gap-2">
              {step === STEPS.length - 1 ? "Finish" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
