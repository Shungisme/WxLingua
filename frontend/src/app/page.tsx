import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const features = [
  {
    icon: "coin",
    title: "Radicals",
    desc: "214 Kangxi radicals help you decode characters instead of rote memorization.",
    stagger: "stagger-1",
  },
  {
    icon: "star",
    title: "SRS",
    desc: "FSRS algorithm schedules reviews right when you need them.",
    stagger: "stagger-2",
  },
  {
    icon: "heart",
    title: "Multi-lang",
    desc: "Traditional Chinese, English, Japanese and Korean on one platform.",
    stagger: "stagger-3",
  },
  {
    icon: "trophy",
    title: "Progress",
    desc: "Streaks, mastery levels and daily study stats at a glance.",
    stagger: "stagger-4",
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-surface-0 bg-dot-grid border-b-4 border-black">
          <div className="mx-auto max-w-4xl px-4 py-20 text-center">
            {/* Pixel sprites row */}
            <div className="flex items-center justify-center gap-6 mb-8 animate-fade-in-up stagger-1">
              <i className="nes-icon is-medium star" />
              <i className="nes-icon is-medium heart" />
              <i className="nes-icon is-medium coin" />
              <i className="nes-icon is-medium star" />
            </div>

            {/* NES-style badge */}
            <div className="inline-block mb-6 animate-fade-in-up stagger-1">
              <span className="nes-badge">
                <span className="is-dark">INSERT COIN</span>
              </span>
            </div>

            {/* Pixel heading */}
            <h1 className="mt-4 font-pixel text-2xl md:text-3xl text-surface-900 leading-loose tracking-tight animate-fade-in-up stagger-2">
              Learn languages
              <br />
              <span className="text-accent-600">level up daily</span>
            </h1>

            {/* Balloon description */}
            <div className="mt-8 flex justify-center animate-fade-in-up stagger-3">
              <div className="nes-balloon from-left max-w-md text-left">
                <p className="text-sm leading-relaxed">
                  WxLingua combines radical decomposition and spaced repetition
                  (FSRS) to help you truly <strong>remember</strong> — not just
                  rote learning.
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up stagger-4">
              <ButtonLink size="lg" href="/register">
                ▶ Play now
              </ButtonLink>
              <ButtonLink size="lg" variant="outline" href="/words">
                Browse words
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-surface-50 border-b-4 border-black py-24">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="font-pixel text-xl text-center text-surface-900 mb-14 leading-loose">
              — Features —
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map(({ icon, title, desc, stagger }) => (
                <div
                  key={title}
                  className={`nes-container animate-fade-in-up ${stagger}`}
                >
                  <p className="title font-pixel text-[10px]">{title}</p>
                  <div className="flex flex-col items-center gap-3">
                    <i className={`nes-icon ${icon} is-medium`} />
                    <p className="text-xs text-surface-600 leading-relaxed text-center">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats section */}
        <section className="py-16 bg-surface-0 border-b-4 border-black">
          <div className="mx-auto max-w-3xl px-4">
            <div className="nes-container with-title is-centered animate-fade-in-up">
              <p className="title font-pixel text-[10px]">Player Stats</p>
              <div className="grid grid-cols-3 gap-8 py-4">
                <div className="text-center">
                  <p className="font-pixel text-2xl text-accent-600">214</p>
                  <p className="text-xs text-surface-500 mt-2">Radicals</p>
                </div>
                <div className="text-center">
                  <p className="font-pixel text-2xl text-accent-600">∞</p>
                  <p className="text-xs text-surface-500 mt-2">Words</p>
                </div>
                <div className="text-center">
                  <p className="font-pixel text-2xl text-accent-600">4+</p>
                  <p className="text-xs text-surface-500 mt-2">Languages</p>
                </div>
              </div>
              {/* Progress bars */}
              <div className="mt-6 flex flex-col gap-4">
                <div>
                  <p className="text-xs text-surface-600 mb-2">Chinese</p>
                  <progress
                    className="nes-progress is-primary"
                    value="80"
                    max="100"
                  ></progress>
                </div>
                <div>
                  <p className="text-xs text-surface-600 mb-2">Japanese</p>
                  <progress
                    className="nes-progress is-warning"
                    value="60"
                    max="100"
                  ></progress>
                </div>
                <div>
                  <p className="text-xs text-surface-600 mb-2">Korean</p>
                  <progress
                    className="nes-progress is-success"
                    value="40"
                    max="100"
                  ></progress>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-surface-0">
          <div className="mx-auto max-w-2xl px-4 text-center animate-fade-in-up">
            <div className="nes-container with-title is-centered">
              <p className="title font-pixel text-[10px]">Ready?</p>
              <div className="py-4">
                <div className="flex justify-center gap-4 mb-6">
                  <i className="nes-icon heart is-medium" />
                  <i className="nes-icon heart is-medium" />
                  <i className="nes-icon heart is-medium" />
                </div>
                <h2 className="font-pixel text-lg text-surface-900 leading-loose">
                  Start your quest
                </h2>
                <p className="mt-3 text-surface-500 text-sm">
                  Create a free account and begin learning today.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                  <ButtonLink size="lg" href="/register">
                    ▶ Sign up free
                  </ButtonLink>
                  <Link
                    href="/login"
                    className="nes-btn !text-[10px] !py-2 !px-4"
                  >
                    Log in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
