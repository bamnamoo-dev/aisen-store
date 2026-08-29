'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Trophy, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  HelpCircle, 
  Sparkles,
  EyeOff,
  Flame,
  Award,
  Crown
} from 'lucide-react';
import Script from 'next/script';
import { supabase } from '@/lib/supabase';

// 과일 정의 (크기, 점수, 색상, 이모지)
const FRUITS = [
  { name: '체리', radius: 16, score: 2, color: '#f43f5e', emoji: '🍒' },
  { name: '딸기', radius: 24, score: 4, color: '#ef4444', emoji: '🍓' },
  { name: '포도', radius: 32, score: 8, color: '#8b5cf6', emoji: '🍇' },
  { name: '한라봉', radius: 40, score: 16, color: '#f97316', emoji: '🍊' },
  { name: '감', radius: 50, score: 32, color: '#ea580c', emoji: '🍅' },
  { name: '사과', radius: 62, score: 64, color: '#dc2626', emoji: '🍎' },
  { name: '배', radius: 76, score: 128, color: '#ca8a04', emoji: '🍐' },
  { name: '복숭아', radius: 90, score: 256, color: '#f472b6', emoji: '🍑' },
  { name: '파인애플', radius: 106, score: 512, color: '#eab308', emoji: '🍍' },
  { name: '멜론', radius: 124, score: 1024, color: '#84cc16', emoji: '🍈' },
  { name: '수박', radius: 146, score: 2048, color: '#16a34a', emoji: '🍉' },
];

interface LeaderboardEntry {
  id?: string;
  name: string;
  score: number;
  created_at?: string;
}

export default function WatermelonGamePage() {
  const [score, setScore] = useState<number>(0);
  const [nextFruitIndex, setNextFruitIndex] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>('');
  const [isBossMode, setIsBossMode] = useState<boolean>(false);
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [isRankingsLoading, setIsRankingsLoading] = useState<boolean>(false);
  const [engineReady, setEngineReady] = useState<boolean>(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<any>(null);
  const renderRef = useRef<any>(null);
  const runnerRef = useRef<any>(null);

  // 랭킹 불러오기
  const fetchRankings = async () => {
    setIsRankingsLoading(true);
    try {
      const { data, error } = await supabase
        .from('watermelon_rankings')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);

      if (data && !error) {
        setRankings(data);
      } else {
        // Fallback local mock
        setRankings([
          { name: '행정실장', score: 3840 },
          { name: '교무부장', score: 2950 },
          { name: '교육행정', score: 2420 },
          { name: '서무주임', score: 1890 },
          { name: '시설주무관', score: 1420 },
        ]);
      }
    } catch (e) {
      setRankings([
        { name: '행정실장', score: 3840 },
        { name: '교무부장', score: 2950 },
        { name: '교육행정', score: 2420 },
      ]);
    } finally {
      setIsRankingsLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();

    // 키보드 단축키 (보스키: ` 키)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        setIsBossMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Matter.js 게임 초기화
  const initGame = () => {
    const Matter = (window as any).Matter;
    if (!Matter || !canvasContainerRef.current) return;

    // 기존 엔진 정리
    if (runnerRef.current && engineRef.current) {
      Matter.Runner.stop(runnerRef.current);
      Matter.Engine.clear(engineRef.current);
    }
    if (renderRef.current) {
      Matter.Render.stop(renderRef.current);
      if (renderRef.current.canvas) renderRef.current.canvas.remove();
    }

    setScore(0);
    setIsGameOver(false);
    setNextFruitIndex(Math.floor(Math.random() * 4)); // 체리~한라봉 중 무작위

    const { Engine, Render, Runner, Bodies, Composite, Events } = Matter;

    const width = 420;
    const height = 620;

    const engine = Engine.create({
      gravity: { x: 0, y: 1.2 }
    });
    engineRef.current = engine;

    const render = Render.create({
      element: canvasContainerRef.current,
      engine: engine,
      options: {
        width: width,
        height: height,
        wireframes: false,
        background: '#f8fafc'
      }
    });
    renderRef.current = render;

    // 벽 생성 (좌, 우, 바닥)
    const wallOptions = { isStatic: true, render: { fillStyle: '#cbd5e1' } };
    const ground = Bodies.rectangle(width / 2, height, width, 30, wallOptions);
    const leftWall = Bodies.rectangle(0, height / 2, 20, height, wallOptions);
    const rightWall = Bodies.rectangle(width, height / 2, 20, height, wallOptions);

    Composite.add(engine.world, [ground, leftWall, rightWall]);

    // 과일 충돌 및 합성 이벤트
    Events.on(engine, 'collisionStart', (event: any) => {
      const pairs = event.pairs;
      for (const pair of pairs) {
        const { bodyA, bodyB } = pair;
        if (bodyA.fruitLevel !== undefined && bodyB.fruitLevel !== undefined) {
          if (bodyA.fruitLevel === bodyB.fruitLevel && !bodyA.isMerged && !bodyB.isMerged) {
            const currentLevel = bodyA.fruitLevel;
            if (currentLevel < FRUITS.length - 1) {
              bodyA.isMerged = true;
              bodyB.isMerged = true;

              const nextLevel = currentLevel + 1;
              const newX = (bodyA.position.x + bodyB.position.x) / 2;
              const newY = (bodyA.position.y + bodyB.position.y) / 2;

              Composite.remove(engine.world, [bodyA, bodyB]);

              const nextFruit = FRUITS[nextLevel];
              const newFruitBody = Bodies.circle(newX, newY, nextFruit.radius, {
                restitution: 0.2,
                friction: 0.1,
                render: {
                  fillStyle: nextFruit.color
                }
              });
              (newFruitBody as any).fruitLevel = nextLevel;
              Composite.add(engine.world, newFruitBody);

              setScore(prev => prev + nextFruit.score);
            }
          }
        }
      }
    });

    Render.run(render);
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);
    setEngineReady(true);
  };

  // 과일 낙하 핸들러
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isGameOver || !engineRef.current) return;
    const Matter = (window as any).Matter;
    if (!Matter) return;

    const rect = canvasContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const boundedX = Math.max(30, Math.min(rect.width - 30, clickX));

    const fruit = FRUITS[nextFruitIndex];
    const fruitBody = Matter.Bodies.circle(boundedX, 40, fruit.radius, {
      restitution: 0.2,
      friction: 0.1,
      render: { fillStyle: fruit.color }
    });
    (fruitBody as any).fruitLevel = nextFruitIndex;

    Matter.Composite.add(engineRef.current.world, fruitBody);

    // 다음 과일 선정 (0~3 레벨)
    setNextFruitIndex(Math.floor(Math.random() * 4));
  };

  // 랭킹 등록
  const handleSubmitScore = async () => {
    if (!playerName.trim()) return;
    try {
      await supabase.from('watermelon_rankings').insert([
        { name: playerName.trim(), score: score }
      ]);
      alert('성적이 실시간 랭킹에 성공적으로 등록되었습니다!');
      setPlayerName('');
      fetchRankings();
    } catch (e) {
      alert('등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.20.0/matter.min.js"
        onLoad={() => initGame()}
      />

      {/* 🤫 보스키 (위장 엑셀 화면) */}
      {isBossMode ? (
        <div className="fixed inset-0 bg-white z-50 p-6 flex flex-col gap-4 font-mono select-none">
          <div className="flex items-center justify-between border-b pb-2 text-xs text-slate-500">
            <span>Microsoft Excel - 2026학년도 학교회계 지출예산서.xlsx [호환 모드]</span>
            <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] cursor-pointer" onClick={() => setIsBossMode(false)}>
              복귀 (` 키)
            </span>
          </div>
          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100">
              <tr>
                <th className="border p-2">관</th>
                <th className="border p-2">항</th>
                <th className="border p-2">목</th>
                <th className="border p-2">원인행위액</th>
                <th className="border p-2">지출결정액</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border p-2">교수학습활동비</td><td className="border p-2">교육운영비</td><td className="border p-2">학습준비물구입</td><td className="border p-2">15,400,000</td><td className="border p-2">15,400,000</td></tr>
              <tr><td className="border p-2">학교일반운영비</td><td className="border p-2">기관운영비</td><td className="border p-2">공공요금및제세</td><td className="border p-2">8,200,000</td><td className="border p-2">8,200,000</td></tr>
              <tr><td className="border p-2">시설관리비</td><td className="border p-2">시설유지비</td><td className="border p-2">체육관보수공사</td><td className="border p-2">24,500,000</td><td className="border p-2">24,500,000</td></tr>
            </tbody>
          </table>
        </div>
      ) : (
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

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 text-xl">
                  🍉
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    행정 힐링 수박 게임
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    동일한 과일을 합쳐 거대한 수박(🍉)을 완성하고 실시간 전국 교직원 랭킹에 도전하세요!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBossMode(true)}
                  className="btn-secondary py-2 px-3 text-xs font-bold text-slate-600 flex items-center gap-1.5"
                  title="백틱(`) 키로 긴급 위장"
                >
                  <EyeOff size={14} />
                  <span>보스키 (` 키)</span>
                </button>
                <button
                  onClick={initGame}
                  className="btn-primary py-2 px-4 text-xs font-bold bg-rose-600 hover:bg-rose-700 shadow-sm flex items-center gap-1.5"
                >
                  <RotateCcw size={14} />
                  <span>다시 시작</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3열 대시보드 레이아웃: (좌측 랭킹보드) + (중앙 캔버스 게임) + (우측 게임 규칙 & 과일 족보) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 좌측 실시간 전국 랭킹보드 (3열) */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              <div className="glass-card p-5 flex flex-col gap-3.5 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Trophy size={18} className="text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-900">전국 실시간 랭킹 Top 10</h3>
                  </div>
                  <button onClick={fetchRankings} className="text-slate-400 hover:text-slate-600">
                    <RotateCcw size={13} />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {rankings.map((r, idx) => (
                    <div 
                      key={idx}
                      className={`p-2.5 rounded-xl flex items-center justify-between border transition-all ${
                        idx === 0 ? 'bg-amber-50/70 border-amber-200 font-bold' :
                        idx === 1 ? 'bg-slate-50 border-slate-200 font-semibold' :
                        idx === 2 ? 'bg-orange-50/50 border-orange-200 font-medium' :
                        'border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                          idx === 0 ? 'bg-amber-500 text-white' :
                          idx === 1 ? 'bg-slate-400 text-white' :
                          idx === 2 ? 'bg-orange-400 text-white' :
                          'text-slate-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-xs text-slate-800 truncate max-w-[90px]">{r.name}</span>
                      </div>
                      <span className="text-xs font-black text-rose-600">{r.score.toLocaleString()}점</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 중앙 게임 캔버스 (5열) */}
            <div className="lg:col-span-5 flex flex-col items-center gap-3">
              
              {/* 상단 점수 & 다음 과일 */}
              <div className="w-full max-w-[420px] flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400">SCORE</span>
                  <span className="text-2xl font-black text-rose-600">{score.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] font-bold text-slate-400">NEXT</span>
                    <span className="text-2xl">{FRUITS[nextFruitIndex].emoji}</span>
                  </div>
                </div>
              </div>

              {/* 물리 캔버스 컨테이너 */}
              <div 
                ref={canvasContainerRef}
                onClick={handleCanvasClick}
                className="w-full max-w-[420px] h-[620px] rounded-2xl border-4 border-slate-800 overflow-hidden shadow-lg cursor-crosshair bg-slate-50 relative flex items-center justify-center"
              >
                {/* 붉은 데드라인 안내선 */}
                <div className="absolute top-20 left-0 right-0 border-b-2 border-dashed border-rose-400/60 pointer-events-none flex justify-end pr-2 text-[10px] text-rose-400 font-bold">
                  DEADLINE
                </div>
              </div>

              {/* 점수 등록 폼 */}
              <div className="w-full max-w-[420px] flex gap-2">
                <input 
                  type="text" 
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="닉네임 (예: 교무부장, 서울행정)"
                  maxLength={10}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-rose-500"
                />
                <button
                  onClick={handleSubmitScore}
                  disabled={score === 0}
                  className="btn-primary py-2 px-4 text-xs font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-50"
                >
                  랭킹 등록
                </button>
              </div>

            </div>

            {/* 우측 과일 진화 족보 & 설명서 (4열) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="glass-card p-5 flex flex-col gap-3.5 bg-white">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
                  🍉 과일 진화 순서표
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {FRUITS.map((f, idx) => (
                    <div key={idx} className="p-2 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center gap-2">
                      <span className="text-lg">{f.emoji}</span>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{f.name}</span>
                        <span className="text-[10px] text-slate-400">+{f.score}점</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-rose-50 rounded-xl text-[11px] text-rose-800 leading-relaxed mt-2 font-medium">
                  💡 <strong>팁:</strong> 마우스를 클릭하면 조준된 위치로 과일이 낙하합니다. 과일이 윗부분 점선에 닿지 않도록 균형 있게 쌓으세요!
                </div>
              </div>
            </div>

          </div>

        </div>
      )}
    </>
  );
}
