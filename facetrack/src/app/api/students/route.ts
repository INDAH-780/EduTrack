// app/api/students/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendResponse = await fetch('http://127.0.0.1:5000/api/students', {
      headers: {
        'Authorization': `Bearer ${process.env.BACKEND_API_KEY}`,
      }
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch students' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}