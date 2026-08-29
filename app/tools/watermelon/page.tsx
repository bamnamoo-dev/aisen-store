'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Trophy, 
  RotateCcw, 
  EyeOff,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import Script from 'next/script';
import { supabase } from '@/lib/supabase';

// 원본 과일 데이터 정의
const FRUITS = [
  { name: 'cherry', radius: 15, c1: '#ff4d4d', c2: '#cc0000', score: 2, label: '체리' },
  { name: 'strawberry', radius: 22, c1: '#ff6699', c2: '#cc0033', score: 4, label: '딸기' },
  { name: 'grape', radius: 30, c1: '#b366ff', c2: '#6600cc', score: 8, label: '포도' },
  { name: 'dekopon', radius: 38, c1: '#ffcc66', c2: '#ff9900', score: 16, label: '한라봉' },
  { name: 'persimmon', radius: 50, c1: '#ff7733', c2: '#e65100', score: 32, label: '감' },
  { name: 'apple', radius: 62, c1: '#ff4d4d', c2: '#cc0000', score: 64, label: '사과' },
  { name: 'pear', radius: 75, c1: '#ffedcc', c2: '#ffcc66', score: 128, label: '배' },
  { name: 'peach', radius: 90, c1: '#ffb3ba', c2: '#ff66b2', score: 256, label: '복숭아' },
  { name: 'pineapple', radius: 105, c1: '#ffee66', c2: '#ccaa00', score: 512, label: '파인애플' },
  { name: 'melon', radius: 125, c1: '#b3ffb3', c2: '#33cc33', score: 1024, label: '멜론' },
  { name: 'watermelon', radius: 150, c1: '#33cc33', c2: '#006600', score: 2048, label: '수박' },
];

interface LeaderboardEntry {
  id?: string;
  name: string;
  score: number;
}

export default function WatermelonGamePage() {
  const [score, setScore] = useState<number>(0);
  const [nextFruitIndex, setNextFruitIndex] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>('');
  const [isBossMode, setIsBossMode] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement>(null);
  const gameInstanceRef = useRef<any>(null);

  // 사운드 매니저
  const playPopSound = () => {
    if (isMuted) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  // 실시간 랭킹 가져오기
  const fetchRankings = async () => {
    try {
      const { data, error } = await supabase
        .from('watermelon_rankings')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);

      if (data && !error) {
        setRankings(data);
      } else {
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
    }
  };

  // 과일 원본 3D 절차적 그래픽 드로잉 함수 (Main.js 100% 동일)
  const drawFruitGraphics = (ctx: CanvasRenderingContext2D, data: any) => {
    const { name, radius, c1, c2 } = data;

    ctx.save();

    const strokeWidth = Math.max(1.5, radius * 0.04);
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = '#4e342e';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);

    const grad = ctx.createRadialGradient(-radius * 0.2, -radius * 0.2, radius * 0.1, 0, 0, radius);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.clip();

    // 1. 고유 텍스처
    if (name === 'watermelon') {
      ctx.strokeStyle = '#0e3a0e';
      ctx.lineWidth = radius * 0.12;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        let startX = i * radius * 0.42;
        ctx.moveTo(startX, -radius);
        for (let y = -radius; y <= radius; y += 8) {
          let wave1 = Math.sin(y * 0.06 + i) * (radius * 0.06);
          let wave2 = Math.cos(y * 0.15) * (radius * 0.03);
          ctx.lineTo(startX + wave1 + wave2, y);
        }
        ctx.stroke();
      }
    } else if (name === 'melon') {
      const drawNets = (color: string, offset: number) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(1, radius * 0.03);
        for (let i = -3; i <= 3; i++) {
          ctx.beginPath();
          ctx.arc(i * radius * 0.35 + offset, 0, radius * 0.95, -Math.PI / 2, Math.PI / 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, i * radius * 0.35 + offset, radius * 0.95, 0, 2 * Math.PI);
          ctx.stroke();
        }
      };
      drawNets('rgba(0, 77, 0, 0.15)', 1);
      drawNets('rgba(255, 255, 255, 0.65)', 0);
    } else if (name === 'pineapple') {
      ctx.strokeStyle = '#996600';
      ctx.lineWidth = Math.max(1.2, radius * 0.03);
      for (let i = -6; i <= 6; i++) {
        ctx.beginPath();
        ctx.moveTo(-radius * 1.5 + i * radius * 0.3, -radius * 1.5);
        ctx.lineTo(radius * 1.5 + i * radius * 0.3, radius * 1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(radius * 1.5 + i * radius * 0.3, -radius * 1.5);
        ctx.lineTo(-radius * 1.5 + i * radius * 0.3, radius * 1.5);
        ctx.stroke();
      }
      ctx.fillStyle = '#ff8800';
      for (let x = -5; x <= 5; x++) {
        for (let y = -5; y <= 5; y++) {
          if ((x + y) % 2 === 0) {
            let px = x * radius * 0.22;
            let py = y * radius * 0.28;
            ctx.beginPath();
            ctx.moveTo(px, py - radius * 0.035);
            ctx.lineTo(px + radius * 0.035, py);
            ctx.lineTo(px, py + radius * 0.035);
            ctx.lineTo(px - radius * 0.035, py);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
    } else if (name === 'strawberry') {
      ctx.fillStyle = '#fff0b3';
      const seeds = [
        { x: 0.0, y: -0.45 }, { x: -0.32, y: -0.32 }, { x: 0.32, y: -0.32 },
        { x: -0.18, y: -0.05 }, { x: 0.18, y: -0.05 }, { x: -0.45, y: 0.12 },
        { x: 0.45, y: 0.12 }, { x: 0.0, y: 0.22 }, { x: -0.25, y: 0.45 },
        { x: 0.25, y: 0.45 }, { x: 0.0, y: 0.68 }
      ];
      seeds.forEach(s => {
        ctx.save();
        ctx.translate(s.x * radius, s.y * radius);
        ctx.rotate(Math.PI / 6);
        ctx.beginPath();
        ctx.moveTo(0, -radius * 0.04);
        ctx.bezierCurveTo(radius * 0.025, -radius * 0.04, radius * 0.03, radius * 0.03, 0, radius * 0.045);
        ctx.bezierCurveTo(-radius * 0.03, radius * 0.03, -radius * 0.025, -radius * 0.04, 0, -radius * 0.04);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });
    } else if (name === 'peach') {
      ctx.strokeStyle = 'rgba(255, 102, 178, 0.55)';
      ctx.lineWidth = radius * 0.07;
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.95);
      ctx.quadraticCurveTo(radius * 0.18, 0, 0, radius * 0.95);
      ctx.stroke();
    } else if (name === 'pear') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      const dots = [
        { x: -0.4, y: -0.5 }, { x: 0.4, y: -0.5 }, { x: -0.2, y: -0.2 },
        { x: 0.3, y: -0.1 }, { x: -0.6, y: 0.1 }, { x: 0.6, y: 0.1 },
        { x: -0.3, y: 0.4 }, { x: 0.3, y: 0.4 }, { x: 0, y: 0.6 },
        { x: -0.5, y: 0.7 }, { x: 0.5, y: 0.7 }
      ];
      dots.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x * radius, d.y * radius, radius * 0.022, 0, 2 * Math.PI);
        ctx.fill();
      });
    } else if (name === 'apple') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.ellipse(-radius * 0.45, 0, radius * 0.1, radius * 0.5, 0.05, 0, 2 * Math.PI);
      ctx.ellipse(radius * 0.45, 0, radius * 0.1, radius * 0.5, -0.05, 0, 2 * Math.PI);
      ctx.fill();
    } else if (name === 'dekopon') {
      ctx.fillStyle = 'rgba(204, 102, 0, 0.2)';
      const kuls = [
        { x: -0.4, y: -0.3 }, { x: 0.4, y: -0.3 }, { x: 0, y: -0.15 },
        { x: -0.5, y: 0.1 }, { x: 0.5, y: 0.1 }, { x: -0.3, y: 0.4 },
        { x: 0.3, y: 0.4 }, { x: 0, y: 0.52 }
      ];
      kuls.forEach(k => {
        ctx.beginPath();
        ctx.arc(k.x * radius, k.y * radius, radius * 0.035, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // 2. 3D 유광 하이라이트
    if (name !== 'cherry' && name !== 'grape') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
      ctx.beginPath();
      ctx.ellipse(radius * 0.28, -radius * 0.38, radius * 0.3, radius * 0.14, Math.PI / 6, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.beginPath();
      ctx.ellipse(-radius * 0.38, radius * 0.38, radius * 0.2, radius * 0.1, -Math.PI / 4, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.restore(); // 클리핑 해제

    // 3. 꼭지 및 잎사귀
    if (name === 'cherry') {
      ctx.strokeStyle = '#5c4033';
      ctx.lineWidth = Math.max(1.5, radius * 0.05);
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.75);
      ctx.quadraticCurveTo(radius * 0.1, -radius * 0.9, radius * 0.05, -radius * 1.05);
      ctx.stroke();

      ctx.fillStyle = '#388e3c';
      ctx.beginPath();
      ctx.ellipse(radius * 0.14, -radius * 0.92, radius * 0.16, radius * 0.08, -Math.PI / 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#4e342e';
      ctx.stroke();
    } else if (name === 'grape') {
      ctx.strokeStyle = '#5c4033';
      ctx.lineWidth = Math.max(1.2, radius * 0.05);
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.85);
      ctx.quadraticCurveTo(radius * 0.1, -radius * 0.95, radius * 0.05, -radius * 1.05);
      ctx.stroke();

      ctx.fillStyle = '#2e7d32';
      ctx.beginPath();
      ctx.ellipse(radius * 0.14, -radius * 0.98, radius * 0.16, radius * 0.08, -Math.PI / 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#4e342e';
      ctx.stroke();
    } else if (name === 'dekopon') {
      ctx.beginPath();
      ctx.arc(0, -radius * 0.9, radius * 0.18, 0, 2 * Math.PI);
      let bumpGrad = ctx.createRadialGradient(-radius * 0.02, -radius * 0.95, radius * 0.02, 0, -radius * 0.9, radius * 0.18);
      bumpGrad.addColorStop(0, c1);
      bumpGrad.addColorStop(1, c2);
      ctx.fillStyle = bumpGrad;
      ctx.fill();
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = '#4e342e';
      ctx.stroke();

      ctx.strokeStyle = '#5c4033';
      ctx.lineWidth = radius * 0.06;
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.98);
      ctx.lineTo(radius * 0.04, -radius * 1.08);
      ctx.stroke();

      ctx.fillStyle = '#2e7d32';
      ctx.beginPath();
      ctx.ellipse(radius * 0.16, -radius * 1.05, radius * 0.18, radius * 0.08, -Math.PI / 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#4e342e';
      ctx.stroke();
    } else if (['apple', 'pear', 'persimmon', 'peach'].includes(name)) {
      ctx.strokeStyle = '#5c4033';
      ctx.lineWidth = radius * 0.06;
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.88);
      ctx.quadraticCurveTo(radius * 0.08, -radius * 1.05, radius * 0.04, -radius * 1.12);
      ctx.stroke();

      if (name === 'apple') {
        ctx.fillStyle = '#388e3c';
        ctx.beginPath();
        ctx.ellipse(radius * 0.16, -radius * 1.02, radius * 0.15, radius * 0.07, Math.PI / 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#4e342e';
        ctx.stroke();
      }
    } else if (name === 'pineapple') {
      ctx.fillStyle = '#1b5e20';
      for (let i = -2.5; i <= 2.5; i += 1) {
        ctx.beginPath();
        ctx.moveTo(0, -radius * 0.82);
        ctx.quadraticCurveTo(i * radius * 0.22, -radius * 0.95, i * radius * 0.28, -radius * 1.12);
        ctx.quadraticCurveTo(i * radius * 0.12, -radius * 0.9, 0, -radius * 0.82);
        ctx.fill();
        ctx.stroke();
      }
    } else if (name === 'watermelon') {
      ctx.strokeStyle = '#0e3a0e';
      ctx.lineWidth = radius * 0.06;
      ctx.beginPath();
      ctx.moveTo(0, -radius * 0.95);
      ctx.quadraticCurveTo(radius * 0.1, -radius * 1.06, 0, -radius * 1.15);
      ctx.quadraticCurveTo(-radius * 0.1, -radius * 1.22, radius * 0.08, -radius * 1.25);
      ctx.stroke();
    }

    // 4. 귀여운 표정 (눈, 볼터치, 입)
    const eyeSize = Math.max(1.2, radius * 0.07);
    const eyeOffset = name === 'cherry' ? radius * 0.15 : radius * 0.28;
    const eyeY = name === 'cherry' ? radius * 0.15 : radius * 0.06;

    // 볼터치
    const drawBlush = (bx: number, by: number) => {
      const br = radius * 0.09;
      ctx.save();
      let blushGrad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      blushGrad.addColorStop(0, 'rgba(255, 105, 180, 0.7)');
      blushGrad.addColorStop(0.5, 'rgba(255, 105, 180, 0.35)');
      blushGrad.addColorStop(1, 'rgba(255, 105, 180, 0)');
      ctx.fillStyle = blushGrad;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    };
    drawBlush(-eyeOffset, eyeY + radius * 0.14);
    drawBlush(eyeOffset, eyeY + radius * 0.14);

    // 초롱초롱 눈
    const drawEye = (ex: number, ey: number, esize: number) => {
      ctx.save();
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(ex, ey, esize, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ex - esize * 0.35, ey - esize * 0.35, esize * 0.32, 0, 2 * Math.PI);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(ex + esize * 0.35, ey + esize * 0.2, esize * 0.18, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    };

    if (name === 'watermelon') {
      // 윙크 (>) + 큰 눈
      ctx.strokeStyle = '#222';
      ctx.lineWidth = Math.max(1.5, radius * 0.045);
      ctx.beginPath();
      ctx.moveTo(-eyeOffset - eyeSize, eyeY - eyeSize * 0.4);
      ctx.lineTo(-eyeOffset, eyeY + eyeSize * 0.4);
      ctx.lineTo(-eyeOffset + eyeSize, eyeY - eyeSize * 0.4);
      ctx.stroke();

      drawEye(eyeOffset, eyeY, eyeSize);

      // 입 (활짝 웃음 + 혀)
      ctx.save();
      ctx.translate(0, eyeY + radius * 0.05);
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.12, 0, Math.PI);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, radius * 0.04, radius * 0.08, 0, Math.PI);
      ctx.clip();
      ctx.fillStyle = '#ff5252';
      ctx.fill();
      ctx.restore();

    } else if (name === 'pineapple') {
      // 선글라스!
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.ellipse(-eyeOffset * 0.8, eyeY, eyeOffset * 0.7, eyeOffset * 0.5, -Math.PI / 12, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(eyeOffset * 0.8, eyeY, eyeOffset * 0.7, eyeOffset * 0.5, Math.PI / 12, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = Math.max(1.5, radius * 0.035);
      ctx.beginPath();
      ctx.moveTo(-eyeOffset * 1.2, eyeY + eyeOffset * 0.25);
      ctx.lineTo(-eyeOffset * 0.7, eyeY - eyeOffset * 0.25);
      ctx.moveTo(eyeOffset * 0.4, eyeY + eyeOffset * 0.25);
      ctx.lineTo(eyeOffset * 0.9, eyeY - eyeOffset * 0.25);
      ctx.stroke();

      // 입
      ctx.strokeStyle = '#222';
      ctx.lineWidth = Math.max(1, radius * 0.045);
      ctx.beginPath();
      ctx.moveTo(-radius * 0.08, eyeY + radius * 0.15);
      ctx.quadraticCurveTo(radius * 0.05, eyeY + radius * 0.18, radius * 0.12, eyeY + radius * 0.11);
      ctx.stroke();

    } else {
      drawEye(-eyeOffset, eyeY, eyeSize);
      drawEye(eyeOffset, eyeY, eyeSize);

      ctx.strokeStyle = '#222';
      ctx.lineWidth = Math.max(1, radius * 0.045);
      ctx.beginPath();
      ctx.moveTo(-radius * 0.06, eyeY + radius * 0.08);
      ctx.lineTo(0, eyeY + radius * 0.13);
      ctx.lineTo(radius * 0.06, eyeY + radius * 0.08);
      ctx.stroke();
    }

    ctx.restore();
  };

  // 다음 과일 프리뷰 캔버스 렌더링
  const updateNextPreview = (fIdx: number) => {
    if (!nextCanvasRef.current) return;
    const cvs = nextCanvasRef.current;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.save();
    ctx.translate(30, 30);
    const fruitData = FRUITS[fIdx];
    const scale = Math.min(1, 24 / fruitData.radius);
    ctx.scale(scale, scale);
    drawFruitGraphics(ctx, fruitData);
    ctx.restore();
  };

  // 게임 실행 및 Matter.js 엔진 초기화
  const initGame = () => {
    const Matter = (window as any).Matter;
    if (!Matter || !canvasRef.current) return;

    const { Engine, Bodies, Composite, Events, Body } = Matter;

    const width = 420;
    const height = 620;

    const engine = Engine.create();
    engine.world.gravity.y = 1.2;

    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 벽 생성
    const ground = Bodies.rectangle(width / 2, height + 10, width, 40, { isStatic: true, plugin: { type: 'wall' } });
    const leftWall = Bodies.rectangle(-10, height / 2, 30, height * 2, { isStatic: true, plugin: { type: 'wall' } });
    const rightWall = Bodies.rectangle(width + 10, height / 2, 30, height * 2, { isStatic: true, plugin: { type: 'wall' } });
    Composite.add(engine.world, [ground, leftWall, rightWall]);

    let curScore = 0;
    let curNextIdx = Math.floor(Math.random() * 4);
    let curDroppingFruit: any = null;
    let canDrop = true;
    let mouseX = width / 2;
    let gameOver = false;
    let gameOverTimer = 0;

    setScore(0);
    setIsGameOver(false);
    setNextFruitIndex(curNextIdx);
    updateNextPreview(curNextIdx);

    // 대기 과일 생성 함수
    const spawnDropping = () => {
      if (gameOver) return;
      const fruitData = FRUITS[curNextIdx];
      curNextIdx = Math.floor(Math.random() * 4);
      setNextFruitIndex(curNextIdx);
      updateNextPreview(curNextIdx);

      const spawnY = 70;
      const boundedX = Math.max(fruitData.radius + 15, Math.min(width - fruitData.radius - 15, mouseX));

      curDroppingFruit = Bodies.circle(boundedX, spawnY, fruitData.radius, {
        isStatic: true,
        restitution: 0.2,
        friction: 0.1,
        collisionFilter: { group: 0, category: 0x0004, mask: 0 },
        plugin: { type: 'fruit', data: fruitData, index: FRUITS.indexOf(fruitData) }
      });
      Composite.add(engine.world, curDroppingFruit);
      canDrop = true;
    };

    spawnDropping();

    // 마우스 이동 & 클릭 이벤트
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) * (width / rect.width);
      if (curDroppingFruit && !curDroppingFruit.isStaticBodyDropped) {
        const fruitData = curDroppingFruit.plugin.data;
        const boundedX = Math.max(fruitData.radius + 15, Math.min(width - fruitData.radius - 15, mouseX));
        Body.setPosition(curDroppingFruit, { x: boundedX, y: 70 });
      }
    };

    const handleClick = () => {
      if (!canDrop || !curDroppingFruit || gameOver) return;
      canDrop = false;
      const old = curDroppingFruit;
      curDroppingFruit = null;

      const pos = old.position;
      const pData = old.plugin;
      Composite.remove(engine.world, old);

      const dropped = Bodies.circle(pos.x, pos.y, pData.data.radius, {
        restitution: 0.2,
        friction: 0.1,
        collisionFilter: { category: 0x0001, mask: 0xFFFFFFFF },
        plugin: { ...pData, isMerging: false }
      });
      Composite.add(engine.world, dropped);

      setTimeout(() => spawnDropping(), 800);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    // 충돌 & 합성 이벤트
    Events.on(engine, 'collisionStart', (event: any) => {
      const pairs = event.pairs;
      for (const pair of pairs) {
        const { bodyA, bodyB } = pair;
        if (bodyA.plugin?.type === 'fruit' && bodyB.plugin?.type === 'fruit') {
          if (bodyA.plugin.index === bodyB.plugin.index && !bodyA.plugin.isMerging && !bodyB.plugin.isMerging) {
            const curIdx = bodyA.plugin.index;
            if (curIdx < FRUITS.length - 1) {
              bodyA.plugin.isMerging = true;
              bodyB.plugin.isMerging = true;

              const midX = (bodyA.position.x + bodyB.position.x) / 2;
              const midY = (bodyA.position.y + bodyB.position.y) / 2;

              Composite.remove(engine.world, [bodyA, bodyB]);

              const nextIdx = curIdx + 1;
              const nextData = FRUITS[nextIdx];
              const mergedBody = Bodies.circle(midX, midY, nextData.radius, {
                restitution: 0.2,
                friction: 0.1,
                plugin: { type: 'fruit', data: nextData, index: nextIdx, isMerging: false }
              });
              Composite.add(engine.world, mergedBody);

              curScore += nextData.score;
              setScore(curScore);
              playPopSound();
            }
          }
        }
      }
    });

    // 렌더링 루프
    let animationId: number;
    const renderLoop = () => {
      Engine.update(engine, 1000 / 60);
      ctx.clearRect(0, 0, width, height);

      // 데드라인 점선
      ctx.beginPath();
      ctx.moveTo(10, 100);
      ctx.lineTo(width - 10, 100);
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);

      const bodies = Composite.allBodies(engine.world);

      // 게임오버 체크
      let isAnyAbove = false;
      bodies.forEach(b => {
        if (b.plugin?.type === 'fruit' && b !== curDroppingFruit && !b.isStatic) {
          if (b.position.y - b.plugin.data.radius < 100) {
            isAnyAbove = true;
          }
        }
      });

      if (isAnyAbove) {
        gameOverTimer++;
        if (gameOverTimer > 120) {
          gameOver = true;
          setIsGameOver(true);
        }
      } else {
        gameOverTimer = 0;
      }

      // 과일 렌더링
      bodies.forEach(b => {
        if (b.plugin?.type === 'fruit') {
          ctx.save();
          ctx.translate(b.position.x, b.position.y);
          ctx.rotate(b.angle);
          drawFruitGraphics(ctx, b.plugin.data);
          ctx.restore();
        }
      });

      if (!gameOver) {
        animationId = requestAnimationFrame(renderLoop);
      }
    };

    renderLoop();

    gameInstanceRef.current = {
      destroy: () => {
        cancelAnimationFrame(animationId);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('click', handleClick);
        Engine.clear(engine);
      }
    };
  };

  useEffect(() => {
    fetchRankings();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        setIsBossMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 랭킹 등록
  const handleSubmitScore = async () => {
    if (!playerName.trim() || score === 0) return;
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
                  onClick={() => setIsMuted(prev => !prev)}
                  className="btn-secondary py-2 px-3 text-xs font-bold text-slate-600 flex items-center gap-1.5"
                >
                  {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  <span>{isMuted ? '음소거' : '소리 ON'}</span>
                </button>
                <button
                  onClick={() => setIsBossMode(true)}
                  className="btn-secondary py-2 px-3 text-xs font-bold text-slate-600 flex items-center gap-1.5"
                  title="백틱(`) 키로 긴급 위장"
                >
                  <EyeOff size={14} />
                  <span>보스키 (` 키)</span>
                </button>
                <button
                  onClick={() => {
                    if (gameInstanceRef.current) gameInstanceRef.current.destroy();
                    initGame();
                  }}
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
              <div className="w-full max-w-[420px] flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400">SCORE</span>
                  <span className="text-2xl font-black text-rose-600">{score.toString().padStart(4, '0')}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-bold text-slate-400">NEXT</span>
                  <div className="w-[60px] h-[60px] rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden">
                    <canvas ref={nextCanvasRef} width={60} height={60}></canvas>
                  </div>
                </div>
              </div>

              {/* 물리 캔버스 컨테이너 */}
              <div className="relative w-full max-w-[420px] rounded-2xl border-4 border-slate-800 overflow-hidden shadow-lg bg-slate-50 flex items-center justify-center">
                <canvas ref={canvasRef} className="cursor-crosshair block w-full h-auto"></canvas>

                {/* 게임오버 오버레이 */}
                {isGameOver && (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white z-20 animate-in fade-in">
                    <h2 className="text-3xl font-black tracking-tight text-rose-400 mb-1">GAME OVER</h2>
                    <p className="text-xs text-slate-300 mb-4">최종 스코어</p>
                    <span className="text-4xl font-black text-white mb-6">{score.toLocaleString()}점</span>

                    <div className="w-full max-w-[280px] flex flex-col gap-2.5">
                      <input 
                        type="text" 
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="닉네임 입력 (랭킹 등록)"
                        maxLength={10}
                        className="px-3 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold text-center focus:outline-none"
                      />
                      <button
                        onClick={handleSubmitScore}
                        className="btn-primary py-2 px-4 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950"
                      >
                        🏆 랭킹 등록하기
                      </button>
                      <button
                        onClick={() => {
                          if (gameInstanceRef.current) gameInstanceRef.current.destroy();
                          initGame();
                        }}
                        className="btn-secondary py-2 px-4 text-xs font-bold text-white border-white/30 hover:bg-white/10 mt-1"
                      >
                        다시 도전
                      </button>
                    </div>
                  </div>
                )}
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
                    <div key={idx} className="p-2 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full border shrink-0" style={{ backgroundColor: f.c1, borderColor: f.c2 }}></span>
                        <span className="font-bold text-slate-800">{f.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">+{f.score}점</span>
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
