import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { 
  Plus, Save, Download, Bold, Italic, Underline as UnderlineIcon, 
  List, Type, History, LogOut, ChevronDown, FileText, FileCode, FileBox
} from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [docTitle, setDocTitle] = useState("Untitled Document");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none max-w-none min-h-[800px]',
        id: 'editor-content'
      },
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Export Functions (Requirement 4.5) ---

  const exportAsText = () => {
    const content = editor?.getText() || "";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `${docTitle}.txt`);
    setShowExportMenu(false);
  };

  const exportAsPDF = () => {
    const element = document.getElementById('editor-content');
    if (!element) return;
    const opt = {
      margin: 15,
      filename: `${docTitle}.pdf`,
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
    setShowExportMenu(false);
  };

  const exportAsWord = async () => {
    const content = editor?.getText() || "";
    const doc = new Document({
      sections: [{
        properties: {},
        children: [new Paragraph({ children: [new TextRun(content)] })],
      }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${docTitle}.docx`);
    setShowExportMenu(false);
  };

  if (!editor) return null;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl">
        <div className="p-6 bg-slate-950 font-black text-white text-xl flex items-center gap-2">
          <div className="p-2 bg-blue-600 rounded-lg"><Type size={20}/></div> SDE v2.0
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button onClick={() => { setDocTitle("New Document"); editor.commands.setContent('<p></p>'); }} className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all mb-4 shadow-lg"><Plus size={18} /> New Document</button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 text-white font-medium"><History size={18}/> Recent Docs</button>
        </nav>
        <div className="p-4 border-t border-slate-800"><button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all font-medium"><LogOut size={18}/> Logout</button></div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative bg-white">
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <input value={docTitle} onChange={(e) => setDocTitle(e.target.value)} className="font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 px-2 rounded-md transition-all"/>
          
          <div className="flex items-center gap-3 relative" ref={menuRef}>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg shadow-md"><Save size={16}/> Save</button>
            
            {/* MULTI-FORMAT EXPORT BUTTON */}
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-sm"
              >
                <Download size={16}/> Export As <ChevronDown size={14} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <ExportOption icon={<FileText size={16} className="text-blue-500"/>} label="Plain Text (.txt)" onClick={exportAsText} />
                  <ExportOption icon={<FileBox size={16} className="text-orange-500"/>} label="Word Doc (.docx)" onClick={exportAsWord} />
                  <ExportOption icon={<FileCode size={16} className="text-red-500"/>} label="PDF Document (.pdf)" onClick={exportAsPDF} />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* TOOLBAR */}
        <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center gap-2 shadow-sm sticky top-16 z-10">
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} icon={<Bold size={18}/>} />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={<Italic size={18}/>} />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} icon={<UnderlineIcon size={18}/>} />
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} icon={<List size={18}/>} />
        </div>

        {/* EDITOR AREA */}
        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
          <div className="max-w-[850px] mx-auto bg-white shadow-xl ring-1 ring-slate-200 p-16 rounded-sm min-h-[1000px]">
            <EditorContent editor={editor} /> 
          </div>
        </div>
      </main>
    </div>
  );
}

function ExportOption({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors border-b border-slate-50 last:border-0 font-medium">
      {icon} {label}
    </button>
  );
}

function ToolbarBtn({ onClick, active, icon }: { onClick: () => void, active: boolean, icon: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`p-2 rounded-lg transition-all ${active ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}>
      {icon}
    </button>
  );
}