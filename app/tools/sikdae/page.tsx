'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  UtensilsCrossed, 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  Trash2, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Users,
  CreditCard,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface ExtractedItem {
  name: string;
  amount: number;
  fileName: string;
}

export default function SikdaePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedItem[]>([]);
  const [saveMode, setSaveMode] = useState<'merged' | 'individual'>('merged');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [libReady, setLibReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // SheetJS 라이브러리 동적 로드 보장 함수
  const loadSheetJS = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).XLSX) {
        resolve((window as any).XLSX);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
      script.onload = () => {
        setLibReady(true);
        resolve((window as any).XLSX);
      };
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    loadSheetJS().then(() => setLibReady(true)).catch(() => {});
  }, []);

  // 이름 추출 정규식: "1.홍길동\n..." -> "홍길동"
  const extractName = (text: any): string | null => {
    if (text === null || text === undefined || text === '') return null;
    const firstLine = String(text).split('\n')[0].trim();
    // 1. 홍길동 또는 1.홍길동 매칭
    const match = firstLine.match(/\d+\.(.*)/);
    if (match && match[1]) {
      return match[1].trim();
    }
    return null;
  };

  // 엑셀 파싱 핸들러 (셀 좌표 기반 1:1 고정밀 추출)
  const processFiles = async (selectedFiles: File[]) => {
    if (!selectedFiles.length) return;
    setIsProcessing(true);
    setStatusMessage('엑셀 파일을 분석하는 중입니다...');

    try {
      const XLSX = await loadSheetJS();
      const results: ExtractedItem[] = [];

      for (const file of selectedFiles) {
        try {
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          if (!worksheet || !worksheet['!ref']) continue;

          const range = XLSX.utils.decode_range(worksheet['!ref']);
          
          // 각 행(row) 순회
          for (let R = range.s.r; R <= range.e.r; ++R) {
            // B열 (col index 1)
            const cellB = worksheet[XLSX.utils.encode_cell({ r: R, c: 1 })];
            const rawName = cellB ? cellB.v : null;
            const parsedName = extractName(rawName);

            if (parsedName) {
              // D열 (col index 3)
              const cellD = worksheet[XLSX.utils.encode_cell({ r: R, c: 3 })];
              let amount = 0;
              if (cellD) {
                if (typeof cellD.v === 'number') {
                  amount = cellD.v;
                } else if (cellD.v) {
                  const cleaned = String(cellD.v).replace(/[^0-9.-]/g, '');
                  amount = Number(cleaned) || 0;
                }
              }

              results.push({
                name: parsedName,
                amount: amount,
                fileName: file.name
              });
            }
          }
        } catch (err: any) {
          console.error(`파일 처리 오류 (${file.name}):`, err);
        }
      }

      setFiles(selectedFiles);
      setExtractedData(results);

      if (results.length > 0) {
        setStatusMessage(`총 ${selectedFiles.length}개 파일에서 ${results.length}명의 식대 내역을 성공적으로 추출했습니다!`);
      } else {
        setStatusMessage('임금대장 형식에서 성명(1.홍길동) 패턴을 찾지 못했습니다. 올바른 임금대장 파일인지 확인해 주세요.');
      }
    } catch (err: any) {
      alert(`처리 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      processFiles(selected);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = Array.from(e.dataTransfer.files).filter(
        f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls')
      );
      if (dropped.length > 0) {
        processFiles(dropped);
      } else {
        alert('엑셀(.xlsx, .xls) 파일만 업로드 가능합니다.');
      }
    }
  };

  const handleClear = () => {
    setFiles([]);
    setExtractedData([]);
    setStatusMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 통합 엑셀 다운로드
  const handleDownloadMerged = async () => {
    const XLSX = await loadSheetJS();
    if (!XLSX || !extractedData.length) return;

    const formatted = extractedData.map((item, idx) => ({
      '순번': idx + 1,
      '성명': item.name,
      '식대금액': item.amount,
      '출처파일명': item.fileName
    }));

    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '식대추출결과');

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '') + '_' + 
                    String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
    
    XLSX.writeFile(wb, `${dateStr}_식대대장_통합결과.xlsx`);
  };

  // 개별 파일 다운로드
  const handleDownloadIndividual = async (fileName: string) => {
    const XLSX = await loadSheetJS();
    if (!XLSX) return;

    const targetData = extractedData.filter(d => d.fileName === fileName);
    if (!targetData.length) return;

    const formatted = targetData.map((item, idx) => ({
      '순번': idx + 1,
      '성명': item.name,
      '식대금액': item.amount
    }));

    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '식대추출');

    const cleanName = fileName.replace(/\.[^/.]+$/, '');
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');

    XLSX.writeFile(wb, `${dateStr}_${cleanName}_정리완료.xlsx`);
  };

  // 통계 계산
  const totalCount = extractedData.length;
  const totalAmount = extractedData.reduce((acc, cur) => acc + cur.amount, 0);

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6">
      
      {/* 상단 네비게이션 & 헤더 */}
      <div className="flex flex-col gap-3">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          <span>메인 포털로 돌아가기</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-xs font-bold text-orange-600 mb-2">
              <UtensilsCrossed size={14} />
              <span>급식비·식대 자동 추출 도구 v2.0 (내장형)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              나이스 임금대장 식대분리기
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              나이스(NEIS) 임금대장에서 <span className="font-bold text-slate-700">성명(B열)</span>과 <span className="font-bold text-slate-700">식대 공제금액(D열)</span>을 0.1초 만에 깔끔하게 정제합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-2 rounded-xl font-semibold shrink-0">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>100% 브라우저 메모리 안전 처리 (서버 유출 0%)</span>
          </div>
        </div>
      </div>

      {/* 1. 업로드 영역 및 옵션 설정 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* 드래그 앤 드롭 업로더 (2열 차지) */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`glass-card border-2 border-dashed p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all ${
              isDragOver 
                ? 'border-orange-500 bg-orange-50/50 scale-[0.99]' 
                : 'border-slate-300 hover:border-orange-400 hover:bg-slate-50/50'
            }`}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="hidden" 
            />

            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shadow-2xs">
              {isProcessing ? (
                <RefreshCw size={28} className="animate-spin text-orange-600" />
              ) : (
                <UploadCloud size={28} />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-base font-bold text-slate-800">
                {files.length > 0 
                  ? `${files.length}개 파일 선택됨 (클릭하여 다른 파일 추가)`
                  : '클릭하여 임금대장 엑셀을 선택하거나 파일들을 끌어다 놓으세요'}
              </p>
              <p className="text-xs text-slate-400 font-medium">
                여러 개의 엑셀 파일(.xlsx, .xls)을 한 번에 동시에 올릴 수 있습니다.
              </p>
            </div>

            {isProcessing && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 text-xs font-bold animate-pulse">
                <Sparkles size={14} />
                <span>데이터 고속 추출 중...</span>
              </div>
            )}
          </div>

          {statusMessage && (
            <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              extractedData.length > 0 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {extractedData.length > 0 ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* 옵션 및 제어 패널 (1열) */}
        <div className="glass-card p-5 flex flex-col justify-between gap-4 bg-white">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              저장 모드 선택
            </span>

            <div className="flex flex-col gap-2">
              <label 
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  saveMode === 'merged' 
                    ? 'border-orange-500 bg-orange-50/60 font-bold text-slate-900' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input 
                  type="radio" 
                  name="saveMode" 
                  checked={saveMode === 'merged'} 
                  onChange={() => setSaveMode('merged')}
                  className="accent-orange-600"
                />
                <div className="flex flex-col">
                  <span className="text-xs sm:text-[13.5px]">하나로 통합 저장 (추천)</span>
                  <span className="text-[11px] text-slate-400 font-normal">여러 파일을 1개 엑셀 파일에 합쳐서 정리</span>
                </div>
              </label>

              <label 
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  saveMode === 'individual' 
                    ? 'border-orange-500 bg-orange-50/60 font-bold text-slate-900' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input 
                  type="radio" 
                  name="saveMode" 
                  checked={saveMode === 'individual'} 
                  onChange={() => setSaveMode('individual')}
                  className="accent-orange-600"
                />
                <div className="flex flex-col">
                  <span className="text-xs sm:text-[13.5px]">각각 따로 저장</span>
                  <span className="text-[11px] text-slate-400 font-normal">업로드한 원본 파일별로 개별 다운로드</span>
                </div>
              </label>
            </div>
          </div>

          {files.length > 0 && (
            <button 
              onClick={handleClear}
              className="btn-secondary py-2 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 w-full"
            >
              <Trash2 size={14} />
              <span>목록 초기화</span>
            </button>
          )}
        </div>

      </div>

      {/* 2. 결과 요약 카드 */}
      {extractedData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-4 flex items-center gap-3.5 border-blue-100 bg-blue-50/30">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">업로드된 파일</span>
              <p className="text-lg font-black text-slate-900">{files.length}개 파일</p>
            </div>
          </div>

          <div className="glass-card p-4 flex items-center gap-3.5 border-emerald-100 bg-emerald-50/30">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">추출된 교직원 수</span>
              <p className="text-lg font-black text-slate-900">{totalCount.toLocaleString()}명</p>
            </div>
          </div>

          <div className="glass-card p-4 flex items-center gap-3.5 border-orange-100 bg-orange-50/30">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">식대 총 공제 합계</span>
              <p className="text-lg font-black text-orange-600">{totalAmount.toLocaleString()}원</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. 다운로드 및 실시간 미리보기 테이블 */}
      {extractedData.length > 0 ? (
        <div className="glass-card p-5 sm:p-6 flex flex-col gap-4 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">추출 결과 실시간 미리보기</h3>
              <p className="text-xs text-slate-400 mt-0.5">상위 100건 데이터가 화면에 표시됩니다.</p>
            </div>

            {saveMode === 'merged' ? (
              <button 
                onClick={handleDownloadMerged}
                className="btn-primary py-2.5 px-5 text-xs sm:text-sm font-bold bg-orange-600 hover:bg-orange-700 shadow-sm"
              >
                <Download size={16} />
                <span>통합 엑셀 다운로드 (.xlsx)</span>
              </button>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(extractedData.map(d => d.fileName))).map((fname) => (
                  <button
                    key={fname}
                    onClick={() => handleDownloadIndividual(fname)}
                    className="btn-secondary py-1.5 px-3 text-xs font-bold text-orange-700 hover:bg-orange-50 border-orange-200"
                  >
                    <Download size={13} />
                    <span className="truncate max-w-[150px]">{fname}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 테이블 */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">순번</th>
                  <th className="py-3 px-4">성명</th>
                  <th className="py-3 px-4 text-right">식대금액 (원)</th>
                  <th className="py-3 px-4">출처 파일명</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {extractedData.slice(0, 100).map((item, idx) => (
                  <tr key={idx} className="hover:bg-orange-50/30 transition-colors">
                    <td className="py-2.5 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{item.name}</td>
                    <td className="py-2.5 px-4 text-right font-semibold text-orange-600">
                      {item.amount.toLocaleString()}원
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 text-xs truncate max-w-[240px]">
                      {item.fileName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
          <Layers size={36} className="text-slate-300" />
          <p className="text-sm font-medium">상단에 임금대장 엑셀 파일을 올리시면 여기에 실시간 정제 결과가 표시됩니다.</p>
        </div>
      )}

    </div>
  );
}
