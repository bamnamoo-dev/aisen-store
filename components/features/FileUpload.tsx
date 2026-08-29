'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, LoaderCircle, CircleCheck, X } from 'lucide-react';

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
        className="btn-primary py-2 px-4 text-xs font-bold"
      >
        <Upload size={14} />
        <span>새 서식 등록</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 md:p-8 max-w-[480px] w-full rounded-2xl shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Upload size={15} />
                </div>
                <h3 className="text-base font-bold text-slate-900">행정 자료 및 서식 등록</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">자료 제목 (선택)</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="미입력 시 파일명이 제목으로 사용됩니다"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">카테고리</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">첨부 파일</label>
                <div 
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                    isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
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
                  <div className="flex flex-col items-center gap-1.5">
                    <Upload size={18} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">
                      클릭하여 파일 선택 또는 드래그 앤 드롭
                    </span>
                    <span className="text-[11px] text-slate-400">PDF, HWP, HWPX, XLSX 등</span>
                  </div>
                </div>

                {selectedFiles && selectedFiles.length > 0 && (
                  <div className="mt-2.5 flex flex-col gap-1 max-h-[100px] overflow-y-auto no-scrollbar">
                    {Array.from(selectedFiles).map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-xs p-1.5 bg-slate-50 rounded border border-slate-200 text-slate-700">
                        <span className="truncate max-w-[240px]">{f.name}</span>
                        <span className="text-slate-400 text-[10px]">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="btn-secondary py-1.5 px-3.5 text-xs"
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="btn-primary py-1.5 px-4 text-xs font-bold disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <LoaderCircle size={14} className="animate-spin" />
                      <span>업로드 중...</span>
                    </>
                  ) : status === 'success' ? (
                    <>
                      <CircleCheck size={14} className="text-emerald-400" />
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
