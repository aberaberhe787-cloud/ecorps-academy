import React from "react";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { staggerContainer, staggerItem, staggerItemReduced } from "../../lib/motionPresets";
import { GUEST_LOOP_STEPS, type GuestNavTab } from "./guestLandingData";

interface GuestHowItWorksProps {
  onOpenTab: (tab: GuestNavTab, requiresAuth?: boolean) => void;
}

export const GuestHowItWorks: React.FC<GuestHowItWorksProps> = ({ onOpenTab }) => {
  const reduceMotion = useReducedMotion();
  const itemMotion = reduceMotion ? staggerItemReduced : staggerItem;

  return (
    <section className="space-y-6">
      <div className="text-center space-y-2 px-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">How ECORP Academy works</h2>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Learn → Practice → Assess → Progress. Guests can learn and practice; sign in to assess
          and save.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.15 }}
      >
        {GUEST_LOOP_STEPS.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.step}
              variants={itemMotion}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 flex flex-col gap-3 min-w-0"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-indigo-300/80">{item.step}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
              <h3 className="font-bold text-white">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed flex-1">{item.detail}</p>
              <button
                type="button"
                onClick={() => onOpenTab(item.tab, item.requiresAuth)}
                className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 inline-flex items-center gap-1 cursor-pointer mt-1"
              >
                {item.action}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};
