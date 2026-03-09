import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BookOpen, Layers, Zap, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Radical analysis",
    desc: "214 Kangxi radicals help you understand Chinese character structure instead of rote memorization.",
  },
  {
    icon: Zap,
    title: "Spaced Repetition (SRS)",
    desc: "FSRS algorithm automatically schedules reviews right when you're about to forget.",
  },
  {
    icon: BookOpen,
    title: "Multi-language",
    desc: "Learn Traditional Chinese, English, Japanese and Korean on the same platform.",
  },
  {
    icon: BarChart3,
    title: "Track progress",
    desc: "Detailed statistics on streaks, mastery level and study time each day.",
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-surface-0">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center"
          >
            <div className="h-[600px] w-[900px] rounded-full bg-accent-100/30 blur-3xl" />
          </div>
          <div className="mx-auto max-w-4xl px-4 py-28 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 px-3 py-1 text-xs font-medium text-accent-700">
              ✦ Language Learning Platform by Vòng Hùng
            </span>
            <h1 className="mt-6 text-5xl md:text-6xl font-bold text-surface-900 leading-tight tracking-tight">
              Learn languages
              <br />
              <span className="text-accent-600">deeper every day</span>
            </h1>
            <p className="mt-5 text-lg text-surface-500 max-w-xl mx-auto">
              WxLingua combines radical analysis and spaced repetition to help
              you truly remember— not just rote learning.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <ButtonLink size="lg" href="/register">
                Get started free
              </ButtonLink>
              <ButtonLink size="lg" variant="outline" href="/words">
                Browse vocabulary
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-surface-50 border-t border-surface-200 py-24">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-3xl font-bold text-center text-surface-900 mb-14">
              Everything you need to learn languages
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-xl bg-surface-0 border border-surface-200 p-6 shadow-card"
                >
                  <div className="rounded-lg bg-accent-50 p-3 w-fit mb-4">
                    <Icon className="h-5 w-5 text-accent-600" />
                  </div>
                  <h3 className="font-semibold text-surface-900 mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-surface-500 leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-surface-0">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <h2 className="text-3xl font-bold text-surface-900">
              Ready to start?
            </h2>
            <p className="mt-3 text-surface-500">
              Create a free account and start learning today.
            </p>
            <ButtonLink size="lg" href="/register" className="mt-6">
              Sign up now
            </ButtonLink>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
