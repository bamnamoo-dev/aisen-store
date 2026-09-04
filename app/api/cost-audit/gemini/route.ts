import { NextResponse } from 'next/server';

// 롤백 백업 모델 순서: 3.5 flash-lite 최우선
const FALLBACK_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.6-flash',
];

// 1인당 1일 최대 호출 한도 (학교 동일 IP 환경 고려하여 브라우저 사용자 UID 기준)
const DAILY_MAX_CALLS_PER_USER = 30;

// 관리자 계정 목록 (한도 완전 제외 및 무제한 이용)
const ADMIN_EMAILS = ['bamnmaoo@gmail.com', 'bamnamoo@gmail.com'];

// 서버 메모리 일일 사용량 캐시: key = `${today}_${userId}` -> count
interface UsageRecord {
  count: number;
  resetAt: number; // KST 자정 타임스탬프
}
const userDailyUsage = new Map<string, UsageRecord>();

// KST(한국 표준시) 기준 오늘 날짜 문자열 및 자정 타임스탬프 계산
function getKstDayInfo() {
  const now = new Date();
  // UTC+9 계산
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstDate = new Date(now.getTime() + kstOffset);
  const dateStr = kstDate.toISOString().slice(0, 10); // YYYY-MM-DD

  // 다음날 KST 00:00:00 타임스탬프
  const nextMidnightKst = new Date(Date.UTC(kstDate.getUTCFullYear(), kstDate.getUTCMonth(), kstDate.getUTCDate() + 1, 0, 0, 0) - kstOffset);
  return { dateStr, resetAt: nextMidnightKst.getTime() };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { base64Data, mimeType = 'image/jpeg', prompt, clientUid, userEmail } = body;

    if (!base64Data) {
      return NextResponse.json(
        { error: '이미지 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

    // 0. 관리자 계정 확인 (bamnmaoo@gmail.com 등은 30회 한도 완전 제외)
    const normalizedEmail = (userEmail || '').toLowerCase().trim();
    const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);

    // 1. 사용자 식별자 확인 (학교 공용 IP 환경 배려: 클라이언트 고유 UID 우선, 없을 시 IP)
    const forwardedFor = req.headers.get('x-forwarded-for') || '';
    const clientIp = forwardedFor.split(',')[0].trim() || 'unknown';
    const userId = clientUid ? `uid_${clientUid}` : `ip_${clientIp}`;

    // 2. 일일 30회 제한 검증 (관리자는 제외!)
    const { dateStr, resetAt } = getKstDayInfo();
    const cacheKey = `${dateStr}_${userId}`;
    const record = userDailyUsage.get(cacheKey) || { count: 0, resetAt };

    // 날짜가 지난 이전 캐시 정리 (메모리 누수 방지)
    if (userDailyUsage.size > 5000) {
      const nowMs = Date.now();
      for (const [key, rec] of userDailyUsage.entries()) {
        if (rec.resetAt < nowMs) userDailyUsage.delete(key);
      }
    }

    if (!isAdmin && record.count >= DAILY_MAX_CALLS_PER_USER) {
      return NextResponse.json(
        {
          error: `오늘의 1인 무료 AI 정밀 판독 한도(${DAILY_MAX_CALLS_PER_USER}회)를 모두 사용하셨습니다.\n(※ 엑셀 및 PDF 서류 업로드 감사는 무제한 이용 가능합니다. 내일 0시에 초기화됩니다.)`,
          limit: DAILY_MAX_CALLS_PER_USER,
          used: record.count,
          remaining: 0,
        },
        { status: 429 }
      );
    }

    // 3. Google Gemini API 호출
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: '서버 환경변수(GOOGLE_API_KEY)가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
    let lastError: any = null;

    for (const model of FALLBACK_MODELS) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const payload = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: cleanBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          response_mime_type: 'application/json',
        },
      };

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[API Gemini ${model} Failed (${response.status})]:`, errText);
          lastError = new Error(`(${response.status}): ${errText}`);
          continue;
        }

        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText) {
          lastError = new Error('Gemini AI로부터 응답 텍스트를 받지 못했습니다.');
          continue;
        }

        const parsed = JSON.parse(candidateText);

        // 성공 시 사용 횟수 증가 (관리자는 차감 없이 무제한)
        if (!isAdmin) {
          record.count += 1;
          userDailyUsage.set(cacheKey, record);
        }

        return NextResponse.json({
          success: true,
          model,
          data: parsed,
          isAdmin,
          limit: isAdmin ? 999999 : DAILY_MAX_CALLS_PER_USER,
          used: isAdmin ? 0 : record.count,
          remaining: isAdmin ? 999999 : (DAILY_MAX_CALLS_PER_USER - record.count),
        });
      } catch (err: any) {
        console.warn(`[API Gemini ${model} Exception]:`, err.message);
        lastError = err;
      }
    }

    return NextResponse.json(
      { error: lastError?.message || '모든 Gemini 모델 분석 시도에 실패했습니다.' },
      { status: 502 }
    );
  } catch (globalErr: any) {
    console.error('[API Gemini Route Error]:', globalErr);
    return NextResponse.json(
      { error: globalErr.message || '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
