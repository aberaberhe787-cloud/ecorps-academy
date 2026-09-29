import React from "react";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { staggerContainer, staggerItem, staggerItemReduced } from "../../lib/motionPresets";
import { Button } from "../ui/Button";
import { GUEST_TRACKS, type GuestLearnTab } from "./guestLandingData";

interface GuestTracksProps {
  onOpenTrack: (tab: GuestLearnTab, lessonId: string) => void;
}

export const GuestTracks: React.FC<GuestTracksProps> = ({ onOpenTrack }) => {
  const reduceMotion = useReducedMotion();
  const itemMotion = reduceMotion ? staggerItemReduced : staggerItem;

  return (
    <section className="space-y-6">
      <div className="text-center space-y-2 px-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Learning Hub tracks</h2>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Same two tracks as the Learning Hub. Sign in later to keep completion and XP.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.15 }}
      >
        {GUEST_TRACKS.map((track) => (
          <motion.div
            key={track.title}
            variants={itemMotion}
            className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6 space-y-4 hover:border-indigo-500/30 transition-colors flex flex-col justify-between min-w-0"
          >
            <div className="space-y-3">
              <span className="inline-flex text-[10px] font-mono font-semibold uppercase tracking-wide text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                {track.level}
              </span>
              <h3 className="font-bold text-white text-sm sm:text-base leading-snug">
                {track.title}
              </h3>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>For: {track.learner}</li>
                <li>About: {track.duration}</li>
                <li>Outcome: {track.outcome}</li>
              </ul>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full border border-slate-800"
              onClick={() => onOpenTrack(track.tab, track.lessonId)}
              icon={<ArrowRight className="h-3.5 w-3.5" />}
              iconPosition="right"
            >
              Open track
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
