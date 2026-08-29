'use client';

import { useEffect, useState } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Trash2, 
  ExternalLink,
  FolderOpen, 
  Edit3, 
  X, 
  BookOpen,
  Layers
} from 'lucide-react';
import ToolHeader from '@/components/ToolHeader';
import FileUpload from '@/components/features/FileUpload';
import { supabase } from '@/lib/supabase';

interface Document {
  id: string;
  file_name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  category: string;
  created_at: string;
  group_id: string;
}

interface GroupedDocument {
  group_id: string;
  file_name: string;
  category: string;
  created_at: string;
  files: { id: string; file_name: string; original_name: string; file_path: string; file_size: number }[];
}

const OFFICIAL_GUIDELINE_CATEGORIES = [
  { name: '계약 업무', cat: '계약', count: '18권 (4,656쪽)', desc: '물품·용역·공사 계약집행기준, 수의계약, 낙찰자 결정기준', icon: '📝' },
  { name: '예산 및 회계', cat: '예산', count: '12권 (2,140쪽)', desc: '학교회계 예산편성 기본지침, 세입세출 예산과목, 회계규칙', icon: '💰' },
  { name: '공무원 인사/복무', cat: '공무원', count: '15권 (3,210쪽)', desc: '국가공무원 복무·징계 실무, 휴직 및 겸직 지침', icon: '👔' },
  { name: '출장 및 여비', cat: '여비', count: '6권 (890쪽)', desc: '공무원보수 등의 업무지침(여비업무 처리기준), 유류비 기준', icon: '🚗' },
  { name: '교육공무직원', cat: '공무직', count: '8권 (1,150쪽)', desc: '교육공무직원 취업규칙, 단체협약, 임금체계 및 복무 기준', icon: '👥' },
  { name: '급식 및 시설안전', cat: '급식', count: '14권 (1,800쪽)', desc: '학교급식 기본방향, 산업안전보건, 시설적립금, 물품·재산 관리', icon: '🍱' },
];

const CATEGORIES = ['전체 자료', '예산지침', '계약', '인사', '급여', '회계', '지출', '매뉴얼', '기타'];

export default function ArchivePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체 자료");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [editForm, setEditForm] = useState<{file_name: string, category: string}>({ 
    file_name: '', 
    category: '' 
  });

  useEffect(() => {
    checkAdmin();
    fetchDocuments();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAdmin(session?.user?.email === 'bamnamoo@gmail.com');
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (doc: Document) => {
    setEditingDoc(doc);
    setEditForm({ 
      file_name: doc.file_name, 
      category: doc.category 
    });
    setShowEditModal(true);
  };

  const handleUpdateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    try {
      const { error } = await supabase
        .from('documents')
        .update({
          file_name: editForm.file_name,
          category: editForm.category
        })
        .eq('id', editingDoc.id);

      if (error) throw error;
      setShowEditModal(false);
      fetchDocuments();
    } catch (error: any) {
      alert(`수정 실패: ${error.message}`);
    }
  };

  const handleDeleteDocument = async (id: string, filePath: string) => {
    if (!confirm('이 문서를 삭제하시겠습니까?')) return;
    try {
      await supabase.storage.from('documents').remove([filePath]);
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
      fetchDocuments();
    } catch (error: any) {
      alert(`삭제 실패: ${error.message}`);
    }
  };

  const handleDownloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(filePath);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error: any) {
      alert(`다운로드 실패: ${error.message}`);
    }
  };

  const groupedDocuments = documents.reduce((acc: { [key: string]: GroupedDocument }, doc) => {
    const key = doc.group_id || doc.id;
    if (!acc[key]) {
      acc[key] = {
        group_id: key,
        file_name: doc.file_name,
        category: doc.category,
        created_at: doc.created_at,
        files: []
      };
    }
    acc[key].files.push({
      id: doc.id,
      file_name: doc.file_name,
      original_name: doc.original_name,
      file_path: doc.file_path,
      file_size: doc.file_size
    });
    return acc;
  }, {});

  const groupedList = Object.values(groupedDocuments).filter(group => {
    const titleMatch = group.file_name.toLowerCase().includes(search.toLowerCase()) ||
                       group.files.some(f => f.original_name.toLowerCase().includes(search.toLowerCase()));
    const catMatch = activeCategory === "전체 자료" || group.category === activeCategory;
    return titleMatch && catMatch;
  });

  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* 겹침 없는 통합 스마트 헤더 */}
      <ToolHeader 
        title="행정 자료실 & 102권 공식 지침서"
        icon={<BookOpen size={15} className="text-emerald-600" />}
      />

      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-8 py-6 flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-blue-600 mb-2">
              <FolderOpen size={13} className="text-blue-600" />
              <span>통합 행정 아카이브</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">행정 자료실 &amp; 공식 지침서</h1>
            <p className="text-sm text-slate-500 mt-1">
              102권 공식 지침서 1:1 스트리밍 뷰어와 교직원 실무 서식을 통합 제공합니다.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && <FileUpload onUploadSuccess={fetchDocuments} defaultCategory={activeCategory} />}
          </div>
        </div>

        {/* SECTION 1: 102 Official Guidelines */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">102권 공식 지침서 1:1 스트리밍 서고</h2>
            </div>
            <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
              0.1초 원본 스트리밍
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {OFFICIAL_GUIDELINE_CATEGORIES.map((guide, idx) => (
              <a 
                key={idx}
                href={`https://chatbot.aisen.store?cat=${encodeURIComponent(guide.cat)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-5 flex flex-col justify-between group hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{guide.icon}</span>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {guide.count}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {guide.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {guide.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">1:1 쪽수 앵커링</span>
                  <div 
                    className="btn-secondary py-1 px-3 text-xs flex items-center gap-1 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors"
                  >
                    <span>서고 열기</span>
                    <ExternalLink size={12} />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* SECTION 2: User Documents */}
        <div className="flex flex-col gap-5 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">실무 서식 및 공문서 다운로드</h2>
            </div>
            <span className="text-xs text-slate-500">총 {groupedList.length}건 등록됨</span>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-slate-200 shadow-sm w-full sm:w-auto overflow-x-auto no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-[260px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="서식명 또는 파일 검색..."
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
              />
            </div>
          </div>

          {/* Documents Grid */}
          {loading ? (
            <div className="py-20 text-center text-slate-400">자료를 불러오는 중...</div>
          ) : groupedList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {groupedList.map((group) => (
                <div 
                  key={group.group_id} 
                  className="glass-card p-5 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {group.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(group.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {group.file_name}
                    </h3>

                    <div className="mt-3 flex flex-col gap-1.5">
                      {group.files.map((file) => (
                        <div 
                          key={file.id} 
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700"
                        >
                          <span className="truncate max-w-[190px]" title={file.original_name}>
                            {file.original_name}
                          </span>
                          <button
                            onClick={() => handleDownloadFile(file.file_path, file.original_name)}
                            className="p-1 rounded text-blue-600 hover:bg-blue-100 transition-all shrink-0 ml-2"
                            title="다운로드"
                          >
                            <Download size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">파일 {group.files.length}개</span>
                    
                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(group.files[0] as any)}
                          className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                          title="제목 수정"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            group.files.forEach(f => handleDeleteDocument(f.id, f.file_path));
                          }}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100"
                          title="전체 삭제"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
              등록된 서식 자료가 없습니다.
            </div>
          )}

        </div>

      </div>

      {/* Edit Title Modal */}
      {showEditModal && editingDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 max-w-[420px] w-full rounded-2xl shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">서식 제목 수정</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateDocument} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">서식 제목</label>
                <input 
                  type="text" 
                  required
                  value={editForm.file_name}
                  onChange={(e) => setEditForm({...editForm, file_name: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">카테고리</label>
                <select 
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  {CATEGORIES.filter(c => c !== "전체 자료").map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary py-1.5 px-3.5 text-xs"
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="btn-primary py-1.5 px-4 text-xs font-bold"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
