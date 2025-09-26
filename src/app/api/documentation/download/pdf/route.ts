import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
  try {
    const { title, content } = await req.json();
    
    // Use puppeteer to generate PDF from HTML
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(content);
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${title}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}