'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';

interface LabelRow {
  id: number;
  title: string;
  year: string;
  quarter: string;
  serial: string;
  org: string;
  width: string;
}

const QUARTERS = [
  '1분기(3~5월)',
  '2분기(6~8월)',
  '3분기(9~11월)',
  '4분기(12~2월)',
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
  '상반기', '하반기', '전체',
];

const CURRENT_YEAR = new Date().getFullYear();

export default function LabelMakerPage() {
  const [rows, setRows] = useState<LabelRow[]>([]);
  const [selectedFont, setSelectedFont] = useState<string>('Pretendard, sans-serif');
  const [showPreview, setShowPreview] = useState<boolean>(false);

  useEffect(() => {
    // 초기 기본 행 3개 세팅
    setRows([
      { id: 1, title: '지출결의서', year: String(CURRENT_YEAR), quarter: '1분기(3~5월)', serial: '1/2', org: '서울행정초등학교', width: '4' },
      { id: 2, title: '지출결의서', year: String(CURRENT_YEAR), quarter: '1분기(3~5월)', serial: '2/2', org: '서울행정초등학교', width: '4' },
      { id: 3, title: '징수결의서', year: String(CURRENT_YEAR), quarter: '1분기(3~5월)', serial: '1/1', org: '서울행정초등학교', width: '3' },
    ]);
  }, []);

  const addRow = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    const defaultOrg = rows.length > 0 ? rows[0].org : '서울행정초등학교';
    setRows(prev => [
      ...prev,
      { id: newId, title: '', year: String(CURRENT_YEAR), quarter: '1분기(3~5월)', serial: '1/1', org: defaultOrg, width: '4' }
    ]);
  };

  const deleteRow = (id: number) => {
    if (rows.length <= 1) {
      alert('최소 1개의 행은 유지해야 합니다.');
      return;
    }
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const updateRow = (id: number, field: keyof LabelRow, value: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const loadSample = () => {
    setRows([
      { id: 1, title: '징수결의서', year: '2026', quarter: '1분기(3~5월)', serial: '1/1', org: '서울행정초등학교', width: '2' },
      { id: 2, title: '지출결의서', year: '2026', quarter: '1분기(3~5월)', serial: '1/2', org: '서울행정초등학교', width: '4' },
      { id: 3, title: '지출결의서', year: '2026', quarter: '1분기(3~5월)', serial: '2/2', org: '서울행정초등학교', width: '4' },
      { id: 4, title: '원천징수영수증', year: '2026', quarter: '2분기(6~8월)', serial: '1/1', org: '서울행정초등학교', width: '3' },
      { id: 5, title: '계약서류', year: '2026', quarter: '상반기', serial: '1/1', org: '서울행정초등학교', width: '5' },
      { id: 6, title: '급여대장', year: '2026', quarter: '전체', serial: '1/1', org: '서울행정초등학교', width: '6' },
    ]);
    setShowPreview(true);
  };

  const clearAll = () => {
    setRows([
      { id: 1, title: '', year: String(CURRENT_YEAR), quarter: '1분기(3~5월)', serial: '1/1', org: '서울행정초등학교', width: '4' }
    ]);
    setShowPreview(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const validRows = rows.filter(r => r.title.trim().length > 0);

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6">
      
      {/* 화면 인쇄용 CSS */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-section, #print-section * {
            visibility: visible;
          }
          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-label {
            border: 1px solid #000 !important;
            page-break-inside: avoid;
            background: #fff !important;
            color: #000 !important;
          }
        }
      `}</style>

      {/* 상단 네비게이션 & 헤더 (화면 전용) */}
      <div className="flex flex-col gap-3 print:hidden">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          <span>메인 포털로 돌아가기</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-xs font-bold text-violet-700 mb-2">
              <Tag size={14} />
              <span>지출증빙서 측면 철 라벨 자동 생성 시스템 v2.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              증빙서 측면표지 제작기
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              학교 행정 지출결의서 및 각종 증빙서 문서철의 <span className="font-bold text-slate-700">측면 척추 라벨(바인더 표지)을 너비 규격에 맞춰 자동 생성 및 인쇄</span>합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadSample}
              className="btn-secondary py-2 px-3.5 text-xs font-semibold"
            >
              <Sparkles size={14} />
              <span>샘플 불러오기</span>
            </button>
            <button
              onClick={clearAll}
              className="btn-secondary py-2 px-3 text-xs text-slate-500 hover:text-red-600"
              title="초기화"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 1. 데이터 입력 테이블 (화면 전용) */}
      <div className="glass-card p-5 sm:p-6 flex flex-col gap-4 bg-white print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">📋 라벨 데이터 입력</h2>
            <span className="text-xs text-slate-400 font-medium">(너비는 바인더 두께 cm 단위)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={addRow}
              className="btn-secondary py-1.5 px-3 text-xs font-bold text-violet-700 hover:bg-violet-50 border-violet-200"
            >
              <Plus size={14} />
              <span>행 추가</span>
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="btn-primary py-1.5 px-4 text-xs font-bold bg-violet-600 hover:bg-violet-700 shadow-sm"
            >
              <Tag size={14} />
              <span>표지 생성하기</span>
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">번호</th>
                <th className="py-2.5 px-3 min-w-[140px]">문서철 제목 (필수)</th>
                <th className="py-2.5 px-3 w-28">생산년도</th>
                <th className="py-2.5 px-3 w-36">분기(월)</th>
                <th className="py-2.5 px-3 w-24">일련번호</th>
                <th className="py-2.5 px-3 min-w-[140px]">기관명</th>
                <th className="py-2.5 px-3 w-24">너비(cm)</th>
                <th className="py-2.5 px-3 w-14 text-center">삭제</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, index) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2 px-3 text-center text-slate-400 font-medium">{index + 1}</td>
                  <td className="py-2 px-3">
                    <input 
                      type="text" 
                      value={row.title}
                      onChange={(e) => updateRow(row.id, 'title', e.target.value)}
                      placeholder="예: 지출결의서, 징수결의서"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-violet-500"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input 
                      type="number" 
                      value={row.year}
                      onChange={(e) => updateRow(row.id, 'year', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:border-violet-500"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <select
                      value={row.quarter}
                      onChange={(e) => updateRow(row.id, 'quarter', e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:border-violet-500 bg-white"
                    >
                      {QUARTERS.map((q, idx) => (
                        <option key={idx} value={q}>{q}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-3">
                    <input 
                      type="text" 
                      value={row.serial}
                      onChange={(e) => updateRow(row.id, 'serial', e.target.value)}
                      placeholder="1/1"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-center font-medium focus:outline-none focus:border-violet-500"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input 
                      type="text" 
                      value={row.org}
                      onChange={(e) => updateRow(row.id, 'org', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:border-violet-500"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input 
                      type="number" 
                      step="0.5"
                      min="1"
                      max="15"
                      value={row.width}
                      onChange={(e) => updateRow(row.id, 'width', e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs text-center font-bold text-violet-700 focus:outline-none focus:border-violet-500"
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button 
                      onClick={() => deleteRow(row.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. 생성된 측면표지 미리보기 & 인쇄 영역 */}
      {(showPreview || validRows.length > 0) && (
        <div className="glass-card p-5 sm:p-6 flex flex-col gap-5 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 print:hidden">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">🏷️ 규격 라벨 실시간 미리보기</h2>
                <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 text-xs font-bold">
                  총 {validRows.length}개 표지
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">A4 용지에 실제 바인더 너비(cm) 비율로 출력됩니다.</p>
            </div>

            <button
              onClick={handlePrint}
              disabled={validRows.length === 0}
              className="btn-primary py-2.5 px-6 text-xs sm:text-sm font-bold bg-violet-600 hover:bg-violet-700 shadow-md flex items-center gap-2"
            >
              <Printer size={16} />
              <span>A4 규격 인쇄하기</span>
            </button>
          </div>

          {/* 라벨 렌더링 컨테이너 (화면 및 인쇄 공용) */}
          <div id="print-section" className="flex flex-wrap items-start gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50 overflow-x-auto min-h-[380px]">
            {validRows.map((item, idx) => {
              const widthCm = parseFloat(item.width) || 4;
              // 1cm = 37.8px (화면 기준)
              const widthPx = Math.max(55, Math.min(widthCm * 37.8, 250));

              return (
                <div 
                  key={idx}
                  className="print-label bg-white border-2 border-slate-900 text-slate-900 flex flex-col justify-between shrink-0 shadow-sm"
                  style={{
                    width: `${widthPx}px`,
                    height: '340px',
                    fontFamily: selectedFont
                  }}
                >
                  {/* 상단 메타 헤더 3칸 (생산년도 / 분기 / 일련번호) */}
                  <div className="border-b-2 border-slate-900 flex flex-col text-center">
                    <div className="border-b border-slate-900 py-1 font-bold text-xs bg-slate-50">
                      {item.year}년
                    </div>
                    <div className="border-b border-slate-900 py-1 font-bold text-[11px] truncate px-1">
                      {item.quarter}
                    </div>
                    <div className="py-1 font-bold text-xs text-slate-800">
                      {item.serial}
                    </div>
                  </div>

                  {/* 중앙 세로형 문서철 제목 */}
                  <div className="flex-1 flex items-center justify-center p-2 text-center overflow-hidden">
                    <span 
                      className="font-black tracking-widest text-center leading-tight whitespace-pre-wrap select-none"
                      style={{
                        fontSize: widthCm >= 4 ? '18px' : '14px',
                        writingMode: widthCm >= 3 ? 'vertical-rl' : 'horizontal-tb',
                        textOrientation: 'upright'
                      }}
                    >
                      {item.title}
                    </span>
                  </div>

                  {/* 하단 기관명 */}
                  <div className="border-t-2 border-slate-900 py-2 px-1 text-center font-bold text-[11px] bg-slate-50 truncate">
                    {item.org}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}
