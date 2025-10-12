import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const input = {
      prompt: `A TOK emoji of ${prompt}`,
      apply_watermark: false,
    };

    const output = await replicate.run(
      'fofr/sdxl-emoji:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e',
      { input }
    ) as Array<{ url: () => string }>;

    // Get the URL from the output - output is an array of objects with .url() method
    const imageUrl = output[0]?.url() || (output[0] as unknown as string);

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      prompt 
    });
  } catch (error) {
    console.error('Error generating emoji:', error);
    return NextResponse.json(
      { error: 'Failed to generate emoji' },
      { status: 500 }
    );
  }
}

