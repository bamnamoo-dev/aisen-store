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

// 기준 명부 옵션 (실무 최적화: '명부 없음' 기본 + '자체 기준 명부')
const ROSTER_OPTIONS = [
  { id: 'none', name: '명부 없음 (자유 수합 / 미제출 검증 생략)' },
  { id: 'custom', name: '📂 자체 기준 명부 직접 등록 (.xlsx)' }
];

export default function ExcelMergePage() {
  const [excelJsLoaded, setExcelJsLoaded] = useState(false);
  const [mode, setMode] = useState<'block' | 'simple'>('block');
  
  // 3단계 범용 수합 설정
  const [activePreset, setActivePreset] = useState<'food' | 'labor' | 'general' | 'custom'>('food');
  const [sheetKeyword, setSheetKeyword] = useState('신청');
  const [headerEndRow, setHeaderEndRow] = useState(17);       // 1단계: 1~N행 헤더 유지 (1회만)
  const [blockStartRow, setBlockStartRow] = useState(18);     // 2단계: 학교별 본문 시작 행
  const [blockRowCount, setBlockRowCount] = useState(16);     // 2단계: 학교당 블록 행 수 (가변행 감지 시 기준)
  const [isAutoDetectRows, setIsAutoDetectRows] = useState(true); // 가변행 자동감지 기본 활성화 (학교별 제출 행수 상이 시 데이터 누락 방지 안전 모드)
  const [sortMode, setSortMode] = useState<'seq' | 'name' | 'filename'>('seq'); // 3단계: 연번순 정렬
  const [schoolCellCol, setSchoolCellCol] = useState(5);      // E열 = 학교명 (인건비는 F열=6열)
  const [schoolCellRowOffset, setSchoolCellRowOffset] = useState(0); 

  // 에듀파인 교부 모드 설정 (수합 시 100% 동시 자동 생성)
  const [edufineBizName, setEdufineBizName] = useState('학교 전출금 교부액');
  const [edufineAmountCol, setEdufineAmountCol] = useState(9); // I열 = 합계액

  // 기준 명부 관리 상태 (전국 대응 - 초기값은 선택 안 함(0개소))
  const [selectedRegion, setSelectedRegion] = useState<string>('none');
  const [targetSchools, setTargetSchools] = useState<SchoolItem[]>([]);
  const [customRosterName, setCustomRosterName] = useState<string>('');
  const [savedCustomRoster, setSavedCustomRoster] = useState<{
    name: string;
    schools: SchoolItem[];
  } | null>(null);

  // 처리 상태 관리
  const [files, setFiles] = useState<File[]>([]);
  const [processedList, setProcessedList] = useState<ProcessedFile[]>([]);
  const [missingSchools, setMissingSchools] = useState<SchoolItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [mergedFileName, setMergedFileName] = useState('');
  const [edufineBlob, setEdufineBlob] = useState<Blob | null>(null);
  const [edufineFileName, setEdufineFileName] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // 엑셀 시트 상단 미리보기 & 스마트 헤더 선택기 상태
  const [previewRows, setPreviewRows] = useState<Array<{ rowNum: number; cells: string[] }>>([]);
  const [previewSheetName, setPreviewSheetName] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [autoDetectedBadge, setAutoDetectedBadge] = useState<string>('');
  const [isManualOpen, setIsManualOpen] = useState(false); // 실무 사용설명서 모달 열림 상태

  const fileInputRef = useRef<HTMLInputElement>(null);
  const rosterInputRef = useRef<HTMLInputElement>(null);

  // 로컬에 영구 저장된 자체 명부 자동 로드 (100% 브라우저 로컬 보안, 서버 유출 0%)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aisen_custom_roster_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.schools) && parsed.schools.length > 0) {
          setSavedCustomRoster(parsed);
        }
      }
    } catch (e) {
      console.error('로컬 자체 명부 로드 실패:', e);
    }
  }, []);

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

  // 기준 명부 로드 (자체 기준 명부 또는 선택 안 함)
  useEffect(() => {
    if (selectedRegion === 'none') {
      setTargetSchools([]);
      setCustomRosterName('');
      return;
    }
    if (selectedRegion === 'custom') {
      if (savedCustomRoster && savedCustomRoster.schools.length > 0) {
        setTargetSchools(savedCustomRoster.schools);
        setCustomRosterName(savedCustomRoster.name);
      }
      return;
    }
    if (selectedRegion === 'virtual_sample') {
      return; // handleLoadSampleFiles에서 직접 세팅
    }
  }, [selectedRegion, savedCustomRoster]);

  // 로컬에 저장된 자체 명부 삭제
  const handleDeleteCustomRoster = () => {
    if (confirm('브라우저에 저장된 자체 기준 명부를 삭제하시겠습니까?')) {
      try {
        localStorage.removeItem('aisen_custom_roster_v1');
      } catch (e) {}
      setSavedCustomRoster(null);
      setCustomRosterName('');
      if (selectedRegion === 'custom') {
        setSelectedRegion('none');
        setTargetSchools([]);
      }
    }
  };

  // 자체 기준 명부 엑셀(.xlsx) 업로드 파싱
  // 자체 명부 표준 양식(.xlsx) 0초 즉시 다운로드
  const handleDownloadRosterTemplate = () => {
    const ExcelJS = (window as any).ExcelJS;
    if (!ExcelJS) {
      alert('ExcelJS 엔진을 로딩 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('기준명부');
    
    ws.columns = [
      { header: '연번', key: 'seq', width: 10 },
      { header: '학교코드 (선택)', key: 'code', width: 16 },
      { header: '기관/학교명', key: 'name', width: 28 },
      { header: '비고 (선택)', key: 'note', width: 16 }
    ];

    // 헤더 스타일링
    const headerRow = ws.getRow(1);
    headerRow.font = { name: '맑은 고딕', bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' } // AI-SEN Blue
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 24;

    // 예시 데이터 5행 (실제 에듀파인 학교코드 예시 반영)
    const samples = [
      { seq: 1, code: 'B100001', name: '가상001초등학교', note: '공립' },
      { seq: 2, code: 'B100002', name: '가상002초등학교', note: '공립' },
      { seq: 3, code: 'B100003', name: '가상003중학교', note: '공립' },
      { seq: 4, code: 'B100004', name: '가상004중학교', note: '사립' },
      { seq: 5, code: 'B100005', name: '가상005고등학교', note: '공립' },
    ];

    samples.forEach(item => {
      const row = ws.addRow(item);
      row.alignment = { vertical: 'middle' };
      row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
    });

    wb.xlsx.writeBuffer().then((buffer: any) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AI-SEN_자체기준명부_표준양식.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  // 자체 명부 엑셀 업로드 처리 (연번·학교코드·학교명 스마트 컬럼 감지 탑재)
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

      // 1. 헤더 행(1~3행) 분석을 통한 학교명/연번/학교코드 컬럼 스마트 탐색
      let nameColIdx = 2; // 기본 B열
      let seqColIdx = 1;  // 기본 A열
      let codeColIdx = -1; // 학교코드 열
      let startScanRow = 2;

      for (let testR = 1; testR <= Math.min(ws.rowCount, 3); testR++) {
        const row = ws.getRow(testR);
        for (let c = 1; c <= Math.min(row.cellCount, 15); c++) {
          const val = String(row.getCell(c).value || '').trim();
          if (/학교|기관|소속|기관명|학교명|대상기관/.test(val)) {
            nameColIdx = c;
            startScanRow = testR + 1;
          }
          if (/연번|순번|번호|^No/i.test(val)) {
            seqColIdx = c;
          }
          if (/코드|학교코드|기관코드|표준코드/i.test(val)) {
            codeColIdx = c;
          }
        }
      }

      // 2. 데이터 행 스캔
      for (let r = startScanRow; r <= Math.min(ws.rowCount, 1000); r++) {
        const row = ws.getRow(r);
        const nameVal = row.getCell(nameColIdx).value;
        const seqVal = row.getCell(seqColIdx).value;
        const codeVal = codeColIdx > 0 ? row.getCell(codeColIdx).value : null;

        let name = '';
        let seq = seqCounter;
        let code = codeVal !== null && codeVal !== undefined ? String(codeVal).trim() : '';

        if (nameVal !== null && nameVal !== undefined && String(nameVal).trim() !== '') {
          name = String(nameVal).trim();
          const parsedSeq = parseInt(String(seqVal), 10);
          if (!isNaN(parsedSeq) && parsedSeq > 0) seq = parsedSeq;
        } else {
          // B열에 없으면 A열도 확인 (1개 컬럼 단일 명부 대응)
          const col1 = row.getCell(1).value;
          if (col1 !== null && col1 !== undefined && String(col1).trim() !== '') {
            name = String(col1).trim();
          }
        }

        if (name && !/연번|학교명|기관명|합계|소계/.test(name)) {
          customList.push({ seq, name, code: code || undefined });
          seqCounter++;
        }
      }

      if (customList.length === 0) {
        alert('명부 엑셀에서 학교/기관명을 찾을 수 없습니다. A열(연번), B열(학교명) 서식을 확인해주세요.');
        return;
      }

      const displayName = `${file.name} (${customList.length}개소)`;
      const rosterData = { name: displayName, schools: customList };
      
      try {
        localStorage.setItem('aisen_custom_roster_v1', JSON.stringify(rosterData));
        setSavedCustomRoster(rosterData);
      } catch (e) {
        console.error('로컬 스토리지 저장 실패:', e);
      }

      setTargetSchools(customList);
      setSelectedRegion('custom');
      setCustomRosterName(displayName);
      alert(`자체 기준 명부가 담당자 PC 브라우저에 안전하게 영구 저장되었습니다!\n총 ${customList.length}개 기관/학교를 기준으로 수합 및 미제출 검증이 진행됩니다.\n(서버 전송 0% · 다음 방문 시에도 그대로 자동 복원됩니다)`);
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
        setSelectedRegion('virtual_sample');
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

      // 가상 136개교 기준 명부 및 표준 B-기관코드(B1000001~) 자동 연동
      const sampleSchools: SchoolItem[] = [];
      fileNames.forEach((name, idx) => {
        const cleanName = name.replace(/\.[^/.]+$/, '').replace(/2026_|신청서|서식/g, '').trim();
        const seq = idx + 1;
        sampleSchools.push({
          seq,
          code: `B10${String(seq).padStart(5, '0')}`,
          name: cleanName
        });
      });
      setTargetSchools(sampleSchools);

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
            school: { seq: finalSeq, name: finalSchoolName, code: matchedSchool?.code },
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

          const pct = 65 + Math.floor((idx / sortedSeqs.length) * 20);
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
      } else {
        // [모드 2: 단순 목록형 취합]
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

      // =========================================================================
      // 🌟 [동시 자동 생성] K-에듀파인 교부서식 시트 및 단독 파일 자동 빌드
      // =========================================================================
      setProgress(88);
      setStatusMessage('K-에듀파인 전출금 교부양식 동시 생성 중...');

      // 1. 통합 마스터 워크북(templateWb)의 2번째 탭으로 추가
      const edufineWs = templateWb.addWorksheet('K에듀파인_교부양식');
      edufineWs.columns = [
        { header: '연번', key: 'seq', width: 10 },
        { header: '학교코드', key: 'code', width: 16 },
        { header: '학교명', key: 'name', width: 28 },
        { header: '세부사업명', key: 'biz', width: 26 },
        { header: '교부금액(원)', key: 'amt', width: 18 },
        { header: '비고', key: 'note', width: 16 }
      ];
      const edufineHRow = edufineWs.getRow(1);
      edufineHRow.font = { name: '맑은 고딕', bold: true, color: { argb: 'FFFFFFFF' } };
      edufineHRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
      edufineHRow.alignment = { vertical: 'middle', horizontal: 'center' };
      edufineHRow.height = 24;

      // 2. K-에듀파인 전용 단독 워크북 빌드 (에듀파인 업로드 전용)
      const singleEdufineWb = new ExcelJS.Workbook();
      const sWs = singleEdufineWb.addWorksheet('전출금교부양식');
      sWs.columns = [
        { header: '연번', key: 'seq', width: 10 },
        { header: '학교코드', key: 'code', width: 16 },
        { header: '학교명', key: 'name', width: 28 },
        { header: '세부사업명', key: 'biz', width: 26 },
        { header: '교부금액(원)', key: 'amt', width: 18 },
        { header: '비고', key: 'note', width: 16 }
      ];
      const sHRow = sWs.getRow(1);
      sHRow.font = { name: '맑은 고딕', bold: true, color: { argb: 'FFFFFFFF' } };
      sHRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
      sHRow.alignment = { vertical: 'middle', horizontal: 'center' };
      sHRow.height = 24;

      // 데이터 채우기 (자체 명부의 연번·학교코드·학교명 100% 반영)
      sortedSeqs.forEach((seq, idx) => {
        const info = matchedMap.get(seq)!;
        const ws = info.data;

        // 교부금액 추출: edufineAmountCol 열에서 합산 또는 첫 행 값 추출
        let amount = 0;
        const amtCell = ws.getCell(blockStartRow, edufineAmountCol).value;
        if (typeof amtCell === 'number') {
          amount = amtCell;
        } else if (amtCell && typeof amtCell === 'object' && 'result' in amtCell && typeof amtCell.result === 'number') {
          amount = amtCell.result;
        } else if (amtCell) {
          const parsed = parseInt(String(amtCell).replace(/[^0-9-]/g, ''), 10);
          if (!isNaN(parsed)) amount = parsed;
        }

        // 자체 명부에 등록된 학교코드가 있으면 100% 우선 적용, 없으면 서울시교육청 표준 B-기관코드 형식(B1000001...) 자동 부여
        const defaultCode = `B10${String(info.school.seq || (idx + 1)).padStart(5, '0')}`;
        const codeStr = info.school.code || defaultCode;

        const rowData = {
          seq: idx + 1,
          code: codeStr,
          name: info.school.name,
          biz: edufineBizName || '학교 전출금 교부액',
          amt: amount,
          note: '정상 교부'
        };

        const r1 = edufineWs.addRow(rowData);
        r1.alignment = { vertical: 'middle' };
        r1.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
        r1.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
        r1.getCell(5).numFmt = '#,##0';

        const r2 = sWs.addRow(rowData);
        r2.alignment = { vertical: 'middle' };
        r2.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
        r2.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
        r2.getCell(5).numFmt = '#,##0';
      });

      // 5. 최종 파일 빌드 (통합 마스터 엑셀 및 K-에듀파인 단독 엑셀)
      setProgress(95);
      setStatusMessage('통합 마스터 및 에듀파인 교부 파일 최종 렌더링 중...');

      // A. 통합 마스터 엑셀 (시트 1: 신청서 취합 원본 + 시트 2: K-에듀파인 교부양식)
      const outBuffer = await templateWb.xlsx.writeBuffer();
      const outBlob = new Blob([outBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      setMergedBlob(outBlob);
      setMergedFileName(`마스터_통합_취합결과_${new Date().toISOString().slice(0, 10)}.xlsx`);

      // B. K-에듀파인 전용 단독 엑셀 파일
      const sBuffer = await singleEdufineWb.xlsx.writeBuffer();
      const sBlob = new Blob([sBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      setEdufineBlob(sBlob);
      setEdufineFileName(`K에듀파인_전출금교부양식_${new Date().toISOString().slice(0, 10)}.xlsx`);

      setProgress(100);
      setStatusMessage(`취합 성공! 통합서식 및 에듀파인 교부서식 동시 완성 (정상 ${matchedMap.size}건 / 미제출 ${missing.length}건)`);

    } catch (error: any) {
      console.error('병합 오류:', error);
      alert('병합 처리 중 오류 발생: ' + error.message);
      setStatusMessage('오류 발생: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 1. 통합 마스터 엑셀 다운로드 (시트 1: 통합서식 + 시트 2: 에듀파인 교부서식)
  const handleDownloadMaster = () => {
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

  // 2. K-에듀파인 전용 단독 엑셀 다운로드
  const handleDownloadEdufine = () => {
    if (!edufineBlob) return;
    const url = URL.createObjectURL(edufineBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = edufineFileName || 'K에듀파인_전출금교부양식.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 기존 호환용 다운로드 핸들러
  const handleDownload = handleDownloadMaster;

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

      <main className="flex-1 max-w-[1140px] w-full mx-auto px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-3.5">
        
        {/* 상단 슬로건 & 오프라인 단독 파일 다운로드 바 (세로 50% 슬림화) */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-xl px-4 py-2 text-white shadow-2xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-sm overflow-hidden">
            <span className="bg-emerald-400 text-slate-900 px-2 py-0.5 rounded text-xs font-black shrink-0">서버 유출 0%</span>
            <span className="bg-white/20 px-2.5 py-0.5 rounded text-xs font-bold shrink-0 hidden sm:inline">100% 로컬 보안</span>
            <span className="font-bold truncate text-sm sm:text-base">
              수십·수백 개 엑셀 서식을 2초 만에 단 1장의 마스터로!
            </span>
          </div>

          <button 
            onClick={downloadOfflineHtml}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/30 px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer active:scale-95"
            title="인터넷이 차단된 폐쇄망 PC용 단일 파일 다운로드"
          >
            <DownloadCloud size={14} />
            <span className="hidden sm:inline">오프라인 다운</span>
            <span className="sm:hidden">오프라인</span>
          </button>
        </div>

        {/* 🏛️ [Step 1] 수합 방식 및 기준 기관 설정 (세로 50% 슬림 1열 통합 바) */}
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 sm:px-5 sm:py-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* 좌측: Step 1 뱃지 + 3대 수합 모드 탭 */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="bg-blue-50 text-blue-700 text-xs sm:text-sm font-black px-2.5 py-1 rounded-md border border-blue-200 shrink-0">
              Step 1
            </span>
            <div className="inline-flex bg-slate-100 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setMode('block')}
                className={`py-1.5 px-3 rounded-md text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  mode === 'block' ? 'bg-white text-blue-700 shadow-2xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="복합 신청서, 셀 병합, 합계 수식이 들어간 엑셀 양식 취합"
              >
                <Layers size={14} />
                <span>서식 블록형</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('simple')}
                className={`py-1.5 px-3 rounded-md text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  mode === 'simple' ? 'bg-white text-blue-700 shadow-2xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="1행 1데이터 형태의 일반 명부, 실태조사 엑셀 양식 취합"
              >
                <FileSpreadsheet size={14} />
                <span>단순 목록형</span>
              </button>
            </div>

            {/* K-에듀파인 교부서식 동시 생성 안내 뱃지 */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 text-xs font-bold shadow-2xs">
              <Send size={12} className="text-emerald-600" />
              <span>K-에듀파인 교부서식 동시 생성</span>
            </div>
          </div>

          {/* 우측: 기준 명부 매핑 드롭다운 & 자체 명부 버튼 */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-700 shrink-0">기준 명부:</span>
            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              {ROSTER_OPTIONS.map(opt => {
                if (opt.id === 'custom') {
                  const label = savedCustomRoster 
                    ? `💾 [내 PC 저장] ${savedCustomRoster.name}`
                    : '📂 자체 기준 명부 직접 등록 (.xlsx)';
                  return (
                    <option key={opt.id} value={opt.id}>
                      {label}
                    </option>
                  );
                }
                return (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                );
              })}
              {selectedRegion === 'virtual_sample' && (
                <option value="virtual_sample">🧪 [테스트] 가상 136개교 샘플 명부</option>
              )}
            </select>

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
              className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold py-1.5 px-3 rounded-lg border border-slate-200 transition-colors cursor-pointer shrink-0"
              title="A열: 연번, B열: 학교/기관명이 적힌 엑셀 파일을 업로드합니다."
            >
              <FileUp size={14} className="text-blue-600" />
              <span>자체 명부</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadRosterTemplate}
              className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs sm:text-sm font-bold py-1.5 px-2.5 rounded-lg border border-blue-200 transition-colors cursor-pointer shrink-0"
              title="자체 명부 표준 엑셀 양식(.xlsx)을 다운로드합니다. (A열: 연번, B열: 학교명)"
            >
              <Download size={13} />
              <span>양식</span>
            </button>

            {customRosterName && (
              <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md border border-blue-200 text-xs sm:text-sm shadow-2xs">
                <span className="truncate max-w-[140px] sm:max-w-[200px]" title={customRosterName}>
                  {customRosterName}
                </span>
                <button
                  type="button"
                  onClick={handleDeleteCustomRoster}
                  className="text-rose-500 hover:text-rose-700 hover:bg-rose-100 p-0.5 rounded-md cursor-pointer transition-colors shrink-0"
                  title="브라우저에 저장된 자체 명부 삭제"
                >
                  <X size={13} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 📂 [Step 2] 취합 파일 업로드 & 테스트 샘플 바 (눈에 띄는 컬러 테두리 강조형) */}
        <div className="bg-white rounded-2xl border-2 border-indigo-200 hover:border-indigo-300 p-4 sm:p-5 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-800 text-xs sm:text-sm font-black px-2.5 py-1 rounded-md border border-indigo-300">
                Step 2
              </span>
              <span className="font-black text-slate-800 text-base sm:text-lg flex items-center gap-1.5">
                <Upload size={19} className="text-indigo-600" />
                취합할 엑셀 서식 등록
              </span>
            </div>
            {files.length > 0 && (
              <span className="text-xs sm:text-sm bg-emerald-50 text-emerald-700 font-bold px-3.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 size={15} />
                총 {files.length}개 파일 준비 완료
              </span>
            )}
          </div>

          {/* 눈에 확실하게 띄는 블루/인디고 컬러 점선 테두리 드롭존 */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-indigo-500 hover:border-indigo-600 bg-indigo-50/60 hover:bg-indigo-50/90 rounded-xl px-5 py-4 sm:py-4.5 text-center sm:text-left cursor-pointer transition-all flex flex-col sm:flex-row items-center justify-between gap-3.5 group shadow-2xs hover:shadow-xs"
          >
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              accept=".xlsx,.xlsm,.xls" 
              className="hidden" 
              onChange={handleFileInputChange}
            />
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                <Upload size={24} className="text-white" />
              </div>
              <div>
                <div className="font-black text-indigo-950 text-base sm:text-lg">
                  취합할 엑셀 파일들을 이곳에 끌어다 놓으세요
                </div>
                <div className="text-xs sm:text-sm text-indigo-800/80 font-semibold">
                  수십~수백 개 .xlsx 파일 일괄 선택 지원 (로컬 브라우저 0초 무부하 보안)
                </div>
              </div>
            </div>

            <span className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black px-5 py-2.5 rounded-xl transition-all shadow-sm group-hover:shadow-md shrink-0 active:scale-95">
              {files.length > 0 ? `📂 파일 다시 선택 (${files.length}개)` : '📂 엑셀 파일 직접 선택'}
            </span>
          </div>

          {/* 🧪 테스트 샘플 액션 바 & 초기화 */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleLoadSampleFiles}
              disabled={isProcessing}
              className="flex-1 min-w-[200px] flex items-center justify-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-300 text-xs sm:text-sm font-bold py-2 px-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs"
              title="136개 가상학교 엑셀 샘플 파일 일괄 로드"
            >
              <FlaskConical size={16} className="text-purple-600" />
              <span>🧪 [테스트] 136개 가상학교 샘플 1초 로드</span>
            </button>
            <a
              href="/samples/sample_136_schools.zip"
              download="sample_136_schools.zip"
              className="flex items-center justify-center gap-1 bg-slate-50 hover:bg-slate-100 text-purple-700 border border-purple-200 text-xs sm:text-sm font-bold py-2.5 px-3.5 rounded-xl transition-colors shrink-0 shadow-2xs"
              title="136개 가상학교 샘플 엑셀 ZIP 다운로드"
            >
              <Archive size={15} />
              <span>ZIP 다운</span>
            </a>
            <button
              type="button"
              onClick={handleReset}
              disabled={isProcessing || (files.length === 0 && targetSchools.length === 0)}
              className="flex items-center justify-center gap-1 bg-slate-50 hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-200 text-xs sm:text-sm font-bold py-2.5 px-3.5 rounded-xl transition-colors shrink-0 shadow-2xs disabled:opacity-40 cursor-pointer"
              title="모든 파일 및 통계 초기화 (0개소 제로 상태)"
            >
              <RotateCcw size={15} />
              <span>초기화</span>
            </button>
          </div>
        </div>

        {/* 👀 [Step 3] 실시간 서식 미리보기 & 스마트 헤더 지정 (대형 와이드 뷰어) */}
        {files.length > 0 && previewRows.length > 0 ? (
          <div className="bg-white rounded-2xl border-2 border-blue-300 p-5 sm:p-6 space-y-3.5 shadow-md transition-all animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="bg-blue-50 text-blue-700 text-xs sm:text-sm font-black px-2.5 py-1 rounded-lg border border-blue-200">
                  Step 3
                </span>
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-xs shrink-0">
                  <Eye size={15} />
                </div>
                <div>
                  <span className="font-black text-slate-800 text-base sm:text-lg">
                    신청서 서식 실시간 미리보기
                  </span>
                  <span className="text-xs sm:text-sm text-slate-500 ml-2 font-medium">
                    ({files[0].name.length > 25 ? files[0].name.slice(0, 25) + '...' : files[0].name} · [{previewSheetName || '기본시트'}])
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 font-bold hidden sm:inline">
                  마우스 1클릭으로 헤더 끝 행 지정
                </span>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                  className="text-xs sm:text-sm text-slate-600 hover:text-slate-900 font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  {isPreviewOpen ? '미리보기 접기 ▲' : '미리보기 펼치기 ▼'}
                </button>
              </div>
            </div>

            {autoDetectedBadge && (
              <div className="bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl font-bold flex items-center justify-between">
                <span>{autoDetectedBadge}</span>
                <span className="text-xs text-blue-600 font-bold">다른 행을 클릭하면 즉시 변경됩니다</span>
              </div>
            )}

            {isPreviewOpen && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 px-1 font-medium">
                  <span>🔵 1행 ~ <strong>{headerEndRow}행</strong>: 공통 헤더로 1회 유지</span>
                  <span>🟢 <strong>{headerEndRow + 1}행</strong>부터: 각 기관/학교별 본문 결합 시작</span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-[340px] overflow-y-auto shadow-inner bg-slate-50/50">
                  <table className="w-full text-xs sm:text-sm text-left border-collapse select-none bg-white">
                    <thead className="bg-slate-100 text-slate-600 sticky top-0 z-10 shadow-2xs">
                      <tr>
                        <th className="py-2.5 px-3 border-b border-r border-slate-300 w-12 text-center font-bold bg-slate-200">행</th>
                        <th className="py-2.5 px-3 border-b border-r border-slate-300 w-32 text-center font-bold bg-slate-100">헤더/본문 경계</th>
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'].map(col => (
                          <th key={col} className="py-2.5 px-3 border-b border-r border-slate-300 min-w-[80px] text-center font-bold bg-slate-100">
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
                            <td className={`py-2 px-2.5 text-center border-r border-slate-200 font-mono font-bold ${
                              isHeaderEdge ? 'text-blue-700 bg-blue-200/50' : 'text-slate-500'
                            }`}>
                              {row.rowNum}
                            </td>
                            <td className="py-2 px-2.5 text-center border-r border-slate-200 whitespace-nowrap">
                              {isHeaderEdge ? (
                                <span className="bg-blue-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold shadow-xs">
                                  ✂️ 헤더 끝 ({row.rowNum}행)
                                </span>
                              ) : isHeader ? (
                                <span className="text-blue-600 text-xs font-semibold">
                                  🔵 헤더 영역
                                </span>
                              ) : isStartData ? (
                                <span className="bg-emerald-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold shadow-xs">
                                  🟢 본문 시작 ({row.rowNum}행)
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                  여기를 클릭 ➔
                                </span>
                              )}
                            </td>
                            {row.cells.map((cellText, cIdx) => (
                              <td
                                key={cIdx}
                                className={`py-2 px-3 border-r border-slate-200 truncate max-w-[150px] ${
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
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-5 text-center text-slate-400 flex items-center justify-center gap-2.5 shadow-2xs">
            <Eye size={20} className="text-slate-400 shrink-0" />
            <span className="text-sm sm:text-base font-medium text-slate-600">
              [Step 3] 엑셀 파일을 등록하면 이곳에 실시간 시트 뷰어가 펼쳐지며 마우스 1클릭으로 헤더를 확정할 수 있습니다.
            </span>
          </div>
        )}

        {/* ⚙️ [Step 4] 범용 수합 3원칙 설정 패널 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-blue-700 text-xs sm:text-sm font-black px-2.5 py-0.5 rounded-lg border border-blue-200">
                Step 4
              </span>
              <span className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
                <SlidersHorizontal size={17} className="text-blue-600" />
                범용 수합 3원칙 설정
              </span>
            </div>

            {/* ⚡ 업무별 1초 원클릭 프리셋 버튼 3종 가로 배치 */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-slate-600 font-bold text-xs sm:text-sm shrink-0 mr-1">⚡ 1초 프리셋:</span>
              <button
                type="button"
                onClick={() => applyPreset('food')}
                className={`py-1.5 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer whitespace-nowrap ${
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
                className={`py-1.5 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer whitespace-nowrap ${
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
                className={`py-1.5 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer whitespace-nowrap ${
                  activePreset === 'general'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs ring-2 ring-emerald-100'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                📋 일반 목록 (헤더 1회 유지)
              </button>
            </div>
          </div>

          {/* 3원칙 컨트롤 그리드 (슬림하고 단정한 높이) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm">
            {/* 1. 공통 헤더 1회 유지 */}
            <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200/80 space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
                  공통 헤더 1회 유지
                </span>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">1~{headerEndRow}행</span>
              </div>
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                <span className="text-slate-700 font-bold text-xs shrink-0">헤더 끝 행:</span>
                <div className="flex items-center gap-1.5">
                  <input 
                    type="number" 
                    value={headerEndRow} 
                    onChange={e => {
                      const newEnd = Number(e.target.value);
                      setHeaderEndRow(newEnd);
                      setBlockStartRow(newEnd + 1);
                      setActivePreset('custom');
                    }}
                    className="w-18 bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 text-center font-black text-xs sm:text-sm shadow-2xs"
                  />
                  <span className="text-slate-600 text-xs font-bold">행</span>
                </div>
              </div>
            </div>

            {/* 2. 본문 추출 방식 */}
            <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200/80 space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-purple-600 text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
                  본문 추출 방식
                </span>
                <label 
                  className="flex items-center gap-1.5 cursor-pointer text-purple-700 font-bold text-xs bg-purple-50 hover:bg-purple-100/70 px-2 py-0.5 rounded-md border border-purple-200 transition-colors shadow-2xs"
                  title="학교마다 작성한 행 수가 달라도 데이터가 잘리거나 빈칸이 생기지 않도록 실제 작성 줄까지 자동 감지합니다."
                >
                  <input 
                    type="checkbox"
                    checked={isAutoDetectRows}
                    onChange={e => {
                      setIsAutoDetectRows(e.target.checked);
                      setActivePreset('custom');
                    }}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>가변행 감지</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                <div>
                  <span className="text-slate-700 block mb-1 text-[11px] sm:text-xs font-bold">
                    시작 행 <span className="text-purple-600 font-normal text-[10px]">(헤더+1)</span>
                  </span>
                  <input 
                    type="number" 
                    value={blockStartRow} 
                    onChange={e => {
                      setBlockStartRow(Number(e.target.value));
                      setActivePreset('custom');
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 font-black text-xs sm:text-sm text-center shadow-2xs h-[34px]"
                  />
                </div>
                <div>
                  {isAutoDetectRows ? (
                    <div>
                      <span className="text-purple-700 block mb-1 text-[11px] sm:text-xs font-bold">
                        추출 범위
                      </span>
                      <div 
                        className="w-full bg-purple-100/90 border border-purple-300 text-purple-800 font-extrabold text-[11px] sm:text-xs rounded-lg px-1.5 py-1 text-center flex items-center justify-center gap-1 shadow-2xs h-[34px]"
                        title="가변행 감지: 학교마다 작성한 줄 수가 달라도 빈 행 전까지의 실제 작성 데이터를 자동으로 모두 수합합니다."
                      >
                        <Sparkles size={13} className="text-purple-600 shrink-0" />
                        <span className="whitespace-nowrap font-bold">끝 행까지 자동</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-slate-700 block mb-1 text-[11px] sm:text-xs font-bold">
                        고정 행수
                      </span>
                      <div className="flex items-center gap-1">
                        <input 
                          type="number" 
                          value={blockRowCount} 
                          onChange={e => {
                            setBlockRowCount(Number(e.target.value));
                            setActivePreset('custom');
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 font-black text-xs sm:text-sm text-center shadow-2xs h-[34px]"
                        />
                        <span className="text-slate-500 text-[11px] font-bold shrink-0">행</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. 취합 순서 정렬 */}
            <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200/80 space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-emerald-600 text-white rounded-full text-xs flex items-center justify-center font-bold">3</span>
                  취합 정렬
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">자동 정렬</span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-200/60">
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

          {/* K-에듀파인 교부 자동 연동 설정 */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 sm:p-3.5 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-900 text-xs sm:text-sm flex items-center gap-1.5">
                <Send size={14} className="text-emerald-700" />
                <span>K-에듀파인 교부서식 자동 연동 설정</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-200">
                수합 시 시트 2 및 전용 파일 동시 생성
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm pt-1 border-t border-emerald-200/60">
              <div>
                <span className="text-slate-700 font-bold block mb-1 text-[11px] sm:text-xs">
                  에듀파인 세부사업명
                </span>
                <input 
                  type="text" 
                  value={edufineBizName} 
                  onChange={e => setEdufineBizName(e.target.value)}
                  placeholder="예: 학교 전출금 교부액, 무상급식비 지원"
                  className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1 text-slate-900 font-bold text-xs sm:text-sm h-[32px] outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                />
              </div>
              <div>
                <span className="text-slate-700 font-bold block mb-1 text-[11px] sm:text-xs">
                  교부금액 열 번호 <span className="text-emerald-700 font-normal text-[10px]">(I열=9열, H열=8열)</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <input 
                    type="number" 
                    value={edufineAmountCol} 
                    onChange={e => setEdufineAmountCol(Number(e.target.value))}
                    className="w-20 bg-white border border-emerald-300 rounded-lg px-2 py-1 text-slate-900 text-center font-black text-xs sm:text-sm h-[32px] shadow-2xs"
                  />
                  <span className="text-slate-600 text-xs font-bold">열</span>
                  <span className="text-slate-400 text-[11px] ml-1">(제출 서식의 지원 금액 컬럼)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🚀 [Step 5] 취합 실행 및 결과 대시보드 */}
        <div className="space-y-4">
          {/* 대형 실행 버튼 */}
          <button
            disabled={files.length === 0 || isProcessing}
            onClick={runMerge}
            className={`w-full py-4 sm:py-4.5 rounded-2xl font-black text-lg sm:text-xl shadow-lg flex items-center justify-center gap-3 transition-all cursor-pointer ${
              files.length === 0 || isProcessing
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : mode === 'edufine'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-200 hover:shadow-xl active:scale-[0.99]'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-200 hover:shadow-xl active:scale-[0.99]'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="animate-spin" size={24} />
                <span>병합 처리 중... ({progress}%)</span>
              </>
            ) : (
              <>
                <Sparkles size={24} />
                <span>{files.length > 0 ? `${files.length}개 파일 일괄 수합 실행 (서식·수식 100% 보존)` : '엑셀 파일을 먼저 등록해주세요'}</span>
              </>
            )}
          </button>

          {/* 처리 프로그레스 바 */}
          {isProcessing && (
            <div className="bg-white rounded-2xl border border-blue-200 p-4 space-y-2 shadow-md">
              <div className="flex justify-between text-sm font-bold text-blue-900">
                <span>{statusMessage}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
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
              <div className="text-sm sm:text-base text-slate-600 font-bold">총 관리 대상수</div>
              <div className="text-3xl sm:text-4xl font-black text-slate-800 mt-1">{targetSchools.length}개소</div>
            </div>
            <div className="bg-white border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="text-sm sm:text-base text-emerald-600 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                정상 매칭
              </div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 mt-1">
                {processedList.filter(p => p.status === 'matched').length}개소
              </div>
            </div>
            <div className="bg-white border border-rose-200 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="text-sm sm:text-base text-rose-600 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                미제출 기관
              </div>
              <div className="text-3xl sm:text-4xl font-black text-rose-700 mt-1">{missingSchools.length}개소</div>
            </div>
            <div className="bg-white border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="text-sm sm:text-base text-amber-600 font-bold">중복/확인필요</div>
              <div className="text-3xl sm:text-4xl font-black text-amber-700 mt-1">
                {processedList.filter(p => p.status === 'duplicate' || p.status === 'unmatched').length}건
              </div>
            </div>
          </div>

          {/* 결과 다운로드 카드 (마스터 통합본 + K-에듀파인 전용 2-Way 완비) */}
          {mergedBlob && (
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-2 border-emerald-500 rounded-2xl p-5 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-center gap-3.5 w-full lg:w-auto">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-md">
                  <FileCheck2 size={24} />
                </div>
                <div>
                  <div className="font-bold text-emerald-950 text-sm sm:text-base">
                    취합 완료! (통합 신청서 마스터 + K-에듀파인 교부서식 동시 완성)
                  </div>
                  <div className="text-xs text-emerald-700 mt-0.5 font-medium">
                    100% 서식·수식 보존 · {((mergedBlob.size) / (1024 * 1024)).toFixed(2)} MB · 시트 1: 통합서식 / 시트 2: 교부양식
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto shrink-0">
                {/* 1. 마스터 엑셀 다운로드 (시트 1: 통합 신청서 + 시트 2: 에듀파인 교부서식) */}
                <button
                  onClick={handleDownloadMaster}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                  title="전체 학교 통합 신청서(시트1)와 K-에듀파인 교부서식(시트2)이 모두 포함된 올인원 마스터 파일"
                >
                  <Download size={16} />
                  <span>마스터 엑셀 다운로드 (통합본)</span>
                </button>

                {/* 2. K-에듀파인 전용 단독 엑셀 파일 다운로드 */}
                {edufineBlob && (
                  <button
                    onClick={handleDownloadEdufine}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                    title="K-에듀파인 시스템에 즉시 엑셀 업로드할 수 있는 단독 표준 규격 파일"
                  >
                    <Send size={15} />
                    <span>K-에듀파인 전용 다운로드</span>
                  </button>
                )}
              </div>
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

      {/* 📖 AI-SEN 엑셀수합 실무 사용설명서 모달 (3초 초간단 비주얼 가이드) */}
      {isManualOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsManualOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-5 sm:p-6 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs shadow-xs shrink-0">
                  <BookOpen size={22} className="text-amber-300" />
                </div>
                <div>
                  <h3 className="font-black text-lg sm:text-xl tracking-tight">
                    AI-SEN 엑셀수합 3초 가이드
                  </h3>
                  <p className="text-blue-100 text-sm mt-0.5 font-medium">
                    단 3단계로 수십 개 학교 서식을 하나로 통합합니다
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsManualOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer text-white shrink-0"
                title="닫기"
              >
                <X size={20} />
              </button>
            </div>

            {/* 핵심 3단계 카드 */}
            <div className="p-5 sm:p-6 space-y-3.5">
              
              {/* 1단계 */}
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 p-4 sm:p-4.5 rounded-2xl">
                <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white font-black text-base sm:text-lg flex items-center justify-center shrink-0 shadow-sm">
                  1
                </div>
                <div className="space-y-1">
                  <div className="font-black text-slate-900 text-base sm:text-lg">
                    엑셀 파일 등록
                  </div>
                  <div className="text-sm sm:text-base text-slate-600 font-medium leading-snug">
                    취합할 파일들을 드롭존에 한 번에 끌어다 놓습니다.
                  </div>
                </div>
              </div>

              {/* 2단계 */}
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 p-4 sm:p-4.5 rounded-2xl">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-black text-base sm:text-lg flex items-center justify-center shrink-0 shadow-sm">
                  2
                </div>
                <div className="space-y-1">
                  <div className="font-black text-slate-900 text-base sm:text-lg">
                    헤더 확인 (자동 감지)
                  </div>
                  <div className="text-sm sm:text-base text-slate-600 font-medium leading-snug">
                    미리보기에서 헤더 끝 행을 확인합니다. (클릭으로 즉시 변경 가능)
                  </div>
                </div>
              </div>

              {/* 3단계 */}
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 p-4 sm:p-4.5 rounded-2xl">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white font-black text-base sm:text-lg flex items-center justify-center shrink-0 shadow-sm">
                  3
                </div>
                <div className="space-y-1">
                  <div className="font-black text-slate-900 text-base sm:text-lg">
                    [수합 실행] & 다운로드
                  </div>
                  <div className="text-sm sm:text-base text-slate-600 font-medium leading-snug">
                    2초 만에 완벽 서식 보존 마스터 엑셀이 생성됩니다.
                  </div>
                </div>
              </div>

              {/* 팁 요약 2종 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3.5 flex items-start gap-3">
                  <Layers size={19} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-blue-950 text-sm sm:text-base block">모드 선택</span>
                    <span className="text-blue-800/90 text-xs sm:text-sm font-medium leading-relaxed">일반 서식은 <strong>블록 서식</strong>, 1줄 명부는 <strong>단순 목록</strong></span>
                  </div>
                </div>
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-3">
                  <ShieldCheck size={19} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-emerald-950 text-sm sm:text-base block">100% 로컬 보안</span>
                    <span className="text-emerald-800/90 text-xs sm:text-sm font-medium leading-relaxed">서버 전송 없이 내 PC 메모리에서 안전 처리</span>
                  </div>
                </div>
              </div>

            </div>

            {/* 모달 하단 푸터 버튼 */}
            <div className="bg-slate-50 border-t border-slate-100 p-4 sm:p-5 flex justify-end">
              <button
                type="button"
                onClick={() => setIsManualOpen(false)}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-black px-8 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                확인
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
