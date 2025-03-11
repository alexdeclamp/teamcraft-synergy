
import * as pdfjs from 'pdfjs-dist';

// Initialize pdf.js worker without using top-level await
const pdfjsWorker = import('pdfjs-dist/build/pdf.worker.entry');
pdfjsWorker.then(worker => {
  pdfjs.GlobalWorkerOptions.workerSrc = worker;
});

// Define custom interfaces for PDF.js text content items
interface TextItem {
  str: string;
  transform: number[];
  hasEOL?: boolean;
  dir?: string;
}

interface TextMarkedContent {
  type: string;
  items: any[];
}

// Type guard to check if an item is a TextItem
function isTextItem(item: any): item is TextItem {
  return item && typeof item.str === 'string' && Array.isArray(item.transform);
}

/**
 * Extract text from a PDF file
 * @param pdfUrl URL of the PDF file
 * @returns Promise resolving to the extracted text and page count
 */
export async function extractPdfText(pdfUrl: string): Promise<{ text: string; pageCount: number }> {
  try {
    // Wait for the worker to be initialized
    await pdfjsWorker;
    
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
        // Get text content with default parameters
        const content = await page.getTextContent();
        
        // Process text content more carefully
        let lastY: number | null = null;
        let text = '';
        
        for (const item of content.items) {
          // Use type guard to check if this is a TextItem
          if (isTextItem(item)) {
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
      text: textContent.trim(), 
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
    // Wait for the worker to be initialized
    await pdfjsWorker;
    
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
    
    // For pdfjs-dist v3.x, we need to check properties in a different way
    // Use typescript "as any" temporarily to access non-typed properties
    const pdfAny = pdf as any;
    
    // Get encrypted status safely
    const isEncrypted = pdfAny._pdfInfo?.encrypted || false;
    
    // Get fingerprint safely
    // First try fingerprints (array), then fall back to fingerprint (string)
    const fingerprint = pdf.fingerprints?.[0] || pdfAny.fingerprint || '';
    
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
