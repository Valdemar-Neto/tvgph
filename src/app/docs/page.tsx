import { Metadata } from 'next';
import { SwaggerPageContent } from './components/SwaggerPageContent';

export const metadata: Metadata = {
  title: 'Reference Hub | TvGPH',
  description: 'Interactive API Documentation and Operational Protocols for the TvGPH Platform',
};

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Reference Hub</h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400 font-medium">
            Strategic resources for the GPH Laboratory Command Center.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Left Column: Protocols */}
          <div className="lg:col-span-1 space-y-8">
             <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4">Operational Protocols</h3>
                <nav className="space-y-2">
                  {[
                    { name: 'Researcher Protocol', level: 'Level 1', path: '/docs/RESEARCHER_PROTOCOL.md' },
                    { name: 'Lab Manager Protocol', level: 'Level 2', path: '/docs/LABORATORY_MANAGER_PROTOCOL.md' },
                    { name: 'Main Manager Protocol', level: 'Level 3', path: '/docs/MAIN_MANAGER_PROTOCOL.md' },
                  ].map((doc) => (
                    <a 
                      key={doc.path}
                      href={doc.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col p-3 rounded-xl border border-slate-100 bg-white hover:border-primary/30 hover:shadow-md transition-all duration-300"
                    >
                      <span className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors">{doc.name}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">{doc.level}</span>
                    </a>
                  ))}
                </nav>
             </div>

             <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Systems Status</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold font-mono uppercase">Global Command Active</span>
                </div>
             </div>
          </div>

          {/* Right Column: API Reference */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Technical API Reference</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Interactive technical documentation for platform endpoints. 
                    For protected routes, ensure you maintain an authenticated session in an adjacent tab.
                  </p>
                </div>
                <SwaggerPageContent />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
