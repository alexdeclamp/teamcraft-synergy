import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download } from 'lucide-react';

const BrandAssets = () => {
  // Function to generate logo SVG
  const generateLogoSvg = () => {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="48" viewBox="0 0 120 48">
      <g fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M24 6l2.4 4.8L31.2 12l-4.8 2.4L24 18l-2.4-4.8L16.8 12l4.8-2.4z" />
        <path d="M38 18l1.6 3.2L42.8 22l-3.2 1.6L38 28l-1.6-3.2L33.2 22l3.2-1.6z" />
        <path d="M10 18l1.6 3.2L14.8 22l-3.2 1.6L10 28l-1.6-3.2L5.2 22l3.2-1.6z" />
        <path d="M24 30l2.4 4.8 4.8 2.4-4.8 2.4L24 42l-2.4-4.8-4.8-2.4 4.8-2.4z" />
      </g>
      <text x="48" y="27" font-family="Inter, sans-serif" font-size="16" font-weight="600" fill="#1F2937">
        Bra<tspan fill="#3B82F6">3</tspan>n
      </text>
    </svg>`;
  };

  // Function to generate favicon (with the diamond-shaped pattern)
  const generateFavicon = () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="12" fill="#2563EB" />
      <path d="M32 19L38 25L32 31L26 25L32 19Z" fill="white" />
      <path d="M45 32L39 38L33 32L39 26L45 32Z" fill="white" />
      <path d="M32 45L26 39L32 33L38 39L32 45Z" fill="white" />
      <path d="M19 32L25 26L31 32L25 38L19 32Z" fill="white" />
    </svg>`;

    return svgContent;
  };

  // Function to generate smaller favicon (16x16)
  const generateSmallFavicon = () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect width="16" height="16" rx="3" fill="#2563EB" />
      <path d="M8 4.75L9.5 6.25L8 7.75L6.5 6.25L8 4.75Z" fill="white" />
      <path d="M11.25 8L9.75 9.5L8.25 8L9.75 6.5L11.25 8Z" fill="white" />
      <path d="M8 11.25L6.5 9.75L8 8.25L9.5 9.75L8 11.25Z" fill="white" />
      <path d="M4.75 8L6.25 6.5L7.75 8L6.25 9.5L4.75 8Z" fill="white" />
    </svg>`;

    return svgContent;
  };

  // Function to generate ICO format favicon
  const generateFaviconIco = () => {
    // ICO is just a wrapper for standard image formats
    // We'll use the same SVG content but instruct user to convert it
    return generateFavicon();
  };

  // Function to generate Apple Touch Icon
  const generateAppleTouchIcon = () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180" fill="none">
      <rect width="180" height="180" rx="45" fill="#2563EB" />
      <path d="M90 53L107 70L90 87L73 70L90 53Z" fill="white" />
      <path d="M127 90L110 107L93 90L110 73L127 90Z" fill="white" />
      <path d="M90 127L73 110L90 93L107 110L90 127Z" fill="white" />
      <path d="M53 90L70 73L87 90L70 107L53 90Z" fill="white" />
    </svg>`;

    return svgContent;
  };

  // Function to generate OG image
  const generateOgImage = () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
      <rect width="1200" height="630" fill="#F8FAFC" />
      <g transform="translate(400, 215)">
        <rect x="0" y="0" width="120" height="120" rx="24" fill="#2563EB" />
        <path d="M60 30L78 48L60 66L42 48L60 30Z" fill="white" />
        <path d="M90 60L72 78L54 60L72 42L90 60Z" fill="white" />
        <path d="M60 90L42 72L60 54L78 72L60 90Z" fill="white" />
        <path d="M30 60L48 42L66 60L48 78L30 60Z" fill="white" />
        <text x="140" y="68" font-family="Inter, sans-serif" font-size="40" font-weight="600" fill="#1F2937">
          Bra<tspan fill="#2563EB">3</tspan>n
        </text>
      </g>
      <text x="600" y="430" font-family="Inter, sans-serif" font-size="24" font-weight="400" fill="#64748b" text-anchor="middle">
        Your AI Second Brain
      </text>
    </svg>`;

    return svgContent;
  };

  // Function to export SVG as PNG with specified dimensions
  const exportSvgAsPng = (svgString, width, height, filename) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const pngUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(pngUrl);
            
            toast.success(`${filename} exported successfully`);
          }
        }, 'image/png');
      }
      
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  };

  // Function to export SVG file
  const exportSvg = (svgString, filename) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`${filename} exported successfully`);
  };

  // Function to add files directly to public folder for production
  const saveToPublicFolder = async (svgString, filename) => {
    try {
      // In a production environment, we would use a server-side solution to save files
      // For now, we'll simulate success and instruct the user
      console.log(`Simulating saving ${filename} to public folder`);
      toast.info(`To use ${filename} in production, please manually add the exported file to your project's public folder.`);
      return true;
    } catch (error) {
      console.error(`Error saving ${filename}:`, error);
      toast.error(`Failed to save ${filename} to public folder`);
      return false;
    }
  };

  const exportFavicon = () => {
    const svgString = generateFavicon();
    const smallSvgString = generateSmallFavicon();
    const icoSvgString = generateFaviconIco();
    
    exportSvgAsPng(svgString, 32, 32, 'favicon-new.png');
    exportSvgAsPng(smallSvgString, 16, 16, 'favicon-new-16x16.png');
    exportSvgAsPng(icoSvgString, 32, 32, 'favicon-new.ico');
    exportSvg(svgString, 'favicon-new.svg');
    
    // Save to public folder (simulation)
    saveToPublicFolder(svgString, 'favicon-new.svg');
    saveToPublicFolder(svgString, 'favicon-new.png');
    saveToPublicFolder(smallSvgString, 'favicon-new-16x16.png');
    saveToPublicFolder(icoSvgString, 'favicon-new.ico');
    
    toast.success('Favicon exported in multiple formats for browser compatibility');
  };

  const exportOgImage = () => {
    const svgString = generateOgImage();
    exportSvgAsPng(svgString, 1200, 630, 'og-image-new.png');
    exportSvg(svgString, 'og-image-new.svg');
    
    // Save to public folder (simulation)
    saveToPublicFolder(svgString, 'og-image-new.png');
  };

  const exportAppleTouchIcon = () => {
    const svgString = generateAppleTouchIcon();
    exportSvgAsPng(svgString, 180, 180, 'apple-touch-icon-new.png');
    exportSvg(svgString, 'apple-touch-icon-new.svg');
    
    // Save to public folder (simulation)
    saveToPublicFolder(svgString, 'apple-touch-icon-new.png');
  };

  const exportAllAssets = () => {
    exportFavicon();
    exportOgImage();
    exportAppleTouchIcon();
  };

  // Automatically generate assets for the public folder on page load
  useEffect(() => {
    // This doesn't actually save to the filesystem in a client-side app,
    // but would be useful in a full-stack environment
    console.log("Page loaded, favicon assets would be generated for public folder in a server environment");
  }, []);

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Brand Asset Generator</h1>
      
      <div className="grid gap-8">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Favicon</h2>
          <div className="flex items-center justify-center bg-slate-100 p-8 rounded-md mb-4">
            <div dangerouslySetInnerHTML={{ __html: generateFavicon() }} />
          </div>
          <p className="text-sm text-gray-500 mb-4">This favicon will generate in multiple formats (SVG, PNG, ICO) for maximum browser compatibility.</p>
          <Button onClick={exportFavicon} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Export Favicon (All Formats)
          </Button>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Social Media Sharing Image</h2>
          <div className="flex items-center justify-center bg-slate-100 p-8 rounded-md mb-4 overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: generateOgImage() }} />
          </div>
          <Button onClick={exportOgImage} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Export OG Image (PNG & SVG)
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Apple Touch Icon</h2>
          <div className="flex items-center justify-center bg-slate-100 p-8 rounded-md mb-4">
            <div 
              dangerouslySetInnerHTML={{ __html: generateAppleTouchIcon() }}
            />
          </div>
          <Button onClick={exportAppleTouchIcon} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Export Apple Touch Icon (PNG & SVG)
          </Button>
        </div>

        <div className="mt-4">
          <Button onClick={exportAllAssets} variant="secondary" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Export All Assets
          </Button>
        </div>
        
        <div className="bg-muted p-6 rounded-lg mt-4">
          <h3 className="font-medium mb-2">Browser Favicon Setup Instructions</h3>
          <p className="text-sm text-muted-foreground mb-4">
            To ensure your favicon displays properly across all browsers:
          </p>
          <ol className="text-sm text-muted-foreground list-decimal pl-4 space-y-2">
            <li>Download all favicon formats using the button above</li>
            <li>Place the downloaded files in your project's <code>public</code> folder</li>
            <li>Ensure your HTML includes references to all favicon formats as shown in your index.html</li>
            <li>Clear your browser cache after deploying to see the changes</li>
            <li>Test across multiple browsers to verify compatibility</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default BrandAssets;
