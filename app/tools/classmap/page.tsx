'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Grid, 
  Plus, 
  Trash2, 
  Printer, 
  Download, 
  Upload, 
  ArrowLeft, 
  CheckCircle2, 
  Edit3, 
  Layers, 
  School,
  Building,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';

interface Room {
  id: string; // "buildingId-floor-roomNum"
  name: string;
  subName?: string;
  color: string;
  isSpecial?: boolean;
}

interface BuildingData {
  id: string;
  name: string;
  floors: number;
  roomsPerFloor: number;
  rooms: Record<string, Room>;
}

const COLOR_PALETTE = [
  { name: '기본 (하양)', bg: 'bg-white', text: 'text-slate-900', border: 'border-slate-300', hex: '#ffffff' },
  { name: '1학년 (노랑)', bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300', hex: '#fef3c7' },
  { name: '2학년 (주황)', bg: 'bg-orange-100', text: 'text-orange-900', border: 'border-orange-300', hex: '#ffedd5' },
  { name: '3학년 (초록)', bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300', hex: '#d1fae5' },
  { name: '4학년 (하늘)', bg: 'bg-sky-100', text: 'text-sky-900', border: 'border-sky-300', hex: '#e0f2fe' },
  { name: '5학년 (파랑)', bg: 'bg-blue-100', text: 'text-blue-900', border: 'border-blue-300', hex: '#dbeafe' },
  { name: '6학년 (보라)', bg: 'bg-purple-100', text: 'text-purple-900', border: 'border-purple-300', hex: '#f3e8ff' },
  { name: '교무/행정 (분홍)', bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-300', hex: '#ffe4e6' },
  { name: '특별실 (청록)', bg: 'bg-teal-100', text: 'text-teal-900', border: 'border-teal-300', hex: '#ccfbf1' },
];

export default function ClassmapPage() {
  const [schoolName, setSchoolName] = useState<string>('서울행정초등학교 교실 배치도');
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [buildings, setBuildings] = useState<BuildingData[]>([]);
  const [activeBuildingId, setActiveBuildingId] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(100);

  // 모달 상태
  const [isAddBuildingModalOpen, setIsAddBuildingModalOpen] = useState(false);
  const [newBuildingName, setNewBuildingName] = useState('본관');
  const [newFloors, setNewFloors] = useState(4);
  const [newRoomsPerFloor, setNewRoomsPerFloor] = useState(6);

  // 선택된 교실 편집 폼
  const [editRoomName, setEditRoomName] = useState('');
  const [editRoomSub, setEditRoomSub] = useState('');
  const [editRoomColor, setEditRoomColor] = useState('#ffffff');

  // 초기 샘플 데이터 로드
  useEffect(() => {
    const saved = localStorage.getItem('sen-classmap-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBuildings(parsed.buildings || []);
        if (parsed.schoolName) setSchoolName(parsed.schoolName);
        if (parsed.buildings?.length > 0) setActiveBuildingId(parsed.buildings[0].id);
        return;
      } catch (e) {}
    }

    // 기본 본관 생성
    const defaultBuilding: BuildingData = {
      id: 'main-building',
      name: '본관',
      floors: 4,
      roomsPerFloor: 6,
      rooms: {
        'main-building-4-1': { id: 'main-building-4-1', name: '6-1', subName: '담임 김철수', color: '#f3e8ff' },
        'main-building-4-2': { id: 'main-building-4-2', name: '6-2', subName: '담임 이영희', color: '#f3e8ff' },
        'main-building-4-3': { id: 'main-building-4-3', name: '6-3', subName: '담임 박민수', color: '#f3e8ff' },
        'main-building-4-4': { id: 'main-building-4-4', name: '음악실', subName: '특별실', color: '#ccfbf1' },
        'main-building-4-5': { id: 'main-building-4-5', name: '미술실', subName: '특별실', color: '#ccfbf1' },
        'main-building-4-6': { id: 'main-building-4-6', name: '연구실', subName: '교원연구실', color: '#ffe4e6' },

        'main-building-3-1': { id: 'main-building-3-1', name: '5-1', subName: '담임 최동욱', color: '#dbeafe' },
        'main-building-3-2': { id: 'main-building-3-2', name: '5-2', subName: '담임 정유진', color: '#dbeafe' },
        'main-building-3-3': { id: 'main-building-3-3', name: '5-3', subName: '담임 강하늘', color: '#dbeafe' },
        'main-building-3-4': { id: 'main-building-3-4', name: '4-1', subName: '담임 송지효', color: '#e0f2fe' },
        'main-building-3-5': { id: 'main-building-3-5', name: '4-2', subName: '담임 유재석', color: '#e0f2fe' },
        'main-building-3-6': { id: 'main-building-3-6', name: '컴퓨터실', subName: '정보관', color: '#ccfbf1' },

        'main-building-2-1': { id: 'main-building-2-1', name: '3-1', subName: '담임 지석진', color: '#d1fae5' },
        'main-building-2-2': { id: 'main-building-2-2', name: '3-2', subName: '담임 하동훈', color: '#d1fae5' },
        'main-building-2-3': { id: 'main-building-2-3', name: '2-1', subName: '담임 양세찬', color: '#ffedd5' },
        'main-building-2-4': { id: 'main-building-2-4', name: '2-2', subName: '담임 전소민', color: '#ffedd5' },
        'main-building-2-5': { id: 'main-building-2-5', name: '교무실', subName: '교무기획부', color: '#ffe4e6' },
        'main-building-2-6': { id: 'main-building-2-6', name: '교장실', subName: '학교장실', color: '#ffe4e6' },

        'main-building-1-1': { id: 'main-building-1-1', name: '1-1', subName: '담임 김종국', color: '#fef3c7' },
        'main-building-1-2': { id: 'main-building-1-2', name: '1-2', subName: '담임 이미주', color: '#fef3c7' },
        'main-building-1-3': { id: 'main-building-1-3', name: '돌봄교실', subName: '초등돌봄1반', color: '#fef3c7' },
        'main-building-1-4': { id: 'main-building-1-4', name: '행정실', subName: '교육행정실', color: '#ffe4e6' },
        'main-building-1-5': { id: 'main-building-1-5', name: '보건실', subName: '보건교사실', color: '#ccfbf1' },
        'main-building-1-6': { id: 'main-building-1-6', name: '방송실', subName: '스튜디오', color: '#ffe4e6' },
      }
    };

    setBuildings([defaultBuilding]);
    setActiveBuildingId('main-building');
  }, []);

  // 로컬 저장
  const saveToStorage = (updatedBuildings: BuildingData[], title = schoolName) => {
    localStorage.setItem('sen-classmap-data', JSON.stringify({
      schoolName: title,
      buildings: updatedBuildings
    }));
  };

  // 건물 추가
  const handleAddBuilding = () => {
    if (!newBuildingName.trim()) return;
    const bId = 'b-' + Date.now();
    const newB: BuildingData = {
      id: bId,
      name: newBuildingName.trim(),
      floors: Number(newFloors) || 3,
      roomsPerFloor: Number(newRoomsPerFloor) || 5,
      rooms: {}
    };

    const updated = [...buildings, newB];
    setBuildings(updated);
    setActiveBuildingId(bId);
    saveToStorage(updated);
    setIsAddBuildingModalOpen(false);
    setNewBuildingName('');
  };

  // 건물 삭제
  const handleDeleteBuilding = (id: string) => {
    if (buildings.length <= 1) {
      alert('최소 1개의 건물은 유지해야 합니다.');
      return;
    }
    if (!confirm('정말 이 건물을 삭제하시겠습니까?')) return;
    const updated = buildings.filter(b => b.id !== id);
    setBuildings(updated);
    setActiveBuildingId(updated[0].id);
    saveToStorage(updated);
  };

  // 교실 선택 및 편집
  const handleSelectRoom = (rId: string, currentRoom?: Room) => {
    setSelectedRoomId(rId);
    if (currentRoom) {
      setEditRoomName(currentRoom.name);
      setEditRoomSub(currentRoom.subName || '');
      setEditRoomColor(currentRoom.color || '#ffffff');
    } else {
      setEditRoomName('');
      setEditRoomSub('');
      setEditRoomColor('#ffffff');
    }
  };

  // 교실 정보 저장
  const handleSaveRoom = () => {
    if (!selectedRoomId || !activeBuildingId) return;

    const updated = buildings.map(b => {
      if (b.id === activeBuildingId) {
        const newRooms = { ...b.rooms };
        if (editRoomName.trim()) {
          newRooms[selectedRoomId] = {
            id: selectedRoomId,
            name: editRoomName.trim(),
            subName: editRoomSub.trim(),
            color: editRoomColor
          };
        } else {
          delete newRooms[selectedRoomId];
        }
        return { ...b, rooms: newRooms };
      }
      return b;
    });

    setBuildings(updated);
    saveToStorage(updated);
    setSelectedRoomId(null);
  };

  // JSON 백업 다운로드
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      schoolName,
      buildings
    }, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `교실배치도_${schoolName}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // JSON 복원 업로드
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.buildings) {
          setBuildings(parsed.buildings);
          if (parsed.schoolName) setSchoolName(parsed.schoolName);
          if (parsed.buildings.length > 0) setActiveBuildingId(parsed.buildings[0].id);
          saveToStorage(parsed.buildings, parsed.schoolName);
          alert('배치도 데이터를 성공적으로 불러왔습니다!');
        }
      } catch (err) {
        alert('올바른 배치도 JSON 파일이 아닙니다.');
      }
    };
    reader.readAsText(file);
  };

  const activeBuilding = buildings.find(b => b.id === activeBuildingId) || buildings[0];

  return (
    <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
      
      {/* 인쇄용 전용 스타일 */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #classmap-print-area, #classmap-print-area * {
            visibility: visible;
          }
          #classmap-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
            padding: 10px !important;
            background: #fff !important;
          }
        }
      `}</style>

      {/* 상단 네비게이션 & 헤더 */}
      <div className="flex flex-col gap-2.5 print:hidden">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          <span>메인 포털로 돌아가기</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100">
              <Grid size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {isEditingTitle ? (
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="text" 
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      onBlur={() => { setIsEditingTitle(false); saveToStorage(buildings, schoolName); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { setIsEditingTitle(false); saveToStorage(buildings, schoolName); } }}
                      autoFocus
                      className="text-xl sm:text-2xl font-black px-2 py-0.5 border-2 border-cyan-500 rounded-lg focus:outline-none"
                    />
                  </div>
                ) : (
                  <h1 
                    onClick={() => setIsEditingTitle(true)}
                    className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight cursor-pointer hover:text-cyan-600 flex items-center gap-2 group"
                    title="클릭하여 학교명 수정"
                  >
                    <span>{schoolName}</span>
                    <Edit3 size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h1>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">층별·호수별 교실 격자 배치, 특별실 지정, 색상 시각화 및 원클릭 도면 인쇄</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="btn-primary py-2 px-4 text-xs font-bold bg-cyan-600 hover:bg-cyan-700 shadow-sm flex items-center gap-1.5"
            >
              <Printer size={15} />
              <span>A4 도면 인쇄</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="btn-secondary py-2 px-3 text-xs font-semibold flex items-center gap-1.5"
              title="데이터 백업"
            >
              <Download size={14} />
              <span>내보내기</span>
            </button>
            <label className="btn-secondary py-2 px-3 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              <Upload size={14} />
              <span>불러오기</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* 작업 영역 레이아웃: (좌측 건물 탭) + (중앙 도면 캔버스) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* 좌측 건물 목록 탭 (3열) */}
        <div className="lg:col-span-3 flex flex-col gap-3 print:hidden">
          <div className="glass-card p-4 flex flex-col gap-3 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Building size={15} className="text-cyan-600" />
                <span>건물 목록</span>
              </span>
              <button
                onClick={() => setIsAddBuildingModalOpen(true)}
                className="btn-secondary py-1 px-2 text-[11px] font-bold text-cyan-700 border-cyan-200 hover:bg-cyan-50 flex items-center gap-1"
              >
                <Plus size={12} />
                <span>건물 추가</span>
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              {buildings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setActiveBuildingId(b.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    activeBuildingId === b.id
                      ? 'border-cyan-500 bg-cyan-50/60 font-bold text-slate-900 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-[13px]">{b.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{b.floors}층 (층당 {b.roomsPerFloor}실)</span>
                  </div>

                  {buildings.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBuilding(b.id);
                      }}
                      className="p-1 text-slate-300 hover:text-red-600 rounded hover:bg-red-50"
                      title="건물 삭제"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 범례 카드 */}
          <div className="glass-card p-4 flex flex-col gap-2.5 bg-white">
            <span className="text-xs font-bold text-slate-700">🎨 색상 범례 가이드</span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {COLOR_PALETTE.slice(1).map((p, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded border border-slate-300 shrink-0" style={{ backgroundColor: p.hex }}></span>
                  <span className="text-slate-600 truncate">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 중앙 교실 도면 캔버스 (9열) */}
        <div id="classmap-print-area" className="lg:col-span-9 flex flex-col gap-4">
          
          <div className="glass-card p-5 sm:p-6 flex flex-col gap-4 bg-white border border-slate-200 shadow-sm">
            
            {/* 캔버스 툴바 (화면 전용) */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  🏛️ {activeBuilding?.name} 교실 배치 현황
                </span>
                <span className="text-xs text-slate-400">(칸을 클릭하여 교실명·색상 수정)</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoomScale(prev => Math.max(70, prev - 10))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  title="축소"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="text-xs font-semibold px-1 text-slate-500">{zoomScale}%</span>
                <button
                  onClick={() => setZoomScale(prev => Math.min(130, prev + 10))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  title="확대"
                >
                  <ZoomIn size={14} />
                </button>
              </div>
            </div>

            {/* 건물 도면 그리드 (위층부터 아래층 순서로 렌더링) */}
            <div 
              className="flex flex-col gap-3 overflow-x-auto p-2"
              style={{ transform: `scale(${zoomScale / 100})`, transformOrigin: 'top left' }}
            >
              {activeBuilding && Array.from({ length: activeBuilding.floors }, (_, i) => activeBuilding.floors - i).map((floor) => (
                <div key={floor} className="flex items-center gap-3">
                  
                  {/* 층수 헤더 */}
                  <div className="w-14 h-18 rounded-xl bg-slate-900 text-white font-black text-sm flex flex-col items-center justify-center shrink-0 shadow-2xs">
                    <span>{floor}F</span>
                    <span className="text-[10px] font-normal text-slate-300">{floor}층</span>
                  </div>

                  {/* 해당 층 교실 행 */}
                  <div className="flex items-center gap-2.5 flex-1">
                    {Array.from({ length: activeBuilding.roomsPerFloor }, (_, rIdx) => {
                      const roomNum = rIdx + 1;
                      const rId = `${activeBuilding.id}-${floor}-${roomNum}`;
                      const roomData = activeBuilding.rooms[rId];

                      return (
                        <div
                          key={roomNum}
                          onClick={() => handleSelectRoom(rId, roomData)}
                          className={`flex-1 min-w-[100px] h-20 rounded-xl border-2 p-2 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${
                            selectedRoomId === rId ? 'ring-3 ring-cyan-500 border-cyan-600' : 'border-slate-300'
                          }`}
                          style={{ backgroundColor: roomData?.color || '#ffffff' }}
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                            <span>{floor}0{roomNum}</span>
                            {roomData?.isSpecial && <span className="text-teal-700">★</span>}
                          </div>

                          <div className="flex flex-col text-center">
                            <span className="font-black text-sm text-slate-900 truncate">
                              {roomData?.name || <span className="text-slate-300 font-normal text-xs">빈 교실</span>}
                            </span>
                            {roomData?.subName && (
                              <span className="text-[11px] font-medium text-slate-600 truncate mt-0.5">
                                {roomData.subName}
                              </span>
                            )}
                          </div>

                          <div className="h-1"></div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

      {/* 교실 편집 모달 */}
      {selectedRoomId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="glass-card p-6 bg-white max-w-[420px] w-full flex flex-col gap-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">교실 정보 수정</h3>
              <button 
                onClick={() => setSelectedRoomId(null)}
                className="text-slate-400 hover:text-slate-700 text-sm"
              >
                닫기
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">교실명 (예: 1-1, 교무실, 음악실)</label>
                <input 
                  type="text" 
                  value={editRoomName}
                  onChange={(e) => setEditRoomName(e.target.value)}
                  placeholder="교실명을 입력하세요"
                  className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">보조 정보 (담임교사명, 용도 등)</label>
                <input 
                  type="text" 
                  value={editRoomSub}
                  onChange={(e) => setEditRoomSub(e.target.value)}
                  placeholder="예: 담임 홍길동, 특별활동실"
                  className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700">배경 색상 선택</label>
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_PALETTE.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditRoomColor(p.hex)}
                      className={`h-8 rounded-lg border-2 transition-all ${
                        editRoomColor === p.hex ? 'border-cyan-600 scale-105 shadow-2xs' : 'border-slate-300'
                      }`}
                      style={{ backgroundColor: p.hex }}
                      title={p.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedRoomId(null)}
                className="btn-secondary py-2 px-4 text-xs font-semibold"
              >
                취소
              </button>
              <button
                onClick={handleSaveRoom}
                className="btn-primary py-2 px-5 text-xs font-bold bg-cyan-600 hover:bg-cyan-700"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 건물 추가 모달 */}
      {isAddBuildingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="glass-card p-6 bg-white max-w-[380px] w-full flex flex-col gap-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">새 건물 추가</h3>
              <button onClick={() => setIsAddBuildingModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-sm">닫기</button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">건물 이름</label>
                <input 
                  type="text" 
                  value={newBuildingName}
                  onChange={(e) => setNewBuildingName(e.target.value)}
                  placeholder="예: 신관, 별관, 체육관동"
                  className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">층수</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={newFloors}
                    onChange={(e) => setNewFloors(Number(e.target.value))}
                    className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">층당 교실 수</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="12" 
                    value={newRoomsPerFloor}
                    onChange={(e) => setNewRoomsPerFloor(Number(e.target.value))}
                    className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setIsAddBuildingModalOpen(false)} className="btn-secondary py-2 px-4 text-xs font-semibold">취소</button>
              <button onClick={handleAddBuilding} className="btn-primary py-2 px-5 text-xs font-bold bg-cyan-600 hover:bg-cyan-700">추가하기</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
