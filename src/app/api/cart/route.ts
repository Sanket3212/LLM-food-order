import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://backend-llm-production-afb7.up.railway.app';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE}/cart`);
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      items: data.items || [],
      total: data.total || 0,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}