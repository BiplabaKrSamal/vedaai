'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Settings, Key, Cpu, Globe, Check } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex h-screen bg-[#0f141a] overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="flex items-center gap-3 px-6 py-4 border-b border-[#1e2d3d] shrink-0">
          <Settings size={16} className="text-brand-400" />
          <div>
            <h1 className="text-base font-semibold text-[#f0f4f8]">Settings</h1>
            <p className="text-xs text-[#4d6077]">Configure your VedaAI workspace</p>
          </div>
        </header>

        <div className="max-w-2xl mx-auto w-full px-6 py-8 space-y-6">
          {/* AI Configuration */}
          <div className="bg-[#161d27] border border-[#2a3547] rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1e2d3d]">
              <Cpu size={15} className="text-brand-400" />
              <h2 className="text-sm font-semibold text-[#f0f4f8]">AI Configuration</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#8a9bb5] mb-1.5 flex items-center gap-1.5">
                  <Key size={11} />
                  Anthropic API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="sk-ant-api03-..."
                    className="flex-1 px-3.5 py-2.5 bg-[#0f141a] border border-[#2a3547] rounded-lg text-sm text-[#f0f4f8] placeholder-[#4d6077] focus:outline-none focus:border-brand-500/50"
                  />
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    {saved ? <><Check size={13} /> Saved</> : 'Save'}
                  </button>
                </div>
                <p className="text-[10px] text-[#4d6077] mt-2">
                  Get your key at{' '}
                  <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer"
                    className="text-brand-400 hover:underline">console.anthropic.com</a>.
                  {' '}Currently running in{' '}
                  <span className="text-amber-400 font-medium">Demo Mode</span> with built-in question banks.
                </p>
              </div>

              <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-lg">
                <p className="text-xs text-amber-400/80">
                  <strong className="text-amber-400">Demo Mode active</strong> — To enable live Claude AI generation,
                  set <code className="bg-amber-500/10 px-1 rounded text-amber-300">ANTHROPIC_API_KEY</code> in your
                  Render service environment variables and redeploy.
                </p>
              </div>
            </div>
          </div>

          {/* App info */}
          <div className="bg-[#161d27] border border-[#2a3547] rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1e2d3d]">
              <Globe size={15} className="text-brand-400" />
              <h2 className="text-sm font-semibold text-[#f0f4f8]">About</h2>
            </div>
            <div className="p-5 space-y-3">
              {[
                ['Version', '1.0.0'],
                ['Mode', 'Demo (in-memory store)'],
                ['AI Model', 'claude-sonnet-4 (when live key set)'],
                ['Stack', 'Next.js 15 + Node.js + BullMQ + WebSocket'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-1.5 border-b border-[#1e2d3d] last:border-0">
                  <span className="text-xs text-[#4d6077]">{k}</span>
                  <span className="text-xs text-[#c0ccda] font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
