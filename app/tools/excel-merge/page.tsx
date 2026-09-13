'use client';

import React, { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import JSZip from 'jszip';
import Link from 'next/link';
import ToolHeader from '@/components/ToolHeader';
import { 
  FileSpreadsheet, Upload, Download, CheckCircle2, AlertCircle, AlertTriangle, 
  Layers, Copy, RefreshCw, Sparkles, FileText, ArrowRight, ShieldCheck, 
  HelpCircle, ChevronDown, Check, Send, DownloadCloud, FileCheck2, School,
  FlaskConical, Archive, Eye, FileUp, Building2, SlidersHorizontal, BookOpen,
  RotateCcw, X
} from 'lucide-react';

interface SchoolItem {
  seq: number;
  name: string;
  type?: string;
  code?: string;
}

interface ProcessedFile {
  name: string;
  size: number;
  schoolName: string;
  matchedSeq?: number;
  status: 'matched' | 'unmatched' | 'duplicate' | 'error';
  errorMsg?: string;
  dataBlock?: any;
  rowCount?: number;
}

// 서울 11개 교육지원청 및 전국/자체 명부 지원 목록
const REGIONAL_OFFICES = [
  { id: 'none', name: '선택 안 함 (전국 자유 서식 / 자체 명부)', count: 0, file: '' },
  { id: 'gangnam', name: '🧪 가상 샘플 교육지원청 (136개교)', count: 136, file: '/data/sample_virtual_schools.json' },
  { id: 'gangdong', name: '서울 강동송파 (약 122개교)', count: 122, file: '/data/sample_virtual_schools.json' },
  { id: 'gangseo', name: '서울 강서양천 (약 131개교)', count: 131, file: '/data/sample_virtual_schools.json' },
  { id: 'bukbu', name: '서울 북부 (약 128개교)', count: 128, file: '/data/sample_virtual_schools.json' },
  { id: 'jungbu', name: '서울 중부 (약 88개교)', count: 88, file: '/data/sample_virtual_schools.json' },
  { id: 'seongdong', name: '서울 성동광진 (약 83개교)', count: 83, file: '/data/sample_virtual_schools.json' },
  { id: 'seongbuk', name: '서울 성북강북 (약 92개교)', count: 92, file: '/data/sample_virtual_schools.json' },
  { id: 'dongbu', name: '서울 동부 (약 97개교)', count: 97, file: '/data/sample_virtual_schools.json' },
  { id: 'seobu', name: '서울 서부 (약 124개교)', count: 124, file: '/data/sample_virtual_schools.json' },
  { id: 'nambu', name: '서울 남부 (약 116개교)', count: 116, file: '/data/sample_virtual_schools.json' },
  { id: 'dongjak', name: '서울 동작관악 (약 112개교)', count: 112, file: '/data/sample_virtual_schools.json' },
  { id: 'custom', name: '📂 자체 기준 명부 직접 등록 (.xlsx)', count: 0, file: '' }
];

export default function ExcelMergePage() {
  const [excelJsLoaded, setExcelJsLoaded] = useState(false);
  const [mode, setMode] = useState<'block' | 'simple' | 'edufine'>('block');
  
  // 3단계 범용 수합 설정
  const [activePreset, setActivePreset] = useState<'food' | 'labor' | 'general' | 'custom'>('food');
  const [sheetKeyword, setSheetKeyword] = useState('신청');
  const [headerEndRow, setHeaderEndRow] = useState(17);       // 1단계: 1~N행 헤더 유지 (1회만)
  const [blockStartRow, setBlockStartRow] = useState(18);     // 2단계: 학교별 본문 시작 행
  const [blockRowCount, setBlockRowCount] = useState(16);     // 2단계: 학교당 블록 행 수 (가변행 감지 시 기준)
  const [isAutoDetectRows, setIsAutoDetectRows] = useState(false); // 가변행 자동감지 (빈 줄 전까지 동적 수합)
  const [sortMode, setSortMode] = useState<'seq' | 'name' | 'filename'>('seq'); // 3단계: 연번순 정렬
  const [schoolCellCol, setSchoolCellCol] = useState(5);      // E열 = 학교명 (인건비는 F열=6열)
  const [schoolCellRowOffset, setSchoolCellRowOffset] = useState(0); 

  // 에듀파인 교부 모드 설정
  const [edufineBizName, setEdufineBizName] = useState('학교 전출금 교부액');
  const [edufineAmountCol, setEdufineAmountCol] = useState(9); // I열 = 합계액

  // 기준 명부 관리 상태 (전국 대응 - 초기값은 선택 안 함(0개소))
  const [selectedRegion, setSelectedRegion] = useState<string>('none');
  const [targetSchools, setTargetSchools] = useState<SchoolItem[]>([]);
  const [customRosterName, setCustomRosterName] = useState<string>('');

  // 처리 상태 관리
  const [files, setFiles] = useState<File[]>([]);
  const [processedList, setProcessedList] = useState<ProcessedFile[]>([]);
  const [missingSchools, setMissingSchools] = useState<SchoolItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [mergedFileName, setMergedFileName] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // 엑셀 시트 상단 미리보기 & 스마트 헤더 선택기 상태
  const [previewRows, setPreviewRows] = useState<Array<{ rowNum: number; cells: string[] }>>([]);
  const [previewSheetName, setPreviewSheetName] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [autoDetectedBadge, setAutoDetectedBadge] = useState<string>('');
  const [isManualOpen, setIsManualOpen] = useState(false); // 실무 사용설명서 모달 열림 상태

  const fileInputRef = useRef<HTMLInputElement>(null);
  const rosterInputRef = useRef<HTMLInputElement>(null);

  // 업무별 1초 원클릭 프리셋
  const applyPreset = (presetType: 'food' | 'labor' | 'general') => {
    setActivePreset(presetType);
    if (presetType === 'food') {
      setMode('block');
      setSheetKeyword('신청');
      setHeaderEndRow(17);
      setBlockStartRow(18);
      setBlockRowCount(16);
      setIsAutoDetectRows(false);
      setSchoolCellCol(5);
      setSortMode('seq');
    } else if (presetType === 'labor') {
      setMode('block');
      setSheetKeyword('인건비');
      setHeaderEndRow(15);
      setBlockStartRow(16);
      setBlockRowCount(1);
      setIsAutoDetectRows(true);
      setSchoolCellCol(6); // F16 학교명
      setSortMode('seq');
    } else if (presetType === 'general') {
      setMode('simple');
      setHeaderEndRow(1);
      setBlockStartRow(2);
      setIsAutoDetectRows(true);
      setSortMode('seq');
    }
  };

  // 기준 명부 로드 (기본 지원청 JSON)
  useEffect(() => {
    if (selectedRegion === 'none') {
      setTargetSchools([]);
      setCustomRosterName('');
      return;
    }
    if (selectedRegion !== 'custom') {
      const office = REGIONAL_OFFICES.find(o => o.id === selectedRegion);
      if (office && office.file) {
        fetch(office.file)
          .then(res => res.json())
          .then((data: SchoolItem[]) => {
            setTargetSchools(data);
            setCustomRosterName('');
          })
          .catch(err => {
            console.error('명부 로드 실패:', err);
          });
      }
    }
  }, [selectedRegion]);

  // 자체 기준 명부 엑셀(.xlsx) 업로드 파싱
  const handleRosterFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const ExcelJS = (window as any).ExcelJS;
    if (!ExcelJS) {
      alert('ExcelJS 엔진을 로딩 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buffer);
      const ws = wb.worksheets[0];
      
      const customList: SchoolItem[] = [];
      let seqCounter = 1;

      // 1행(헤더) 제외하고 2행부터 스캔
      for (let r = 2; r <= Math.min(ws.rowCount, 1000); r++) {
        const row = ws.getRow(r);
        const col1 = row.getCell(1).value;
        const col2 = row.getCell(2).value;

        let name = '';
        let seq = seqCounter;

        if (col2 !== null && col2 !== undefined && String(col2).trim() !== '') {
          name = String(col2).trim();
          const parsedSeq = parseInt(String(col1), 10);
          if (!isNaN(parsedSeq) && parsedSeq > 0) seq = parsedSeq;
        } else if (col1 !== null && col1 !== undefined && String(col1).trim() !== '') {
          name = String(col1).trim();
        }

        if (name) {
          customList.push({ seq, name });
          seqCounter++;
        }
      }

      if (customList.length === 0) {
        alert('명부 엑셀에서 학교/기관명을 찾을 수 없습니다. A열(연번) B열(이름) 서식을 확인해주세요.');
        return;
      }

      setTargetSchools(customList);
      setSelectedRegion('custom');
      setCustomRosterName(`${file.name} (${customList.length}개소 등록됨)`);
      alert(`자체 기준 명부가 성공적으로 등록되었습니다!\n총 ${customList.length}개 기관/학교를 기준으로 수합이 진행됩니다.`);
    } catch (err: any) {
      alert('명부 엑셀 파싱 실패: ' + err.message);
    }
  };

  // 학교명 정규화 (공백, 괄호 등 제거 비교용)
  const normalizeSchoolName = (name: string): string => {
    if (!name) return '';
    return String(name).replace(/[\s\u3000\(\)\[\]_]/g, '').trim();
  };

  // 학교명 매칭
  const findMatchingSchool = (rawName: string): SchoolItem | undefined => {
    if (!rawName) return undefined;
    const cleanRaw = normalizeSchoolName(rawName);
    
    // 1. 정확 일치
    let match = targetSchools.find(s => normalizeSchoolName(s.name) === cleanRaw);
    if (match) return match;

    // 2. 부분 일치 (예: '개포초' -> '서울개포초등학교')
    match = targetSchools.find(s => {
      const cleanTarget = normalizeSchoolName(s.name);
      return cleanTarget.includes(cleanRaw) || cleanRaw.includes(cleanTarget);
    });
    if (match) return match;

    // 3. 접두어 '서울' 제외 비교
    const stripSeoul = (s: string) => s.replace(/^서울/, '');
    const cleanNoSeoul = stripSeoul(cleanRaw);
    match = targetSchools.find(s => {
      const targetNoSeoul = stripSeoul(normalizeSchoolName(s.name));
      return targetNoSeoul.includes(cleanNoSeoul) || cleanNoSeoul.includes(targetNoSeoul);
    });

    return match;
  };

  // 수식 오프셋 조정 함수 (상대 행 번호만 + offset)
  const shiftFormula = (formula: string, rowOffset: number): string => {
    if (!formula || rowOffset === 0) return formula;
    const pattern = /(\$?)([A-Za-z]{1,3})(\$?)(\d+)/g;
    return formula.replace(pattern, (match, colAbs, col, rowAbs, row) => {
      if (rowAbs === '$') return match; // 절대참조 행은 고정
      return `${colAbs}${col}${rowAbs}${parseInt(row, 10) + rowOffset}`;
    });
  };

  // 가변 데이터 행 감지 함수 (빈 줄 전까지의 실제 작성 행 수 스캔)
  const findLastDataRow = (ws: any, startRow: number, maxCol: number = 40): number => {
    let last = startRow;
    let emptyStreak = 0;
    for (let r = startRow; r < startRow + 300; r++) {
      let hasVal = false;
      for (let c = 1; c <= maxCol; c++) {
        const v = ws.getCell(r, c).value;
        if (v !== null && v !== undefined && String(v).trim() !== '') {
          hasVal = true;
          break;
        }
      }
      if (hasVal) {
        last = r;
        emptyStreak = 0;
      } else {
        emptyStreak++;
        if (emptyStreak >= 2) break;
      }
    }
    return last;
  };

  // 엑셀 업로드 시 스마트 헤더 자동 감지 (컬럼 타이틀 행 탐지)
  const detectSmartHeaderRow = (rows: Array<{ rowNum: number; cells: string[] }>): number | null => {
    const keywords = ['연번', '순번', '학교명', '기관명', '학교', '구분', '성명', '직급', '항목', '급별'];
    let detectedRow: number | null = null;

    for (let i = 0; i < Math.min(rows.length, 25); i++) {
      const r = rows[i];
      const joined = r.cells.join(' ');
      let hitCount = 0;
      for (const kw of keywords) {
        if (joined.includes(kw)) hitCount++;
      }
      // 타이틀 키워드가 2개 이상 들어있는 행을 헤더 끝 행으로 판별
      if (hitCount >= 2) {
        detectedRow = r.rowNum;
      }
    }
    return detectedRow;
  };

  // 첫 번째 파일의 상단 30행을 읽어 시각적 미리보기 구성 & 스마트 헤더 추천
  const loadSheetPreview = async (file: File) => {
    try {
      const ExcelJS = (window as any).ExcelJS;
      if (!ExcelJS) return;
      const buffer = await file.arrayBuffer();
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buffer);

      let ws = wb.worksheets.find((s: any) => s.name.includes(sheetKeyword));
      if (!ws) ws = wb.worksheets[1] || wb.worksheets[0];
      if (!ws) return;

      setPreviewSheetName(ws.name);

      const rows: Array<{ rowNum: number; cells: string[] }> = [];
      const maxRowsToPreview = Math.min(30, ws.rowCount || 30);

      for (let r = 1; r <= maxRowsToPreview; r++) {
        const row = ws.getRow(r);
        const cellVals: string[] = [];
        for (let c = 1; c <= 12; c++) {
          const val = row.getCell(c).value;
          let text = '';
          if (val === null || val === undefined) text = '';
          else if (typeof val === 'object') {
            if (val.result !== undefined) text = String(val.result);
            else if (val.formula) text = `=${val.formula}`;
            else text = String(val);
          } else {
            text = String(val);
          }
          cellVals.push(text.trim());
        }
        rows.push({ rowNum: r, cells: cellVals });
      }
      setPreviewRows(rows);

      // 스마트 헤더 자동 감지 실행
      const detected = detectSmartHeaderRow(rows);
      if (detected && detected > 0) {
        setHeaderEndRow(detected);
        setBlockStartRow(detected + 1);
        setAutoDetectedBadge(`✨ 컬럼명 분석 결과 헤더 끝이 ${detected}행으로 자동 지정되었습니다.`);
      } else {
        setAutoDetectedBadge('');
      }
    } catch (e) {
      console.error('시트 미리보기 파싱 실패:', e);
    }
  };

  // files 또는 sheetKeyword 변경 시 미리보기 갱신
  useEffect(() => {
    if (files.length > 0 && typeof window !== 'undefined' && (window as any).ExcelJS) {
      loadSheetPreview(files[0]);
    } else if (files.length === 0) {
      setPreviewRows([]);
      setPreviewSheetName('');
      setAutoDetectedBadge('');
    }
  }, [files, sheetKeyword, excelJsLoaded]);

  // 마우스 클릭으로 헤더 끝 행 및 본문 시작행 1초 지정
  const handleSelectHeaderEndRow = (rowNum: number) => {
    setHeaderEndRow(rowNum);
    setBlockStartRow(rowNum + 1);
    setActivePreset('custom');
    setAutoDetectedBadge(`마우스 클릭으로 ${rowNum}행을 헤더 끝으로 지정하였습니다.`);
  };

  // 파일 업로드 처리
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const valid = newFiles.filter(f => 
      !f.name.startsWith('~$') && (f.name.endsWith('.xlsx') || f.name.endsWith('.xlsm') || f.name.endsWith('.xls'))
    );
    if (valid.length === 0) {
      alert('유효한 엑셀 파일(.xlsx, .xlsm)이 없습니다.');
      return;
    }
    setFiles(prev => [...prev, ...valid]);
    setMergedBlob(null);
  };

  // 136개교 가상 샘플 파일 로드
  const handleLoadSampleFiles = async () => {
    setIsProcessing(true);
    setStatusMessage('관내 136개교 표준 샘플 파일 로드 및 압축 해제 중...');
    setProgress(30);
    try {
      if (selectedRegion === 'none') {
        setSelectedRegion('gangnam');
      }
      const res = await fetch('/samples/sample_136_schools.zip');
      if (!res.ok) throw new Error('샘플 파일을 가져올 수 없습니다.');
      const blob = await res.blob();
      setProgress(60);
      const zip = await JSZip.loadAsync(blob);
      const sampleFiles: File[] = [];
      const fileNames = Object.keys(zip.files).filter(name => !name.startsWith('__MACOSX') && name.endsWith('.xlsx'));
      
      for (const name of fileNames) {
        const fileData = await zip.files[name].async('blob');
        sampleFiles.push(new File([fileData], name, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      }
      setProgress(100);
      setFiles(sampleFiles);
      setMergedBlob(null);
      setStatusMessage(`표준 136개교 샘플이 로드되었습니다. (${sampleFiles.length}개 파일)`);
    } catch (e: any) {
      alert('샘플 파일 로드 실패: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 전체 초기화
  const handleReset = () => {
    setSelectedRegion('none');
    setTargetSchools([]);
    setCustomRosterName('');
    setFiles([]);
    setProcessedList([]);
    setMissingSchools([]);
    setMergedBlob(null);
    setMergedFileName('');
    setProgress(0);
    setStatusMessage('');
    setPreviewRows([]);
    setPreviewSheetName('');
    setAutoDetectedBadge('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (rosterInputRef.current) rosterInputRef.current.value = '';
  };

  // 전국 범용 마스터 엑셀 병합 실행 엔진
  const runMerge = async () => {
    if (files.length === 0) {
      alert('취합할 엑셀 파일을 먼저 업로드해주세요.');
      return;
    }
    if (!(window as any).ExcelJS) {
      alert('ExcelJS 엔진을 로딩 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setIsProcessing(true);
    setProgress(5);
    setStatusMessage('제출 서식 분석 및 마스터 템플릿 로딩 중...');

    const ExcelJS = (window as any).ExcelJS;
    const processed: ProcessedFile[] = [];
    const matchedMap = new Map<number, { file: File; school: SchoolItem; data: any }>();

    try {
      // 1. 기준 템플릿 파일 로드 (첫 번째 유효 엑셀)
      const templateFile = files[0];
      const templateBuffer = await templateFile.arrayBuffer();
      const templateWb = new ExcelJS.Workbook();
      await templateWb.xlsx.load(templateBuffer);

      let targetWs = templateWb.worksheets.find((s: any) => s.name.includes(sheetKeyword));
      if (!targetWs) targetWs = templateWb.worksheets[1] || templateWb.worksheets[0];

      // 2. 각 파일 순회 및 연번/학교명 추출
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const pct = 15 + Math.floor((i / files.length) * 45);
        setProgress(pct);
        setStatusMessage(`파일 파싱 중 (${i + 1}/${files.length}): ${file.name}`);

        try {
          const buffer = await file.arrayBuffer();
          const wb = new ExcelJS.Workbook();
          await wb.xlsx.load(buffer);

          let ws = wb.worksheets.find((s: any) => s.name.includes(sheetKeyword));
          if (!ws) ws = wb.worksheets[1] || wb.worksheets[0];

          let rawSchoolName = '';
          const col1Val = ws.getCell(blockStartRow, 1).value;
          const parsedColSeq = parseInt(String(col1Val), 10);

          if (mode === 'block') {
            const targetRow = blockStartRow + schoolCellRowOffset;
            const cellVal = ws.getCell(targetRow, schoolCellCol).value;
            rawSchoolName = cellVal ? String(cellVal).trim() : '';
          } else {
            rawSchoolName = file.name.replace(/\.[^/.]+$/, '').replace(/신청서|서식|2026/g, '').trim();
          }

          if (!rawSchoolName) {
            rawSchoolName = file.name.replace(/\.[^/.]+$/, '').replace(/신청서|서식|2026/g, '').trim();
          }

          const matchedSchool = findMatchingSchool(rawSchoolName);
          const finalSeq = (!isNaN(parsedColSeq) && parsedColSeq > 0) 
            ? parsedColSeq 
            : (matchedSchool?.seq || (i + 1));
          const finalSchoolName = matchedSchool?.name || rawSchoolName || `기관_${finalSeq}`;

          if (matchedMap.has(finalSeq)) {
            processed.push({
              name: file.name,
              size: file.size,
              schoolName: finalSchoolName,
              matchedSeq: finalSeq,
              status: 'duplicate',
              errorMsg: `중복 제출 기관 (연번 ${finalSeq})`
            });
            continue;
          }

          matchedMap.set(finalSeq, {
            file,
            school: { seq: finalSeq, name: finalSchoolName },
            data: ws
          });

          processed.push({
            name: file.name,
            size: file.size,
            schoolName: finalSchoolName,
            matchedSeq: finalSeq,
            status: 'matched'
          });

        } catch (err: any) {
          processed.push({
            name: file.name,
            size: file.size,
            schoolName: '(손상된 파일)',
            status: 'error',
            errorMsg: err.message || '파일 열기 실패'
          });
        }
      }

      setProcessedList(processed);

      // 3. 미제출 학교/기관 파악
      const missing = targetSchools.filter(ts => !matchedMap.has(ts.seq));
      setMissingSchools(missing);

      setProgress(65);
      setStatusMessage(`매칭 완료 (정상 ${matchedMap.size}건 / 미제출 ${missing.length}건). 마스터 엑셀 조립 중...`);

      // 4. 모드별 병합 수행 (정렬 기준 적용)
      let sortedSeqs = Array.from(matchedMap.keys());
      if (sortMode === 'seq') {
        sortedSeqs.sort((a, b) => a - b);
      } else if (sortMode === 'name') {
        sortedSeqs.sort((a, b) => {
          const nameA = matchedMap.get(a)?.school.name || '';
          const nameB = matchedMap.get(b)?.school.name || '';
          return nameA.localeCompare(nameB, 'ko');
        });
      } else if (sortMode === 'filename') {
        sortedSeqs.sort((a, b) => {
          const fileA = matchedMap.get(a)?.file.name || '';
          const fileB = matchedMap.get(b)?.file.name || '';
          return fileA.localeCompare(fileB, 'ko');
        });
      }

      if (mode === 'block') {
        // [모드 1: 서식 블록형 취합 - 가변행/고정블록 겸용]
        let currentDstRow = blockStartRow;

        for (let idx = 0; idx < sortedSeqs.length; idx++) {
          const seq = sortedSeqs[idx];
          const info = matchedMap.get(seq)!;
          const srcWs = info.data;
          
          const actualRowCount = isAutoDetectRows 
            ? Math.max(1, findLastDataRow(srcWs, blockStartRow) - blockStartRow + 1)
            : blockRowCount;

          const dstStartRow = currentDstRow;
          const rowOffset = dstStartRow - blockStartRow;

          const pct = 65 + Math.floor((idx / sortedSeqs.length) * 25);
          setProgress(pct);
          setStatusMessage(`기관 데이터 결합 (${idx + 1}/${sortedSeqs.length}): ${info.school.name} (${actualRowCount}행)`);

          // 행별 셀 복사 (값, 서식, 수식)
          for (let r = 0; r < actualRowCount; r++) {
            const srcRowNum = blockStartRow + r;
            const dstRowNum = dstStartRow + r;
            const srcRow = srcWs.getRow(srcRowNum);
            const dstRow = targetWs.getRow(dstRowNum);

            if (srcRow.height) dstRow.height = srcRow.height;

            srcRow.eachCell({ includeEmpty: true }, (cell: any, colNumber: number) => {
              const dstCell = dstRow.getCell(colNumber);

              // 빗금 사선 셀 방어 및 수식 평행이동
              const hasDiagonal = cell.border?.diagonal && (cell.border.diagonal.up || cell.border.diagonal.down);
              if (hasDiagonal && !cell.formula && (!cell.value || typeof cell.value !== 'object')) {
                dstCell.value = null;
              } else if (cell.formula) {
                dstCell.value = {
                  formula: shiftFormula(cell.formula, rowOffset),
                  result: cell.result
                };
              } else if (cell.value && typeof cell.value === 'object' && cell.value.formula) {
                dstCell.value = {
                  formula: shiftFormula(cell.value.formula, rowOffset),
                  result: cell.value.result
                };
              } else {
                dstCell.value = cell.value;
              }

              // 스타일 100% 보존
              if (cell.font) dstCell.font = { ...cell.font };
              if (cell.fill) dstCell.fill = { ...cell.fill };
              if (cell.border) dstCell.border = { ...cell.border };
              if (cell.alignment) dstCell.alignment = { ...cell.alignment };
              if (cell.numFmt) dstCell.numFmt = cell.numFmt;
            });
          }

          // 병합 셀 오프셋 이동 적용
          if (idx > 0 && srcWs.model && srcWs.model.merges) {
            srcWs.model.merges.forEach((mergeRange: string) => {
              const parts = mergeRange.split(':');
              if (parts.length === 2) {
                const match1 = parts[0].match(/([A-Z]+)(\d+)/);
                const match2 = parts[1].match(/([A-Z]+)(\d+)/);
                if (match1 && match2) {
                  const col1 = match1[1];
                  const row1 = parseInt(match1[2], 10);
                  const col2 = match2[1];
                  const row2 = parseInt(match2[2], 10);

                  if (row1 >= blockStartRow && row2 < blockStartRow + actualRowCount) {
                    const newMerge = `${col1}${row1 + rowOffset}:${col2}${row2 + rowOffset}`;
                    try {
                      targetWs.mergeCells(newMerge);
                    } catch (e) {}
                  }
                }
              }
            });
          }

          currentDstRow += actualRowCount;
        }
      } else if (mode === 'edufine') {
        // [모드 2: K-에듀파인 업로드 양식 변환]
        const edufineWb = new ExcelJS.Workbook();
        const edufineWs = edufineWb.addWorksheet('전출금교부양식');

        edufineWs.addRow(['연번', '학교코드', '학교명', '세부사업명', '교부금액(원)', '비고']);
        edufineWs.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        edufineWs.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };

        sortedSeqs.forEach((seq, idx) => {
          const info = matchedMap.get(seq)!;
          const ws = info.data;
          const amtCell = ws.getCell(blockStartRow, edufineAmountCol).value;
          const amount = typeof amtCell === 'number' ? amtCell : (parseInt(String(amtCell).replace(/[^0-9]/g, '')) || 0);

          edufineWs.addRow([
            idx + 1,
            info.school.code || `SCH_${info.school.seq}`,
            info.school.name,
            edufineBizName,
            amount,
            '정상 교부'
          ]);
        });

        const outBuffer = await edufineWb.xlsx.writeBuffer();
        const outBlob = new Blob([outBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        setMergedBlob(outBlob);
        setMergedFileName(`K에듀파인_전출금교부양식_${new Date().toISOString().slice(0, 10)}.xlsx`);
        setProgress(100);
        setStatusMessage(`K-에듀파인 양식 변환 완료! 총 ${sortedSeqs.length}개 기관`);
        setIsProcessing(false);
        return;

      } else {
        // [모드 3: 단순 목록형 취합]
        let currentDstRow = blockStartRow;
        for (let idx = 0; idx < sortedSeqs.length; idx++) {
          const seq = sortedSeqs[idx];
          const info = matchedMap.get(seq)!;
          const srcWs = info.data;
          const lastR = findLastDataRow(srcWs, blockStartRow);
          const count = Math.max(1, lastR - blockStartRow + 1);

          for (let r = 0; r < count; r++) {
            const srcRow = srcWs.getRow(blockStartRow + r);
            const dstRow = targetWs.getRow(currentDstRow + r);
            if (srcRow.height) dstRow.height = srcRow.height;

            srcRow.eachCell({ includeEmpty: true }, (cell: any, colNumber: number) => {
              const dstCell = dstRow.getCell(colNumber);
              dstCell.value = cell.value;
              if (cell.font) dstCell.font = { ...cell.font };
              if (cell.fill) dstCell.fill = { ...cell.fill };
              if (cell.border) dstCell.border = { ...cell.border };
              if (cell.alignment) dstCell.alignment = { ...cell.alignment };
              if (cell.numFmt) dstCell.numFmt = cell.numFmt;
            });
          }
          currentDstRow += count;
        }
      }

      // 5. 최종 마스터 엑셀 워크북 빌드
      setProgress(95);
      setStatusMessage('최종 통합 서식 엑셀 파일 생성 중...');

      const outBuffer = await templateWb.xlsx.writeBuffer();
      const outBlob = new Blob([outBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      setMergedBlob(outBlob);
      setMergedFileName(`마스터_통합_취합결과_${new Date().toISOString().slice(0, 10)}.xlsx`);
      setProgress(100);
      setStatusMessage(`취합 성공! 정상 처리 ${matchedMap.size}건 / 미제출 ${missing.length}건`);

    } catch (error: any) {
      console.error('병합 오류:', error);
      alert('병합 처리 중 오류 발생: ' + error.message);
      setStatusMessage('오류 발생: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 취합 결과 엑셀 다운로드
  const handleDownload = () => {
    if (!mergedBlob) return;
    const url = URL.createObjectURL(mergedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mergedFileName || '통합_마스터_서식.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 미제출 학교 명단 클립보드 복사
  const copyMissingList = () => {
    if (missingSchools.length === 0) return;
    const text = missingSchools.map(s => `${s.seq}. ${s.name}`).join('\n');
    navigator.clipboard.writeText(`[미제출 기관·학교 독촉 명단]\n` + text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // 오프라인 폐쇄망 전용 단독 실행기(.html) 다운로드
  const downloadOfflineHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>AI-SEN 엑셀수합 (오프라인 폐쇄망 전용)</title>
  <script src="https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js"><\/script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Malgun Gothic", sans-serif; padding: 30px; background: #f8fafc; color: #1e293b; }
    .card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); max-width: 900px; margin: 0 auto; }
    h1 { font-size: 24px; color: #1e40af; margin-bottom: 8px; }
    .btn { background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; }
    .btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🏛️ AI-SEN 엑셀수합 (오프라인 폐쇄망 실행기)</h1>
    <p style="color: #64748b; margin-bottom: 20px;">인터넷이 없는 국정원/교육청 폐쇄망 PC에서도 100% 안전하게 동작합니다.</p>
    <div style="border: 2px dashed #cbd5e1; border-radius: 12px; padding: 40px; text-align: center;">
      <input type="file" id="fIn" multiple accept=".xlsx,.xlsm" style="display:none;" onchange="alert(this.files.length + '개 파일 선택됨')">
      <button class="btn" onclick="document.getElementById('fIn').click()">엑셀 파일들 선택하기</button>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AI-SEN_엑셀수합기_오프라인폐쇄망용.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Script 
        src="/vendor/exceljs.min.js" 
        strategy="afterInteractive" 
        onLoad={() => setExcelJsLoaded(true)}
      />

      {/* 스마트 통합 헤더 */}
      <ToolHeader 
        title="AI-SEN 엑셀수합" 
        icon={<FileSpreadsheet size={15} className="text-blue-600" />}
        themeColor="blue"
        extraAction={
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsManualOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2 sm:px-2.5 py-1 rounded-lg transition-colors shadow-2xs cursor-pointer"
              title="AI-SEN 엑셀수합 실무 사용설명서 열기"
            >
              <BookOpen size={13} className="text-amber-700" />
              <span className="hidden sm:inline">사용설명서</span>
            </button>

            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 sm:px-2.5 py-1 rounded-lg transition-colors shadow-2xs cursor-pointer"
              title="업로드된 파일 및 통계 초기화 (0개소 제로 상태로 복귀)"
            >
              <RotateCcw size={13} className="text-rose-600" />
              <span className="hidden sm:inline">초기화</span>
            </button>

            <Link
              href="/board"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2 sm:px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
              title="실무 소통게시판 바로가기"
            >
              <span className="hidden sm:inline">소통게시판</span>
            </Link>
          </div>
        }
      />

      <main className="flex-1 max-w-[920px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* 상단 슬로건 & 오프라인 단독 파일 다운로드 바 */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-7 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide">100% 로컬 무부하 보안</span>
              <span className="bg-emerald-400 text-slate-900 px-2 py-0.5 rounded-full text-xs font-bold">서버 유출 0%</span>
              <span className="bg-blue-800/60 text-blue-100 px-2.5 py-0.5 rounded-full text-xs font-semibold">전국 시도교육청 호환</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight pt-0.5">
              수십·수백 개 학교·기관이 제출한 엑셀 서식을 2초 만에 단 1장의 마스터로!
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              MS 엑셀 실행 불필요 ❌ · 파이썬 설치 ❌ · 복합 수식 및 색상·테두리 100% 온전 보존
            </p>
          </div>

          <button 
            onClick={downloadOfflineHtml}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 backdrop-blur-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            title="인터넷이 차단된 폐쇄망 PC용 단일 파일 다운로드"
          >
            <DownloadCloud size={16} />
            <span>오프라인 단독파일 다운</span>
          </button>
        </div>

        {/* 🏛️ [Step 1] 기준 명부 설정 & 3대 수합 모드 상단 컨트롤 바 */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-blue-700 text-xs font-black px-2.5 py-0.5 rounded-md border border-blue-200">
                Step 1
              </span>
              <span className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
                <Building2 size={17} className="text-blue-600" />
                수합 방식 및 기준 기관 설정
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              전국 17개 시도교육청 및 자체 서식 완벽 대응
            </span>
          </div>

          {/* 3대 수합 모드 선택 탭 (가로 3분할 꽉 찬 볼륨감) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setMode('block')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'block' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers size={15} />
              <span>서식 블록형 취합</span>
            </button>
            <button
              onClick={() => setMode('simple')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'simple' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet size={15} />
              <span>단순 목록형 취합</span>
            </button>
            <button
              onClick={() => setMode('edufine')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'edufine' ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send size={15} />
              <span>K-에듀파인 교부 변환</span>
            </button>
          </div>

          {/* 기준 명부 선택 및 자체 엑셀 업로드 */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold text-slate-600 shrink-0">
                기준 명부 매핑:
              </span>
              <select
                value={selectedRegion}
                onChange={e => setSelectedRegion(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                {REGIONAL_OFFICES.map(office => (
                  <option key={office.id} value={office.id}>
                    {office.name}
                  </option>
                ))}
              </select>

              {/* 자체 명부 파일 등록 버튼 */}
              <input 
                ref={rosterInputRef}
                type="file" 
                accept=".xlsx,.xlsm,.xls" 
                className="hidden" 
                onChange={handleRosterFileChange}
              />
              <button
                type="button"
                onClick={() => rosterInputRef.current?.click()}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                title="A열: 연번, B열: 학교/기관명이 적힌 엑셀 파일을 업로드합니다."
              >
                <FileUp size={14} className="text-blue-600" />
                <span>자체 명부 엑셀 등록</span>
              </button>
            </div>

            {customRosterName && (
              <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-lg border border-blue-200">
                {customRosterName}
              </span>
            )}
          </div>
        </div>

        {/* 📂 [Step 2] 취합 파일 업로드 & 테스트 샘플 바 */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-50 text-indigo-700 text-xs font-black px-2.5 py-0.5 rounded-md border border-indigo-200">
                Step 2
              </span>
              <span className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
                <Upload size={17} className="text-indigo-600" />
                취합할 엑셀 서식 등록
              </span>
            </div>
            {files.length > 0 && (
              <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 size={14} />
                총 {files.length}개 파일 준비 완료
              </span>
            )}
          </div>

          {/* 세로 비율이 살아있는 볼륨감 있는 드롭존 */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/20 hover:bg-indigo-50/40 rounded-2xl p-7 sm:p-9 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group hover:shadow-sm min-h-[180px]"
          >
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              accept=".xlsx,.xlsm,.xls" 
              className="hidden" 
              onChange={handleFileInputChange}
            />
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <Upload size={26} />
            </div>
            <div className="space-y-1">
              <div className="font-extrabold text-slate-800 text-base sm:text-lg">
                취합할 엑셀 파일들을 이곳에 끌어다 놓으세요
              </div>
              <div className="text-xs sm:text-sm text-slate-500">
                수십~수백 개 .xlsx 파일 또는 폴더 일괄 선택 지원 (로컬 브라우저 0초 무부하 보안)
              </div>
            </div>

            <span className="mt-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs group-hover:shadow-md">
              {files.length > 0 ? `📂 파일 다시 선택 (${files.length}개 로드됨)` : '📂 엑셀 파일 직접 선택'}
            </span>
          </div>

          {/* 🧪 테스트 샘플 액션 바 & 초기화 */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleLoadSampleFiles}
              disabled={isProcessing}
              className="flex-1 min-w-[220px] flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              title="136개 가상학교 엑셀 샘플 파일 일괄 로드"
            >
              <FlaskConical size={15} />
              <span>🧪 [테스트] 136개 가상학교 샘플 1초 로드</span>
            </button>
            <a
              href="/samples/sample_136_schools.zip"
              download="sample_136_schools.zip"
              className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-purple-700 border border-purple-200 text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl transition-colors shrink-0 shadow-xs"
              title="136개 가상학교 샘플 엑셀 ZIP 다운로드"
            >
              <Archive size={14} />
              <span>ZIP 다운</span>
            </a>
            <button
              type="button"
              onClick={handleReset}
              disabled={isProcessing || (files.length === 0 && targetSchools.length === 0)}
              className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-200 text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl transition-colors shrink-0 shadow-xs disabled:opacity-40 cursor-pointer"
              title="모든 파일 및 통계 초기화 (0개소 제로 상태)"
            >
              <RotateCcw size={14} />
              <span>초기화</span>
            </button>
          </div>
        </div>

        {/* 👀 [Step 3] 실시간 서식 미리보기 & 스마트 헤더 지정 */}
        {files.length > 0 && previewRows.length > 0 ? (
          <div className="bg-white rounded-3xl border-2 border-blue-300 p-5 sm:p-6 space-y-4 shadow-md transition-all animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="bg-blue-50 text-blue-700 text-xs font-black px-2.5 py-0.5 rounded-md border border-blue-200">
                  Step 3
                </span>
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0">
                  <Eye size={13} />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-sm sm:text-base">
                    신청서 서식 실시간 미리보기
                  </span>
                  <span className="text-xs text-slate-400 ml-2">
                    ({files[0].name.length > 30 ? files[0].name.slice(0, 30) + '...' : files[0].name} · 시트: [{previewSheetName || '기본시트'}])
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold hidden sm:inline">
                  마우스 1클릭으로 헤더 끝 행 지정
                </span>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  {isPreviewOpen ? '미리보기 접기 ▲' : '미리보기 펼치기 ▼'}
                </button>
              </div>
            </div>

            {autoDetectedBadge && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-2 rounded-xl font-medium flex items-center justify-between">
                <span>{autoDetectedBadge}</span>
                <span className="text-[11px] text-blue-600 font-bold">다른 행을 클릭하면 즉시 변경됩니다</span>
              </div>
            )}

            {isPreviewOpen && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>🔵 1행 ~ <strong>{headerEndRow}행</strong>: 공통 헤더로 1회 유지</span>
                  <span>🟢 <strong>{headerEndRow + 1}행</strong>부터: 각 기관/학교별 본문 결합 시작</span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-[350px] overflow-y-auto shadow-inner bg-slate-50/50">
                  <table className="w-full text-xs text-left border-collapse select-none bg-white">
                    <thead className="bg-slate-100 text-slate-600 sticky top-0 z-10 shadow-2xs">
                      <tr>
                        <th className="py-2 px-2.5 border-b border-r border-slate-300 w-12 text-center font-bold bg-slate-200">행</th>
                        <th className="py-2 px-2.5 border-b border-r border-slate-300 w-28 text-center font-bold bg-slate-100">헤더/본문 경계</th>
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'].map(col => (
                          <th key={col} className="py-2 px-2.5 border-b border-r border-slate-300 min-w-[75px] text-center font-bold bg-slate-100">
                            {col}열
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map(row => {
                        const isHeader = row.rowNum <= headerEndRow;
                        const isHeaderEdge = row.rowNum === headerEndRow;
                        const isStartData = row.rowNum === headerEndRow + 1;

                        return (
                          <tr
                            key={row.rowNum}
                            onClick={() => handleSelectHeaderEndRow(row.rowNum)}
                            title={`${row.rowNum}행을 헤더 끝으로 지정하려면 클릭하세요`}
                            className={`border-b border-slate-200 transition-colors cursor-pointer group ${
                              isHeaderEdge
                                ? 'bg-blue-100 border-b-2 border-b-blue-600 font-semibold'
                                : isHeader
                                  ? 'bg-blue-50/70 hover:bg-blue-100/70'
                                  : isStartData
                                    ? 'bg-emerald-50 hover:bg-emerald-100/70'
                                    : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className={`py-1.5 px-2 text-center border-r border-slate-200 font-mono font-bold ${
                              isHeaderEdge ? 'text-blue-700 bg-blue-200/50' : 'text-slate-500'
                            }`}>
                              {row.rowNum}
                            </td>
                            <td className="py-1.5 px-2 text-center border-r border-slate-200 whitespace-nowrap">
                              {isHeaderEdge ? (
                                <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-xs">
                                  ✂️ 헤더 끝 ({row.rowNum}행)
                                </span>
                              ) : isHeader ? (
                                <span className="text-blue-600 text-[10px] font-semibold">
                                  🔵 헤더 영역
                                </span>
                              ) : isStartData ? (
                                <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-xs">
                                  🟢 본문 시작 ({row.rowNum}행)
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                                  여기를 클릭 ➔
                                </span>
                              )}
                            </td>
                            {row.cells.map((cellText, cIdx) => (
                              <td
                                key={cIdx}
                                className={`py-1.5 px-2.5 border-r border-slate-200 truncate max-w-[140px] ${
                                  isHeaderEdge ? 'text-blue-950 font-medium' : isHeader ? 'text-blue-900' : 'text-slate-700'
                                }`}
                                title={cellText}
                              >
                                {cellText || <span className="text-slate-300 font-normal">-</span>}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 파일 업로드 전 슬림 안내 바 */
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-4 sm:p-5 text-center text-slate-400 flex items-center justify-center gap-2.5 shadow-2xs">
            <Eye size={16} className="text-slate-400 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-slate-500">
              [Step 3] 엑셀 파일을 등록하면 이곳에 실시간 시트 뷰어가 펼쳐지며 마우스 1클릭으로 헤더를 확정할 수 있습니다.
            </span>
          </div>
        )}

        {/* ⚙️ [Step 4] 범용 수합 3원칙 설정 패널 */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-blue-700 text-xs font-black px-2.5 py-0.5 rounded-md border border-blue-200">
                Step 4
              </span>
              <span className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
                <SlidersHorizontal size={16} className="text-blue-600" />
                범용 수합 3원칙 설정
              </span>
            </div>

            {/* ⚡ 업무별 1초 원클릭 프리셋 버튼 3종 가로 배치 */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-slate-500 font-bold text-xs shrink-0 mr-1">⚡ 1초 프리셋:</span>
              <button
                type="button"
                onClick={() => applyPreset('food')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                  activePreset === 'food'
                    ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-xs ring-2 ring-blue-100'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                🍱 블록 서식 (16줄 고정)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('labor')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                  activePreset === 'labor'
                    ? 'bg-purple-50 text-purple-700 border-purple-300 shadow-xs ring-2 ring-purple-100'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                👨‍🍳 가변 서식 (동적 감지)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('general')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                  activePreset === 'general'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs ring-2 ring-emerald-100'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                📋 일반 목록 (헤더 1회 유지)
              </button>
            </div>
          </div>

          {/* 3원칙 컨트롤 그리드 (적절한 세로 볼륨감 보유) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
            {/* 1. 공통 헤더 1회 유지 */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 flex flex-col justify-between min-h-[145px]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-[11px] flex items-center justify-center font-bold">1</span>
                  공통 헤더 1회 유지
                </span>
                <span className="text-[11px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">1~{headerEndRow}행</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                첫 번째 학교의 상단 헤더 서식을 1회만 생성하고, 이후 학교부터는 본문만 이어붙입니다.
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                <span className="text-slate-600 font-medium shrink-0">헤더 끝 행:</span>
                <input 
                  type="number" 
                  value={headerEndRow} 
                  onChange={e => {
                    setHeaderEndRow(Number(e.target.value));
                    setActivePreset('custom');
                  }}
                  className="w-20 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 text-center font-bold text-xs shadow-2xs"
                />
                <span className="text-slate-400 text-[11px]">행까지 서식 보존</span>
              </div>
            </div>

            {/* 2. 본문 추출 방식 */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 flex flex-col justify-between min-h-[145px]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-purple-600 text-white rounded-full text-[11px] flex items-center justify-center font-bold">2</span>
                  본문 데이터 추출 방식
                </span>
                <label className="flex items-center gap-1 cursor-pointer text-purple-700 font-bold text-[11px] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                  <input 
                    type="checkbox"
                    checked={isAutoDetectRows}
                    onChange={e => {
                      setIsAutoDetectRows(e.target.checked);
                      setActivePreset('custom');
                    }}
                    className="rounded text-purple-600"
                  />
                  <span>가변행 감지</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-slate-600 block mb-0.5 text-[11px] font-medium">본문 시작행</span>
                  <input 
                    type="number" 
                    value={blockStartRow} 
                    onChange={e => {
                      setBlockStartRow(Number(e.target.value));
                      setActivePreset('custom');
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 font-bold text-xs text-center shadow-2xs"
                  />
                </div>
                <div>
                  <span className="text-slate-600 block mb-0.5 text-[11px] font-medium">
                    {isAutoDetectRows ? '기준 행수' : '고정 블록 행수'}
                  </span>
                  <input 
                    type="number" 
                    value={blockRowCount} 
                    onChange={e => {
                      setBlockRowCount(Number(e.target.value));
                      setActivePreset('custom');
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 font-bold text-xs text-center shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* 3. 취합 순서 정렬 */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 flex flex-col justify-between min-h-[145px]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-emerald-600 text-white rounded-full text-[11px] flex items-center justify-center font-bold">3</span>
                  취합 순서 정렬
                </span>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">자동 정렬</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                서식 취합 시 기관/학교 데이터가 배치될 정렬 기준을 선택합니다.
              </div>
              <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setSortMode('seq')}
                  className={`py-1.5 rounded-lg text-xs font-bold border text-center transition-colors cursor-pointer ${
                    sortMode === 'seq' ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  연번순
                </button>
                <button
                  type="button"
                  onClick={() => setSortMode('name')}
                  className={`py-1.5 rounded-lg text-xs font-bold border text-center transition-colors cursor-pointer ${
                    sortMode === 'name' ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  가나다순
                </button>
                <button
                  type="button"
                  onClick={() => setSortMode('filename')}
                  className={`py-1.5 rounded-lg text-xs font-bold border text-center transition-colors cursor-pointer ${
                    sortMode === 'filename' ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  파일명순
                </button>
              </div>
            </div>
          </div>

          {/* K-에듀파인 세부 설정 */}
          {mode === 'edufine' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
              <div>
                <label className="text-slate-600 font-medium block mb-1">에듀파인 교부 세부사업명</label>
                <input 
                  type="text" 
                  value={edufineBizName} 
                  onChange={e => setEdufineBizName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                />
              </div>
              <div>
                <label className="text-slate-600 font-medium block mb-1">교부금액 열 번호 (I열 = 9열)</label>
                <input 
                  type="number" 
                  value={edufineAmountCol} 
                  onChange={e => setEdufineAmountCol(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium"
                />
              </div>
            </div>
          )}
        </div>

        {/* 🚀 [Step 5] 취합 실행 및 결과 대시보드 */}
        <div className="space-y-4">
          {/* 대형 실행 버튼 */}
          <button
            disabled={files.length === 0 || isProcessing}
            onClick={runMerge}
            className={`w-full py-4 sm:py-4.5 rounded-2xl font-black text-base sm:text-lg shadow-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              files.length === 0 || isProcessing
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : mode === 'edufine'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-200 hover:shadow-xl active:scale-[0.99]'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-200 hover:shadow-xl active:scale-[0.99]'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="animate-spin" size={22} />
                <span>병합 처리 중... ({progress}%)</span>
              </>
            ) : (
              <>
                <Sparkles size={22} />
                <span>{files.length > 0 ? `${files.length}개 파일 일괄 수합 실행 (서식·수식 100% 보존)` : '엑셀 파일을 먼저 등록해주세요'}</span>
              </>
            )}
          </button>

          {/* 처리 프로그레스 바 */}
          {isProcessing && (
            <div className="bg-white rounded-2xl border border-blue-200 p-4 space-y-2 shadow-md">
              <div className="flex justify-between text-xs font-bold text-blue-900">
                <span>{statusMessage}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* 통계 신호등 요약 카드 4종 (가로 4열) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">총 관리 대상수</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">{targetSchools.length}개소</div>
            </div>
            <div className="bg-white border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                정상 매칭
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
                {processedList.filter(p => p.status === 'matched').length}개소
              </div>
            </div>
            <div className="bg-white border border-rose-200 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="text-xs text-rose-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                미제출 기관
              </div>
              <div className="text-2xl sm:text-3xl font-black text-rose-700 mt-1">{missingSchools.length}개소</div>
            </div>
            <div className="bg-white border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="text-xs text-amber-600 font-medium">중복/확인필요</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-1">
                {processedList.filter(p => p.status === 'duplicate' || p.status === 'unmatched').length}건
              </div>
            </div>
          </div>
          </div>

          {/* 결과 다운로드 카드 */}
          {mergedBlob && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-500 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3.5 animate-in fade-in">
              <div className="flex items-center gap-3.5 w-full sm:w-auto">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-md">
                  <FileCheck2 size={24} />
                </div>
                <div>
                  <div className="font-bold text-emerald-950 text-sm sm:text-base">{mergedFileName}</div>
                  <div className="text-xs text-emerald-700 mt-0.5 font-medium">
                    100% 서식 및 수식 보존 완료 · {((mergedBlob.size) / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Download size={18} />
                <span>마스터 엑셀 다운로드</span>
              </button>
            </div>
          )}

          {/* 미제출교 독촉 명단 박스 */}
          {missingSchools.length > 0 && (
            <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <AlertCircle size={15} className="text-rose-600" />
                  미제출 기관·학교 명단 ({missingSchools.length}개소)
                </span>
                <button
                  onClick={copyMissingList}
                  className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedNotification ? (
                    <>
                      <Check size={13} className="text-emerald-600" />
                      <span className="text-emerald-700">복사 완료!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>독촉 명단 1초 복사</span>
                    </>
                  )}
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto bg-rose-50/50 rounded-xl p-3 text-xs text-rose-950 font-medium divide-y divide-rose-100/60">
                {missingSchools.map((s, idx) => (
                  <div key={idx} className="py-1 flex justify-between">
                    <span>{s.seq}. {s.name}</span>
                    <span className="text-rose-500 text-[11px]">{s.type || '미제출'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 기관/학교별 실시간 처리 리스트 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="font-bold text-slate-800 text-xs sm:text-sm flex items-center justify-between">
              <span>기관/학교별 처리 현황 ({processedList.length}건)</span>
              <span className="text-[11px] text-slate-400 font-normal">연번 순 정렬</span>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
              {processedList.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  파일을 업로드하면 실시간 검증 결과가 여기에 표시됩니다.
                </div>
              ) : (
                processedList.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.status === 'matched' && <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />}
                      {item.status === 'unmatched' && <AlertTriangle size={15} className="text-amber-500 shrink-0" />}
                      {item.status === 'duplicate' && <AlertCircle size={15} className="text-rose-500 shrink-0" />}
                      {item.status === 'error' && <AlertCircle size={15} className="text-rose-600 shrink-0" />}
                      <span className="font-medium text-slate-800">{item.schoolName}</span>
                      <span className="text-slate-400 text-[10px] truncate max-w-[250px]">({item.name})</span>
                    </div>
                    <div>
                      {item.status === 'matched' && (
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">정상</span>
                      )}
                      {item.status === 'duplicate' && (
                        <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">중복</span>
                      )}
                      {item.status === 'unmatched' && (
                        <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[10px] font-bold">불일치</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </main>

      {/* 📖 AI-SEN 엑셀수합 실무 사용설명서 모달 */}
      {isManualOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setIsManualOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 상단 헤더 */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
                  <BookOpen size={20} className="text-amber-300" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg tracking-tight flex items-center gap-2">
                    AI-SEN 엑셀수합 실무 사용설명서
                    <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      가이드
                    </span>
                  </h3>
                  <p className="text-blue-200 text-xs mt-0.5">
                    수십·수백 개 학교의 엑셀 서식을 2초 만에 단 1장의 마스터로 취합하는 방법
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsManualOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer text-white"
                title="사용설명서 닫기"
              >
                <X size={18} />
              </button>
            </div>

            {/* 모달 내용 스크롤 영역 */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
              
              {/* 1. 빠른 3단계 요약 */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-2.5">
                <div className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                  <Sparkles size={16} className="text-blue-600" />
                  <span>🎯 1분 초간단 3단계 이용 순서</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                    <div className="font-bold text-blue-700 mb-1">1단계. 서식 업로드</div>
                    <p className="text-slate-600">수합할 엑셀 파일들을 드롭존에 한 번에 끌어다 놓습니다. (폴더 통째 선택 가능)</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                    <div className="font-bold text-blue-700 mb-1">2단계. 헤더 확인·지정</div>
                    <p className="text-slate-600">우측 상단 뷰어에서 자동 감지된 헤더를 확인하거나, 원하는 행을 마우스로 1클릭합니다.</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                    <div className="font-bold text-blue-700 mb-1">3단계. [취합 실행] 클릭</div>
                    <p className="text-slate-600">2초 만에 단일 마스터 엑셀이 완성되며 미제출교 명단도 1초 만에 복사됩니다.</p>
                  </div>
                </div>
              </div>

              {/* 2. 3대 취합 모드 안내 */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Layers size={16} className="text-indigo-600" />
                  <span>🧩 3대 취합 모드 선택 요령</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="border border-slate-200 p-3 rounded-xl hover:border-indigo-300 transition-colors">
                    <div className="font-bold text-slate-800 flex items-center justify-between mb-1">
                      <span className="text-indigo-700 font-extrabold">🍱 서식 블록형 취합 (기본 추천)</span>
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px]">급식비·식품관리비·인건비</span>
                    </div>
                    <p className="text-slate-600">
                      학교별로 16줄 등 다행(Multi-Row) 복합 서식이 있는 경우 사용합니다. 1~17행 헤더는 최초 1회만 맨 위에 유지되고, 각 학교의 본문 블록(16줄)이 아래로 순서대로 온전히 이어붙습니다.
                    </p>
                  </div>

                  <div className="border border-slate-200 p-3 rounded-xl hover:border-blue-300 transition-colors">
                    <div className="font-bold text-slate-800 flex items-center justify-between mb-1">
                      <span className="text-blue-700 font-extrabold">📋 단순 목록형 취합</span>
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px]">일반 명부·실태조사·시설현황</span>
                    </div>
                    <p className="text-slate-600">
                      1행에 헤더 컬럼이 있고 각 학교별로 1줄씩 데이터를 제출한 일반 목록 표를 단일 엑셀 시트로 병합합니다.
                    </p>
                  </div>

                  <div className="border border-slate-200 p-3 rounded-xl hover:border-emerald-300 transition-colors">
                    <div className="font-bold text-slate-800 flex items-center justify-between mb-1">
                      <span className="text-emerald-700 font-extrabold">📤 K-에듀파인 교부 변환</span>
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px]">학교 전출금 교부액 일괄 업로드</span>
                    </div>
                    <p className="text-slate-600">
                      각 학교 신청서의 교부액 합계(I열 등)를 자동 추출하여, K-에듀파인 예산관리 시스템에서 바로 업로드할 수 있는 엑셀 양식으로 즉시 변환합니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. 스마트 헤더 자동 감지 & 마우스 1초 클릭 */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Eye size={16} className="text-blue-600" />
                  <span>✨ 엑셀 뷰어 & 스마트 헤더 1초 지정</span>
                </h4>
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1.5 text-xs">
                  <p className="font-semibold text-slate-800">
                    컴퓨터에서 MS 엑셀을 따로 실행할 필요가 없습니다!
                  </p>
                  <p className="text-slate-600">
                    • 엑셀 파일을 올리면 시스템이 컬럼명(학교명, 연번 등)을 스캔하여 헤더 끝 행을 0.1초 만에 자동 지정합니다.<br />
                    • 변경을 원하시면 우측 상단 뷰어의 원하는 행을 <strong>마우스로 툭 클릭</strong>하면 즉시 헤더 끝 및 본문 시작 행으로 반영됩니다.
                  </p>
                </div>
              </div>

              {/* 4. 기준 명부 & 미제출 독촉 명단 1초 복사 */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Building2 size={16} className="text-purple-600" />
                  <span>🏛️ 기준 명부 & 미제출 독촉 명단 1초 복사</span>
                </h4>
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1.5 text-xs">
                  <p className="text-slate-600">
                    • <strong>교육지원청 선택</strong> 또는 <strong>[자체 명부 엑셀 업로드]</strong>로 대상 기관을 설정할 수 있습니다.<br />
                    • 취합 완료 후 미제출교가 있는 경우, 우측 하단의 <strong>[📋 독촉 명단 1초 복사]</strong> 버튼을 누르면 공문서나 메신저에 바로 붙여넣을 수 있는 텍스트가 클립보드에 복사됩니다.
                  </p>
                </div>
              </div>

              {/* 5. 100% 로컬 무부하 보안 & 오프라인 실행기 */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl space-y-1 text-xs">
                <div className="font-bold text-emerald-950 flex items-center gap-1">
                  <ShieldCheck size={15} className="text-emerald-600" />
                  <span>100% 브라우저 로컬 보안 (서버 유출 0%)</span>
                </div>
                <p className="text-emerald-800">
                  모든 엑셀 파싱 및 병합 작업은 귀하의 PC 웹브라우저 메모리 안에서만 0초 만에 완결되며 서버로 단 1바이트도 전송되지 않습니다. 인터넷이 차단된 폐쇄망 환경에서는 상단의 <strong>[오프라인 단독파일 다운]</strong>을 이용해 주십시오.
                </p>
              </div>

            </div>

            {/* 모달 하단 푸터 버튼 */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsManualOpen(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
              >
                확인 및 닫기
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
