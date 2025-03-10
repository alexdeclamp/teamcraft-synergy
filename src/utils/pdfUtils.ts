
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
    
    console.log(`PDF data size: ${(pdfData.byteLength / 1024 / 1024).toFixed(2)} MB`);
    
    // Load the PDF with pdf.js
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(pdfData) });
    const pdf = await loadingTask.promise;
    console.log(`PDF loaded successfully: ${pdf.numPages} pages`);
    
    // Extract text from each page with more detailed extraction
    let textContent = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Processing page ${i}/${pdf.numPages}`);
      const page = await pdf.getPage(i);
      
      try {
        // Get text content with all properties
        const content = await page.getTextContent({
          normalizeWhitespace: true,
          disableCombineTextItems: false
        });
        
        // Process text content more carefully
        let lastY = null;
        let text = '';
        
        for (const item of content.items) {
          if (typeof item.str !== 'string') continue;
          
          // Add newlines between different vertical positions (paragraphs)
          if (lastY !== null && lastY !== item.transform[5]) {
            text += '\n';
          }
          
          text += item.str;
          
          // Add space if this isn't the end of a line
          if (item.hasEOL !== true) {
            text += ' ';
          } else {
            text += '\n';
          }
          
          lastY = item.transform[5];
        }
        
        textContent += text + '\n\n'; // Add extra newline between pages
        console.log(`Page ${i}: Extracted ${text.length} characters`);
      } catch (pageError) {
        console.error(`Error extracting text from page ${i}:`, pageError);
        textContent += `[Error extracting page ${i}]\n\n`;
      } finally {
        // Free memory
        if (page && typeof page.cleanup === 'function') {
          page.cleanup();
        }
      }
    }
    
    console.log(`Total text extracted: ${textContent.length} characters`);
    
    return { 
      text: textContent, 
      pageCount: pdf.numPages 
    };
  } catch (error: any) {
    console.error('Error extracting PDF text:', error);
    throw error;
  }
}

/**
 * Get information about a PDF file
 * @param pdfUrl URL of the PDF file
 * @returns Promise resolving to information about the PDF
 */
export async function getPdfInfo(pdfUrl: string): Promise<{ pageCount: number; isEncrypted: boolean; fingerprint: string }> {
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
    
    // Load the PDF with pdf.js
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(pdfData) });
    const pdf = await loadingTask.promise;
    
    return {
      pageCount: pdf.numPages,
      isEncrypted: pdf.isEncrypted,
      fingerprint: pdf.fingerprint
    };
  } catch (error: any) {
    console.error('Error getting PDF info:', error);
    throw error;
  }
}
