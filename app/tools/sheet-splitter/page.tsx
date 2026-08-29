'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  Trash2, 
  ArrowLeft, 
  CheckCircle2, 
  Archive,
  Layers,
  Sparkles,
  CheckSquare,
  FileCheck
} from 'lucide-react';
import Script from 'next/script';
import ToolHeader from '@/components/ToolHeader';

interface SheetInfo {
  name: string;
  rowCount: number;
  selected: boolean;
}

export default function SheetSplitterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [workbookData, setWorkbookData] = useState<any>(null);
  const [sheetList, setSheetList] = useState<SheetInfo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 엑셀 시트 분석
  const processExcelFile = async (uploadedFile: File) => {
    setIsProcessing(true);

    const XLSX = (window as any).XLSX;
    if (!XLSX) {
      alert('엑셀 처리 엔진을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
      setIsProcessing(false);
      return;
    }

    try {
      const data = await uploadedFile.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      
      const sheets: SheetInfo[] = wb.SheetNames.map((name: string) => {
        const ws = wb.Sheets[name];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
        return {
          name: name,
          rowCount: rows.length,
          selected: true
        };
      });

      setFile(uploadedFile);
      setWorkbookData(wb);
      setSheetList(sheets);
    } catch (err: any) {
      alert(`엑셀 파일 분석 실패: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processExcelFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.name.endsWith('.xlsx') || dropped.name.endsWith('.xls')) {
        processExcelFile(dropped);
      } else {
        alert('엑셀(.xlsx, .xls) 파일만 업로드 가능합니다.');
      }
    }
  };

  const handleClear = () => {
    setFile(null);
    setWorkbookData(null);
    setSheetList([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleSheetSelection = (index: number) => {
    setSheetList(prev => prev.map((s, idx) => idx === index ? { ...s, selected: !s.selected } : s));
  };

  const toggleSelectAll = () => {
    const allSelected = sheetList.every(s => s.selected);
    setSheetList(prev => prev.map(s => ({ ...s, selected: !allSelected })));
  };

  // 단일 시트 다운로드
  const downloadSingleSheet = (sheetName: string) => {
    const XLSX = (window as any).XLSX;
    if (!XLSX || !workbookData) return;

    const ws = workbookData.Sheets[sheetName];
    const newWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWb, ws, sheetName);

    XLSX.writeFile(newWb, `${sheetName}.xlsx`);
  };

  // 선택한 시트들을 ZIP으로 일괄 압축 다운로드
  const downloadZip = async () => {
    const XLSX = (window as any).XLSX;
    const JSZip = (window as any).JSZip;

    if (!XLSX || !JSZip) {
      alert('압축 처리 모듈을 준비 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    const selectedSheets = sheetList.filter(s => s.selected);
    if (!selectedSheets.length) {
      alert('분리하여 다운로드할 시트를 하나 이상 선택해 주세요.');
      return;
    }

    setIsZipping(true);

    try {
      const zip = new JSZip();

      for (const s of selectedSheets) {
        const ws = workbookData.Sheets[s.name];
        const newWb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWb, ws, s.name);

        // 엑셀 바이너리 생성
        const wbout = XLSX.write(newWb, { bookType: 'xlsx', type: 'array' });
        zip.file(`${s.name}.xlsx`, wbout);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      const cleanFileName = file ? file.name.replace(/\.[^/.]+$/, '') : 'excel';
      a.download = `split_${cleanFileName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`ZIP 파일 생성 오류: ${err.message}`);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <>
      {/* SheetJS & JSZip 라이브러리 비동기 로드 */}
      <Script 
        src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js" 
        strategy="lazyOnload"
      />
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js" 
        strategy="lazyOnload"
      />

      <div className="w-full flex flex-col min-h-screen">
        {/* 겹침 없는 통합 스마트 헤더 */}
        <ToolHeader 
          title="엑셀시트별 분리저장기"
          icon={<FileSpreadsheet size={15} className="text-emerald-700" />}
        />

        <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-8 py-6 flex flex-col gap-6">
          
          {/* 상단 헤더 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 mb-2">
                <FileSpreadsheet size={14} />
                <span>엑셀 다중 탭 분리 도구 v2.0 (내장형)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                엑셀시트별 분리저장기
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                하나의 엑셀 파일 안에 있는 여러 시트(탭)를 <span className="font-bold text-slate-700">개별 엑셀 파일(.xlsx)로 자동 분할하여 ZIP으로 묶어 다운로드</span>합니다.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-2 rounded-xl font-semibold shrink-0">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>대용량 엑셀도 0.5초 초고속 분리</span>
            </div>
          </div>
        </div>

        {/* 1. 업로드 영역 */}
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`glass-card border-2 border-dashed p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all ${
            isDragOver 
              ? 'border-emerald-500 bg-emerald-50/40 scale-[0.99]' 
              : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50/50'
          }`}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="hidden" 
          />

          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs">
            <UploadCloud size={28} />
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-base font-bold text-slate-800">
              {file ? file.name : '클릭하여 분리할 엑셀 파일을 선택하거나 끌어다 놓으세요'}
            </p>
            <p className="text-xs text-slate-400 font-medium">
              여러 탭(시트)이 포함된 엑셀 파일(.xlsx, .xls)을 지원합니다.
            </p>
          </div>

          {isProcessing && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold animate-pulse">
              <Sparkles size={14} />
              <span>시트 탐색 및 데이터 파싱 중...</span>
            </div>
          )}
        </div>

        {/* 2. 시트 목록 및 분리 다운로드 영역 */}
        {sheetList.length > 0 && (
          <div className="glass-card p-5 sm:p-6 flex flex-col gap-5 bg-white">
            
            {/* 상단 컨트롤러 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">발견된 시트 목록</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    총 {sheetList.length}개 탭
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">원하는 시트만 선택하여 분리하거나 전체를 일괄 압축할 수 있습니다.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSelectAll}
                  className="btn-secondary py-2 px-3 text-xs font-semibold"
                >
                  <CheckSquare size={14} />
                  <span>{sheetList.every(s => s.selected) ? '선택 해제' : '전체 선택'}</span>
                </button>

                <button 
                  onClick={downloadZip}
                  disabled={isZipping || sheetList.filter(s => s.selected).length === 0}
                  className="btn-primary py-2 px-4 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
                >
                  <Archive size={16} />
                  <span>{isZipping ? '압축 중...' : '선택 시트 일괄 다운로드 (ZIP)'}</span>
                </button>

                <button 
                  onClick={handleClear}
                  className="btn-secondary py-2 px-2.5 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50"
                  title="초기화"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* 시트 그리드 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {sheetList.map((sheet, idx) => (
                <div 
                  key={idx}
                  onClick={() => toggleSheetSelection(idx)}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 cursor-pointer transition-all ${
                    sheet.selected 
                      ? 'border-emerald-400 bg-emerald-50/40 shadow-2xs' 
                      : 'border-slate-200 bg-slate-50/50 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <input 
                        type="checkbox" 
                        checked={sheet.selected} 
                        onChange={() => {}} 
                        className="accent-emerald-600 rounded shrink-0"
                      />
                      <span className="text-xs sm:text-sm font-bold text-slate-900 truncate" title={sheet.name}>
                        {sheet.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 shrink-0">
                      {sheet.rowCount}행
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadSingleSheet(sheet.name);
                    }}
                    className="w-full btn-secondary py-1 px-2.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100/80 border-emerald-200 flex items-center justify-center gap-1"
                  >
                    <Download size={12} />
                    <span>개별 다운로드</span>
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {!sheetList.length && !isProcessing && (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
            <Layers size={36} className="text-slate-300" />
            <p className="text-sm font-medium">상단에 다중 시트 엑셀 파일을 올리시면 시트별 개별 파일 분리 목록이 열립니다.</p>
          </div>
        )}

        </div>
      </div>
    </>
  );
}
