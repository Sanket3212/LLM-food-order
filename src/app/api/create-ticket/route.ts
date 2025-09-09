// app/api/create-ticket/route.ts
import { NextRequest, NextResponse } from 'next/server';

const MANTIS_CONFIG = {
  url: process.env.NEXT_PUBLIC_MANTIS_URL || '',
  apiKey: process.env.MANTIS_API_KEY || '',
  projectId: parseInt(process.env.NEXT_PUBLIC_MANTIS_PROJECT_ID || '1')
};

interface OrderData {
  orderNumber: string;
  items: string;
  total: number;
  timestamp: string;
}

export async function POST(req: NextRequest) {
  if (!MANTIS_CONFIG.url || !MANTIS_CONFIG.apiKey) {
    console.error('Missing MantisBT configuration');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const orderData: OrderData = await req.json();

    const description = `Order Details:
${orderData.items}

Total Amount: ${orderData.total.toFixed(2)}
Order Date: ${new Date(orderData.timestamp).toLocaleString()}
Customer: Walk-in Customer`;

    // Properly formatted tags
    const tags = [
      { name: 'order' },
      { name: 'food' },
      { name: `total-${orderData.total.toFixed(2)}` }
    ];

    const payload = {
      summary: `Food Order - ${orderData.orderNumber}`,
      description,
      category: { name: 'General' },
      project: { id: MANTIS_CONFIG.projectId },
      tags
    };

    console.log('Creating MantisBT ticket:', { ...payload, tags: '[REDACTED]' });

    const response = await fetch(`${MANTIS_CONFIG.url}/api/rest/issues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': MANTIS_CONFIG.apiKey,
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('MantisBT response:', data);

    if (response.ok && data.issue?.id) {
      const issueId = data.issue.id;
      console.log('MantisBT ticket created successfully:', issueId);
      return NextResponse.json({ issueId });
    } else {
      const errorMessage = data.message || 'Failed to create ticket';
      console.error('MantisBT API Error:', data);
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating MantisBT ticket:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
