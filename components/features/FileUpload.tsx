'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, Loader2, CheckCircle2, X, FilePlus, Files } from 'lucide-react';

const CATEGORIES = ['예산지침', '계약', '인사', '급여', '회계', '지출', '매뉴얼', '기타'];

export default function FileUpload({ onUploadSuccess, defaultCategory = '기타' }: { onUploadSuccess?: () => void, defaultCategory?: string }) {
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(defaultCategory === '전체 자료' ? '기타' : defaultCategory);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) return alert('파일을 선택해주세요.');

    try {
      setUploading(true);
      setStatus('idle');

      const filesArray = Array.from(selectedFiles);
      const groupId = crypto.randomUUID();
      
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        const fileExt = file.name.split('.').pop();
        const randomName = `${Math.random().toString(36).substring(7)}_${Date.now()}.${fileExt}`;
        const filePath = `${randomName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase
          .from('documents')
          .insert([
            {
              file_name: title || file.name,
              original_name: file.name,
              file_path: filePath,
              file_size: file.size,
              category: category,
              group_id: groupId,
            },
          ]);

        if (dbError) throw dbError;
      }

      setStatus('success');
      setTimeout(() => {
        setShowModal(false);
        setStatus('idle');
        setTitle('');
        setSelectedFiles(null);
        if (onUploadSuccess) onUploadSuccess();
      }, 1000);

    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`업로드 실패: ${error.message}`);
      setStatus('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="btn-primary py-2.5 px-5 text-xs font-bold"
      >
        <Upload size={16} />
        <span>새 서식 등록</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-950 border border-slate-800 p-6 md:p-8 max-w-[520px] w-full rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Upload size={18} />
                </div>
                <h3 className="text-lg font-bold text-white">행정 자료 및 서식 등록</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">자료 제목 (선택)</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="미입력 시 첫 번째 파일명이 제목으로 사용됩니다"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">카테고리</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">첨부 파일 (다중 선택 가능)</label>
                <div 
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isDragging ? 'border-blue-400 bg-blue-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
                  }`}
                  onClick={() => document.getElementById('archive-file-input')?.click()}
                >
                  <input 
                    id="archive-file-input"
                    type="file" 
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-600/15 text-blue-400 flex items-center justify-center">
                      <Upload size={20} />
                    </div>
                    <span className="text-xs font-bold text-slate-300">
                      클릭하여 파일 선택 또는 드래그 앤 드롭
                    </span>
                    <span className="text-[11px] text-slate-500">PDF, HWP, HWPX, XLSX, ZIP 등 모든 문서</span>
                  </div>
                </div>

                {selectedFiles && selectedFiles.length > 0 && (
                  <div className="mt-3 flex flex-col gap-1.5 max-h-[120px] overflow-y-auto no-scrollbar">
                    {Array.from(selectedFiles).map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-xs p-2 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">
                        <span className="truncate max-w-[280px]">{f.name}</span>
                        <span className="text-slate-500 text-[10px]">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="btn-secondary py-2 px-4 text-xs"
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="btn-primary py-2 px-5 text-xs font-bold disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>업로드 중...</span>
                    </>
                  ) : status === 'success' ? (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span>완료!</span>
                    </>
                  ) : (
                    <span>업로드</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
