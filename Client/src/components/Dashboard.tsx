import React, { useState } from 'react';
import { 
  FileText, Image as ImageIcon, Sigma, History, Settings, LogOut, 
  Plus, Save, Download, Users, Bold, Italic, Underline, List, 
  AlignLeft, AlignCenter, AlignRight, Camera, ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('formula'); // 'formula' or 'ocr'

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      
      {/* --- LEFT SIDEBAR: Navigation --- */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20">
        <div className="p-6 bg-slate-950">
          <h2 className="text-xl font-black text-white flex items-center gap-3 tracking-wide">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg shadow-blue-500/20">
              <FileText size={20} className="text-white" />
            </div>
            SDE <span className="text-blue-400 font-medium">v2.0</span>
          </h2>
        </div>
        
        <div className="p-4">
          <button className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg transition-all mb-4">
            <Plus size={18} /> New Document
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2 mt-2">Workspace</div>
          <NavItem icon={<History size={18} />} label="Recent Docs" active />
          <NavItem icon={<Users size={18} />} label="Shared with me" />
          
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2 mt-6">AI Tools</div>
          <NavItem icon={<ImageIcon size={18} />} label="OCR History" />
          <NavItem icon={<Sigma size={18} />} label="Formula Library" />
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-1 bg-slate-950/50">
          <NavItem icon={<Settings size={18} />} label="Settings" />
          <NavItem icon={<LogOut size={18} />} label="Logout" color="text-red-400 hover:text-red-300 hover:bg-red-500/10" />
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col relative">
        
        {/* Header: Document Info & Actions */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <div>
              <input 
                type="text" 
                defaultValue="Quantum_Computing_Draft" 
                className="font-bold text-slate-800 text-lg outline-none hover:bg-slate-50 px-2 py-1 rounded focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <p className="text-[11px] text-slate-400 font-medium px-2">Last modified: Just now</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Active Collaborators (FR 4.2) */}
            <div className="flex items-center gap-2 mr-4 border-r border-slate-200 pr-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live</span>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-500 flex items-center justify-center text-xs text-white font-bold z-20">YP</div>
                <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center text-xs text-white font-bold z-10">RS</div>
              </div>
            </div>

            {/* File Operations (FR 4.5) */}
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all">
              <Save size={16} /> Save
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md shadow-blue-600/20 transition-all">
              <Download size={16} /> Export PDF
            </button>
          </div>
        </header>

        {/* Editor Toolbar (FR 4.1) */}
        <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center gap-1 overflow-x-auto shadow-sm z-0">
          <ToolbarButton icon={<Bold size={16} />} />
          <ToolbarButton icon={<Italic size={16} />} />
          <ToolbarButton icon={<Underline size={16} />} />
          <div className="w-px h-6 bg-slate-200 mx-2" />
          <ToolbarButton icon={<AlignLeft size={16} />} active />
          <ToolbarButton icon={<AlignCenter size={16} />} />
          <ToolbarButton icon={<AlignRight size={16} />} />
          <div className="w-px h-6 bg-slate-200 mx-2" />
          <ToolbarButton icon={<List size={16} />} />
        </div>

        {/* Workspace Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Document / Writing Area */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
             <div className="max-w-[850px] mx-auto min-h-[1100px] bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-200 p-16 outline-none text-slate-700 leading-relaxed">
                <h1 className="text-4xl font-black mb-6 text-slate-900 border-b pb-4">Introduction to Quantum Computing</h1>
                <p className="mb-4 text-lg">
                  Quantum computing is a rapidly emerging technology that harnesses the laws of quantum mechanics to solve problems too complex for classical computers. 
                  Below is the mass-energy equivalence formula extracted from my handwritten notes.
                </p>
                
                {/* Simulated Real-Time Cursor (FR 4.2) */}
                <span className="border-l-2 border-emerald-500 animate-pulse h-5 inline-block -mb-1 ml-1" />
                <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-sm absolute -mt-4 font-bold shadow-sm">Rishabh</span>
             </div>
          </div>
          
          {/* --- RIGHT SIDEBAR: AI Intelligence Pane (FR 4.3, 4.4) --- */}
          <div className="w-80 bg-white border-l border-slate-200 flex flex-col shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.03)] z-10">
            {/* Pane Tabs */}
            <div className="flex border-b border-slate-200">
              <button 
                onClick={() => setActiveTab('formula')}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'formula' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                Formula
              </button>
              <button 
                onClick={() => setActiveTab('ocr')}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'ocr' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                Image OCR
              </button>
            </div>

            {/* Pane Content */}
            <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50">
              
              {activeTab === 'formula' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Live Rendering</h4>
                    <p className="text-xs text-slate-500 mb-4">Select a formula in your document or upload an image to see the LaTeX preview.</p>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex justify-center text-3xl text-slate-800 font-serif">
                      $$E = mc^2$$
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs font-bold text-blue-800 mb-1 flex items-center gap-1"><Sigma size={14}/> LaTeX Code</p>
                    <code className="text-sm text-blue-600 block mt-2 p-2 bg-white rounded border border-blue-100">
                      E = mc^2
                    </code>
                  </div>
                </div>
              )}

              {activeTab === 'ocr' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Upload Image</h4>
                    <p className="text-xs text-slate-500 mb-4">Upload handwritten notes to extract text automatically.</p>
                    <div className="border-2 border-dashed border-blue-300 bg-blue-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-100 transition-colors group">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 text-blue-500 group-hover:scale-110 transition-transform shadow-sm">
                        <Camera size={24} />
                      </div>
                      <p className="text-sm font-bold text-blue-800">Drag & Drop</p>
                      <p className="text-xs text-blue-600 mt-1">or click to browse files</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sub-component for Sidebar Navigation Items
function NavItem({ icon, label, active = false, color = "text-slate-400 hover:text-white" }: any) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
      active ? "bg-blue-600 text-white shadow-md shadow-blue-900/50" : `hover:bg-slate-800 ${color}`
    }`}>
      {icon}
      <span>{label}</span>
      {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
    </button>
  );
}

// Sub-component for Editor Toolbar Buttons
function ToolbarButton({ icon, active = false }: { icon: React.ReactNode, active?: boolean }) {
  return (
    <button className={`p-2 rounded md transition-colors ${
      active ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
    }`}>
      {icon}
    </button>
  );
}