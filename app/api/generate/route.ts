import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

interface ReplicateOutput {
  url: () => string | URL;
}

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
    ) as ReplicateOutput[];

    // According to Replicate docs, output[0].url() returns the image URL
    if (!output || !Array.isArray(output) || output.length === 0) {
      console.error('No output received from Replicate API:', output);
      throw new Error('No output received from API');
    }

    const urlResult = output[0].url();
    // url() may return a URL object or string, convert to string
    const imageUrl = typeof urlResult === 'string' ? urlResult : String(urlResult);
    
    if (!imageUrl || imageUrl.trim() === '') {
      console.error('Invalid image URL received from Replicate API:', imageUrl);
      throw new Error('Invalid image URL received from API');
    }

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

