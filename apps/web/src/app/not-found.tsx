import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#0f141a]">
      <div className="text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#161d27] border border-[#2a3547] flex items-center justify-center">
          <span className="text-2xl font-black text-[#2a3547]">?</span>
        </div>
        <div>
          <h1 className="text-4xl font-black text-[#f0f4f8] mb-1">404</h1>
          <p className="text-sm text-[#8a9bb5]">Page not found</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
