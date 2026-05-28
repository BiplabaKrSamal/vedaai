import { Sidebar } from '@/components/layout/Sidebar';
import { HelpCircle, BookOpen, Zap, FileText, Download, RefreshCw, Upload } from 'lucide-react';

const FAQS = [
  {
    icon: Zap,
    q: 'How do I create an assignment?',
    a: 'Click "New Assignment" on the dashboard. Fill in the title, subject, grade, due date, and configure your question types. Click "Generate Paper" and the AI will build a structured question paper in seconds.',
  },
  {
    icon: BookOpen,
    q: 'What subjects are supported?',
    a: 'Biology, Mathematics, History, Physics, Chemistry and more. The AI adapts to any subject — just type it in. For best results in demo mode, use one of the five built-in subject banks.',
  },
  {
    icon: FileText,
    q: 'What question types can I generate?',
    a: 'Multiple Choice (MCQ), Short Answer, Long Answer / Essay, True or False, and Fill in the Blanks. Mix and match across sections.',
  },
  {
    icon: Upload,
    q: 'Can I upload my own material?',
    a: 'Yes — upload a PDF or TXT file when creating an assignment. The AI uses your content as the source for generating questions.',
  },
  {
    icon: Download,
    q: 'How do I export the paper?',
    a: 'Open any completed assignment and click "Export PDF". A properly formatted A4 question paper is generated client-side and downloaded instantly.',
  },
  {
    icon: RefreshCw,
    q: 'Can I regenerate a paper?',
    a: 'Yes — click "Regenerate" on any completed paper. A new paper is generated with fresh questions while keeping your configuration.',
  },
];

export default function HelpPage() {
  return (
    <div className="flex h-screen bg-[#0f141a] overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="flex items-center gap-3 px-6 py-4 border-b border-[#1e2d3d] shrink-0">
          <HelpCircle size={16} className="text-brand-400" />
          <div>
            <h1 className="text-base font-semibold text-[#f0f4f8]">Help</h1>
            <p className="text-xs text-[#4d6077]">Frequently asked questions</p>
          </div>
        </header>

        <div className="max-w-2xl mx-auto w-full px-6 py-8 space-y-3">
          {FAQS.map(({ icon: Icon, q, a }) => (
            <div key={q} className="bg-[#161d27] border border-[#2a3547] rounded-xl p-5 hover:border-[#3a4557] transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={13} className="text-brand-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#f0f4f8] mb-1.5">{q}</p>
                  <p className="text-xs text-[#8a9bb5] leading-relaxed">{a}</p>
                </div>
              </div>
            </div>
          ))}

          <div className="text-center pt-4">
            <p className="text-xs text-[#4d6077]">
              Built with ❤️ for VedaAI ·{' '}
              <a href="https://github.com/BiplabaKrSamal/vedaai" target="_blank" rel="noopener noreferrer"
                className="text-brand-400 hover:underline">GitHub</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
