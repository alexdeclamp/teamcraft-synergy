
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
        // Get text content with appropriate parameters
        const content = await page.getTextContent();
        
        // Process text content more carefully
        let lastY: number | null = null;
        let text = '';
        
        for (const item of content.items) {
          // Make sure we're dealing with TextItem not TextMarkedContent
          if ('str' in item) {
            // This is a TextItem
            
            // Add newlines between different vertical positions (paragraphs)
            if (lastY !== null && lastY !== (item as pdfjs.TextItem).transform[5]) {
              text += '\n';
            }
            
            text += (item as pdfjs.TextItem).str;
            
            // Add space if this isn't the end of a line
            if ((item as pdfjs.TextItem).hasEOL !== true) {
              text += ' ';
            } else {
              text += '\n';
            }
            
            lastY = (item as pdfjs.TextItem).transform[5];
          }
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
    
    // Check if PDF is encrypted
    // PDF.js doesn't directly expose isEncrypted in the type definitions
    // but it might be available at runtime
    const isEncrypted = 'isEncrypted' in pdf ? (pdf as any).isEncrypted : false;
    
    // Use fingerprints (plural) as it's the correct property name
    const fingerprint = pdf.fingerprints?.[0] || '';
    
    return {
      pageCount: pdf.numPages,
      isEncrypted,
      fingerprint
    };
  } catch (error: any) {
    console.error('Error getting PDF info:', error);
    throw error;
  }
}
