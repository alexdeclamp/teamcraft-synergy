
import * as pdfjs from 'pdfjs-dist';

// Initialize pdf.js worker
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Extract text from a PDF file
 * @param pdfUrl URL of the PDF file
 * @returns Promise resolving to the extracted text and page count
 */
export async function extractPdfText(pdfUrl: string): Promise<{ text: string; pageCount: number }> {
  try {
    // Fetch the PDF
    const response = await fetch(pdfUrl, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }
    
    // Get the PDF data as ArrayBuffer
    const pdfData = await response.arrayBuffer();
    
    if (pdfData.byteLength === 0) {
      throw new Error("PDF data is empty");
    }
    
    // Load the PDF with pdf.js
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(pdfData) });
    const pdf = await loadingTask.promise;
    
    // Extract text from each page
    let textContent = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Processing page ${i}/${pdf.numPages}`);
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      textContent += strings.join(' ') + '\n';
      
      // Free memory
      if (page && typeof page.cleanup === 'function') {
        page.cleanup();
      }
    }
    
    return { 
      text: textContent, 
      pageCount: pdf.numPages 
    };
  } catch (error: any) {
    console.error('Error extracting PDF text:', error);
    throw error;
  }
}
