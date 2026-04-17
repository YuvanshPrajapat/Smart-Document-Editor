import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { MathExtension } from '@aarkue/tiptap-math-extension';
import { Extension } from '@tiptap/core';
import 'katex/dist/katex.min.css';
import { Color } from '@tiptap/extension-color';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import HorizontalRule from '@tiptap/extension-horizontal-rule';

import { WebrtcProvider } from 'y-webrtc';

import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import {Table} from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

import * as mammoth from 'mammoth';


import {
  Plus, Save, Download, Bold, Italic, Underline as UnderlineIcon,
  List, Type, History, LogOut, ChevronDown, FileText, FileCode, FileBox,
  Sparkles, Image as ImageIcon, Calculator, PenTool, Loader2,
  Heading1, Heading2, AlignLeft, AlignCenter, AlignRight, Highlighter, Undo, Redo,
  Moon, Sun
} from 'lucide-react';

import { docsService } from '../services/docs';
import { aiService } from '../services/ai';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { Share2, Trash2, Strikethrough, Subscript as SubscriptIcon, Superscript as SuperscriptIcon,
  RemoveFormatting, AlignJustify, Link as LinkIcon, Palette, ListOrdered, Table as TableIcon, CheckSquare, FolderOpen, Sigma, Minus, Youtube as YoutubeIcon } from 'lucide-react';

import UserMenu from './UserMenu';

import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';

// --- CUSTOM SMART TAB EXTENSION ---
const SmartTab = Extension.create({
  name: 'smartTab',
  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (this.editor.isActive('bulletList') || this.editor.isActive('orderedList')) {
          return false;
        }
        return this.editor.commands.insertContent('\u00A0\u00A0\u00A0\u00A0');
      },
    };
  },
});

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  // Document State
  const [docTitle, setDocTitle] = useState("Untitled Document");
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [savedDocs, setSavedDocs] = useState<any[]>([]);
  // Tab Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'ai'>('home');

  // UI State
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // Dark mode
  const [isDark, setIsDark] = useState(false);

  // --- MULTIPLAYER SETUP ---
  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);

  // --- SPLIT THE FILE INPUTS HERE ---
  const docInputRef = useRef<HTMLInputElement>(null);
  const aiImageInputRef = useRef<HTMLInputElement>(null);

  const [activeAiMode, setActiveAiMode] = useState<'ocr' | 'formula' | 'handwriting'>('ocr');

  const editorImageInputRef = useRef<HTMLInputElement>(null);


  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      FontFamily,
      Color,
      Subscript,
      Superscript,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, autolink: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      MathExtension.configure({ evaluation: false }),
      SmartTab,
      Image.configure({ inline: true, allowBase64: true }),
      Youtube.configure({ width: 480, height: 320 }),
      HorizontalRule,
      Collaboration.configure({
        document: ydoc,
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none max-w-none min-h-[800px]',
        id: 'editor-content'
      },
    },
  });

  // --- 1. SILENT AUTO-SAVE LOOP ---
  useEffect(() => {
    if (!currentDocId || !editor) return;

    const autoSaveTimer = setInterval(async () => {
      try {
        const content = editor.getJSON();
        const safeTitle = docTitle || "Untitled Document";
        await docsService.updateDocument(currentDocId, safeTitle, content);
        console.log("Auto-saved to cloud at:", new Date().toLocaleTimeString());
      } catch (error: any) {
        console.error("Auto-save failed. Backend says:", error.response?.data || error.message);
      }
    }, 30000);

    return () => clearInterval(autoSaveTimer);
  }, [currentDocId, docTitle, editor]);

  // --- 1. LOAD SIDEBAR DOCUMENTS ON STARTUP ---
  useEffect(() => {
    fetchMyDocuments();
  }, []);

  // --- 2. THE "SHARE LINK" CATCHER ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedDocId = params.get('docId');

    if (sharedDocId && editor && !currentDocId) {
      const loadSharedDoc = async () => {
        try {
          const doc = await docsService.getDocumentById(sharedDocId);
          setCurrentDocId(doc.id || doc._id);
          setDocTitle(doc.title);
          editor.commands.setContent(doc.content);
        } catch (error) {
          console.error("Could not load shared document:", error);
          alert("Error: Shared document not found or you do not have permission.");
        }
      };
      loadSharedDoc();
    }
  }, [editor, currentDocId]);


  const fetchMyDocuments = async () => {
    try {
      const docs = await docsService.getDocuments();
      setSavedDocs(docs);
    } catch (error) {
      console.error("Failed to load documents", error);
    }
  };

  // Refs
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const aiMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
      if (aiMenuRef.current && !aiMenuRef.current.contains(event.target as Node)) {
        setShowAiMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- 2. SAVE TO MONGODB ---
  const handleSaveToDatabase = async () => {
    if (!editor) return;
    setIsSaving(true);
    try {
      const content = editor.getJSON();
      if (currentDocId) {
        await docsService.updateDocument(currentDocId, docTitle, content);
      } else {
        const newDoc = await docsService.createDocument(docTitle, content);
        setCurrentDocId(newDoc.id || newDoc._id);
      }
      await fetchMyDocuments();
    } catch (error) {
      console.error("Error saving document:", error);
      alert("Failed to save document. Check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- 3. LOAD FROM SIDEBAR ---
  const handleLoadDocument = (doc: any) => {
    setCurrentDocId(doc.id || doc._id);
    setDocTitle(doc.title);
    editor?.commands.setContent(doc.content);
  };

  const handleCreateNew = () => {
    setCurrentDocId(null);
    setDocTitle("Untitled Document");
    editor?.commands.setContent('<p></p>');
  };

  const handleShare = () => {
    if (!currentDocId) {
      alert("Please save the document to the cloud first before sharing!");
      return;
    }
    const shareLink = `${window.location.origin}/dashboard?docId=${currentDocId}`;
    navigator.clipboard.writeText(shareLink);
    alert(`Share Link copied to clipboard!\n\n${shareLink}\n\nSend this to a friend to collaborate in real-time.`);
  };

  const handleDelete = async () => {
    if (!currentDocId) {
      alert("This is an unsaved document. You can just clear the text!");
      return;
    }
    if (window.confirm("Are you sure you want to delete this document? This cannot be undone.")) {
      try {
        await docsService.deleteDocument(currentDocId);
        setCurrentDocId(null);
        setDocTitle('Untitled Document');
        editor?.commands.setContent('');
        fetchMyDocuments();
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Failed to delete the document. Check your connection.");
      }
    }
  };

  // --- 4. AI IMAGE PROCESSING ---
  const triggerAiUpload = (mode: 'ocr' | 'formula' | 'handwriting') => {
    setActiveAiMode(mode);
    setShowAiMenu(false);
    aiImageInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    setIsAiProcessing(true);
    try {
      if (activeAiMode === 'ocr') {
        const result = await aiService.extractText(file);
        if (result.data?.text) {
          editor.chain().focus().insertContent(`\n${result.data.text}\n`).run();
        } else alert("OCR completed, but no text was found.");
      } else if (activeAiMode === 'formula') {
        const result = await aiService.extractFormula(file);
        if (result.data?.content) {
          editor.chain().focus().insertContent({
            type: "inlineMath",
            attrs: { latex: result.data.content }
          }).run();
          editor.chain().focus().insertContent('<p></p>').run();
        } else alert("Math extraction completed, but no formula was found.");
      } else if (activeAiMode === 'handwriting') {
        const result = await aiService.extractHandwriting(file);
        if (result.data?.content) {
          editor.chain().focus().insertContent(`\n${result.data.content}\n`).run();
        } else alert("Handwriting extraction completed, but no text was found.");
      }
    } catch (error) {
      console.error("AI processing failed:", error);
      alert("AI Processing Failed. Check the console for details.");
    } finally {
      setIsAiProcessing(false);
      if (aiImageInputRef.current) aiImageInputRef.current.value = '';
    }
  };

  // --- LOCAL IMAGE UPLOAD FUNCTION ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      editor.chain().focus().setImage({ src: base64String }).run();
    };
    reader.readAsDataURL(file);

    if (editorImageInputRef.current) editorImageInputRef.current.value = '';
  };

  // --- 5. EXPORT FUNCTIONS ---
  const exportAsText = () => {
    const content = editor?.getText() || "";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `${docTitle}.txt`);
    setShowExportMenu(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    try {
      if (file.name.endsWith('.txt')) {
        const text = await file.text();
        const html = text.split('\n').map(line => `<p>${line}</p>`).join('');
        editor.commands.setContent(html);
        setDocTitle(file.name.replace('.txt', ''));
      } else if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        editor.commands.setContent(result.value);
        setDocTitle(file.name.replace('.docx', ''));
        if (result.messages.length > 0) {
          console.warn("Mammoth warnings:", result.messages);
        }
      } else {
        alert("Format not supported yet. Please use .txt or .docx");
        return;
      }
      setCurrentDocId(null);
    } catch (error) {
      console.error("Error importing file:", error);
      alert("Failed to open the document. The file might be corrupted.");
    } finally {
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  const exportAsPDF = () => {
    if (!editor) return;

    editor.commands.blur();

    const element = document.querySelector('.ProseMirror') as HTMLElement;
    if (!element) return;

    const tempStyle = document.createElement('style');
    tempStyle.innerHTML = `
      .katex-display { padding-top: 1rem !important; padding-bottom: 1rem !important; }
      .katex-html { min-height: 3rem !important; display: block !important; }
      .base { margin-top: 0.5rem !important; margin-bottom: 0.5rem !important; }
    `;
    document.head.appendChild(tempStyle);

    const opt = {
      margin: [15, 15, 15, 15],
      filename: `${docTitle}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth
      },
      pagebreak: { mode: ['css', 'avoid-all'] },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      document.head.removeChild(tempStyle);
      setShowExportMenu(false);
    });
  };

  const exportAsWord = async () => {
    if (!editor) return;
    try {
      const content = editor.getText();
      const paragraphs = content.split('\n').map(line =>
        new Paragraph({ children: [new TextRun(line)] })
      );
      const doc = new Document({
        sections: [{ properties: {}, children: paragraphs }],
      });
      const fileBuffer = await Packer.toBlob(doc);
      saveAs(fileBuffer, `${docTitle}.docx`);
    } catch (error) {
      console.error("Word export failed", error);
      alert("Failed to export Word document.");
    }
    setShowExportMenu(false);
  };

  if (!editor) return null;

  // Theme classes
  const t = {
    // Sidebar
    sidebar: isDark ? 'bg-[#111318] border-[#1e2130]' : 'bg-[#1a1d23] border-[#252830]',
    sidebarText: isDark ? 'text-slate-300' : 'text-slate-400',
    sidebarHover: isDark ? 'hover:bg-[#1e2130]' : 'hover:bg-[#252830]',
    sidebarActive: isDark ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500' : 'bg-blue-600/15 text-blue-400 border-l-2 border-blue-500',

    // Header
    header: isDark ? 'bg-[#16191f] border-[#1e2130]' : 'bg-white border-[#e0e3e8]',
    headerText: isDark ? 'text-white' : 'text-slate-900',
    titleInput: isDark ? 'bg-transparent text-white border-[#2a2d3a] focus:border-blue-500 focus:bg-[#1e2130]' : 'bg-transparent text-slate-900 border-[#e0e3e8] focus:border-blue-500',

    // Ribbon/Toolbar
    ribbon: isDark ? 'bg-[#13151c] border-[#1e2130]' : 'bg-[#f7f8fa] border-[#e0e3e8]',
    ribbonTabs: isDark ? 'bg-[#13151c]' : 'bg-[#f7f8fa]',
    ribbonContent: isDark ? 'bg-[#16191f]' : 'bg-white',
    tabActive: isDark ? 'border-blue-500 text-blue-400' : 'border-blue-600 text-blue-700',
    tabInactive: isDark ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-800',
    tabDivider: isDark ? 'bg-[#2a2d3a]' : 'bg-slate-200',

    // Toolbar buttons
    toolbarBtn: isDark
      ? 'text-slate-300 hover:bg-[#2a2d3a] hover:text-white'
      : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900',
    toolbarBtnActive: isDark
      ? 'bg-blue-600/20 text-blue-400'
      : 'bg-blue-100 text-blue-700',
    toolbarSelect: isDark
      ? 'bg-[#1e2130] border-[#2a2d3a] text-slate-300 hover:bg-[#252830]'
      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50',
    toolbarInsertBtn: isDark
      ? 'border-[#2a2d3a] text-slate-300 hover:bg-[#252830] hover:border-[#3a3d4a]'
      : 'border-slate-200 text-slate-700 hover:bg-slate-100',

    // Editor area
    editorBg: isDark ? 'bg-[#0f1117]' : 'bg-[#eceef2]',

    // Buttons
    btnPrimary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white',
    btnGreen: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    btnDanger: isDark
      ? 'text-red-400 bg-red-900/20 border border-red-800/40 hover:bg-red-900/30'
      : 'text-red-600 bg-red-50 border border-red-200 hover:bg-red-100',
    btnGhost: isDark
      ? 'text-slate-300 bg-[#1e2130] border border-[#2a2d3a] hover:bg-[#252830]'
      : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50',

    // Dropdown
    dropdown: isDark
      ? 'bg-[#16191f] border border-[#2a2d3a] shadow-2xl'
      : 'bg-white border border-slate-200 shadow-xl',
    dropdownItem: isDark
      ? 'text-slate-300 hover:bg-[#1e2130] hover:text-blue-400'
      : 'text-slate-700 hover:bg-slate-50 hover:text-blue-700',
    dropdownDivider: isDark ? 'border-[#1e2130]' : 'border-slate-100',
  };

  return (
    <div
      className={`flex h-screen overflow-hidden transition-colors duration-200`}
      style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
    >
      <input type="file" ref={aiImageInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {/* ======================== SIDEBAR ======================== */}
      <aside className={`w-60 flex flex-col border-r flex-shrink-0 ${t.sidebar}`}>
        {/* Logo */}
        <div className="px-5 py-4 flex items-center gap-2.5 border-b border-[#1e2130]">
          <div className="w-7 h-7 bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Type size={14} className="text-white" />
          </div>
          <span className="font-black text-white text-base tracking-tight">
            <span className="text-blue-500 font-black">SDE</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <button
            onClick={handleCreateNew}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors mb-4"
          >
            <Plus size={15} /> New Document
          </button>

          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600 px-3 py-2">
            My Documents
          </div>

          {savedDocs.length === 0 ? (
            <div className="text-xs text-slate-600 px-3 py-2 italic">No saved documents yet.</div>
          ) : (
            savedDocs.map((doc, idx) => (
              <button
                key={doc._id || idx}
                onClick={() => handleLoadDocument(doc)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium truncate transition-colors text-left ${
                  currentDocId === (doc._id || doc.id)
                    ? t.sidebarActive
                    : `${t.sidebarText} ${t.sidebarHover}`
                }`}
              >
                <FileText size={14} className="flex-shrink-0" />
                <span className="truncate">{doc.title}</span>
              </button>
            ))
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="px-3 py-3 border-t border-[#1e2130]">
          <p className="text-[10px] text-slate-600 text-center">Smart Document Editor</p>
        </div>
      </aside>

      {/* ======================== MAIN ======================== */}
      <main className={`flex-1 flex flex-col relative overflow-hidden transition-colors duration-200 ${isDark ? 'bg-[#0f1117]' : 'bg-[#eceef2]'}`}>

        {/* ---- HEADER ---- */}
        <header className={`h-14 border-b flex items-center justify-between px-5 flex-shrink-0 sticky top-0 z-40 ${t.header}`}>
          {/* Title */}
          <input
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            className={`font-bold text-sm outline-none px-2 py-1 border transition-all w-52 ${t.titleInput}`}
          />

          <div className="flex items-center gap-2">
            {/* Save */}
            <button
              onClick={handleSaveToDatabase} disabled={isSaving}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all disabled:opacity-60 ${t.btnPrimary}`}
            >
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {isSaving ? 'Saving...' : 'Save'}
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all ${t.btnGreen}`}
            >
              <Share2 size={13} /> Share
            </button>

            {/* Delete */}
            <button
              onClick={handleDelete}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all ${t.btnDanger}`}
            >
              <Trash2 size={13} /> Delete
            </button>

            {/* Hidden inputs */}
            <input type="file" ref={docInputRef} onChange={handleImport} accept=".txt,.docx" className="hidden" />
            <input type="file" ref={editorImageInputRef} onChange={handleImageUpload} accept="image/png, image/jpeg, image/jpg" className="hidden" />

            {/* Open */}
            <button
              onClick={() => docInputRef.current?.click()}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all ${t.btnGhost}`}
            >
              <FolderOpen size={13} className="text-amber-500" /> Open
            </button>

            {/* Export */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all ${t.btnGhost}`}
              >
                <Download size={13} /> Export
                <ChevronDown size={11} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
              </button>
              {showExportMenu && (
                <div className={`absolute right-0 mt-1 w-48 z-50 overflow-hidden ${t.dropdown}`}>
                  <DropdownBtn dark={isDark} icon={<FileText size={14} className="text-slate-400" />} label="Plain Text (.txt)" onClick={exportAsText} />
                  <DropdownBtn dark={isDark} icon={<FileBox size={14} className="text-blue-500" />} label="Word Doc (.docx)" onClick={exportAsWord} />
                  <DropdownBtn dark={isDark} icon={<FileCode size={14} className="text-red-500" />} label="PDF (.pdf)" onClick={exportAsPDF} />
                </div>
              )}
            </div>

            {/* Divider */}
            <div className={`w-px h-6 mx-1 ${isDark ? 'bg-[#2a2d3a]' : 'bg-slate-200'}`} />

            {/* Dark mode toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`flex items-center justify-center w-8 h-8 transition-colors ${
                isDark
                  ? 'text-slate-300 hover:text-yellow-400 hover:bg-[#1e2130]'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <UserMenu onLogout={onLogout} />
          </div>
        </header>

        {/* ---- RIBBON (Tabbed Toolbar) ---- */}
        {editor && (
          <div className={`border-b flex flex-col flex-shrink-0 sticky z-30 ${t.ribbon}`} style={{ top: '56px' }}>

            {/* Tab Headers */}
            <div className={`flex items-center gap-0 px-5 text-xs font-bold ${t.ribbonTabs} border-b ${isDark ? 'border-[#1e2130]' : 'border-[#e0e3e8]'}`}>
              {(['home', 'insert', 'ai'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all capitalize ${
                    activeTab === tab ? t.tabActive : t.tabInactive
                  }`}
                >
                  {tab === 'ai' && <Sparkles size={12} className={activeTab === 'ai' ? 'text-blue-500' : 'text-slate-400'} />}
                  {tab === 'ai' ? 'AI Tools' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className={`px-4 py-2 flex items-center gap-4 flex-wrap min-h-[52px] ${t.ribbonContent}`}>

              {/* ===== HOME TAB ===== */}
              {activeTab === 'home' && (
                <>
                  {/* Undo/Redo */}
                  <div className={`flex items-center gap-0.5 pr-4 border-r ${t.tabDivider}`}>
                    <ToolbarBtn dark={isDark} icon={<Undo size={16} />} onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo" />
                    <ToolbarBtn dark={isDark} icon={<Redo size={16} />} onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo" />
                  </div>

                  {/* Typography */}
                  <div className={`flex items-center gap-2 pr-4 border-r ${t.tabDivider}`}>
                    <select
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'p') editor.chain().focus().setParagraph().run();
                        else editor.chain().focus().toggleHeading({ level: parseInt(val) as any }).run();
                      }}
                      value={editor.isActive('heading', { level: 1 }) ? '1' : editor.isActive('heading', { level: 2 }) ? '2' : editor.isActive('heading', { level: 3 }) ? '3' : 'p'}
                      className={`text-xs border px-2 py-1.5 outline-none w-32 font-semibold cursor-pointer transition-colors ${t.toolbarSelect}`}
                    >
                      <option value="p">Normal Text</option>
                      <option value="1">Heading 1</option>
                      <option value="2">Heading 2</option>
                      <option value="3">Heading 3</option>
                    </select>

                    <select
                      onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                      value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
                      className={`text-xs border px-2 py-1.5 outline-none w-40 font-medium cursor-pointer transition-colors ${t.toolbarSelect}`}
                    >
                      <option value="Inter">Inter</option>
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Georgia">Georgia</option>
                    </select>
                  </div>

                  {/* Formatting */}
                  <div className={`flex items-center gap-0.5 pr-4 border-r ${t.tabDivider}`}>
                    <ToolbarBtn dark={isDark} icon={<Bold size={16} />} active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold" />
                    <ToolbarBtn dark={isDark} icon={<Italic size={16} />} active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic" />
                    <ToolbarBtn dark={isDark} icon={<UnderlineIcon size={16} />} active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline" />
                    <ToolbarBtn dark={isDark} icon={<Strikethrough size={16} />} active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough" />
                    <div className={`w-px h-4 mx-0.5 ${t.tabDivider}`} />
                    <ToolbarBtn dark={isDark} icon={<SubscriptIcon size={16} />} active={editor.isActive('subscript')} onClick={() => editor.chain().focus().toggleSubscript().run()} title="Subscript" />
                    <ToolbarBtn dark={isDark} icon={<SuperscriptIcon size={16} />} active={editor.isActive('superscript')} onClick={() => editor.chain().focus().toggleSuperscript().run()} title="Superscript" />
                    <div className={`w-px h-4 mx-0.5 ${t.tabDivider}`} />

                    {/* Text Color */}
                    <label
                      className={`relative p-1.5 transition-all cursor-pointer flex flex-col items-center gap-0.5 ${isDark ? 'text-slate-300 hover:bg-[#2a2d3a]' : 'text-slate-600 hover:bg-slate-200'}`}
                      title="Text Color"
                    >
                      <span className={`text-[13px] font-black leading-none font-serif`}>A</span>
                      <div className="w-4 h-[3px]" style={{ backgroundColor: editor.getAttributes('textStyle').color || (isDark ? '#ffffff' : '#000000') }} />
                      <input type="color" className="absolute opacity-0 w-0 h-0" onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()} value={editor.getAttributes('textStyle').color || '#000000'} />
                    </label>

                    {/* Highlight */}
                    <label
                      className={`relative p-1.5 transition-all cursor-pointer flex flex-col items-center gap-0.5 ${isDark ? 'text-slate-300 hover:bg-[#2a2d3a]' : 'text-slate-600 hover:bg-slate-200'}`}
                      title="Highlight"
                    >
                      <Highlighter size={14} />
                      <div className="w-4 h-[3px]" style={{ backgroundColor: editor.getAttributes('highlight').color || 'transparent' }} />
                      <input type="color" className="absolute opacity-0 w-0 h-0" onInput={(e) => editor.chain().focus().toggleHighlight({ color: (e.target as HTMLInputElement).value }).run()} value={editor.getAttributes('highlight').color || '#ffff00'} />
                    </label>
                  </div>

                  {/* Alignment & Lists */}
                  <div className="flex items-center gap-0.5">
                    <ToolbarBtn dark={isDark} icon={<AlignLeft size={16} />} active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Align Left" />
                    <ToolbarBtn dark={isDark} icon={<AlignCenter size={16} />} active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Align Center" />
                    <ToolbarBtn dark={isDark} icon={<AlignRight size={16} />} active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Align Right" />
                    <div className={`w-px h-4 mx-0.5 ${t.tabDivider}`} />
                    <ToolbarBtn dark={isDark} icon={<List size={16} />} active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List" />
                    <ToolbarBtn dark={isDark} icon={<ListOrdered size={16} />} active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered List" />
                    <ToolbarBtn dark={isDark} icon={<CheckSquare size={16} />} active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()} title="Checklist" />
                  </div>
                </>
              )}

              {/* ===== INSERT TAB ===== */}
              {activeTab === 'insert' && (
                <div className="flex items-center gap-2 flex-wrap">
                  <InsertBtn dark={isDark} icon={<ImageIcon size={14} className="text-blue-500" />} label="Image" onClick={() => editorImageInputRef.current?.click()} />

                  <InsertBtn dark={isDark} icon={<LinkIcon size={14} className="text-emerald-500" />} label="Link" onClick={() => {
                    const url = window.prompt('Enter URL (e.g., google.com):');
                    if (url) {
                      const validUrl = /^https?:\/\//.test(url) ? url : `https://${url}`;
                      if (editor.state.selection.empty) {
                        editor.chain().focus().insertContent(`<a href="${validUrl}">${validUrl}</a>`).run();
                      } else {
                        editor.chain().focus().extendMarkRange('link').setLink({ href: validUrl }).run();
                      }
                    }
                  }} />

                  <InsertBtn dark={isDark} icon={<YoutubeIcon size={14} className="text-red-500" />} label="Video" onClick={() => {
                    const url = window.prompt('Enter YouTube URL:');
                    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
                  }} />

                  <div className={`w-px h-6 mx-1 ${t.tabDivider}`} />

                  <InsertBtn dark={isDark} icon={<TableIcon size={14} className="text-slate-500" />} label="Table" onClick={() => {
                    const size = window.prompt('Enter table size (Rows x Columns)\nExample: 3x4', '3x3');
                    if (size) {
                      const [rows, cols] = size.split('x').map(Number);
                      if (rows > 0 && cols > 0) editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
                    }
                  }} />

                  <InsertBtn dark={isDark} icon={<Minus size={14} className="text-slate-500" />} label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()} />

                  <InsertBtn dark={isDark} icon={<Sigma size={14} className="text-purple-500" />} label="Math" onClick={() => {
                    const formula = window.prompt('Enter LaTeX formula:');
                    if (formula) editor.chain().focus().insertContent({ type: "inlineMath", attrs: { latex: formula } }).run();
                  }} />
                </div>
              )}

              {/* ===== AI TOOLS TAB ===== */}
              {activeTab === 'ai' && (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Upload image for AI extraction:
                  </span>
                  <InsertBtn
                    dark={isDark}
                    icon={isAiProcessing && activeAiMode === 'ocr' ? <Loader2 size={14} className="animate-spin text-blue-500" /> : <ImageIcon size={14} className="text-blue-500" />}
                    label="Standard Text"
                    onClick={() => triggerAiUpload('ocr')}
                    disabled={isAiProcessing}
                  />
                  <InsertBtn
                    dark={isDark}
                    icon={isAiProcessing && activeAiMode === 'formula' ? <Loader2 size={14} className="animate-spin text-purple-500" /> : <Sigma size={14} className="text-purple-500" />}
                    label="Math Formula"
                    onClick={() => triggerAiUpload('formula')}
                    disabled={isAiProcessing}
                  />
                  <InsertBtn
                    dark={isDark}
                    icon={isAiProcessing && activeAiMode === 'handwriting' ? <Loader2 size={14} className="animate-spin text-orange-500" /> : <PenTool size={14} className="text-orange-500" />}
                    label="Handwriting"
                    onClick={() => triggerAiUpload('handwriting')}
                    disabled={isAiProcessing}
                  />
                </div>
              )}

            </div>
          </div>
        )}

        {/* ---- EDITOR AREA ---- */}
        <div className={`flex-1 overflow-y-auto p-8 ${isDark ? 'bg-[#0f1117]' : 'bg-[#eceef2]'}`}
          style={isDark ? { '--editor-bg': '#1e2130' } as React.CSSProperties : {}}>
          <div className="max-w-[210mm] mx-auto">
            <EditorContent
              editor={editor}
              className={isDark ? 'dark-editor' : ''}
            />
          </div>
        </div>
      </main>

      {/* Dark mode ProseMirror overrides */}
      {isDark && (
        <style>{`
          .dark-editor .ProseMirror {
            background-color: #1c1f2b !important;
            color: #d4d8e8 !important;
            border-color: #2a2d3a !important;
            box-shadow: 0 4px 24px rgba(0,0,0,0.4) !important;
          }
          .dark-editor .ProseMirror h1,
          .dark-editor .ProseMirror h2 {
            color: #e8ecf4 !important;
          }
          .dark-editor .ProseMirror table td,
          .dark-editor .ProseMirror table th {
            border-color: #2a2d3a !important;
          }
          .dark-editor .ProseMirror table th {
            background-color: #1a1d26 !important;
          }
          .dark-editor .ProseMirror hr {
            border-top-color: #2a2d3a !important;
          }
        `}</style>
      )}
    </div>
  );
}

// ======= REUSABLE COMPONENTS =======

function DropdownBtn({ icon, label, onClick, dark }: { icon: React.ReactNode; label: string; onClick: () => void; dark: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold transition-colors border-b last:border-0 ${
        dark
          ? 'text-slate-300 hover:bg-[#1e2130] hover:text-blue-400 border-[#1e2130]'
          : 'text-slate-700 hover:bg-slate-50 hover:text-blue-700 border-slate-100'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function ToolbarBtn({ onClick, active, icon, title, dark }: { onClick: () => void; active: boolean; icon: React.ReactNode; title?: string; dark: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 transition-all duration-150 flex items-center justify-center ${
        active
          ? dark
            ? 'bg-blue-600/25 text-blue-400'
            : 'bg-blue-100 text-blue-700'
          : dark
          ? 'text-slate-400 hover:bg-[#2a2d3a] hover:text-slate-200'
          : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
      }`}
    >
      {icon}
    </button>
  );
}

function InsertBtn({ icon, label, onClick, dark, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; dark: boolean; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border transition-colors disabled:opacity-50 ${
        dark
          ? 'border-[#2a2d3a] text-slate-300 hover:bg-[#252830] hover:border-[#3a3d4a]'
          : 'border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
      }`}
    >
      {icon} {label}
    </button>
  );
}
