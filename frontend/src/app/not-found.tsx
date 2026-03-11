import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6 text-center">
      <div>
        <p className="font-pixel text-5xl text-surface-200">404</p>
        <h1 className="font-pixel text-sm mt-4 text-surface-900">
          Page not found
        </h1>
        <p className="font-pixel text-[8px] mt-2 text-surface-400">
          The URL you accessed is invalid.
        </p>
        <ButtonLink className="mt-6" href="/">
          Go to homepage
        </ButtonLink>
      </div>
    </div>
  );
}
