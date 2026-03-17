"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ButtonLink } from "@/components/ui/button";

// ── Shared viewport config ──────────────────────────────────────────
const VIEWPORT = { once: true, amount: 0.15 } as const;

// ── Variant helpers ─────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: VIEWPORT,
  transition: { duration: 0.48, ease: "easeOut" as const, delay },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: VIEWPORT,
  transition: { duration: 0.4, delay },
});

// ── Feature cards ───────────────────────────────────────────────────
const features = [
  {
    icon: "coin",
    title: "Radicals",
    desc: "214 Kangxi radicals help you decode characters instead of rote memorization.",
  },
  {
    icon: "star",
    title: "SRS",
    desc: "FSRS algorithm schedules reviews right when you need them.",
  },
  {
    icon: "heart",
    title: "Multi-lang",
    desc: "Traditional Chinese, English, Japanese and Korean on one platform.",
  },
  {
    icon: "trophy",
    title: "Progress",
    desc: "Streaks, mastery levels and daily study stats at a glance.",
  },
];

// ── Animated NES-style progress bar ────────────────────────────────
function AnimatedProgressBar({
  value,
  color,
}: {
  value: number;
  color: "primary" | "warning" | "success";
}) {
  const colors = {
    primary: "#209cee",
    warning: "#ffc41a",
    success: "#92cc41",
  };

  return (
    <div
      className="w-full border-2 border-black bg-surface-100"
      style={{ height: "1.25rem", imageRendering: "pixelated" }}
    >
      <motion.div
        className="h-full"
        style={{ background: colors[color], transformOrigin: "left" }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: value / 100 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.1, ease: "easeOut" as const, delay: 0.3 }}
      />
    </div>
  );
}

// ── Main export ─────────────────────────────────────────────────────
export function HomeClient() {
  return (
    <main>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-surface-0 bg-dot-grid border-b-4 border-black">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          {/* Pixel sprites row */}
          <motion.div
            className="flex items-center justify-center gap-6 mb-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {["star", "heart", "coin", "star"].map((icon, i) => (
              <motion.i
                key={i}
                className={`nes-icon is-medium ${icon}`}
                variants={{
                  hidden: { opacity: 0, y: -14 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.35, ease: "easeOut" as const },
                  },
                }}
              />
            ))}
          </motion.div>

          {/* Badge */}
          <motion.div
            className="inline-block mb-6"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.35,
              ease: "easeOut" as const,
              delay: 0.3,
            }}
          >
            <span className="nes-badge">
              <span className="font-pixel !text-[10px] is-dark">
                INSERT COIN
              </span>
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            className="mt-4 font-pixel text-2xl md:text-3xl text-surface-900 leading-loose tracking-tight"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              ease: "easeOut" as const,
              delay: 0.42,
            }}
          >
            Learn languages
            <br />
            <span className="text-accent-600">level up daily</span>
          </motion.h1>

          {/* Balloon */}
          <motion.div
            className="mt-8 flex justify-center"
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.45,
              ease: "easeOut" as const,
              delay: 0.58,
            }}
          >
            <div className="nes-balloon from-left max-w-md text-left">
              <p className="font-pixel !text-[10px] leading-relaxed">
                WxLingua combines radical decomposition and spaced repetition
                (FSRS) to help you truly <strong>remember</strong> — not just
                rote learning.
              </p>
            </div>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              ease: "easeOut" as const,
              delay: 0.72,
            }}
          >
            <ButtonLink size="lg" href="/register">
              <i className="hn hn-play-solid"></i>
              Play now
            </ButtonLink>
            <ButtonLink size="lg" variant="outline" href="/dictionary">
              Browse words
            </ButtonLink>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-surface-50 border-b-4 border-black py-24">
        <div className="mx-auto max-w-5xl px-4">
          {/* Heading */}
          <motion.h2
            className="font-pixel text-xl text-center text-surface-900 mb-14 leading-loose"
            {...fadeUp(0)}
          >
            — Features —
          </motion.h2>

          {/* Cards stagger */}
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.1, delayChildren: 0.1 },
              },
            }}
          >
            {features.map(({ icon, title, desc }) => (
              <motion.div
                key={title}
                className="nes-container"
                variants={{
                  hidden: { opacity: 0, y: 36, scale: 0.95 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.42, ease: "easeOut" as const },
                  },
                }}
                whileHover={{ y: -4, transition: { duration: 0.18 } }}
              >
                <p className="title font-pixel text-[10px]">{title}</p>
                <div className="flex flex-col items-center gap-3">
                  <i className={`nes-icon ${icon} is-medium`} />
                  <p className="font-pixel !text-[8px] text-surface-600 leading-relaxed text-center">
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 bg-surface-0 border-b-4 border-black">
        <div className="mx-auto max-w-3xl px-4">
          <motion.div
            className="nes-container with-title is-centered"
            {...fadeUp(0)}
          >
            <p className="title font-pixel text-[10px]">Player Stats</p>

            {/* Numbers */}
            <motion.div
              className="grid grid-cols-3 gap-8 py-4"
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.12, delayChildren: 0.2 },
                },
              }}
            >
              {[
                { value: "214", label: "Radicals" },
                { value: "∞", label: "Words" },
                { value: "4+", label: "Languages" },
              ].map(({ value, label }) => (
                <motion.div
                  key={label}
                  className="text-center"
                  variants={{
                    hidden: { opacity: 0, y: 16, scale: 0.85 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { duration: 0.4, ease: "easeOut" as const },
                    },
                  }}
                >
                  <p className="font-pixel text-2xl text-accent-600">{value}</p>
                  <p className="font-pixel !text-xs text-surface-500 mt-2">
                    {label}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Animated progress bars */}
            <motion.div className="mt-6 flex flex-col gap-4" {...fadeIn(0.1)}>
              {[
                { label: "Chinese", value: 80, color: "primary" as const },
                { label: "Japanese", value: 60, color: "warning" as const },
                { label: "Korean", value: 40, color: "success" as const },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p className="font-pixel !text-xs text-surface-600 mb-2">
                    {label}
                  </p>
                  <AnimatedProgressBar value={value} color={color} />
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-surface-0">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <motion.div
            className="nes-container with-title is-centered"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.5, ease: "easeOut" as const }}
          >
            <p className="title font-pixel text-[10px]">Ready?</p>
            <div className="py-4">
              {/* Hearts stagger */}
              <motion.div
                className="flex justify-center gap-4 mb-6"
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT}
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: 0.14, delayChildren: 0.15 },
                  },
                }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.i
                    key={i}
                    className="nes-icon heart is-medium"
                    variants={{
                      hidden: { opacity: 0, scale: 0, y: -10 },
                      visible: {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 16,
                        },
                      },
                    }}
                  />
                ))}
              </motion.div>

              <motion.h2
                className="font-pixel text-lg text-surface-900 leading-loose"
                {...fadeUp(0.1)}
              >
                Start your quest
              </motion.h2>

              <motion.p
                className="font-pixel !text-[8px] mt-3 text-surface-500 text-sm"
                {...fadeUp(0.2)}
              >
                Create a free account and begin learning today.
              </motion.p>

              <motion.div
                className="mt-6 flex flex-col sm:flex-row gap-4 justify-center"
                {...fadeUp(0.3)}
              >
                <ButtonLink size="lg" href="/register">
                  <i className="hn hn-play-solid"></i>
                  Sign up free
                </ButtonLink>
                <Link
                  href="/login"
                  className="nes-btn !text-[10px] !py-2 !px-4"
                >
                  Log in
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
