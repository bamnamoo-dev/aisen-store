import { NextResponse } from 'next/server';

// 롤백 백업 모델 순서: 2.5 flash -> 2.0 flash -> 1.5 flash
const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.5-flash-lite',
];

export async function POST(req: Request) {
  try {
    const { base64Data, mimeType = 'image/jpeg', prompt } = await req.json();

    if (!base64Data) {
      return NextResponse.json(
        { error: '이미지 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

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
        return NextResponse.json({ success: true, model, data: parsed });
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
