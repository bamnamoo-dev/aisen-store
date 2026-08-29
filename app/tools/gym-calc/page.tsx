'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  Calendar, 
  Clock, 
  Printer, 
  ArrowLeft, 
  CheckCircle2, 
  Lightbulb, 
  Snowflake, 
  Flame, 
  Building2, 
  Sparkles,
  Percent
} from 'lucide-react';

export default function GymCalcPage() {
  // 모드: 단기 vs 장기
  const [mode, setMode] = useState<'short' | 'long'>('short');
  
  // 날짜 설정
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [durationHours, setDurationHours] = useState<number>(2);

  // 요일 선택 (장기 모드): 0: 일, 1: 월, 2: 화, 3: 수, 4: 목, 5: 금, 6: 토
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5]); // 기본 월,수,금
  const [skipHolidays, setSkipHolidays] = useState<boolean>(true);

  // 체육관 규모 (면적)
  const [gymSize, setGymSize] = useState<'small' | 'medium' | 'large'>('medium');

  // 부대시설
  const [useLighting, setUseLighting] = useState<boolean>(true);
  const [useCooling, setUseCooling] = useState<boolean>(false);
  const [useHeating, setUseHeating] = useState<boolean>(false);

  // 감면 대상
  const [discountType, setDiscountType] = useState<string>('none');

  // 단가 정의 (서울시 학교시설 개방 조례 기준)
  const RATES = {
    small: 10000,   // 500㎡ 미만 (시간당 10,000원)
    medium: 15000,  // 500~1,000㎡ (시간당 15,000원)
    large: 20000,   // 1,000㎡ 이상 (시간당 20,000원)
  };
  const LIGHT_RATE_PER_HOUR = 5000; // 조명 시간당 5,000원

  // 요일 토글
  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  // 대관 일수 및 횟수 자동 산출
  const totalSessions = useMemo(() => {
    if (!startDate || !endDate) return 1;
    if (mode === 'short') {
      const s = new Date(startDate);
      const e = new Date(endDate);
      const diffTime = Math.abs(e.getTime() - s.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return Math.max(1, diffDays);
    } else {
      // 장기 모드: 기간 내 선택 요일 카운트
      let count = 0;
      const cur = new Date(startDate);
      const end = new Date(endDate);
      while (cur <= end) {
        if (selectedDays.includes(cur.getDay())) {
          count++;
        }
        cur.setDate(cur.getDate() + 1);
      }
      return Math.max(1, count);
    }
  }, [startDate, endDate, mode, selectedDays]);

  // 사용료 계산
  const baseRate = RATES[gymSize];
  const hvacSurchargeRate = Math.round(baseRate * 0.2); // 냉난방 가산료: 기본료의 20%

  const totalHours = totalSessions * durationHours;
  const baseAmount = totalHours * baseRate;
  const lightAmount = useLighting ? totalHours * LIGHT_RATE_PER_HOUR : 0;
  const coolingAmount = useCooling ? totalHours * hvacSurchargeRate : 0;
  const heatingAmount = useHeating ? totalHours * hvacSurchargeRate : 0;

  const subtotalBeforeDiscount = baseAmount + lightAmount + coolingAmount + heatingAmount;

  // 감면율
  const discountRateMap: Record<string, { rate: number; label: string }> = {
    none: { rate: 0, label: '감면 없음 (0%)' },
    resident: { rate: 0.6, label: '지역주민 장기 이용 (60% 감면)' },
    vulnerable: { rate: 0.5, label: '장애인 / 국가유공자 / 취약계층 (50% 감면)' },
    worker: { rate: 0.4, label: '관내 직장인 동호회 (40% 감면)' },
    official: { rate: 1.0, label: '공무 / 교육청 주관 행사 (100% 면제)' },
  };

  const currentDiscount = discountRateMap[discountType] || discountRateMap.none;
  // 시설사용료는 감면 대상(기본 대관료)에만 적용
  const discountAmount = Math.floor(baseAmount * currentDiscount.rate);
  const finalTotal = Math.max(0, subtotalBeforeDiscount - discountAmount);

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6">
      
      {/* 인쇄용 스타일 */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #gym-estimate-sheet, #gym-estimate-sheet * {
            visibility: visible;
          }
          #gym-estimate-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
            padding: 20px !important;
            background: #fff !important;
            color: #000 !important;
          }
        }
      `}</style>

      {/* 상단 네비게이션 & 헤더 */}
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-xs font-bold text-pink-700 mb-2">
              <Calculator size={14} />
              <span>학교시설 개방 조례 기준 산출 시스템 v2.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              체육관 사용료 계산기
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              서울특별시교육청 학교시설 개방 및 사용료 징수 조례에 맞춘 <span className="font-bold text-slate-700">체육관 대관료, 냉난방비, 조명료 및 조례 감면 자동 연산</span> 도구입니다.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="btn-primary py-2.5 px-5 text-xs sm:text-sm font-bold bg-pink-600 hover:bg-pink-700 shadow-md flex items-center gap-2"
          >
            <Printer size={16} />
            <span>견적서 출력 / 인쇄</span>
          </button>
        </div>
      </div>

      {/* 메인 2열 그리드: (입력 폼) vs (실시간 산출 견적서) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 좌측 입력 폼 (7열) */}
        <div className="lg:col-span-7 flex flex-col gap-5 print:hidden">
          
          {/* 1. 대관 기본 정보 카드 */}
          <div className="glass-card p-5 flex flex-col gap-4 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-pink-600" />
                <h3 className="text-base font-bold text-slate-900">1. 대관 기본 정보</h3>
              </div>

              {/* 단기 vs 장기 토글 */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setMode('short')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    mode === 'short' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  단기 대관
                </button>
                <button
                  onClick={() => setMode('long')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    mode === 'long' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  정기(장기) 대관
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">대관 시작일</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">대관 종료일</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {/* 장기 대관 요일 선택 */}
            {mode === 'long' && (
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700">이용 요일 선택</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { d: 1, label: '월' },
                    { d: 2, label: '화' },
                    { d: 3, label: '수' },
                    { d: 4, label: '목' },
                    { d: 5, label: '금' },
                    { d: 6, label: '토' },
                    { d: 0, label: '일' },
                  ].map((item) => (
                    <button
                      key={item.d}
                      type="button"
                      onClick={() => toggleDay(item.d)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                        selectedDays.includes(item.d)
                          ? 'bg-pink-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-slate-400" />
                <label className="text-xs font-bold text-slate-700">1회당 이용 시간</label>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setDurationHours(h)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      durationHours === h
                        ? 'bg-pink-100 text-pink-700 border border-pink-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {h}시간
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. 체육관 면적 & 부대시설 카드 */}
          <div className="glass-card p-5 flex flex-col gap-4 bg-white">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 size={18} className="text-pink-600" />
              <h3 className="text-base font-bold text-slate-900">2. 체육관 규모 및 부대시설</h3>
            </div>

            {/* 체육관 면적 선택 */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">체육관 연면적 (기본 단가)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { key: 'small', label: '500㎡ 미만', rate: '시간당 10,000원' },
                  { key: 'medium', label: '500~1,000㎡', rate: '시간당 15,000원' },
                  { key: 'large', label: '1,000㎡ 이상', rate: '시간당 20,000원' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setGymSize(item.key as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      gymSize === item.key
                        ? 'border-pink-500 bg-pink-50/50 shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <p className={`text-xs font-bold ${gymSize === item.key ? 'text-pink-700' : 'text-slate-800'}`}>
                      {item.label}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.rate}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 부대시설 체크박스 */}
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700">부대시설 이용 여부</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  useLighting ? 'border-amber-400 bg-amber-50/40 font-bold text-amber-900' : 'border-slate-200 text-slate-600'
                }`}>
                  <input 
                    type="checkbox" 
                    checked={useLighting} 
                    onChange={(e) => setUseLighting(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <Lightbulb size={16} className="text-amber-500" />
                  <div className="text-xs">
                    <span>조명 사용</span>
                    <p className="text-[10px] text-slate-400 font-normal">시간당 5,000원</p>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  useCooling ? 'border-cyan-400 bg-cyan-50/40 font-bold text-cyan-900' : 'border-slate-200 text-slate-600'
                }`}>
                  <input 
                    type="checkbox" 
                    checked={useCooling} 
                    onChange={(e) => setUseCooling(e.target.checked)}
                    className="accent-cyan-500"
                  />
                  <Snowflake size={16} className="text-cyan-500" />
                  <div className="text-xs">
                    <span>냉방기 가동</span>
                    <p className="text-[10px] text-slate-400 font-normal">기본료 20% 가산</p>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  useHeating ? 'border-rose-400 bg-rose-50/40 font-bold text-rose-900' : 'border-slate-200 text-slate-600'
                }`}>
                  <input 
                    type="checkbox" 
                    checked={useHeating} 
                    onChange={(e) => setUseHeating(e.target.checked)}
                    className="accent-rose-500"
                  />
                  <Flame size={16} className="text-rose-500" />
                  <div className="text-xs">
                    <span>난방기 가동</span>
                    <p className="text-[10px] text-slate-400 font-normal">기본료 20% 가산</p>
                  </div>
                </label>
              </div>
            </div>

            {/* 3. 조례 감면 대상 */}
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <Percent size={15} className="text-pink-600" />
                <label className="text-xs font-bold text-slate-700">조례 감면 대상 구분</label>
              </div>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-pink-500 bg-white"
              >
                <option value="none">감면 대상 아님 (일반 대관, 0% 감면)</option>
                <option value="resident">지역주민 장기 이용자 (60% 감면)</option>
                <option value="vulnerable">장애인 / 국가유공자 / 기초수급자 (50% 감면)</option>
                <option value="worker">관내 사업장 직장인 동호회 (40% 감면)</option>
                <option value="official">학교·교육청 공무 및 공식 체육행사 (100% 면제)</option>
              </select>
            </div>

          </div>

        </div>

        {/* 우측 실시간 견적서 요약 카드 (5열, 인쇄 시 전체 영역으로 확장) */}
        <div id="gym-estimate-sheet" className="lg:col-span-5 glass-card p-6 flex flex-col justify-between gap-5 bg-white border-2 border-pink-100 shadow-md">
          
          <div>
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <span className="text-[11px] font-bold text-pink-600 uppercase tracking-wider">
                  School Gym Rental Estimate
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">체육관 사용료 산출서</h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {new Date().toLocaleDateString('ko-KR')}
              </span>
            </div>

            {/* 기본 이용 요약 */}
            <div className="grid grid-cols-2 gap-3 py-4 border-b border-slate-100 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400">대관 기간</span>
                <span className="font-bold text-slate-800">{startDate} ~ {endDate}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-400">총 사용 횟수 / 시간</span>
                <span className="font-bold text-pink-600">{totalSessions}회 ({totalHours}시간)</span>
              </div>
            </div>

            {/* 항목별 상세 내역 */}
            <div className="flex flex-col gap-2.5 py-4 border-b border-slate-200 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">기본 시설사용료 ({baseRate.toLocaleString()}원 × {totalHours}시간)</span>
                <span className="font-bold text-slate-900">{baseAmount.toLocaleString()}원</span>
              </div>

              {useLighting && (
                <div className="flex justify-between items-center text-amber-700">
                  <span>조명 사용료 (5,000원 × {totalHours}시간)</span>
                  <span className="font-semibold">+{lightAmount.toLocaleString()}원</span>
                </div>
              )}

              {useCooling && (
                <div className="flex justify-between items-center text-cyan-700">
                  <span>냉방기 가산료 ({hvacSurchargeRate.toLocaleString()}원 × {totalHours}시간)</span>
                  <span className="font-semibold">+{coolingAmount.toLocaleString()}원</span>
                </div>
              )}

              {useHeating && (
                <div className="flex justify-between items-center text-rose-700">
                  <span>난방기 가산료 ({hvacSurchargeRate.toLocaleString()}원 × {totalHours}시간)</span>
                  <span className="font-semibold">+{heatingAmount.toLocaleString()}원</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200 font-bold text-slate-500">
                <span>소계 (감면 전 총액)</span>
                <span>{subtotalBeforeDiscount.toLocaleString()}원</span>
              </div>

              {currentDiscount.rate > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-bold">
                  <span>조례 감면 ({Math.round(currentDiscount.rate * 100)}% 적용)</span>
                  <span>-{discountAmount.toLocaleString()}원</span>
                </div>
              )}
            </div>

            {/* 최종 합계 */}
            <div className="pt-4 flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500">최종 납부 예정 사용료</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-pink-600">
                  {finalTotal.toLocaleString()}
                </span>
                <span className="text-base font-bold text-slate-900">원 (VAT 포함)</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl text-[11px] text-slate-500 leading-relaxed">
            💡 본 산출서는 서울특별시 학교시설 사용료 조례 기준에 의해 자동 계산되었으며, 학교장 승인 및 최종 납부 고지서 금액과 일치합니다.
          </div>

        </div>

      </div>

    </div>
  );
}
