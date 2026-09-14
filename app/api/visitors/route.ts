import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const forwarded = request.headers.get('x-forwarded-for') || '';
    const userAgent = request.headers.get('user-agent') || '';

    const res = await fetch('https://chatbot.aisen.store/api/visitors?record=1', {
      headers: {
        'x-forwarded-for': forwarded,
        'user-agent': userAgent,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ success: true, today: 1, total: 1580, date: new Date().toISOString().slice(0, 10) });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ success: true, today: 1, total: 1580, date: new Date().toISOString().slice(0, 10) });
  }
}
