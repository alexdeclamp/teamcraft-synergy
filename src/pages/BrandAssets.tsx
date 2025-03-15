
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

  // Function to generate favicon
  const generateFavicon = () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="12" fill="#3B82F6" />
      <g transform="translate(16, 16)" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 4l1.6 3.2L21.2 8l-3.2 1.6L16 12l-1.6-3.2L10.8 8l3.2-1.6z" />
        <path d="M25.3 12l1.1 2.1L28.5 15l-2.1 1.1L25.3 18l-1.1-2.1L22.1 15l2.1-1.1z" />
        <path d="M6.7 12l1.1 2.1L9.9 15l-2.1 1.1L6.7 18l-1.1-2.1L3.5 15l2.1-1.1z" />
        <path d="M16 20l1.6 3.2 3.6 1.6-3.6 1.6L16 28l-1.6-3.2-3.6-1.6 3.6-1.6z" />
      </g>
    </svg>`;

    return svgContent;
  };

  // Function to generate Apple Touch Icon
  const generateAppleTouchIcon = () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180" fill="none">
      <rect width="180" height="180" rx="45" fill="#3B82F6" />
      <g transform="translate(45, 45)" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M45 11.25l4.5 9L58.5 22.5l-9 4.5L45 36l-4.5-9-9-4.5 9-4.5z" />
        <path d="M71.25 33.75l3 6 7.5 3-7.5 3-3 6-3-6-7.5-3 7.5-3z" />
        <path d="M18.75 33.75l3 6 7.5 3-7.5 3-3 6-3-6-7.5-3 7.5-3z" />
        <path d="M45 56.25l4.5 9 9 4.5-9 4.5-4.5 9-4.5-9-9-4.5 9-4.5z" />
      </g>
    </svg>`;

    return svgContent;
  };

  // Function to generate OG image
  const generateOgImage = () => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
      <rect width="1200" height="630" fill="#F8FAFC" />
      <g transform="translate(400, 215)">
        <g fill="none" stroke="#3B82F6" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M60 15l6 12L78 30l-12 6L60 45l-6-12L42 30l12-6z" />
          <path d="M95 45l4 8L107 55l-8 4L95 70l-4-8L83 55l8-4z" />
          <path d="M25 45l4 8L37 55l-8 4L25 70l-4-8L13 55l8-4z" />
          <path d="M60 75l6 12 12 6-12 6L60 105l-6-12-12-6 12-6z" />
        </g>
        <text x="120" y="68" font-family="Inter, sans-serif" font-size="40" font-weight="600" fill="#1F2937">
          Bra<tspan fill="#3B82F6">3</tspan>n
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

  const exportFavicon = () => {
    const svgString = generateFavicon();
    exportSvgAsPng(svgString, 64, 64, 'favicon-new.png');
    exportSvg(svgString, 'favicon-new.svg');
  };

  const exportOgImage = () => {
    const svgString = generateOgImage();
    exportSvgAsPng(svgString, 1200, 630, 'og-image-new.png');
    exportSvg(svgString, 'og-image-new.svg');
  };

  const exportAppleTouchIcon = () => {
    const svgString = generateAppleTouchIcon();
    exportSvgAsPng(svgString, 180, 180, 'apple-touch-icon-new.png');
    exportSvg(svgString, 'apple-touch-icon-new.svg');
  };

  const exportAllAssets = () => {
    exportFavicon();
    exportOgImage();
    exportAppleTouchIcon();
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Brand Asset Generator</h1>
      
      <div className="grid gap-8">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Favicon</h2>
          <div className="flex items-center justify-center bg-slate-100 p-8 rounded-md mb-4">
            <div dangerouslySetInnerHTML={{ __html: generateFavicon() }} />
          </div>
          <Button onClick={exportFavicon} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Export Favicon (PNG & SVG)
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
      </div>
    </div>
  );
};

export default BrandAssets;
