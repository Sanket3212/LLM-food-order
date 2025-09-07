import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://backend-llm-production-afb7.up.railway.app';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE}/process-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    
    if (response.ok) {
      let responseMessage = `Great! ${data.message}`;

      // Handle menu request
      if (data.intent === 'ask_menu') {
        const menuResponse = await fetch(`${API_BASE}/menu`);
        const menuData = await menuResponse.json();
        const items = Array.isArray(menuData) ? menuData : menuData.menu;
        
        responseMessage = `Here's our menu! ${items.map((item: { name: string }) => item.name).join(', ')}`;
      }

      return NextResponse.json({
        success: true,
        message: responseMessage,
        items: data.items || [],
        total: data.total || 0,
        intent: data.intent,
      });
    } else {
      return NextResponse.json(
        { success: false, error: data.error || 'Failed to process order' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error processing order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process order' },
      { status: 500 }
    );
  }
}