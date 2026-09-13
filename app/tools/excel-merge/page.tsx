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
  RotateCcw, X, ClipboardList, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter
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
  fitness?: number;
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
  const [activeReportTab, setActiveReportTab] = useState<'all' | 'missing' | 'error' | 'duplicate' | 'matched'>('missing');
  const [copiedReportType, setCopiedReportType] = useState<string | null>(null);

  // 🌟 제출 현황 및 서식 검증 리스트 실시간 필터 & 다각도 정렬 상태
  const [reportSearchKeyword, setReportSearchKeyword] = useState<string>('');
  const [reportSortField, setReportSortField] = useState<'seq' | 'name' | 'filename'>('seq');
  const [reportSortOrder, setReportSortOrder] = useState<'asc' | 'desc'>('asc');

  // 엑셀 시트 상단 미리보기 & 스마트 헤더 선택기 상태
  const [previewRows, setPreviewRows] = useState<Array<{ rowNum: number; cells: string[] }>>([]);
  const [previewSheetName, setPreviewSheetName] = useState<string>('');
  const [selectedSheetIndex, setSelectedSheetIndex] = useState<number>(-1); // -1: 자동, 0: 1번째 시트, 1: 2번째 시트, 2: 3번째 시트...
  const [availableSheets, setAvailableSheets] = useState<Array<{ index: number; name: string }>>([]);
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

      // 1. 헤더 행(1~15행) 전수 탐색을 통한 학교명/연번/학교코드 컬럼 스마트 자동 감지
      let nameColIdx = -1;
      let seqColIdx = -1;
      let codeColIdx = -1;
      let startScanRow = 2;

      for (let testR = 1; testR <= Math.min(ws.rowCount, 15); testR++) {
        const row = ws.getRow(testR);
        let foundNameCol = -1;
        let foundSeqCol = -1;
        let foundCodeCol = -1;

        for (let c = 1; c <= Math.min(row.cellCount, 25); c++) {
          const val = String(row.getCell(c).value || '').trim();
          if (!val) continue;
          if (/^학교명$|^기관명$|^대상교$|^학교$|^기관$/i.test(val) || (/학교|기관/i.test(val) && !/운영|여부|급식|지원|대상/i.test(val))) {
            foundNameCol = c;
          }
          if (/^연번$|^순번$|^번호$|^No$/i.test(val)) {
            foundSeqCol = c;
          }
          if (/코드|학교코드|기관코드|표준코드/i.test(val)) {
            foundCodeCol = c;
          }
        }

        // 해당 행에 '학교명' 컬럼이 존재하면 이 행을 실제 표의 헤더 행으로 확정!
        if (foundNameCol > 0) {
          nameColIdx = foundNameCol;
          seqColIdx = foundSeqCol > 0 ? foundSeqCol : (nameColIdx > 1 ? 1 : -1);
          if (foundCodeCol > 0) codeColIdx = foundCodeCol;
          startScanRow = testR + 1;
          break;
        }
      }

      // 만약 헤더 키워드를 못 찾았다면 기본값 (A열: 연번, B열: 학교명) 폴백
      if (nameColIdx === -1) {
        nameColIdx = 2;
        seqColIdx = 1;
        startScanRow = 2;
      }

      // 2. 데이터 행 스캔 (서울시 1,355개교 전체 지원을 위해 최대 3,000행 스캔)
      for (let r = startScanRow; r <= Math.min(ws.rowCount, 3000); r++) {
        const row = ws.getRow(r);
        const nameVal = row.getCell(nameColIdx).value;
        const seqVal = seqColIdx > 0 ? row.getCell(seqColIdx).value : null;
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

        if (name && !/연번|학교명|기관명|합계|소계|총계|총\s*\d+교/.test(name)) {
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

  // 학교명 정규화 (공백, 괄호, 특수기호, 접두어 '서울/서울특별시' 제거 비교용)
  const normalizeSchoolName = (name: string): string => {
    if (!name) return '';
    return String(name)
      .replace(/[\s\u3000\u00A0\(\)\[\]_·\-\.\,\r\n\t]/g, '')
      .replace(/^서울특별시|^서울시?|^서울/g, '')
      .trim();
  };

  // 학교명 스마트 매칭 (초등학교/초, 중학교/중 약칭 및 파일명/본문 학교명 정밀 탐색)
  const findMatchingSchool = (rawName: string): SchoolItem | undefined => {
    if (!rawName || targetSchools.length === 0) return undefined;
    const cleanRaw = normalizeSchoolName(rawName);
    if (!cleanRaw || cleanRaw.length < 2) return undefined;

    // 🚨 행정 일반 명사는 단독 매칭 방지 (예: E18 셀에 '공립', '초등학교' 등만 적혀있는 경우)
    if (/^(공립|사립|국립|학교|초등학교|중학교|고등학교|특수학교|교육지원청|서울특별시|지원청)$/.test(cleanRaw)) {
      return undefined;
    }

    // 1. 정확 일치 (서울 접두어 제거 상태)
    let match = targetSchools.find(s => normalizeSchoolName(s.name) === cleanRaw);
    if (match) return match;

    // 2. 부분 일치 (타겟 학교명이 원본 문자열에 포함되거나, 원본이 타겟에 포함)
    match = targetSchools.find(s => {
      const cleanTarget = normalizeSchoolName(s.name);
      if (!cleanTarget || cleanTarget.length < 2) return false;
      if (cleanRaw.includes(cleanTarget)) return true;
      if (cleanRaw.length >= 3 && cleanTarget.includes(cleanRaw)) return true;
      return false;
    });
    if (match) return match;

    // 3. 약칭 매칭 ('초등학교' <-> '초', '중학교' <-> '중')
    const toShort = (s: string) => s.replace(/초등학교|초등$/, '초').replace(/중학교$/, '중').replace(/고등학교|고등$/, '고');
    const rawShort = toShort(cleanRaw);
    match = targetSchools.find(s => {
      const targetShort = toShort(normalizeSchoolName(s.name));
      if (!targetShort || targetShort.length < 2) return false;
      if (rawShort.includes(targetShort)) return true;
      if (rawShort.length >= 3 && targetShort.includes(rawShort)) return true;
      return false;
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

  // 🛡️ 셀 값 및 수식 안전 복사 함수 (Shared Formula 및 잘못된 신청서 수식 완벽 방어)
  const copyCellValueSafely = (cell: any, rowOffset: number) => {
    if (!cell) return null;

    // 1. 빗금 사선 셀 방어 (빗금 테두리 빈 셀은 null 처리)
    const hasDiagonal = cell.border?.diagonal && (cell.border.diagonal.up || cell.border.diagonal.down);
    if (hasDiagonal && !cell.formula && (!cell.value || typeof cell.value !== 'object')) {
      return null;
    }

    // 2. 🚨 공유 수식(sharedFormula) 클론 최우선 방어:
    // 학교 담당자가 임의로 행을 편집/삭제하여 마스터가 깨진 경우 'Shared Formula master must exist...' 크래시 발생
    // 따라서 cell.model.sharedFormula 또는 cell.value.sharedFormula가 감지되면 무조건 계산된 결과값(숫자/텍스트)으로 안전 전환!
    const isShared = Boolean(
      cell.model?.sharedFormula || 
      cell.sharedFormula || 
      (cell.value && typeof cell.value === 'object' && 'sharedFormula' in cell.value) ||
      (cell.model && cell.model.shareType === 'shared' && !cell.model.formula)
    );

    if (isShared) {
      const safeResult = cell.model?.result !== undefined 
        ? cell.model.result 
        : (cell.value && typeof cell.value === 'object' && cell.value.result !== undefined 
            ? cell.value.result 
            : (cell.result !== undefined ? cell.result : (typeof cell.value === 'number' || typeof cell.value === 'string' ? cell.value : null)));
      return safeResult;
    }

    // 3. 단독 수식(formula)이 정상 명시된 셀 -> 오프셋만큼 행 번호 이동 보존
    if (cell.formula && !cell.model?.sharedFormula) {
      return {
        formula: shiftFormula(cell.formula, rowOffset),
        result: cell.result !== undefined ? cell.result : null
      };
    }

    // 4. cell.value가 객체이고 formula 속성을 가진 경우
    if (cell.value && typeof cell.value === 'object' && cell.value.formula && !cell.value.sharedFormula) {
      return {
        formula: shiftFormula(cell.value.formula, rowOffset),
        result: cell.value.result !== undefined ? cell.value.result : (cell.result !== undefined ? cell.result : null)
      };
    }

    // 5. 일반 객체형 셀 값인 경우 (RichText, Date, Hyperlink 등)
    if (cell.value && typeof cell.value === 'object') {
      if ('sharedFormula' in cell.value) {
        return cell.value.result !== undefined ? cell.value.result : null;
      }
      return cell.value;
    }

    // 6. 기본 원시값 (숫자, 문자열, 불리언 등)
    return cell.value;
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

  // 🛡️ 한셀/비표준 메타데이터 reading 'company' 크래시 방어 및 2단계 자동 치유 엑셀 로더
  const loadWorkbookSafely = async (file: File, ExcelJS: any): Promise<any> => {
    const buffer = await file.arrayBuffer();
    const wb = new ExcelJS.Workbook();
    try {
      await wb.xlsx.load(buffer);
      // 🚨 한셀/비표준 검증: 만약 파싱된 전체 행 수가 0이거나 행이 비정상 누락된 경우 치유 파이프라인으로 이동!
      const totalParsedRows = wb.worksheets.reduce((sum: number, ws: any) => sum + (ws.rowCount || 0), 0);
      if (totalParsedRows > 0) {
        return wb;
      }
      throw new Error('한셀(Hancom Cell) x: 네임스페이스로 인한 빈 워크시트 감지');
    } catch (err: any) {
      // 🚨 1단계 치유: JSZip으로 [Content_Types].xml 공백 정규화, 한셀 x: 접두사 제거, docProps/app.xml 강제 주입
      try {
        const zip = await JSZip.loadAsync(buffer);

        // 1-0. 한셀(Hancom Cell) 특유의 <x:worksheet>, <x:row>, <x:c>, <x:sst>, <x:workbook> 접두사 전면 정규화
        for (const filename of Object.keys(zip.files)) {
          if (filename.endsWith('.xml') || filename.endsWith('.rels')) {
            const fileObj = zip.file(filename);
            if (fileObj) {
              let text = await fileObj.async('string');
              if (text.includes('<x:worksheet') || text.includes('<x:sst') || text.includes('<x:workbook') || text.includes('xmlns:x=')) {
                text = text.replace(/<\/?x:([a-zA-Z0-9_]+)/g, (match) => match.replace('x:', ''))
                           .replace(/xmlns:x=/g, 'xmlns=');
                zip.file(filename, text);
              }
            }
          }
        }

        // 1-1. [Content_Types].xml의 등호 공백(PartName = "/docProps/app.xml") 정규화
        const ctFile = zip.file('[Content_Types].xml') || zip.file('[content_types].xml');
        if (ctFile) {
          let ctText = await ctFile.async('string');
          ctText = ctText.replace(/PartName\s*=\s*/g, 'PartName=')
                         .replace(/ContentType\s*=\s*/g, 'ContentType=')
                         .replace(/Extension\s*=\s*/g, 'Extension=');

          if (!ctText.includes('PartName="/docProps/app.xml"')) {
            ctText = ctText.replace('</Types>', '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>');
          }
          if (!ctText.includes('PartName="/docProps/core.xml"')) {
            ctText = ctText.replace('</Types>', '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>');
          }
          zip.file('[Content_Types].xml', ctText);
        }

        // 1-2. docProps/app.xml 표준 규격 강제 주입 (한셀의 Company 누락 크래시 원천 해결)
        const cleanAppXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Excel</Application>
  <Company></Company>
  <Manager></Manager>
</Properties>`;
        zip.file('docProps/app.xml', cleanAppXml);

        // 1-3. docProps/core.xml 표준 규격 주입
        if (!zip.file('docProps/core.xml') && !zip.file('docprops/core.xml')) {
          const cleanCoreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:creator>AI-SEN</dc:creator>
</cp:coreProperties>`;
          zip.file('docProps/core.xml', cleanCoreXml);
        }

        const healedBuffer = await zip.generateAsync({ type: 'arraybuffer' });
        const healedWb = new ExcelJS.Workbook();
        await healedWb.xlsx.load(healedBuffer);
        return healedWb;
      } catch (healErr1: any) {
        // 1단계 실패 시 2단계 시도
      }

      // 🚨 2단계 치유: SheetJS(XLSX)를 통한 100% 무오차 표준 버퍼 재생성 (Round-trip)
      try {
        const XLSX = (window as any).XLSX;
        if (XLSX) {
          const sWb = XLSX.read(buffer, { type: 'array' });
          const cleanBuffer = XLSX.write(sWb, { type: 'array', bookType: 'xlsx' });
          const healedWb2 = new ExcelJS.Workbook();
          await healedWb2.xlsx.load(cleanBuffer);
          return healedWb2;
        }
      } catch (healErr2: any) {
        // 2단계 실패
      }

      // 모든 치유 실패 시 원래 에러 throw
      throw err;
    }
  };

  // 첫 번째 파일의 특정 시트를 읽어 시각적 미리보기 구성 & 스마트 헤더 추천
  const loadSheetPreview = async (file: File, forceSheetIndex?: number) => {
    try {
      const ExcelJS = (window as any).ExcelJS;
      if (!ExcelJS) return;
      const wb = await loadWorkbookSafely(file, ExcelJS);

      // 파일 내 전체 시트 목록 추출 (사용자 시트 탭 선택 UI용)
      const sheets = wb.worksheets.map((s: any, idx: number) => ({ index: idx, name: s.name }));
      setAvailableSheets(sheets);

      // 대상 시트 결정 (강제 지정 인덱스 > 현재 선택 인덱스 > 시트명 일치 > 키워드 > 2번째/1번째)
      const targetIdx = forceSheetIndex !== undefined ? forceSheetIndex : selectedSheetIndex;
      let ws: any = null;

      if (targetIdx >= 0 && wb.worksheets[targetIdx]) {
        ws = wb.worksheets[targetIdx];
      } else if (previewSheetName) {
        ws = wb.worksheets.find((s: any) => s.name === previewSheetName);
      } else if (sheetKeyword) {
        ws = wb.worksheets.find((s: any) => s.name.includes(sheetKeyword));
      }

      if (!ws) {
        ws = wb.worksheets[1] || wb.worksheets[0];
      }
      if (!ws) return;

      const currentIdx = wb.worksheets.indexOf(ws);
      setPreviewSheetName(ws.name);
      if (forceSheetIndex !== undefined) {
        setSelectedSheetIndex(forceSheetIndex);
      }

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
        setAutoDetectedBadge(`✨ [${ws.name}] 컬럼명 분석 결과 헤더 끝이 ${detected}행으로 자동 지정되었습니다.`);
      } else {
        setAutoDetectedBadge(`현재 선택된 시트: [${ws.name}] (필요 시 아래 표에서 헤더 끝 행을 클릭하세요)`);
      }
    } catch (e) {
      console.error('시트 미리보기 파싱 실패:', e);
    }
  };

  // 사용자가 시트 탭(몇 번째 시트인지)을 직접 클릭했을 때 전환
  const handleSheetTabClick = (sheetIdx: number) => {
    setSelectedSheetIndex(sheetIdx);
    const validExcel = files.find(f => 
      !f.name.startsWith('~$') && (f.name.endsWith('.xlsx') || f.name.endsWith('.xlsm') || f.name.endsWith('.xls'))
    );
    if (validExcel) {
      loadSheetPreview(validExcel, sheetIdx);
    }
  };

  // files 또는 sheetKeyword 변경 시 미리보기 갱신 (유효한 첫 번째 엑셀 파일 자동 탐색)
  useEffect(() => {
    if (files.length > 0 && typeof window !== 'undefined' && (window as any).ExcelJS) {
      const validExcel = files.find(f => 
        !f.name.startsWith('~$') && (f.name.endsWith('.xlsx') || f.name.endsWith('.xlsm') || f.name.endsWith('.xls'))
      );
      if (validExcel) {
        loadSheetPreview(validExcel);
      }
    } else if (files.length === 0) {
      setPreviewRows([]);
      setPreviewSheetName('');
      setAvailableSheets([]);
      setSelectedSheetIndex(-1);
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
    // 1. 임시 락 파일(~$...)만 제외하고 모든 파일 수용 (PDF, HWP 등 오제출 파일 포함)
    const cleaned = newFiles.filter(f => !f.name.startsWith('~$'));
    if (cleaned.length === 0) {
      alert('선택된 파일이 없습니다.');
      return;
    }

    // 최소 1개 이상 취합 가능한 엑셀 파일(.xlsx, .xlsm, .xls)이 존재하는지 확인
    const hasExcelInNew = cleaned.some(f => 
      f.name.endsWith('.xlsx') || f.name.endsWith('.xlsm') || f.name.endsWith('.xls')
    );

    if (!hasExcelInNew) {
      alert('취합 기준 템플릿이 될 유효한 엑셀 파일(.xlsx, .xlsm)이 최소 1개 이상 포함되어야 합니다.');
      return;
    }

    // 🌟 사용자 요청: 새 파일 업로드 시 기존 자료(파일 및 이전 취합 결과)를 완전히 초기화하고 새 파일들로 교체!
    // 동일 이름 중복 파일 원천 제거
    const uniqueFiles: File[] = [];
    const seenNames = new Set<string>();
    for (const f of cleaned) {
      if (!seenNames.has(f.name)) {
        seenNames.add(f.name);
        uniqueFiles.push(f);
      }
    }

    // 기존 파일 및 결과 데이터 완전 초기화 & 새 파일들로 교체
    setFiles(uniqueFiles);
    setProcessedList([]);
    setMissingSchools([]);
    setMergedBlob(null);
    setMergedFileName('');
    setEdufineBlob(null);
    setProgress(0);
    setStatusMessage('');
    setActiveReportTab('missing');
    setCopiedReportType(null);
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
    setSelectedSheetIndex(-1);
    setAvailableSheets([]);
    setAutoDetectedBadge('');
    setActiveReportTab('missing');
    setCopiedReportType(null);
    setReportSearchKeyword('');
    setReportSortField('seq');
    setReportSortOrder('asc');
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
    const matchedMap = new Map<number, { file: File; school: SchoolItem; data: any; fitness?: number }>();

    try {
      // 1. 기준 템플릿 파일 로드 (첫 번째 유효한 엑셀 파일을 스마트 탐색)
      let templateFile: File | undefined;
      let templateWb: any;
      let targetWs: any;

      for (const f of files) {
        const isExcel = f.name.endsWith('.xlsx') || f.name.endsWith('.xlsm') || f.name.endsWith('.xls');
        if (!isExcel || f.name.startsWith('~$')) continue;
        try {
          const wb = await loadWorkbookSafely(f, ExcelJS);

          // 템플릿 대상 시트 (사용자 지정 순번 > 시트명 > 키워드 > 2번째/1번째 시트)
          let ws: any = null;
          if (selectedSheetIndex >= 0 && wb.worksheets[selectedSheetIndex]) {
            ws = wb.worksheets[selectedSheetIndex];
          } else if (previewSheetName) {
            ws = wb.worksheets.find((s: any) => s.name === previewSheetName);
          } else if (sheetKeyword) {
            ws = wb.worksheets.find((s: any) => s.name.includes(sheetKeyword));
          }
          if (!ws) ws = wb.worksheets[1] || wb.worksheets[0];

          if (ws) {
            templateFile = f;
            templateWb = wb;
            targetWs = ws;
            break;
          }
        } catch (e) {
          // 해당 엑셀 파일이 손상된 경우 다음 파일 탐색
        }
      }

      if (!templateFile || !templateWb || !targetWs) {
        alert('취합 기준 템플릿으로 사용할 수 있는 유효한 엑셀 파일이 없습니다.\n정상적인 .xlsx 서식 파일이 포함되어 있는지 확인해주세요.');
        setIsProcessing(false);
        return;
      }

      // 🌟 기준 템플릿의 헤더 지문(Fingerprint) 수집 (1행 ~ headerEndRow 영역의 핵심 컬럼/제목 단어들)
      const COMMON_ADMIN_STOPWORDS = new Set([
        '구분', '연번', '비고', '공립', '사립', '초', '중', '고', '학교', '초등', '중등', '고등', '합계', '계', 'no', 'seq', 'id', '소계', '총계', '기타', '일련번호'
      ]);
      const templateHeaderWords = new Set<string>();
      const templateCoreWords = new Set<string>(); // 불용어 제외 핵심 업무 키워드 (급식, 인건, 산출, 단가 등)

      for (let r = 1; r <= Math.max(headerEndRow, 3); r++) {
        const row = targetWs.getRow(r);
        row.eachCell({ includeEmpty: false }, (c: any) => {
          const val = c.value;
          const txt = String(val && typeof val === 'object' ? (val.result || val.formula || '') : (val || '')).trim();
          if (txt.length >= 2) {
            const clean = txt.replace(/[^\uAC00-\uD7A3a-zA-Z0-9]/g, ' ');
            clean.split(/\s+/).forEach(w => {
              const lower = w.toLowerCase();
              if (lower.length >= 2 && !/^\d+$/.test(lower)) {
                templateHeaderWords.add(lower);
                if (!COMMON_ADMIN_STOPWORDS.has(lower)) {
                  templateCoreWords.add(lower);
                }
              }
            });
          }
        });
      }

      // 2. 각 파일 순회 및 연번/학교명 추출 (PDF, 비엑셀, 서식오류 파일 자동 감지 & 패스)
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const pct = 15 + Math.floor((i / files.length) * 45);
        setProgress(pct);
        setStatusMessage(`파일 분석 중 (${i + 1}/${files.length}): ${file.name}`);

        // 학교명 사전 추출 (파일명 기반)
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        const cleanFileName = nameWithoutExt.replace(/신청서|서식|2026/g, '').trim();
        const matchedSchoolByName = findMatchingSchool(cleanFileName);
        const fallbackSchoolName = matchedSchoolByName?.name || cleanFileName || file.name;

        // 🚨 A. 확장자 검사: 비엑셀 파일(PDF, HWP, 이미지 등) 즉시 패스 & 오류 카운팅
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const isExcelExt = ext === 'xlsx' || ext === 'xlsm' || ext === 'xls';
        if (!isExcelExt) {
          const extBadge = ext ? ext.toUpperCase() : '기타';
          processed.push({
            name: file.name,
            size: file.size,
            schoolName: fallbackSchoolName,
            matchedSeq: matchedSchoolByName?.seq,
            status: 'error',
            errorMsg: `비엑셀 파일(${extBadge}) 제출`
          });
          continue; // 🚀 패스하고 다음 파일로 진행!
        }

        try {
          const wb = await loadWorkbookSafely(file, ExcelJS);

          // 🚨 B. 시트 검증 및 취합 대상 시트 탐색 (지정 순번 > 시트명 일치 > 키워드 > 2번째/1번째)
          if (!wb.worksheets || wb.worksheets.length === 0) {
            processed.push({
              name: file.name,
              size: file.size,
              schoolName: fallbackSchoolName,
              status: 'error',
              errorMsg: '빈 엑셀 파일 (시트 없음)'
            });
            continue;
          }

          // 🌟 1. 전체 시트 중 기준 템플릿과 가장 적합한 최적 시트 탐색 & 지문 적합도(Fitness Score) 산출
          let ws: any = null;
          let bestFitness = -1;
          let bestMatchedWords = 0;

          // 1-1. 각 시트의 헤더 지문(Fingerprint) 정밀 스캔하여 기준 템플릿과 일치도가 가장 높은 최적 시트 자동 선택
          for (const s of wb.worksheets) {
            let score = 0;
            // 시트명 매칭 가산점 (미리보기 시트명 일치 +50, 키워드 일치 +25)
            if (previewSheetName && s.name === previewSheetName) score += 50;
            else if (sheetKeyword && s.name.includes(sheetKeyword)) score += 25;

            // 시트 헤더 단어 일치도 측정 (1~20행)
            let matchCount = 0;
            const scannedWords = new Set<string>();
            const scanMaxRow = Math.min(s.rowCount || 0, Math.max(headerEndRow + 3, 20));

            for (let r = 1; r <= scanMaxRow; r++) {
              const row = s.getRow(r);
              row.eachCell({ includeEmpty: false }, (c: any) => {
                const val = c.value;
                const txt = String(val && typeof val === 'object' ? (val.result || val.formula || '') : (val || '')).trim();
                if (txt.length >= 2) {
                  const clean = txt.replace(/[^\uAC00-\uD7A3a-zA-Z0-9]/g, ' ');
                  clean.split(/\s+/).forEach(w => {
                    const lower = w.toLowerCase();
                    if (lower.length >= 2 && !scannedWords.has(lower)) {
                      scannedWords.add(lower);
                      if (templateCoreWords.has(lower)) {
                        matchCount++;
                      }
                    }
                  });
                }
              });
            }

            score += matchCount * 5;
            if (score > bestFitness) {
              bestFitness = score;
              ws = s;
              bestMatchedWords = matchCount;
            }
          }

          // 1-2. 사용자가 상단 미리보기에서 특정 시트 순번을 직접 클릭한 경우 우선 반영
          if (selectedSheetIndex >= 0 && wb.worksheets[selectedSheetIndex]) {
            ws = wb.worksheets[selectedSheetIndex];
          }

          if (!ws) ws = wb.worksheets[1] || wb.worksheets[0];

          // 🌟 스마트 시트 자동 보정: 선택된 ws의 행 수가 blockStartRow보다 작다면 유효 데이터 시트 자동 탐색!
          if (ws && (ws.rowCount || 0) < blockStartRow) {
            const candidate = wb.worksheets.find((s: any) => 
              (s.rowCount || 0) >= blockStartRow && 
              ((previewSheetName && s.name === previewSheetName) || (sheetKeyword && s.name.includes(sheetKeyword)) || (s.rowCount || 0) > 10)
            );
            if (candidate) {
              ws = candidate;
            }
          }

          // 🚨 C-1. 서식 자체를 잘못 낸 경우 (행 수 극단적 부족)
          const totalRows = ws?.rowCount || 0;
          if (totalRows < blockStartRow && totalRows <= 3) {
            processed.push({
              name: file.name,
              size: file.size,
              schoolName: fallbackSchoolName,
              status: 'error',
              errorMsg: '서식 불일치 (행 수 부족/다른 양식)'
            });
            continue;
          }

          // 🚨 C-2. 서식 지문(Fingerprint) 정밀 대조: 기준 템플릿의 핵심 단어가 5개 이상인데 일치 단어가 0개이면 완전 다른 업무 양식 자동 제외!
          if (templateCoreWords.size >= 5 && bestMatchedWords === 0 && (!previewSheetName || ws.name !== previewSheetName)) {
            processed.push({
              name: file.name,
              size: file.size,
              schoolName: fallbackSchoolName,
              status: 'error',
              errorMsg: '서식 불일치 (다른 업무 양식 제출 - 자동 제외)'
            });
            continue; // 🚀 취합 데이터에 절대 결합하지 않고 즉시 패스!
          }

          // 🚨 C-3. 단일 학교 서식 아님 감지 (수십 개 시설이 나열된 총괄 대장 파일 침범 원천 차단)
          if (mode === 'block') {
            const detectedRowsForCheck = findLastDataRow(ws, blockStartRow) - blockStartRow + 1;
            if (detectedRowsForCheck > Math.max(45, blockRowCount * 2.5)) {
              processed.push({
                name: file.name,
                size: file.size,
                schoolName: fallbackSchoolName,
                status: 'error',
                errorMsg: `서식 불일치 (단일 학교 서식 아님 - 종합 대장 파일 ${detectedRowsForCheck}행 제외)`
              });
              continue; // 🚀 종합 대장 파일 취합 제외!
            }
          }

          let rawSchoolName = '';
          const col1Val = ws.getCell(blockStartRow, 1).value;
          const parsedColSeq = parseInt(String(col1Val), 10);

          if (mode === 'block') {
            const targetRow = blockStartRow + schoolCellRowOffset;
            const cellVal = ws.getCell(targetRow, schoolCellCol).value;
            rawSchoolName = cellVal ? String(cellVal).trim() : '';
          } else {
            rawSchoolName = cleanFileName;
          }

          if (!rawSchoolName) {
            rawSchoolName = cleanFileName;
          }

          const matchedSchool = findMatchingSchool(rawSchoolName);

          // 🌟 기준 명부가 등록되어 있는 경우 -> 명부의 연번(seq)을 100% 최우선 적용하여 칼정렬!
          let finalSeq = (i + 1);
          if (matchedSchool?.seq) {
            finalSeq = matchedSchool.seq;
          } else if (matchedSchoolByName?.seq) {
            finalSeq = matchedSchoolByName.seq;
          } else if (!isNaN(parsedColSeq) && parsedColSeq > 0 && targetSchools.length === 0) {
            finalSeq = parsedColSeq;
          } else if (targetSchools.length > 0) {
            // 🚨 기준 명부가 있는데 매칭되지 않은 파일이 명부의 1~N번 슬롯(예: 50번 이수초, 51번 일원초)을 가로채지 못하도록 안전 격리!
            finalSeq = 10000 + (i + 1);
          }

          const finalSchoolName = matchedSchool?.name || matchedSchoolByName?.name || rawSchoolName || `기관_${finalSeq}`;

          // 🚨 D. 본문 데이터 전무 검사 (엉뚱한 빈 서식 패스)
          let hasContent = false;
          for (let r = blockStartRow; r < blockStartRow + 5; r++) {
            for (let c = 1; c <= 12; c++) {
              const val = ws.getCell(r, c).value;
              if (val !== null && val !== undefined && String(val).trim() !== '') {
                hasContent = true;
                break;
              }
            }
            if (hasContent) break;
          }

          if (!hasContent) {
            processed.push({
              name: file.name,
              size: file.size,
              schoolName: finalSchoolName,
              status: 'error',
              errorMsg: '서식 불일치 (본문 내용 비어있음)'
            });
            continue; // 🚀 패스!
          }

          const candidateRecord: ProcessedFile = {
            name: file.name,
            size: file.size,
            schoolName: finalSchoolName,
            matchedSeq: finalSeq,
            status: 'matched',
            fitness: bestFitness
          };

          if (matchedMap.has(finalSeq)) {
            const existing = matchedMap.get(finalSeq)!;
            const existingFitness = existing.fitness ?? 0;

            if (bestFitness > existingFitness) {
              // 🏆 새 파일이 템플릿과 더 잘 맞음! (예: 앞서 들어온 파일이 엉뚱한 파일이거나 구버전이고 지금 파일이 진짜 서식)
              const oldIdx = processed.findIndex(p => p.name === existing.file.name && p.matchedSeq === finalSeq);
              if (oldIdx >= 0) {
                processed[oldIdx].status = 'duplicate';
                processed[oldIdx].errorMsg = `중복 제출 기관 (연번 ${finalSeq}) - 더 적합한 서식으로 대체됨`;
              }
              matchedMap.set(finalSeq, {
                file,
                school: { seq: finalSeq, name: finalSchoolName, code: matchedSchool?.code || matchedSchoolByName?.code },
                data: ws,
                fitness: bestFitness
              });
              candidateRecord.status = 'matched';
              processed.push(candidateRecord);
            } else {
              // 기존에 먼저 등록된 파일이 더 적합하거나 동일함 -> 새 파일은 중복으로 처리
              candidateRecord.status = 'duplicate';
              candidateRecord.errorMsg = `중복 제출 기관 (연번 ${finalSeq})`;
              processed.push(candidateRecord);
            }
            continue;
          }

          matchedMap.set(finalSeq, {
            file,
            school: { seq: finalSeq, name: finalSchoolName, code: matchedSchool?.code || matchedSchoolByName?.code },
            data: ws,
            fitness: bestFitness
          });

          processed.push(candidateRecord);

        } catch (err: any) {
          processed.push({
            name: file.name,
            size: file.size,
            schoolName: fallbackSchoolName || '(손상된 파일)',
            status: 'error',
            errorMsg: err.message?.includes('password') ? '암호 걸린 파일' : (err.message || '파일 열기 실패')
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
          
          const detectedRows = isAutoDetectRows 
            ? Math.max(1, findLastDataRow(srcWs, blockStartRow) - blockStartRow + 1)
            : blockRowCount;
          // 🛡️ 비정상 대용량 데이터 침범 방지 안전 캡 (최대 40행)
          const actualRowCount = Math.min(detectedRows, Math.max(40, blockRowCount * 2));

          const dstStartRow = currentDstRow;
          const rowOffset = dstStartRow - blockStartRow;

          const pct = 65 + Math.floor((idx / sortedSeqs.length) * 20);
          setProgress(pct);
          setStatusMessage(`기관 데이터 결합 (${idx + 1}/${sortedSeqs.length}): ${info.school.name} (${actualRowCount}행)`);

          try {
            // 행별 셀 복사 (값, 서식, 수식)
            for (let r = 0; r < actualRowCount; r++) {
              const srcRowNum = blockStartRow + r;
              const dstRowNum = dstStartRow + r;
              const srcRow = srcWs.getRow(srcRowNum);
              const dstRow = targetWs.getRow(dstRowNum);

              if (srcRow.height) dstRow.height = srcRow.height;

              srcRow.eachCell({ includeEmpty: true }, (cell: any, colNumber: number) => {
                const dstCell = dstRow.getCell(colNumber);

                // 🛡️ 셀 값 및 수식 안전 복사 (Shared Formula 방어)
                dstCell.value = copyCellValueSafely(cell, rowOffset);

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
          } catch (schoolMergeErr: any) {
            console.error(`[${info.school.name}] 서식 오류로 자동 패스:`, schoolMergeErr);
            const foundItem = processed.find(p => p.matchedSeq === seq || p.schoolName === info.school.name);
            if (foundItem) {
              foundItem.status = 'error';
              foundItem.errorMsg = '서식/수식 깨짐 (자동 패스)';
            }
          }
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

          try {
            for (let r = 0; r < count; r++) {
              const srcRowNum = blockStartRow + r;
              const dstRowNum = currentDstRow + r;
              const rowOffset = dstRowNum - srcRowNum;
              const srcRow = srcWs.getRow(srcRowNum);
              const dstRow = targetWs.getRow(dstRowNum);
              if (srcRow.height) dstRow.height = srcRow.height;

              srcRow.eachCell({ includeEmpty: true }, (cell: any, colNumber: number) => {
                const dstCell = dstRow.getCell(colNumber);
                dstCell.value = copyCellValueSafely(cell, rowOffset);
                if (cell.font) dstCell.font = { ...cell.font };
                if (cell.fill) dstCell.fill = { ...cell.fill };
                if (cell.border) dstCell.border = { ...cell.border };
                if (cell.alignment) dstCell.alignment = { ...cell.alignment };
                if (cell.numFmt) dstCell.numFmt = cell.numFmt;
              });
            }
            currentDstRow += count;
          } catch (listMergeErr: any) {
            console.error(`[${info.school.name}] 목록형 서식 오류로 자동 패스:`, listMergeErr);
            const foundItem = processed.find(p => p.matchedSeq === seq || p.schoolName === info.school.name);
            if (foundItem) {
              foundItem.status = 'error';
              foundItem.errorMsg = '서식/수식 깨짐 (자동 패스)';
            }
          }
        }
      }

      // =========================================================================
      // 🌟 [동시 자동 생성] K-에듀파인 교부서식 시트 및 단독 파일 (사용자 요청으로 비활성화/숨김)
      // =========================================================================
      const isEdufineEnabled = false; // 사용자 요청: 교부금 프로그램 비활성화

      let singleEdufineWb: any = null;
      let edufineWs: any = null;
      let sWs: any = null;

      if (isEdufineEnabled) {
        setProgress(88);
        setStatusMessage('K-에듀파인 전출금 교부양식 생성 중...');

        // 1. 통합 마스터 워크북(templateWb)의 2번째 탭으로 추가
        edufineWs = templateWb.addWorksheet('K에듀파인_교부양식');
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
        singleEdufineWb = new ExcelJS.Workbook();
        sWs = singleEdufineWb.addWorksheet('전출금교부양식');
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

        // 데이터 채우기 (자체 명부의 연번·학교코드·학교명 반영)
        sortedSeqs.forEach((seq, idx) => {
          const info = matchedMap.get(seq)!;
          const ws = info.data;

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
      }

      // 5. 최종 파일 빌드 전 워크시트 내 잔존 공유 수식(Shared Formula) 전수 안전 살균
      // (cell.model 내부의 sharedFormula 속성까지 100% 제거하여 ExcelJS 크래시 원천 차단)
      templateWb.eachSheet((ws: any) => {
        ws.eachRow({ includeEmpty: true }, (row: any) => {
          row.eachCell({ includeEmpty: true }, (cell: any) => {
            const hasShared = Boolean(
              cell.model?.sharedFormula || 
              cell.sharedFormula || 
              (cell.value && typeof cell.value === 'object' && cell.value.sharedFormula)
            );

            if (hasShared) {
              const safeVal = cell.model?.result !== undefined
                ? cell.model.result
                : ((cell.value && typeof cell.value === 'object' && cell.value.result !== undefined)
                    ? cell.value.result
                    : (cell.result !== undefined ? cell.result : null));
              
              cell.value = safeVal;
              if (cell.model) {
                delete cell.model.sharedFormula;
                delete cell.model.shareType;
                delete cell.model.ref;
                if (!cell.model.formula) {
                  cell.model.type = typeof safeVal === 'number' ? 2 : (typeof safeVal === 'string' ? 3 : (safeVal === null ? 0 : 2));
                  cell.model.value = safeVal;
                }
              }
            }

            // 마스터 없는 불완전 수식 셀(type 6) 완벽 방어
            if (cell.model && cell.model.type === 6 && !cell.model.formula) {
              const safeVal = cell.model.result !== undefined ? cell.model.result : null;
              cell.model.type = typeof safeVal === 'number' ? 2 : (typeof safeVal === 'string' ? 3 : 0);
              cell.model.value = safeVal;
              delete cell.model.sharedFormula;
              delete cell.model.shareType;
            }
          });
        });
      });

      // 5. 최종 파일 빌드 (무정지 2단계 안전 그물망 적용)
      setProgress(95);
      setStatusMessage('통합 마스터 및 에듀파인 교부 파일 최종 렌더링 중...');

      // 🛡️ 무정지 엑셀 빌드 헬퍼 (수식 충돌 시 전원 자동 값 확정 복구 모드 가동)
      const safeWriteWorkbook = async (wb: any): Promise<Uint8Array> => {
        try {
          return await wb.xlsx.writeBuffer();
        } catch (writeErr: any) {
          console.warn('1차 수식 보존 빌드 실패 (신청서 수식 손상 감지):', writeErr.message);
          console.warn('-> 2차 무정지 안전망 가동: 모든 셀 값을 확정값으로 자동 복원하여 파일 생성');

          wb.eachSheet((w: any) => {
            w.eachRow({ includeEmpty: true }, (row: any) => {
              row.eachCell({ includeEmpty: true }, (cell: any) => {
                if (cell.type === 6 || cell.model?.type === 6 || cell.model?.sharedFormula || cell.formula) {
                  const val = cell.model?.result ?? cell.result ?? cell.value?.result ?? cell.value ?? null;
                  const cleanVal = (val !== null && typeof val === 'object') ? null : val;
                  cell.value = cleanVal;
                  if (cell.model) {
                    delete cell.model.formula;
                    delete cell.model.sharedFormula;
                    delete cell.model.shareType;
                    delete cell.model.ref;
                    cell.model.type = typeof cleanVal === 'number' ? 2 : (typeof cleanVal === 'string' ? 3 : 0);
                    cell.model.value = cleanVal;
                  }
                }
              });
            });
          });

          return await wb.xlsx.writeBuffer();
        }
      };

      // A. 통합 마스터 엑셀 (시트 1: 신청서 취합 원본 + 시트 2: K-에듀파인 교부양식)
      const outBuffer = await safeWriteWorkbook(templateWb);
      const outBlob = new Blob([outBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      setMergedBlob(outBlob);
      setMergedFileName(`마스터_통합_취합결과_${new Date().toISOString().slice(0, 10)}.xlsx`);

      // B. K-에듀파인 전용 단독 엑셀 파일 (사용자 요청으로 비활성화/숨김)
      if (singleEdufineWb) {
        const sBuffer = await safeWriteWorkbook(singleEdufineWb);
        const sBlob = new Blob([sBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        setEdufineBlob(sBlob);
        setEdufineFileName(`K에듀파인_전출금교부양식_${new Date().toISOString().slice(0, 10)}.xlsx`);
      } else {
        setEdufineBlob(null);
      }

      setProgress(100);
      setStatusMessage(`취합 성공! 마스터 서식 완성 (정상 ${matchedMap.size}건 / 미제출 ${missing.length}건)`);

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

  // 3. 📊 종합 취합 결과 보고서 엑셀 파일(.xlsx) 생성 및 다운로드 (정렬 & 자동 필터 완비)
  const handleDownloadReportExcel = async () => {
    try {
      const ExcelJS = (window as any).ExcelJS;
      if (!ExcelJS) {
        alert('ExcelJS 엔진을 로딩 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      const wb = new ExcelJS.Workbook();
      wb.creator = 'AI-SEN 엑셀수합';
      wb.created = new Date();

      // 사용자 선택 정렬 기준 반영 헬퍼
      const sortList = <T extends { seq?: any; name?: string; schoolName?: string; matchedSeq?: any }>(list: T[]): T[] => {
        return [...list].sort((a: any, b: any) => {
          let cmp = 0;
          if (reportSortField === 'seq') {
            const seqA = a.matchedSeq !== undefined ? a.matchedSeq : (a.seq !== undefined ? a.seq : 999999);
            const seqB = b.matchedSeq !== undefined ? b.matchedSeq : (b.seq !== undefined ? b.seq : 999999);
            cmp = seqA - seqB;
          } else if (reportSortField === 'name') {
            const nameA = a.schoolName || a.name || '';
            const nameB = b.schoolName || b.name || '';
            cmp = nameA.localeCompare(nameB, 'ko');
          } else if (reportSortField === 'filename') {
            const fileA = a.name || '';
            const fileB = b.name || '';
            cmp = fileA.localeCompare(fileB, 'ko');
          }
          return reportSortOrder === 'asc' ? cmp : -cmp;
        });
      };

      const matchedItems = sortList(processedList.filter(p => p.status === 'matched'));
      const errorItems = sortList(processedList.filter(p => p.status === 'error'));
      const duplicateItems = sortList(processedList.filter(p => p.status === 'duplicate'));
      const sortedMissingSchools = sortList(missingSchools);
      const totalCount = targetSchools.length > 0 ? targetSchools.length : (matchedItems.length + missingSchools.length);

      // --- [시트 1: 📊 취합 총괄 보고서] ---
      const ws1 = wb.addWorksheet('취합 총괄 보고서');
      ws1.columns = [
        { width: 8 },  // A 연번/순번
        { width: 28 }, // B 학교명
        { width: 45 }, // C 파일명/기관코드
        { width: 38 }, // D 사유/구분
        { width: 22 }  // E 조치사항/상태
      ];

      // 대형 제목
      ws1.mergeCells('A2:E2');
      const titleCell = ws1.getCell('A2');
      titleCell.value = 'AI-SEN 엑셀 취합 결과 종합 보고서';
      titleCell.font = { name: '맑은 고딕', size: 18, bold: true, color: { argb: 'FF1E3A8A' } };
      titleCell.alignment = { vertical: 'middle' };
      ws1.getRow(2).height = 36;

      // 부제 & 생성일시
      ws1.mergeCells('A3:E3');
      const subCell = ws1.getCell('A3');
      const now = new Date();
      const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const sortLabel = reportSortField === 'seq' ? '연번순' : (reportSortField === 'name' ? '학교명순' : '파일명순');
      const orderLabel = reportSortOrder === 'asc' ? '오름차순' : '내림차순';
      subCell.value = `작성일시: ${dateStr} · 총 관리 대상 ${totalCount}개소 기준 · 적용 정렬: ${sortLabel}(${orderLabel})`;
      subCell.font = { name: '맑은 고딕', size: 10, color: { argb: 'FF64748B' } };

      // 5대 통계 요약 카드 표 (5행~6행)
      ws1.getRow(5).height = 24;
      ws1.getRow(6).height = 32;

      const headersStat = ['총 관리 대상', '정상 수합 완료', '미제출 기관', '서식오류 (취합제외)', '중복 제출'];
      const valuesStat = [totalCount, matchedItems.length, missingSchools.length, errorItems.length, duplicateItems.length];
      const colorsStat = ['FF334155', 'FF15803D', 'FFBE123C', 'FFB45309', 'FF6B7280'];
      const bgColorsStat = ['FFF1F5F9', 'FFDCFCE7', 'FFFFE4E6', 'FFFEF3C7', 'FFF3F4F6'];

      for (let c = 1; c <= 5; c++) {
        const hCell = ws1.getCell(5, c);
        hCell.value = headersStat[c - 1];
        hCell.font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: colorsStat[c - 1] } };
        hCell.alignment = { horizontal: 'center', vertical: 'middle' };
        hCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColorsStat[c - 1] } };
        hCell.border = { top: { style: 'thin', color: { argb: 'FFCBD5E1' } }, bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } }, left: { style: 'thin', color: { argb: 'FFCBD5E1' } }, right: { style: 'thin', color: { argb: 'FFCBD5E1' } } };

        const vCell = ws1.getCell(6, c);
        vCell.value = `${valuesStat[c - 1]}건`;
        vCell.font = { name: '맑은 고딕', size: 16, bold: true, color: { argb: colorsStat[c - 1] } };
        vCell.alignment = { horizontal: 'center', vertical: 'middle' };
        vCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColorsStat[c - 1] } };
        vCell.border = { top: { style: 'thin', color: { argb: 'FFCBD5E1' } }, bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } }, left: { style: 'thin', color: { argb: 'FFCBD5E1' } }, right: { style: 'thin', color: { argb: 'FFCBD5E1' } } };
      }

      // 섹션 1: 미제출 기관 목록
      let startRow = 9;
      ws1.getCell(startRow, 1).value = `🔴 미제출 기관 명단 (${sortedMissingSchools.length}개소)`;
      ws1.getCell(startRow, 1).font = { name: '맑은 고딕', size: 13, bold: true, color: { argb: 'FFBE123C' } };
      startRow++;

      const missingHeaderRow = ws1.getRow(startRow);
      missingHeaderRow.values = ['연번', '기관·학교명', '기관코드', '구분', '제출상태'];
      missingHeaderRow.font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      for (let c = 1; c <= 5; c++) {
        ws1.getCell(startRow, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE11D48' } };
        ws1.getCell(startRow, c).alignment = { horizontal: 'center', vertical: 'middle' };
      }
      startRow++;

      if (sortedMissingSchools.length === 0) {
        ws1.getCell(startRow, 2).value = '미제출 기관이 없습니다. (전원 제출 완료)';
        startRow++;
      } else {
        sortedMissingSchools.forEach((s) => {
          const r = ws1.getRow(startRow);
          r.values = [s.seq, s.name, s.code || '-', s.type || '초·중·고', '미제출 (독촉 대상)'];
          r.font = { name: '맑은 고딕', size: 10 };
          r.getCell(1).alignment = { horizontal: 'center' };
          r.getCell(3).alignment = { horizontal: 'center' };
          r.getCell(4).alignment = { horizontal: 'center' };
          r.getCell(5).alignment = { horizontal: 'center' };
          r.getCell(5).font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FFE11D48' } };
          startRow++;
        });
      }

      // 섹션 2: 서식 오류 및 다른 양식 제출 목록
      startRow += 2;
      ws1.getCell(startRow, 1).value = `⚠️ 서식 오류 및 다른 양식 제출 목록 (${errorItems.length}건 - 취합 제외)`;
      ws1.getCell(startRow, 1).font = { name: '맑은 고딕', size: 13, bold: true, color: { argb: 'FFB45309' } };
      startRow++;

      const errorHeaderRow = ws1.getRow(startRow);
      errorHeaderRow.values = ['순번', '기관·학교명', '제출 파일명', '오류 사유 (취합 제외 사유)', '조치 사항'];
      errorHeaderRow.font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      for (let c = 1; c <= 5; c++) {
        ws1.getCell(startRow, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97706' } };
        ws1.getCell(startRow, c).alignment = { horizontal: 'center', vertical: 'middle' };
      }
      startRow++;

      if (errorItems.length === 0) {
        ws1.getCell(startRow, 2).value = '서식 오류 파일이 없습니다.';
        startRow++;
      } else {
        errorItems.forEach((item, idx) => {
          const r = ws1.getRow(startRow);
          r.values = [idx + 1, item.schoolName, item.name, item.errorMsg || '서식 불일치', '올바른 서식 재제출 요청'];
          r.font = { name: '맑은 고딕', size: 10 };
          r.getCell(1).alignment = { horizontal: 'center' };
          r.getCell(4).font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FFDC2626' } };
          r.getCell(5).alignment = { horizontal: 'center' };
          r.getCell(5).font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FFB45309' } };
          startRow++;
        });
      }

      // 섹션 3: 중복 제출 목록
      if (duplicateItems.length > 0) {
        startRow += 2;
        ws1.getCell(startRow, 1).value = `🟡 중복 제출 목록 (${duplicateItems.length}건 - 최초 유효본 외 제외)`;
        ws1.getCell(startRow, 1).font = { name: '맑은 고딕', size: 13, bold: true, color: { argb: 'FFB45309' } };
        startRow++;

        const dupHeaderRow = ws1.getRow(startRow);
        dupHeaderRow.values = ['순번', '기관·학교명', '중복 제출 파일명', '기존 등록 연번', '조치 사항'];
        dupHeaderRow.font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        for (let c = 1; c <= 5; c++) {
          ws1.getCell(startRow, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97706' } };
          ws1.getCell(startRow, c).alignment = { horizontal: 'center', vertical: 'middle' };
        }
        startRow++;

        duplicateItems.forEach((item, idx) => {
          const r = ws1.getRow(startRow);
          r.values = [idx + 1, item.schoolName, item.name, item.matchedSeq || '-', '최초 유효본 반영 후 중복 제외'];
          r.font = { name: '맑은 고딕', size: 10 };
          r.getCell(1).alignment = { horizontal: 'center' };
          r.getCell(4).alignment = { horizontal: 'center' };
          r.getCell(5).alignment = { horizontal: 'center' };
          startRow++;
        });
      }

      // --- [시트 2: 🔴 미제출 기관] ---
      const ws2 = wb.addWorksheet('미제출 기관');
      ws2.columns = [{ width: 10 }, { width: 30 }, { width: 18 }, { width: 20 }];
      ws2.addRow(['연번', '기관·학교명', '기관코드', '비고']);
      ws2.getRow(1).font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      for (let c = 1; c <= 4; c++) {
        ws2.getCell(1, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE11D48' } };
        ws2.getCell(1, c).alignment = { horizontal: 'center', vertical: 'middle' };
      }
      sortedMissingSchools.forEach(s => {
        const r = ws2.addRow([s.seq, s.name, s.code || '', '독촉 대상']);
        r.font = { name: '맑은 고딕', size: 10 };
        r.getCell(1).alignment = { horizontal: 'center' };
        r.getCell(3).alignment = { horizontal: 'center' };
        r.getCell(4).alignment = { horizontal: 'center' };
      });
      ws2.autoFilter = { from: 'A1', to: `D${Math.max(2, sortedMissingSchools.length + 1)}` };

      // --- [시트 3: ⚠️ 서식오류(재제출요청)] ---
      const ws3 = wb.addWorksheet('서식오류(재제출)');
      ws3.columns = [{ width: 8 }, { width: 28 }, { width: 45 }, { width: 35 }, { width: 20 }];
      ws3.addRow(['순번', '학교명', '파일명', '오류 사유', '조치사항']);
      ws3.getRow(1).font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      for (let c = 1; c <= 5; c++) {
        ws3.getCell(1, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97706' } };
        ws3.getCell(1, c).alignment = { horizontal: 'center', vertical: 'middle' };
      }
      errorItems.forEach((item, idx) => {
        const r = ws3.addRow([idx + 1, item.schoolName, item.name, item.errorMsg || '서식 불일치', '재제출 요청']);
        r.font = { name: '맑은 고딕', size: 10 };
        r.getCell(1).alignment = { horizontal: 'center' };
        r.getCell(4).font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FFDC2626' } };
        r.getCell(5).alignment = { horizontal: 'center' };
      });
      ws3.autoFilter = { from: 'A1', to: `E${Math.max(2, errorItems.length + 1)}` };

      // --- [시트 4: 🟢 정상 수합 완료] ---
      const ws4 = wb.addWorksheet('정상 수합 완료');
      ws4.columns = [{ width: 10 }, { width: 30 }, { width: 45 }, { width: 15 }];
      ws4.addRow(['연번', '학교명', '제출 파일명', '상태']);
      ws4.getRow(1).font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      for (let c = 1; c <= 4; c++) {
        ws4.getCell(1, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } };
        ws4.getCell(1, c).alignment = { horizontal: 'center', vertical: 'middle' };
      }
      matchedItems.forEach((item, idx) => {
        const r = ws4.addRow([item.matchedSeq || idx + 1, item.schoolName, item.name, '정상 수합']);
        r.font = { name: '맑은 고딕', size: 10 };
        r.getCell(1).alignment = { horizontal: 'center' };
        r.getCell(4).alignment = { horizontal: 'center' };
      });
      ws4.autoFilter = { from: 'A1', to: `D${Math.max(2, matchedItems.length + 1)}` };

      // --- [시트 5: 🟡 중복 제출] ---
      const ws5 = wb.addWorksheet('중복 제출');
      ws5.columns = [{ width: 8 }, { width: 28 }, { width: 45 }, { width: 16 }, { width: 25 }];
      ws5.addRow(['순번', '학교명', '제출 파일명', '기존 연번', '비고']);
      ws5.getRow(1).font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      for (let c = 1; c <= 5; c++) {
        ws5.getCell(1, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97706' } };
        ws5.getCell(1, c).alignment = { horizontal: 'center', vertical: 'middle' };
      }
      duplicateItems.forEach((item, idx) => {
        const r = ws5.addRow([idx + 1, item.schoolName, item.name, item.matchedSeq || '-', '최초 유효본 외 중복 제외']);
        r.font = { name: '맑은 고딕', size: 10 };
        r.getCell(1).alignment = { horizontal: 'center' };
        r.getCell(4).alignment = { horizontal: 'center' };
        r.getCell(5).alignment = { horizontal: 'center' };
      });
      ws5.autoFilter = { from: 'A1', to: `E${Math.max(2, duplicateItems.length + 1)}` };

      const reportBuffer = await wb.xlsx.writeBuffer();
      const reportBlob = new Blob([reportBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(reportBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `취합결과_종합보고서_${sortLabel}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert('종합 보고서 엑셀 생성 실패: ' + e.message);
    }
  };

  // 🌟 실시간 검색 필터 및 다각도 정렬 연산
  const kw = reportSearchKeyword.trim().toLowerCase();
  const filterAndSort = <T extends { seq?: any; name?: string; schoolName?: string; matchedSeq?: any; errorMsg?: string }>(
    list: T[]
  ): T[] => {
    let result = list;
    if (kw) {
      result = result.filter(item => {
        const name = (item.schoolName || item.name || '').toLowerCase();
        const file = (item.name || '').toLowerCase();
        const err = (item.errorMsg || '').toLowerCase();
        const seqStr = String(item.matchedSeq !== undefined ? item.matchedSeq : (item.seq !== undefined ? item.seq : ''));
        return name.includes(kw) || file.includes(kw) || err.includes(kw) || seqStr.includes(kw);
      });
    }
    return [...result].sort((a: any, b: any) => {
      let cmp = 0;
      if (reportSortField === 'seq') {
        const seqA = a.matchedSeq !== undefined ? a.matchedSeq : (a.seq !== undefined ? a.seq : 999999);
        const seqB = b.matchedSeq !== undefined ? b.matchedSeq : (b.seq !== undefined ? b.seq : 999999);
        cmp = seqA - seqB;
      } else if (reportSortField === 'name') {
        const nameA = a.schoolName || a.name || '';
        const nameB = b.schoolName || b.name || '';
        cmp = nameA.localeCompare(nameB, 'ko');
      } else if (reportSortField === 'filename') {
        const fileA = a.name || '';
        const fileB = b.name || '';
        cmp = fileA.localeCompare(fileB, 'ko');
      }
      return reportSortOrder === 'asc' ? cmp : -cmp;
    });
  };

  const filteredMissing = filterAndSort(missingSchools);
  const filteredError = filterAndSort(processedList.filter(p => p.status === 'error'));
  const filteredDuplicate = filterAndSort(processedList.filter(p => p.status === 'duplicate'));
  const filteredMatched = filterAndSort(processedList.filter(p => p.status === 'matched'));
  const filteredAll = filterAndSort(processedList);

  // 4. 📥 현재 화면에 필터링 및 정렬된 목록 그대로 엑셀 다운로드 (자동 필터 탑재)
  const handleDownloadCurrentViewExcel = async () => {
    try {
      const ExcelJS = (window as any).ExcelJS;
      if (!ExcelJS) {
        alert('ExcelJS 엔진을 로딩 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      const wb = new ExcelJS.Workbook();
      wb.creator = 'AI-SEN 엑셀수합';
      wb.created = new Date();

      let tabTitle = '전체 현황';
      let itemsToExport: Array<{ seq: any; name: string; file: string; status: string; note: string }> = [];

      if (activeReportTab === 'missing') {
        tabTitle = '미제출 기관';
        itemsToExport = filteredMissing.map(s => ({
          seq: s.seq,
          name: s.name,
          file: '-',
          status: '미제출',
          note: s.code ? `기관코드: ${s.code}` : '독촉 대상'
        }));
      } else if (activeReportTab === 'error') {
        tabTitle = '서식오류 (취합제외)';
        itemsToExport = filteredError.map((item, idx) => ({
          seq: item.matchedSeq || (idx + 1),
          name: item.schoolName,
          file: item.name,
          status: '서식오류',
          note: item.errorMsg || '서식 불일치'
        }));
      } else if (activeReportTab === 'duplicate') {
        tabTitle = '중복 제출';
        itemsToExport = filteredDuplicate.map((item, idx) => ({
          seq: item.matchedSeq || (idx + 1),
          name: item.schoolName,
          file: item.name,
          status: '중복제출',
          note: item.errorMsg || `중복 (연번 ${item.matchedSeq || '-'})`
        }));
      } else if (activeReportTab === 'matched') {
        tabTitle = '정상 수합 완료';
        itemsToExport = filteredMatched.map((item, idx) => ({
          seq: item.matchedSeq || (idx + 1),
          name: item.schoolName,
          file: item.name,
          status: '정상수합',
          note: '정상 결합'
        }));
      } else {
        tabTitle = '전체 파일 처리현황';
        itemsToExport = filteredAll.map((item, idx) => ({
          seq: item.matchedSeq || (idx + 1),
          name: item.schoolName,
          file: item.name,
          status: item.status === 'matched' ? '정상' : (item.status === 'error' ? '서식오류' : (item.status === 'duplicate' ? '중복' : '미매칭')),
          note: item.errorMsg || (item.status === 'matched' ? '정상 결합' : '-')
        }));
      }

      const ws = wb.addWorksheet(tabTitle);
      ws.columns = [
        { width: 10 }, // A: 연번
        { width: 32 }, // B: 기관·학교명
        { width: 50 }, // C: 파일명
        { width: 16 }, // D: 처리 상태
        { width: 36 }  // E: 사유/비고
      ];

      // 대형 제목행
      ws.addRow([`AI-SEN 검증 목록 - ${tabTitle}`]);
      ws.mergeCells('A1:E1');
      ws.getRow(1).height = 32;
      ws.getCell('A1').font = { name: '맑은 고딕', size: 15, bold: true, color: { argb: 'FF1E3A8A' } };
      ws.getCell('A1').alignment = { vertical: 'middle' };

      // 부제행
      const sortDesc = `${reportSortField === 'seq' ? '연번순' : (reportSortField === 'name' ? '학교명순' : '파일명순')} (${reportSortOrder === 'asc' ? '오름차순' : '내림차순'})`;
      const filterDesc = reportSearchKeyword ? ` · 검색어: "${reportSearchKeyword}"` : '';
      ws.addRow([`정렬: ${sortDesc}${filterDesc} · 추출건수: ${itemsToExport.length}건 · 일시: ${new Date().toLocaleString('ko-KR')}`]);
      ws.mergeCells('A2:E2');
      ws.getRow(2).height = 20;
      ws.getCell('A2').font = { name: '맑은 고딕', size: 9, color: { argb: 'FF64748B' } };
      ws.getCell('A2').alignment = { vertical: 'middle' };

      // 빈 행
      ws.addRow([]);

      // 헤더행 (4행)
      const headerRow = ws.addRow(['연번', '기관·학교명', '제출 파일명', '처리 상태', '사유 / 비고']);
      headerRow.height = 25;
      headerRow.font = { name: '맑은 고딕', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      
      const headerColor = activeReportTab === 'missing' ? 'FFE11D48' 
                        : (activeReportTab === 'error' ? 'FFD97706' 
                        : (activeReportTab === 'duplicate' ? 'FFD97706' 
                        : (activeReportTab === 'matched' ? 'FF16A34A' : 'FF2563EB')));

      for (let c = 1; c <= 5; c++) {
        const cell = ws.getCell(4, c);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerColor } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }

      // 데이터 채우기
      itemsToExport.forEach(item => {
        const r = ws.addRow([item.seq, item.name, item.file, item.status, item.note]);
        r.font = { name: '맑은 고딕', size: 10 };
        r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        r.getCell(2).alignment = { vertical: 'middle' };
        r.getCell(3).alignment = { vertical: 'middle' };
        r.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
        r.getCell(5).alignment = { vertical: 'middle' };
      });

      // 🌟 자동 필터 (AutoFilter) 활성화: 엑셀을 열었을 때 상단 화살표 드롭다운으로 즉시 필터·정렬 가능!
      ws.autoFilter = {
        from: { row: 4, column: 1 },
        to: { row: Math.max(5, 4 + itemsToExport.length), column: 5 }
      };

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeTabName = tabTitle.replace(/[\s\(\)\/]/g, '_');
      a.download = `검증리스트_${safeTabName}_${reportSortField}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('현재 목록 엑셀 파일 생성 실패: ' + err.message);
    }
  };

  // 기존 호환용 다운로드 핸들러
  const handleDownload = handleDownloadMaster;

  // 1. 종합 취합 결과 보고서 클립보드 1초 복사 (K-에듀파인 메신저/공문 보고용)
  const copySummaryReport = () => {
    const matchedCount = processedList.filter(p => p.status === 'matched').length;
    const errorItems = processedList.filter(p => p.status === 'error');
    const duplicateItems = processedList.filter(p => p.status === 'duplicate');
    const targetCount = targetSchools.length > 0 ? targetSchools.length : (matchedCount + missingSchools.length);

    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let report = `[📢 AI-SEN 엑셀 수합 취합 결과 종합 보고]\n`;
    report += `• 취합 일시: ${dateStr}\n`;
    report += `• 총 관리 대상: ${targetCount}개소\n`;
    report += `• 정상 수합: ${matchedCount}개소\n`;
    report += `• 미제출 기관: ${missingSchools.length}개소\n`;
    report += `• 서식오류/제외: ${errorItems.length}건\n`;
    report += `• 중복 제출: ${duplicateItems.length}건\n`;

    if (missingSchools.length > 0) {
      report += `\n[🔴 미제출 기관·학교 독촉 명단 (${missingSchools.length}개소)]\n`;
      report += missingSchools.map((s, idx) => `${idx + 1}. ${s.name}${s.code ? ` (${s.code})` : ''}`).join('\n');
    }

    if (errorItems.length > 0) {
      report += `\n\n[⚠️ 서식오류 및 다른양식 제출 (재제출 요청 필요 - ${errorItems.length}건)]\n`;
      report += errorItems.map((item, idx) => `${idx + 1}. ${item.schoolName} (${item.name}) - 사유: ${item.errorMsg || '서식 불일치'}`).join('\n');
    }

    if (duplicateItems.length > 0) {
      report += `\n\n[🟡 중복 제출 기관 명단 (${duplicateItems.length}건)]\n`;
      report += duplicateItems.map((item, idx) => `${idx + 1}. ${item.schoolName} (${item.name})`).join('\n');
    }

    navigator.clipboard.writeText(report);
    setCopiedReportType('summary');
    setCopiedNotification(true);
    setTimeout(() => {
      setCopiedReportType(null);
      setCopiedNotification(false);
    }, 2500);
  };

  // 2. 미제출 기관만 복사 (독촉 쪽지/메신저용)
  const copyMissingList = () => {
    if (missingSchools.length === 0) return;
    const text = `[미제출 기관·학교 독촉 명단 (${missingSchools.length}개소)]\n` + 
      missingSchools.map((s, idx) => `${idx + 1}. ${s.name}${s.code ? ` (${s.code})` : ''}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedReportType('missing');
    setCopiedNotification(true);
    setTimeout(() => {
      setCopiedReportType(null);
      setCopiedNotification(false);
    }, 2500);
  };

  // 3. 서식오류 / 다른양식 제출 기관만 복사 (재제출 요청용)
  const copyErrorList = () => {
    const errorItems = processedList.filter(p => p.status === 'error');
    if (errorItems.length === 0) return;
    const text = `[서식 오류 및 다른양식 제출 재제출 요청 명단 (${errorItems.length}건)]\n` + 
      errorItems.map((item, idx) => `${idx + 1}. ${item.schoolName} (${item.name}) - 사유: ${item.errorMsg || '서식 불일치'}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedReportType('error');
    setCopiedNotification(true);
    setTimeout(() => {
      setCopiedReportType(null);
      setCopiedNotification(false);
    }, 2500);
  };

  // 4. 중복 제출 기관만 복사
  const copyDuplicateList = () => {
    const duplicateItems = processedList.filter(p => p.status === 'duplicate');
    if (duplicateItems.length === 0) return;
    const text = `[중복 제출 기관 명단 (${duplicateItems.length}건)]\n` + 
      duplicateItems.map((item, idx) => `${idx + 1}. ${item.schoolName} (${item.name})`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedReportType('duplicate');
    setCopiedNotification(true);
    setTimeout(() => {
      setCopiedReportType(null);
      setCopiedNotification(false);
    }, 2500);
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
      <Script 
        src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js" 
        strategy="afterInteractive" 
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
        
        {/* 상단 슬로건 & 오프라인 단독 파일 다운로드 바 (모바일 반응형 슬림화) */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-white shadow-2xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm overflow-hidden">
            <span className="bg-emerald-400 text-slate-900 px-2 py-0.5 rounded text-[11px] sm:text-xs font-black shrink-0">서버 유출 0%</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] sm:text-xs font-bold shrink-0 hidden sm:inline">100% 로컬 보안</span>
            <span className="font-bold truncate text-xs sm:text-base">
              수십·수백 개 엑셀 서식을 2초 만에 단 1장의 마스터로!
            </span>
          </div>

          <button 
            onClick={downloadOfflineHtml}
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 border border-white/30 px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer active:scale-95"
            title="인터넷이 차단된 폐쇄망 PC용 단일 파일 다운로드"
          >
            <DownloadCloud size={13} />
            <span className="hidden sm:inline">오프라인 다운</span>
            <span className="sm:hidden">오프라인</span>
          </button>
        </div>

        {/* 🏛️ [Step 1] 수합 방식 및 기준 기관 설정 (좌우 완벽 수평 칼정렬) */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:px-5 sm:py-3 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* 좌측: Step 1 뱃지 + 2대 수합 모드 탭 */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="bg-blue-50 text-blue-700 text-xs sm:text-sm font-black px-2.5 py-1.5 rounded-lg border border-blue-200 shrink-0">
              Step 1
            </span>
            <div className="inline-flex bg-slate-100 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setMode('block')}
                className={`py-1.5 px-3 rounded-md text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                className={`py-1.5 px-3 rounded-md text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'simple' ? 'bg-white text-blue-700 shadow-2xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="1행 1데이터 형태의 일반 명부, 실태조사 엑셀 양식 취합"
              >
                <FileSpreadsheet size={14} />
                <span>단순 목록형</span>
              </button>
            </div>
          </div>

          {/* 우측: 기준 명부 매핑 드롭다운 & 자체 명부 버튼 (인라인 수평 정렬) */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-1 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <span className="text-xs sm:text-sm font-bold text-slate-700 shrink-0">기준 명부:</span>
            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer h-[38px] max-w-[260px] sm:max-w-[330px] truncate"
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
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => rosterInputRef.current?.click()}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold py-1.5 px-3 rounded-lg border border-slate-200 transition-colors cursor-pointer h-[38px]"
                title="A열: 연번, B열: 학교/기관명이 적힌 엑셀 파일을 업로드합니다."
              >
                <FileUp size={14} className="text-blue-600" />
                <span>자체 명부</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadRosterTemplate}
                className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs sm:text-sm font-bold py-1.5 px-2.5 rounded-lg border border-blue-200 transition-colors cursor-pointer h-[38px]"
                title="자체 명부 표준 엑셀 양식(.xlsx)을 다운로드합니다. (A열: 연번, B열: 학교명, 선택: 학교코드)"
              >
                <Download size={13} />
                <span>양식</span>
              </button>
              {customRosterName && (
                <button
                  type="button"
                  onClick={handleDeleteCustomRoster}
                  className="flex items-center gap-1 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs sm:text-sm font-bold py-1.5 px-2 rounded-lg cursor-pointer transition-colors h-[38px]"
                  title="브라우저에 저장된 자체 명부 삭제"
                >
                  <X size={13} />
                  <span>해제</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 📂 [Step 2] 취합 파일 업로드 & 테스트 샘플 바 (모바일 터치 완벽 대응형) */}
        <div className="bg-white rounded-2xl border-2 border-indigo-200 hover:border-indigo-300 p-3.5 sm:p-5 shadow-sm space-y-3 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-indigo-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-800 text-xs sm:text-sm font-black px-2.5 py-1 rounded-md border border-indigo-300 shrink-0">
                Step 2
              </span>
              <span className="font-black text-slate-800 text-sm sm:text-lg flex items-center gap-1.5">
                <Upload size={18} className="text-indigo-600" />
                취합할 엑셀 서식 등록
              </span>
            </div>
            {files.length > 0 && (
              <span className="text-xs sm:text-sm bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5 w-fit">
                <CheckCircle2 size={14} />
                총 {files.length}개 파일 준비 완료
              </span>
            )}
          </div>

          {/* 눈에 확실하게 띄는 블루/인디고 컬러 점선 테두리 드롭존 (모바일 터치 탭 안내) */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-indigo-500 hover:border-indigo-600 bg-indigo-50/60 hover:bg-indigo-50/90 active:bg-indigo-100/80 rounded-xl p-4 sm:px-5 sm:py-4.5 text-center sm:text-left cursor-pointer transition-all flex flex-col sm:flex-row items-center justify-between gap-3.5 group shadow-2xs hover:shadow-xs"
          >
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              accept=".xlsx,.xlsm,.xls,.pdf,.hwp,.hwpx,*" 
              className="hidden" 
              onChange={handleFileInputChange}
            />
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-3.5">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                <Upload size={24} className="text-white" />
              </div>
              <div className="text-center sm:text-left">
                <div className="font-black text-indigo-950 text-sm sm:text-lg">
                  <span className="hidden sm:inline">취합할 엑셀 파일들을 이곳에 끌어다 놓으세요</span>
                  <span className="sm:hidden">여기를 터치하여 엑셀 파일들을 선택하세요</span>
                </div>
                <div className="text-xs sm:text-sm text-indigo-800/80 font-semibold mt-0.5">
                  수십~수백 개 .xlsx 파일 일괄 선택 지원 (로컬 브라우저 0초 무부하 보안)
                </div>
              </div>
            </div>

            <span className="w-full sm:w-auto text-center bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black py-3 px-5 sm:py-2.5 rounded-xl transition-all shadow-sm group-hover:shadow-md shrink-0 active:scale-95">
              {files.length > 0 ? `📂 파일 다시 선택 (${files.length}개)` : '📂 엑셀 파일 직접 선택'}
            </span>
          </div>

          {/* 🧪 테스트 샘플 액션 바 & 초기화 (모바일 2열/3열 균형 정렬) */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleLoadSampleFiles}
              disabled={isProcessing}
              className="col-span-2 sm:flex-1 flex items-center justify-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-300 text-xs sm:text-sm font-bold py-2.5 px-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs min-h-[38px]"
              title="136개 가상학교 엑셀 샘플 파일 일괄 로드"
            >
              <FlaskConical size={15} className="text-purple-600" />
              <span>🧪 136개 가상학교 샘플 1초 로드</span>
            </button>
            <a
              href="/samples/sample_136_schools.zip"
              download="sample_136_schools.zip"
              className="flex items-center justify-center gap-1 bg-slate-50 hover:bg-slate-100 text-purple-700 border border-purple-200 text-xs sm:text-sm font-bold py-2.5 px-3 rounded-xl transition-colors shrink-0 shadow-2xs min-h-[38px]"
              title="136개 가상학교 샘플 엑셀 ZIP 다운로드"
            >
              <Archive size={14} />
              <span>ZIP 다운</span>
            </a>
            <button
              type="button"
              onClick={handleReset}
              disabled={isProcessing || (files.length === 0 && targetSchools.length === 0)}
              className="flex items-center justify-center gap-1 bg-slate-50 hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-200 text-xs sm:text-sm font-bold py-2.5 px-3 rounded-xl transition-colors shrink-0 shadow-2xs disabled:opacity-40 cursor-pointer min-h-[38px]"
              title="모든 파일 및 통계 초기화 (0개소 제로 상태)"
            >
              <RotateCcw size={14} />
              <span>초기화</span>
            </button>
          </div>
        </div>

        {/* 👀 [Step 3] 실시간 서식 미리보기 & 스마트 헤더 지정 (모바일 스와이프 친화형) */}
        {files.length > 0 && previewRows.length > 0 ? (
          <div className="bg-white rounded-2xl border-2 border-blue-300 p-3.5 sm:p-6 space-y-3 sm:space-y-3.5 shadow-md transition-all animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5 sm:pb-3">
              <div className="flex items-center gap-2">
                <span className="bg-blue-50 text-blue-700 text-xs sm:text-sm font-black px-2.5 py-1 rounded-lg border border-blue-200 shrink-0">
                  Step 3
                </span>
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-xs shrink-0">
                  <Eye size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-black text-slate-800 text-sm sm:text-lg">
                    신청서 서식 실시간 미리보기
                  </span>
                  <span className="text-[11px] sm:text-sm text-slate-500 ml-1.5 font-medium truncate block sm:inline">
                    ({files[0].name.length > 20 ? files[0].name.slice(0, 20) + '...' : files[0].name} · [{previewSheetName || '기본시트'}])
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                <span className="text-xs sm:text-sm text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 font-bold hidden sm:inline">
                  마우스 1클릭으로 헤더 끝 행 지정
                </span>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                  className="w-full sm:w-auto text-center text-xs sm:text-sm text-slate-600 hover:text-slate-900 font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer min-h-[34px]"
                >
                  {isPreviewOpen ? '미리보기 접기 ▲' : '미리보기 펼치기 ▼'}
                </button>
              </div>
            </div>

            {/* 📑 취합 대상 시트(몇 번째 시트인지) 원클릭 선택 바 */}
            {availableSheets.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-slate-100 border border-blue-200/80 rounded-xl p-3 shadow-2xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <span className="text-xs sm:text-sm font-black text-blue-950 flex items-center gap-1.5">
                    <Layers size={16} className="text-blue-600" />
                    취합할 시트(탭) 선택 :
                    <span className="text-blue-700 font-extrabold ml-1">
                      {selectedSheetIndex >= 0 ? `${selectedSheetIndex + 1}번째 시트` : '자동 감지'}
                    </span>
                    <span className="text-slate-500 font-semibold text-xs">([{previewSheetName || '기본시트'}])</span>
                  </span>
                  <span className="text-[11px] text-blue-700 font-medium hidden sm:inline">
                    💡 아래 탭 버튼을 클릭하면 해당 시트로 즉시 전환되어 취합됩니다.
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {availableSheets.map((sh) => {
                    const isSelected = selectedSheetIndex === sh.index || previewSheetName === sh.name;
                    return (
                      <button
                        key={sh.index}
                        type="button"
                        onClick={() => handleSheetTabClick(sh.index)}
                        className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shadow-2xs ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300 font-black scale-102'
                            : 'bg-white text-slate-700 hover:bg-slate-50 hover:text-blue-600 border border-slate-200'
                        }`}
                        title={`${sh.index + 1}번째 시트: [${sh.name}] 로 취합`}
                      >
                        <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-black ${
                          isSelected ? 'bg-white text-blue-600' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {sh.index + 1}
                        </span>
                        <span className="truncate max-w-[160px] sm:max-w-[220px]">{sh.name}</span>
                        {isSelected && <Check size={14} className="text-white shrink-0 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {autoDetectedBadge && (
              <div className="bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm p-3 rounded-xl font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span>{autoDetectedBadge}</span>
                <span className="text-xs text-blue-600 font-bold">다른 행을 터치/클릭하면 즉시 변경됩니다</span>
              </div>
            )}

            {isPreviewOpen && (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm text-slate-600 px-1 font-medium gap-1">
                  <span>🔵 1행 ~ <strong>{headerEndRow}행</strong>: 공통 헤더로 1회 유지</span>
                  <span>🟢 <strong>{headerEndRow + 1}행</strong>부터: 각 기관/학교별 본문 결합 시작</span>
                </div>

                {/* 모바일 가로 스크롤 터치 힌트 */}
                <div className="sm:hidden text-[11px] text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-100 font-bold flex items-center justify-between">
                  <span>👉 표를 좌우로 밀어서 전체 열을 확인하세요</span>
                  <span>터치로 헤더 변경</span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-[320px] sm:max-h-[340px] overflow-y-auto shadow-inner bg-slate-50/50 touch-pan-x touch-pan-y">
                  <table className="w-full text-xs sm:text-sm text-left border-collapse select-none bg-white">
                    <thead className="bg-slate-100 text-slate-600 sticky top-0 z-10 shadow-2xs">
                      <tr>
                        <th className="py-2 px-2.5 border-b border-r border-slate-300 w-12 text-center font-bold bg-slate-200 text-xs">행</th>
                        <th className="py-2 px-2.5 border-b border-r border-slate-300 w-28 sm:w-32 text-center font-bold bg-slate-100 text-xs">헤더/본문 경계</th>
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'].map(col => (
                          <th key={col} className="py-2 px-2.5 border-b border-r border-slate-300 min-w-[75px] text-center font-bold bg-slate-100 text-xs">
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
                            title={`${row.rowNum}행을 헤더 끝으로 지정하려면 터치하세요`}
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
                            <td className={`py-2 px-2 text-center border-r border-slate-200 font-mono font-bold text-xs ${
                              isHeaderEdge ? 'text-blue-700 bg-blue-200/50' : 'text-slate-500'
                            }`}>
                              {row.rowNum}
                            </td>
                            <td className="py-2 px-2 text-center border-r border-slate-200 whitespace-nowrap">
                              {isHeaderEdge ? (
                                <span className="bg-blue-600 text-white text-[11px] sm:text-xs px-2 py-0.5 rounded-full font-bold shadow-xs">
                                  ✂️ 헤더 끝 ({row.rowNum}행)
                                </span>
                              ) : isHeader ? (
                                <span className="text-blue-600 text-[11px] sm:text-xs font-semibold">
                                  🔵 헤더 영역
                                </span>
                              ) : isStartData ? (
                                <span className="bg-emerald-600 text-white text-[11px] sm:text-xs px-2 py-0.5 rounded-full font-bold shadow-xs">
                                  🟢 본문 시작 ({row.rowNum}행)
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                  터치 선택 ➔
                                </span>
                              )}
                            </td>
                            {row.cells.map((cellText, cIdx) => (
                              <td
                                key={cIdx}
                                className={`py-2 px-2.5 border-r border-slate-200 truncate max-w-[140px] text-xs ${
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
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-4 sm:p-5 text-center text-slate-400 flex items-center justify-center gap-2 shadow-2xs">
            <Eye size={18} className="text-slate-400 shrink-0" />
            <span className="text-xs sm:text-base font-medium text-slate-600">
              [Step 3] 엑셀 파일을 등록하면 이곳에 실시간 시트 뷰어가 펼쳐지며 1클릭으로 헤더를 확정할 수 있습니다.
            </span>
          </div>
        )}

        {/* ⚙️ [Step 4] 범용 수합 3원칙 설정 패널 (모바일 최적화 터치 인풋) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-5 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-blue-700 text-xs sm:text-sm font-black px-2.5 py-0.5 rounded-lg border border-blue-200 shrink-0">
                Step 4
              </span>
              <span className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
                <SlidersHorizontal size={16} className="text-blue-600" />
                범용 수합 3원칙 설정
              </span>
            </div>

            {/* ⚡ 업무별 1초 원클릭 프리셋 버튼 3종 가로 배치 */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 touch-pan-x">
              <span className="text-slate-600 font-bold text-xs sm:text-sm shrink-0 mr-0.5">⚡ 프리셋:</span>
              <button
                type="button"
                onClick={() => applyPreset('food')}
                className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer whitespace-nowrap min-h-[34px] ${
                  activePreset === 'food'
                    ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-xs ring-2 ring-blue-100'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                🍱 블록 서식
              </button>
              <button
                type="button"
                onClick={() => applyPreset('labor')}
                className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer whitespace-nowrap min-h-[34px] ${
                  activePreset === 'labor'
                    ? 'bg-purple-50 text-purple-700 border-purple-300 shadow-xs ring-2 ring-purple-100'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                👨‍🍳 가변 서식
              </button>
              <button
                type="button"
                onClick={() => applyPreset('general')}
                className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer whitespace-nowrap min-h-[34px] ${
                  activePreset === 'general'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs ring-2 ring-emerald-100'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                📋 일반 목록
              </button>
            </div>
          </div>

          {/* 3원칙 컨트롤 그리드 (모바일 터치 타겟 넉넉화) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 text-xs sm:text-sm">
            {/* 1. 공통 헤더 1회 유지 */}
            <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200/80 space-y-2 flex flex-col justify-between">
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
                    inputMode="numeric"
                    value={headerEndRow} 
                    onChange={e => {
                      const newEnd = Number(e.target.value);
                      setHeaderEndRow(newEnd);
                      setBlockStartRow(newEnd + 1);
                      setActivePreset('custom');
                    }}
                    className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-900 text-center font-black text-xs sm:text-sm shadow-2xs h-[38px]"
                  />
                  <span className="text-slate-600 text-xs font-bold">행</span>
                </div>
              </div>
            </div>

            {/* 2. 본문 추출 방식 */}
            <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200/80 space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-purple-600 text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
                  본문 추출 방식
                </span>
                <label 
                  className="flex items-center gap-1.5 cursor-pointer text-purple-700 font-bold text-xs bg-purple-50 hover:bg-purple-100/70 px-2.5 py-1 rounded-md border border-purple-200 transition-colors shadow-2xs min-h-[28px]"
                  title="학교마다 작성한 행 수가 달라도 데이터가 잘리거나 빈칸이 생기지 않도록 실제 작성 줄까지 자동 감지합니다."
                >
                  <input 
                    type="checkbox"
                    checked={isAutoDetectRows}
                    onChange={e => {
                      setIsAutoDetectRows(e.target.checked);
                      setActivePreset('custom');
                    }}
                    className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
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
                    inputMode="numeric"
                    value={blockStartRow} 
                    onChange={e => {
                      setBlockStartRow(Number(e.target.value));
                      setActivePreset('custom');
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 font-black text-xs sm:text-sm text-center shadow-2xs h-[38px]"
                  />
                </div>
                <div>
                  {isAutoDetectRows ? (
                    <div>
                      <span className="text-purple-700 block mb-1 text-[11px] sm:text-xs font-bold">
                        추출 범위
                      </span>
                      <div 
                        className="w-full bg-purple-100/90 border border-purple-300 text-purple-800 font-extrabold text-[11px] sm:text-xs rounded-lg px-1.5 py-1 text-center flex items-center justify-center gap-1 shadow-2xs h-[38px]"
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
                          inputMode="numeric"
                          value={blockRowCount} 
                          onChange={e => {
                            setBlockRowCount(Number(e.target.value));
                            setActivePreset('custom');
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 font-black text-xs sm:text-sm text-center shadow-2xs h-[38px]"
                        />
                        <span className="text-slate-500 text-[11px] font-bold shrink-0">행</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. 취합 순서 정렬 */}
            <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200/80 space-y-2 flex flex-col justify-between">
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
                  className={`py-2 rounded-lg text-xs font-bold border text-center transition-colors cursor-pointer min-h-[38px] ${
                    sortMode === 'seq' ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  연번순
                </button>
                <button
                  type="button"
                  onClick={() => setSortMode('name')}
                  className={`py-2 rounded-lg text-xs font-bold border text-center transition-colors cursor-pointer min-h-[38px] ${
                    sortMode === 'name' ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  가나다순
                </button>
                <button
                  type="button"
                  onClick={() => setSortMode('filename')}
                  className={`py-2 rounded-lg text-xs font-bold border text-center transition-colors cursor-pointer min-h-[38px] ${
                    sortMode === 'filename' ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  파일명순
                </button>
              </div>
            </div>
          </div>

          {/* (사용자 요청) K-에듀파인 교부 자동 연동 설정 숨김 처리 (삭제하지 않고 비노출) */}
          {false && (
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 sm:p-3.5 space-y-2 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-extrabold text-emerald-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <Send size={14} className="text-emerald-700" />
                  <span>K-에듀파인 교부서식 자동 연동 설정</span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-200 w-fit">
                  수합 시 시트 2 및 전용 파일 동시 생성
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm pt-1 border-t border-emerald-200/60">
                <div>
                  <span className="text-slate-700 font-bold block mb-1 text-[11px] sm:text-xs">
                    에듀파인 세부사업명
                  </span>
                  <input 
                    type="text" 
                    value={edufineBizName} 
                    onChange={e => setEdufineBizName(e.target.value)}
                    placeholder="예: 학교 전출금 교부액, 무상급식비 지원"
                    className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-bold text-xs sm:text-sm h-[38px] outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                  />
                </div>
                <div>
                  <span className="text-slate-700 font-bold block mb-1 text-[11px] sm:text-xs">
                    교부금액 열 번호 <span className="text-emerald-700 font-normal text-[10px]">(I열=9열, H열=8열)</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="number" 
                      inputMode="numeric"
                      value={edufineAmountCol} 
                      onChange={e => setEdufineAmountCol(Number(e.target.value))}
                      className="w-20 bg-white border border-emerald-300 rounded-lg px-2 py-1 text-slate-900 text-center font-black text-xs sm:text-sm h-[38px] shadow-2xs"
                    />
                    <span className="text-slate-600 text-xs font-bold">열</span>
                    <span className="text-slate-400 text-[10px] sm:text-[11px] ml-1 truncate">(제출 서식의 지원 금액 컬럼)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 🚀 [Step 5] 취합 실행 및 결과 대시보드 (모바일 터치 친화형) */}
        <div className="space-y-3 sm:space-y-4">
          {/* 대형 실행 버튼 (모바일 터치 최적화) */}
          <button
            disabled={files.length === 0 || isProcessing}
            onClick={runMerge}
            className={`w-full py-3.5 sm:py-4.5 px-4 rounded-2xl font-black text-base sm:text-xl shadow-lg flex items-center justify-center gap-2.5 sm:gap-3 transition-all cursor-pointer min-h-[52px] ${
              files.length === 0 || isProcessing
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-200 hover:shadow-xl active:scale-[0.99]'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="animate-spin" size={20} />
                <span>병합 처리 중... ({progress}%)</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>{files.length > 0 ? `${files.length}개 파일 일괄 수합 실행 (100% 보존)` : '엑셀 파일을 먼저 등록해주세요'}</span>
              </>
            )}
          </button>

          {/* 처리 프로그레스 바 */}
          {isProcessing && (
            <div className="bg-white rounded-2xl border border-blue-200 p-3.5 sm:p-4 space-y-2 shadow-md">
              <div className="flex justify-between text-xs sm:text-sm font-bold text-blue-900">
                <span>{statusMessage}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2.5 sm:h-3 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* 통계 신호등 요약 카드 4종 (모바일 2x2 그리드 완벽 대응) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
            <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-2xs">
              <div className="text-xs sm:text-base text-slate-600 font-bold">총 관리 대상수</div>
              <div className="text-2xl sm:text-4xl font-black text-slate-800 mt-0.5 sm:mt-1">{targetSchools.length}개소</div>
            </div>
            <div className="bg-white border border-emerald-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-2xs">
              <div className="text-xs sm:text-base text-emerald-600 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                정상 매칭
              </div>
              <div className="text-2xl sm:text-4xl font-black text-emerald-700 mt-0.5 sm:mt-1">
                {processedList.filter(p => p.status === 'matched').length}개소
              </div>
            </div>
            <div className="bg-white border border-rose-200 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-2xs">
              <div className="text-xs sm:text-base text-rose-600 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                미제출 기관
              </div>
              <div className="text-2xl sm:text-4xl font-black text-rose-700 mt-0.5 sm:mt-1">{missingSchools.length}개소</div>
            </div>
            {/* 4번째 카드: 오류/확인필요 (PDF, 서식 불일치, 손상 파일 명확 카운트) */}
            {(() => {
              const errCount = processedList.filter(p => p.status === 'error').length;
              const dupCount = processedList.filter(p => p.status === 'duplicate').length;
              const unmatchCount = processedList.filter(p => p.status === 'unmatched').length;
              const totalIssues = errCount + dupCount + unmatchCount;
              return (
                <div className={`bg-white border ${errCount > 0 ? 'border-rose-300 ring-1 ring-rose-200' : 'border-amber-200'} rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-2xs`}>
                  <div className="text-xs sm:text-base font-bold flex items-center justify-between">
                    <span className={errCount > 0 ? 'text-rose-600' : 'text-amber-600'}>오류/확인필요</span>
                    {errCount > 0 && (
                      <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-black">
                        오류 {errCount}
                      </span>
                    )}
                  </div>
                  <div className={`text-2xl sm:text-4xl font-black ${errCount > 0 ? 'text-rose-700' : 'text-amber-700'} mt-0.5 sm:mt-1`}>
                    {totalIssues}건
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 결과 다운로드 카드 (마스터 통합본 + K-에듀파인 전용 2-Way 완비 / 모바일 꽉찬 터치) */}
          {mergedBlob && (
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-2 border-emerald-500 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-3.5 sm:gap-4 animate-in fade-in">
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-md">
                  <FileCheck2 size={22} />
                </div>
                <div>
                  <div className="font-bold text-emerald-950 text-xs sm:text-base">
                    취합 완료! (통합 마스터 엑셀 완성)
                  </div>
                  <div className="text-[11px] sm:text-xs text-emerald-700 mt-0.5 font-medium">
                    100% 서식·수식 보존 취합 완료 · {((mergedBlob.size) / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto shrink-0">
                {/* 1. 마스터 엑셀 다운로드 */}
                <button
                  onClick={handleDownloadMaster}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black px-4 sm:px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs sm:text-sm min-h-[42px]"
                  title="전체 학교 통합 신청서 마스터 엑셀 다운로드"
                >
                  <Download size={15} />
                  <span>마스터 엑셀 다운로드</span>
                </button>

                {/* 2. (사용자 요청) K-에듀파인 전용 단독 엑셀 파일 다운로드 숨김 */}
                {false && edufineBlob && (
                  <button
                    onClick={handleDownloadEdufine}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 text-white font-black px-4 sm:px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs sm:text-sm min-h-[42px]"
                    title="K-에듀파인 시스템에 즉시 엑셀 업로드할 수 있는 단독 표준 규격 파일"
                  >
                    <Send size={14} />
                    <span>K-에듀파인 전용 다운로드</span>
                  </button>
                )}

                {/* 3. 📊 종합 보고서 엑셀 다운로드 (.xlsx) */}
                <button
                  onClick={handleDownloadReportExcel}
                  className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 active:from-teal-800 active:to-emerald-800 text-white font-black px-4 sm:px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs sm:text-sm min-h-[42px]"
                  title="미제출교, 서식오류, 정상취합 현황이 포함된 종합 결과 보고서 엑셀(.xlsx)을 다운로드합니다."
                >
                  <FileSpreadsheet size={15} />
                  <span>종합보고서 엑셀 다운로드</span>
                </button>

                {/* 4. 📋 종합 취합 결과 보고서 1초 복사 */}
                <button
                  onClick={copySummaryReport}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:from-purple-800 active:to-indigo-800 text-white font-black px-4 sm:px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs sm:text-sm min-h-[42px]"
                  title="미제출교, 서식오류, 정상취합 현황이 포함된 종합 결과 보고서를 복사합니다."
                >
                  {copiedReportType === 'summary' ? (
                    <>
                      <Check size={15} className="text-emerald-300" />
                      <span className="text-emerald-200">종합 보고서 복사완료!</span>
                    </>
                  ) : (
                    <>
                      <ClipboardList size={15} />
                      <span>📋 종합 보고서 1초 복사</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 🌟 취합 결과 종합 관리 & 기관 리스트 (미제출 / 서식오류·다른양식 / 중복 / 정상) */}
          {(processedList.length > 0 || missingSchools.length > 0) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-5">
              {/* 헤더 & 전용 1초 복사 바 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-black text-slate-800 text-base sm:text-lg flex items-center gap-2">
                    <span>기관·학교별 제출 현황 및 서식 검증 리스트</span>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">
                      총 {targetSchools.length > 0 ? `${targetSchools.length}개소 관리` : `${processedList.length}건 처리`}
                    </span>
                  </h4>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
                    미제출 기관 독촉, 다른 양식 제출교 재제출 요청, 중복 파일 명단을 분리 확인하고 엑셀 다운로드 및 1초 복사할 수 있습니다.
                  </p>
                </div>

                {/* 탭별 1초 복사 및 엑셀 다운로드 버튼 그룹 */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* 상시 노출 종합 보고서 엑셀 다운로드 버튼 */}
                  <button
                    onClick={handleDownloadReportExcel}
                    className="text-xs sm:text-sm bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 border border-emerald-300 px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    title="미제출·서식오류·정상취합·중복제출 종합 보고서 엑셀(.xlsx)을 다운로드합니다."
                  >
                    <FileSpreadsheet size={15} className="text-emerald-700" />
                    <span>종합보고서 엑셀 다운로드</span>
                  </button>

                  {/* 현재 화면 목록 엑셀 다운로드 (활성화된 탭 + 검색 필터 + 정렬 반영) */}
                  <button
                    onClick={handleDownloadCurrentViewExcel}
                    className="text-xs sm:text-sm bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-800 border border-blue-300 px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    title="현재 보고 계신 탭의 필터·정렬된 목록을 엑셀(.xlsx)로 다운로드합니다 (엑셀 내 자동 필터 화살표 포함)."
                  >
                    <Download size={14} className="text-blue-700" />
                    <span>현재 목록 엑셀</span>
                  </button>

                  {activeReportTab === 'missing' && missingSchools.length > 0 && (
                    <button
                      onClick={copyMissingList}
                      className="text-xs sm:text-sm bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200 px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      {copiedReportType === 'missing' ? (
                        <>
                          <Check size={14} className="text-emerald-600" />
                          <span className="text-emerald-700 font-black">미제출 명단 복사완료!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>미제출 독촉 명단 1초 복사</span>
                        </>
                      )}
                    </button>
                  )}

                  {activeReportTab === 'error' && processedList.some(p => p.status === 'error') && (
                    <button
                      onClick={copyErrorList}
                      className="text-xs sm:text-sm bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-800 border border-amber-300 px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      {copiedReportType === 'error' ? (
                        <>
                          <Check size={14} className="text-emerald-600" />
                          <span className="text-emerald-700 font-black">재제출 명단 복사완료!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>재제출 요청 명단 1초 복사</span>
                        </>
                      )}
                    </button>
                  )}

                  {activeReportTab === 'duplicate' && processedList.some(p => p.status === 'duplicate') && (
                    <button
                      onClick={copyDuplicateList}
                      className="text-xs sm:text-sm bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      {copiedReportType === 'duplicate' ? (
                        <>
                          <Check size={14} className="text-emerald-600" />
                          <span className="text-emerald-700 font-black">중복 명단 복사완료!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>중복 명단 1초 복사</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* 상시 노출 종합 보고서 복사 버튼 */}
                  <button
                    onClick={copySummaryReport}
                    className="text-xs sm:text-sm bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 border border-indigo-200 px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    title="공문/에듀파인 메신저용 종합 보고서를 클립보드에 복사합니다."
                  >
                    {copiedReportType === 'summary' ? (
                      <>
                        <Check size={14} className="text-emerald-600" />
                        <span className="text-emerald-700 font-black">종합 보고서 복사완료!</span>
                      </>
                    ) : (
                      <>
                        <ClipboardList size={14} />
                        <span>종합 보고서 1초 복사</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 스마트 5대 서브 탭 바 */}
              {(() => {
                const errCount = processedList.filter(p => p.status === 'error').length;
                const dupCount = processedList.filter(p => p.status === 'duplicate').length;
                const matchedCount = processedList.filter(p => p.status === 'matched').length;
                const missingCount = missingSchools.length;

                return (
                  <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-xl text-xs sm:text-sm font-bold">
                    <button
                      type="button"
                      onClick={() => setActiveReportTab('missing')}
                      className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeReportTab === 'missing'
                          ? 'bg-white text-rose-700 shadow-xs font-black'
                          : 'text-slate-600 hover:text-rose-700'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${missingCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`} />
                      <span>미제출 기관</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-black ${
                        missingCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {missingCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveReportTab('error')}
                      className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeReportTab === 'error'
                          ? 'bg-white text-rose-800 shadow-xs font-black'
                          : 'text-slate-600 hover:text-rose-700'
                      }`}
                    >
                      <AlertCircle size={14} className={errCount > 0 ? 'text-rose-600' : 'text-slate-400'} />
                      <span>서식오류 / 다른양식 (취합제외)</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-black ${
                        errCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {errCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveReportTab('duplicate')}
                      className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeReportTab === 'duplicate'
                          ? 'bg-white text-amber-700 shadow-xs font-black'
                          : 'text-slate-600 hover:text-amber-700'
                      }`}
                    >
                      <span>중복 제출</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-black ${
                        dupCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {dupCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveReportTab('matched')}
                      className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeReportTab === 'matched'
                          ? 'bg-white text-emerald-700 shadow-xs font-black'
                          : 'text-slate-600 hover:text-emerald-700'
                      }`}
                    >
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span>정상 수합 완료</span>
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-black">
                        {matchedCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveReportTab('all')}
                      className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeReportTab === 'all'
                          ? 'bg-white text-blue-700 shadow-xs font-black'
                          : 'text-slate-600 hover:text-blue-700'
                      }`}
                    >
                      <span>전체 파일 처리 현황</span>
                      <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-black">
                        {processedList.length}
                      </span>
                    </button>
                  </div>
                );
              })()}

              {/* 🔍 실시간 검색 필터 & 정렬 컨트롤 바 */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 sm:p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
                {/* 실시간 옴니 검색창 */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={reportSearchKeyword}
                    onChange={(e) => setReportSearchKeyword(e.target.value)}
                    placeholder="학교명, 파일명, 연번, 오류 사유 등으로 실시간 검색..."
                    className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-8 py-1.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                  />
                  {reportSearchKeyword && (
                    <button
                      onClick={() => setReportSearchKeyword('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
                      title="검색어 지우기"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* 정렬 옵션 & 차순 선택 버튼 그룹 */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0">
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-bold mr-1">
                    <Filter size={13} className="text-slate-400" />
                    <span>정렬:</span>
                  </div>

                  {/* 연번순 */}
                  <button
                    type="button"
                    onClick={() => {
                      if (reportSortField === 'seq') {
                        setReportSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                      } else {
                        setReportSortField('seq');
                        setReportSortOrder('asc');
                      }
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      reportSortField === 'seq'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                    }`}
                    title="연번(기준명부 순번) 기준으로 정렬"
                  >
                    <span>연번순</span>
                    {reportSortField === 'seq' && (
                      reportSortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    )}
                  </button>

                  {/* 학교명순 */}
                  <button
                    type="button"
                    onClick={() => {
                      if (reportSortField === 'name') {
                        setReportSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                      } else {
                        setReportSortField('name');
                        setReportSortOrder('asc');
                      }
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      reportSortField === 'name'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                    }`}
                    title="학교/기관명 가나다순 정렬"
                  >
                    <span>학교명순</span>
                    {reportSortField === 'name' && (
                      reportSortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    )}
                  </button>

                  {/* 파일명순 */}
                  <button
                    type="button"
                    onClick={() => {
                      if (reportSortField === 'filename') {
                        setReportSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                      } else {
                        setReportSortField('filename');
                        setReportSortOrder('asc');
                      }
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      reportSortField === 'filename'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                    }`}
                    title="제출된 원본 파일명 가나다순 정렬"
                  >
                    <span>파일명순</span>
                    {reportSortField === 'filename' && (
                      reportSortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    )}
                  </button>

                  {/* 오름차순/내림차순 토글 */}
                  <button
                    type="button"
                    onClick={() => setReportSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer ml-0.5"
                    title={reportSortOrder === 'asc' ? '현재: 오름차순 (클릭 시 내림차순 전환)' : '현재: 내림차순 (클릭 시 오름차순 전환)'}
                  >
                    <ArrowUpDown size={12} className="text-slate-500" />
                    <span>{reportSortOrder === 'asc' ? '오름차순' : '내림차순'}</span>
                  </button>
                </div>
              </div>

              {/* 탭별 본문 내용: 스크롤바 없이 전체 내용이 시원하게 다 펼쳐짐 (Full Expand) */}
              <div className="min-h-[160px] space-y-3">
                {/* 1. 미제출 탭 */}
                {activeReportTab === 'missing' && (
                  missingSchools.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2 opacity-80" />
                      <span className="text-emerald-700 font-bold block text-base sm:text-lg">모든 대상 학교가 정상 제출되었습니다!</span>
                      <span className="text-xs sm:text-sm text-slate-500">미제출 기관이 0개소입니다.</span>
                    </div>
                  ) : filteredMissing.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <Search size={28} className="mx-auto text-slate-400 mb-2 opacity-60" />
                      <p className="text-sm font-bold text-slate-600">
                        &ldquo;{reportSearchKeyword}&rdquo; 검색어와 일치하는 미제출 기관이 없습니다.
                      </p>
                      <p className="text-xs text-slate-400 mt-1">다른 검색어를 입력하시거나 검색어를 지워보세요.</p>
                      <button
                        onClick={() => setReportSearchKeyword('')}
                        className="mt-3 text-xs bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-100 transition-all cursor-pointer"
                      >
                        검색어 초기화
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-3 sm:p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs sm:text-sm text-rose-900 font-semibold flex items-center justify-between">
                        <span>⚠️ 아래 {filteredMissing.length}개 기관은 아직 서류를 제출하지 않았습니다. 독촉 공문 또는 메신저 쪽지를 발송하세요.</span>
                        <span className="text-xs sm:text-sm text-rose-700 font-black">
                          {reportSearchKeyword ? `검색 ${filteredMissing.length}개소 (전체 ${missingSchools.length}개소)` : `총 ${missingSchools.length}개소`}
                        </span>
                      </div>
                      <div className="divide-y divide-rose-100 bg-rose-50/30 rounded-xl p-2 sm:p-3 border border-rose-100">
                        {filteredMissing.map((s, idx) => (
                          <div key={idx} className="py-3 px-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-rose-100/50 rounded-lg transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="font-black text-rose-800 text-sm sm:text-base w-8 text-right shrink-0">{s.seq}.</span>
                              <span className="font-bold text-slate-900 text-sm sm:text-base">{s.name}</span>
                              {s.code && <span className="text-slate-500 text-xs sm:text-sm font-medium">({s.code})</span>}
                            </div>
                            <span className="bg-rose-100 text-rose-800 border border-rose-200 px-3 py-1 rounded-lg text-xs sm:text-sm font-bold shrink-0">
                              미제출
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}

                {/* 2. 서식오류 / 다른양식 탭 */}
                {activeReportTab === 'error' && (
                  (() => {
                    const errorFiles = processedList.filter(p => p.status === 'error');
                    if (errorFiles.length === 0) {
                      return (
                        <div className="text-center py-12 text-slate-400">
                          <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2 opacity-80" />
                          <span className="text-emerald-700 font-bold block text-base sm:text-lg">서식 오류 파일이 없습니다!</span>
                          <span className="text-xs sm:text-sm text-slate-500">모든 제출 파일이 유효한 서식으로 확인되었습니다.</span>
                        </div>
                      );
                    }
                    if (filteredError.length === 0) {
                      return (
                        <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          <Search size={28} className="mx-auto text-slate-400 mb-2 opacity-60" />
                          <p className="text-sm font-bold text-slate-600">
                            &ldquo;{reportSearchKeyword}&rdquo; 검색어와 일치하는 서식 오류 파일이 없습니다.
                          </p>
                          <p className="text-xs text-slate-400 mt-1">다른 검색어를 입력하시거나 검색어를 지워보세요.</p>
                          <button
                            onClick={() => setReportSearchKeyword('')}
                            className="mt-3 text-xs bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-100 transition-all cursor-pointer"
                          >
                            검색어 초기화
                          </button>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-2">
                        <div className="p-3.5 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
                          ⚠️ 아래 <strong>{filteredError.length}개 파일</strong>은 <strong>아예 다른 양식을 제출했거나 비엑셀(PDF) 등 오류</strong>가 발생하여 <span className="text-rose-700 font-bold underline">취합 데이터에서 자동으로 안전하게 제외</span>되었습니다. 올바른 서식으로 재제출을 요청하세요.
                        </div>
                        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white p-1">
                          {filteredError.map((item, idx) => (
                            <div key={idx} className="py-3.5 px-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-rose-50/50 rounded-lg transition-colors">
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="font-black text-rose-800 text-sm sm:text-base w-8 text-right shrink-0">{item.matchedSeq || idx + 1}.</span>
                                <div className="min-w-0 space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-black text-slate-900 text-sm sm:text-base">{item.schoolName}</span>
                                    <span className="text-slate-500 text-xs sm:text-sm font-medium">({item.name})</span>
                                  </div>
                                  <div className="text-xs sm:text-sm text-rose-600 font-bold flex items-center gap-1.5">
                                    <AlertCircle size={14} className="shrink-0 text-rose-600" />
                                    <span>{item.errorMsg || '서식 불일치 (취합 제외)'}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="shrink-0 flex items-center gap-1.5">
                                <span className="bg-rose-100 text-rose-800 border border-rose-300 px-3 py-1 rounded-lg text-xs sm:text-sm font-black">
                                  {item.errorMsg?.includes('비엑셀') ? '비엑셀(PDF)' : '다른서식 (제외)'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()
                )}

                {/* 3. 중복 제출 탭 */}
                {activeReportTab === 'duplicate' && (
                  (() => {
                    const dupFiles = processedList.filter(p => p.status === 'duplicate');
                    if (dupFiles.length === 0) {
                      return (
                        <div className="text-center py-12 text-slate-400">
                          <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2 opacity-80" />
                          <span className="text-xs sm:text-sm text-slate-500">중복 제출된 파일이 없습니다.</span>
                        </div>
                      );
                    }
                    if (filteredDuplicate.length === 0) {
                      return (
                        <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          <Search size={28} className="mx-auto text-slate-400 mb-2 opacity-60" />
                          <p className="text-sm font-bold text-slate-600">
                            &ldquo;{reportSearchKeyword}&rdquo; 검색어와 일치하는 중복 제출 파일이 없습니다.
                          </p>
                          <p className="text-xs text-slate-400 mt-1">다른 검색어를 입력하시거나 검색어를 지워보세요.</p>
                          <button
                            onClick={() => setReportSearchKeyword('')}
                            className="mt-3 text-xs bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-100 transition-all cursor-pointer"
                          >
                            검색어 초기화
                          </button>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-2">
                        <div className="p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
                          동일 기관에서 중복 제출된 파일 {filteredDuplicate.length}건입니다. 최초로 유효하게 처리된 파일이 취합에 반영되었습니다.
                        </div>
                        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white p-1">
                          {filteredDuplicate.map((item, idx) => (
                            <div key={idx} className="py-3 px-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-amber-50/50 rounded-lg">
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="font-black text-amber-800 text-sm sm:text-base w-8 text-right shrink-0">{item.matchedSeq || idx + 1}.</span>
                                <div className="min-w-0 space-y-0.5">
                                  <span className="font-black text-slate-900 text-sm sm:text-base">{item.schoolName}</span>
                                  <span className="text-slate-500 text-xs sm:text-sm ml-2 font-medium">({item.name})</span>
                                </div>
                              </div>
                              <span className="bg-amber-100 text-amber-900 border border-amber-200 px-3 py-1 rounded-lg text-xs sm:text-sm font-bold shrink-0">
                                중복 (연번 {item.matchedSeq || '-'})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()
                )}

                {/* 4. 정상 수합 완료 탭 */}
                {activeReportTab === 'matched' && (
                  (() => {
                    const matchedFiles = processedList.filter(p => p.status === 'matched');
                    if (matchedFiles.length === 0) {
                      return (
                        <div className="text-center py-12 text-slate-400 text-sm font-medium">
                          정상 수합된 내역이 아직 없습니다.
                        </div>
                      );
                    }
                    if (filteredMatched.length === 0) {
                      return (
                        <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          <Search size={28} className="mx-auto text-slate-400 mb-2 opacity-60" />
                          <p className="text-sm font-bold text-slate-600">
                            &ldquo;{reportSearchKeyword}&rdquo; 검색어와 일치하는 정상 수합 내역이 없습니다.
                          </p>
                          <p className="text-xs text-slate-400 mt-1">다른 검색어를 입력하시거나 검색어를 지워보세요.</p>
                          <button
                            onClick={() => setReportSearchKeyword('')}
                            className="mt-3 text-xs bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-100 transition-all cursor-pointer"
                          >
                            검색어 초기화
                          </button>
                        </div>
                      );
                    }
                    return (
                      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white p-1">
                        {filteredMatched.map((item, idx) => (
                          <div key={idx} className="py-3 px-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-emerald-50/40 rounded-lg">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="font-black text-emerald-800 text-sm sm:text-base w-8 text-right shrink-0">{item.matchedSeq || idx + 1}.</span>
                              <span className="font-bold text-slate-900 text-sm sm:text-base truncate">{item.schoolName}</span>
                              <span className="text-slate-500 text-xs sm:text-sm truncate hidden sm:inline font-medium">({item.name})</span>
                            </div>
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-lg text-xs sm:text-sm font-bold shrink-0">
                              정상 결합
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}

                {/* 5. 전체 보기 탭 */}
                {activeReportTab === 'all' && (
                  (() => {
                    if (processedList.length === 0) {
                      return (
                        <div className="text-center py-12 text-slate-400 text-sm font-medium">
                          처리된 내역이 아직 없습니다.
                        </div>
                      );
                    }
                    if (filteredAll.length === 0) {
                      return (
                        <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          <Search size={28} className="mx-auto text-slate-400 mb-2 opacity-60" />
                          <p className="text-sm font-bold text-slate-600">
                            &ldquo;{reportSearchKeyword}&rdquo; 검색어와 일치하는 항목이 없습니다.
                          </p>
                          <p className="text-xs text-slate-400 mt-1">다른 검색어를 입력하시거나 검색어를 지워보세요.</p>
                          <button
                            onClick={() => setReportSearchKeyword('')}
                            className="mt-3 text-xs bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-100 transition-all cursor-pointer"
                          >
                            검색어 초기화
                          </button>
                        </div>
                      );
                    }
                    return (
                      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white p-1">
                        {filteredAll.map((item, idx) => (
                          <div key={idx} className="py-3 px-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="font-black text-slate-700 text-sm sm:text-base w-8 text-right shrink-0">{item.matchedSeq || idx + 1}.</span>
                              {item.status === 'matched' && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                              {item.status === 'error' && <AlertCircle size={16} className="text-rose-600 shrink-0" />}
                              {item.status === 'duplicate' && <AlertTriangle size={16} className="text-amber-500 shrink-0" />}
                              <span className="font-bold text-slate-900 text-sm sm:text-base truncate">{item.schoolName}</span>
                              <span className="text-slate-500 text-xs sm:text-sm truncate hidden sm:inline font-medium">({item.name})</span>
                            </div>
                            <div className="shrink-0">
                              {item.status === 'matched' && <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-lg text-xs sm:text-sm font-bold">정상</span>}
                              {item.status === 'error' && <span className="bg-rose-100 text-rose-800 border border-rose-200 px-3 py-1 rounded-lg text-xs sm:text-sm font-black">{item.errorMsg || '오류'}</span>}
                              {item.status === 'duplicate' && <span className="bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-lg text-xs sm:text-sm font-bold">중복</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          )}
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
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs shadow-xs shrink-0">
                  <BookOpen size={22} className="text-amber-300" />
                </div>
                <div>
                  <h3 className="font-black text-lg sm:text-xl tracking-tight">
                    AI-SEN 엑셀수합 실무 시뮬레이션 가이드
                  </h3>
                  <p className="text-blue-100 text-xs sm:text-sm mt-0.5 font-medium">
                    실제 행정 실무 진행 순서대로 빠짐없이 정리한 핵심 4단계 가이드
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

            {/* 모달 본문 (실제 실무 순서 4단계 + 사전팁 + 보안) */}
            <div className="p-5 sm:p-6 space-y-3.5 max-h-[72vh] overflow-y-auto text-slate-800">
              
              {/* 사전 준비 팁 (선택) */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3.5">
                <span className="text-xl shrink-0 mt-0.5">💡</span>
                <div className="text-xs sm:text-sm space-y-1">
                  <div className="font-black text-blue-950 flex items-center gap-2">
                    <span>[사전 준비] 자체 학교 기준 명부 등록 (선택 사항)</span>
                    <span className="bg-blue-200/70 text-blue-900 text-[11px] px-2 py-0.5 rounded-md font-bold">브라우저 자동 영구 보관</span>
                  </div>
                  <p className="text-blue-800/90 leading-relaxed font-medium">
                    지원청의 <strong>[학교명 - 연번]</strong> 엑셀이 있다면 <strong>[자체 기준 명부 등록]</strong>에 1회 등록해 두세요. 등록된 학교 순서대로 깔끔하게 자동 정렬되고, 미제출 학교도 1초 만에 자동 파악됩니다. <span className="text-blue-600">(명부가 없어도 제출된 파일 순서대로 자유롭게 자동 수합됩니다)</span>
                  </p>
                </div>
              </div>

              {/* 1단계: 엑셀 파일 일괄 드롭 */}
              <div className="flex items-start gap-3.5 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black text-base sm:text-lg flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  1
                </div>
                <div className="space-y-1 flex-1">
                  <div className="font-black text-slate-900 text-base sm:text-lg flex items-center justify-between">
                    <span>취합할 엑셀 파일 일괄 등록</span>
                    <span className="text-xs text-blue-600 font-bold">마우스 드래그 & 드롭</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    학교들로부터 취합된 수십 개의 엑셀 파일(.xlsx)을 중앙 점선 영역에 한 번에 끌어다 놓습니다. (즉시 유효성 검사 및 실시간 목록 표시)
                  </p>
                </div>
              </div>

              {/* 2단계: 양식 모드 & 헤더 끝 행 지정 */}
              <div className="flex items-start gap-3.5 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-base sm:text-lg flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  2
                </div>
                <div className="space-y-2 flex-1">
                  <div className="font-black text-slate-900 text-base sm:text-lg flex items-center justify-between">
                    <span>양식 모드 선택 & 헤더 끝 행 확인 (★ 핵심)</span>
                    <span className="text-xs text-indigo-600 font-bold">1초 확인</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-white border border-indigo-100 rounded-xl p-2.5">
                      <strong className="text-indigo-950 block mb-0.5 font-black">🥞 서식 블록형</strong>
                      <span className="text-slate-600">학교당 여러 줄 복합 서식/수식 (급식비, 인건비, 목적사업비)</span>
                    </div>
                    <div className="bg-white border border-indigo-100 rounded-xl p-2.5">
                      <strong className="text-indigo-950 block mb-0.5 font-black">📄 단순 목록형</strong>
                      <span className="text-slate-600">학교당 1줄씩 나열되는 명부 (수요조사, 비품 실태조사)</span>
                    </div>
                  </div>
                  {/* 헤더 끝 행 지정 방법 상세 안내 */}
                  <div className="bg-indigo-50/80 border border-indigo-200/90 rounded-xl p-3 text-xs space-y-1.5">
                    <div className="font-black text-indigo-950 flex items-center gap-1.5">
                      <span className="text-indigo-600">🎯</span>
                      <span>[헤더 끝 행]이란 무엇이고 어떻게 지정하나요?</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-indigo-900/90 leading-relaxed font-medium">
                      <li>
                        <strong>역할:</strong> 표의 제목/항목명(연번, 학교명, 신청금액 등)이 끝나는 <strong>마지막 행 번호</strong>입니다. 이 행 바로 다음 줄부터 실제 각 학교의 데이터(본문)가 합쳐집니다.
                      </li>
                      <li>
                        <strong>지정 방법:</strong> 파일 등록 시 프로그램이 <strong>파란색 음영으로 자동 감지</strong>합니다. 만약 실제 표 제목과 다를 경우, 아래 <strong>[시트 뷰어 표]에서 표 제목의 마지막 행을 마우스로 &lsquo;콕&rsquo; 클릭</strong>하시면 1초 만에 즉시 수정됩니다.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 3단계: 수합 실행 */}
              <div className="flex items-start gap-3.5 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-base sm:text-lg flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  3
                </div>
                <div className="space-y-1 flex-1">
                  <div className="font-black text-slate-900 text-base sm:text-lg flex items-center justify-between">
                    <span>🚀 [수합 실행] 클릭</span>
                    <span className="text-xs text-emerald-600 font-bold">0.5초 고속 연산</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    클릭 즉시 모든 학교 파일의 서식과 수식을 100% 온전하게 보존한 <strong>[취합 마스터 엑셀]</strong>이 고속 생성됩니다.
                  </p>
                  <p className="text-xs text-emerald-700 font-medium">
                    🟢 정상 제출 및 🔴 미제출 학교가 5대 신호등으로 즉시 자동 분류되며, <strong>[📋 미제출 독촉 명단 1초 복사]</strong>가 가능합니다.
                  </p>
                </div>
              </div>

              {/* 4단계: 결과 확인 및 엑셀 다운로드 */}
              <div className="flex items-start gap-3.5 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
                <div className="w-10 h-10 rounded-2xl bg-blue-700 text-white font-black text-base sm:text-lg flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  4
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="font-black text-slate-900 text-base sm:text-lg flex items-center justify-between">
                    <span>결과 확인 및 엑셀 다운로드</span>
                    <span className="text-xs text-blue-700 font-bold">원클릭 저장</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                      <strong className="text-slate-900 block mb-0.5 font-black">📥 마스터 엑셀 다운로드</strong>
                      <span className="text-slate-600">모든 학교의 서식·수식·셀병합이 100% 보존된 최종 취합본</span>
                    </div>
                    <div className="bg-white border border-blue-200 rounded-xl p-2.5">
                      <strong className="text-blue-900 block mb-0.5 font-black">📊 종합보고서 / 현재 목록 엑셀</strong>
                      <span className="text-blue-800">정상, 미제출, 오류, 중복 현황이 엑셀 필터와 함께 정리된 보고서</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 하단 100% 로컬 보안 안내 */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3">
                <ShieldCheck size={22} className="text-emerald-600 shrink-0" />
                <div className="text-xs sm:text-sm">
                  <span className="font-black text-emerald-950 block">100% 로컬 브라우저 보안 (서버 유출 0%)</span>
                  <span className="text-emerald-800 font-medium">모든 취합 연산은 담당자 PC 메모리 안에서만 처리되며, 외부 서버로 단 1바이트도 전송되지 않습니다.</span>
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
