import React from 'react';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/landing/FooterSection';
import { Separator } from '@/components/ui/separator';
import { Download, Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const Brand = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

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

  const downloadLogo = (format: 'png' | 'svg') => {
    if (format === 'svg') {
      const svgBlob = new Blob([generateLogoSvg()], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bra3n-logo.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('SVG logo downloaded successfully');
    } else if (format === 'png') {
      const svgString = generateLogoSvg();
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 96;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, 240, 96);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const pngUrl = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = pngUrl;
              link.download = 'bra3n-logo.png';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(pngUrl);
              
              toast.success('PNG logo downloaded successfully');
            }
          }, 'image/png');
        }
        
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Brand Guidelines</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Everything you need to know about using our brand assets consistently across all platforms.
            </p>
          </div>

          <Tabs defaultValue="logo" className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="logo">Logo</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="usage">Usage Rules</TabsTrigger>
            </TabsList>

            <TabsContent value="logo" className="space-y-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <h2 className="text-2xl font-semibold mb-4">Primary Logo</h2>
                      <p className="text-muted-foreground mb-4">
                        Our logo combines the Sparkles icon with the wordmark "Bra3n" where the "3" is highlighted in our primary color.
                      </p>
                      <div className="flex flex-col gap-3 mt-6">
                        <Button 
                          variant="outline" 
                          className="flex items-center gap-2 w-full sm:w-auto"
                          onClick={() => downloadLogo('png')}
                        >
                          <Download className="h-4 w-4" />
                          Download PNG
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex items-center gap-2 w-full sm:w-auto"
                          onClick={() => downloadLogo('svg')}
                        >
                          <Download className="h-4 w-4" />
                          Download SVG
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-center border rounded-lg p-12 bg-white">
                      <div className="flex items-center space-x-3">
                        <Sparkles className="h-12 w-12 text-primary" />
                        <span className="font-semibold text-3xl tracking-tight whitespace-nowrap">
                          Bra<span className="text-primary">3</span>n
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-semibold mb-4">Logo Spacing</h2>
                  <p className="text-muted-foreground mb-4">
                    Always maintain adequate clear space around the logo to ensure visibility and impact.
                    The minimum clear space should be equal to the height of the "B" in the wordmark.
                  </p>
                  <div className="bg-muted/30 rounded-lg p-8 border border-dashed border-muted-foreground/40 mt-4">
                    <div className="flex justify-center items-center">
                      <div className="flex items-center space-x-3 bg-white px-8 py-6 rounded-md relative">
                        <div className="h-12 w-12 flex items-center justify-center">
                          <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3l1.2 2.4 2.4 1.2-2.4 1.2L12 9l-1.2-2.4L8.4 5.4l2.4-1.2z" />
                            <path d="M19 9l.8 1.6 1.6.8-1.6.8-.8 1.6-.8-1.6-1.6-.8 1.6-.8z" />
                            <path d="M5 9l.8 1.6 1.6.8-1.6.8L5 14l-.8-1.6-1.6-.8 1.6-.8z" />
                            <path d="M12 15l1.2 2.4 2.4 1.2-2.4 1.2L12 21l-1.2-2.4-2.4-1.2 2.4-1.2z" />
                          </svg>
                        </div>
                        <span className="font-semibold text-2xl tracking-tight whitespace-nowrap">
                          Bra<span className="text-primary">3</span>n
                        </span>
                      </div>
                    </div>
                    <p className="text-center text-sm text-muted-foreground mt-6">
                      Minimum clear space around logo
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="colors" className="space-y-8">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-semibold mb-4">Primary Colors</h2>
                  <p className="text-muted-foreground mb-6">
                    Our primary color palette establishes the visual identity of our brand.
                    Use these colors consistently across all communications.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="h-24 bg-primary rounded-md flex items-end p-3">
                        <div className="text-white font-medium">Primary Blue</div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">HSL: 210 100% 50%</span>
                        <button 
                          className="text-sm flex items-center gap-1" 
                          onClick={() => handleCopy("hsl(210, 100%, 50%)", "primary")}
                        >
                          {copied === "primary" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {copied === "primary" ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="h-24 bg-accent rounded-md flex items-end p-3">
                        <div className="text-accent-foreground font-medium">Accent Blue</div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">HSL: 210 100% 97%</span>
                        <button 
                          className="text-sm flex items-center gap-1" 
                          onClick={() => handleCopy("hsl(210, 100%, 97%)", "accent")}
                        >
                          {copied === "accent" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {copied === "accent" ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="h-24 bg-destructive rounded-md flex items-end p-3">
                        <div className="text-destructive-foreground font-medium">Alert Red</div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">HSL: 0 84% 60%</span>
                        <button 
                          className="text-sm flex items-center gap-1" 
                          onClick={() => handleCopy("hsl(0, 84%, 60%)", "destructive")}
                        >
                          {copied === "destructive" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {copied === "destructive" ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-semibold mb-4">Neutral Colors</h2>
                  <p className="text-muted-foreground mb-6">
                    Our neutral palette complements the primary colors and provides balance in our designs.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="h-20 bg-background border rounded-md flex items-end p-3">
                        <div className="font-medium">Background</div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">HSL: 0 0% 100%</span>
                        <button 
                          className="text-sm flex items-center gap-1" 
                          onClick={() => handleCopy("hsl(0, 0%, 100%)", "background")}
                        >
                          {copied === "background" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {copied === "background" ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="h-20 bg-foreground rounded-md flex items-end p-3">
                        <div className="text-white font-medium">Foreground</div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">HSL: 220 9% 15%</span>
                        <button 
                          className="text-sm flex items-center gap-1" 
                          onClick={() => handleCopy("hsl(220, 9%, 15%)", "foreground")}
                        >
                          {copied === "foreground" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {copied === "foreground" ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="h-20 bg-muted rounded-md flex items-end p-3">
                        <div className="font-medium">Muted</div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">HSL: 220 14% 96%</span>
                        <button 
                          className="text-sm flex items-center gap-1" 
                          onClick={() => handleCopy("hsl(220, 14%, 96%)", "muted")}
                        >
                          {copied === "muted" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {copied === "muted" ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="h-20 bg-muted-foreground rounded-md flex items-end p-3">
                        <div className="text-white font-medium">Muted Text</div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">HSL: 220 9% 45%</span>
                        <button 
                          className="text-sm flex items-center gap-1" 
                          onClick={() => handleCopy("hsl(220, 9%, 45%)", "muted-foreground")}
                        >
                          {copied === "muted-foreground" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {copied === "muted-foreground" ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="typography" className="space-y-8">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-semibold mb-4">Font Family</h2>
                  <p className="text-muted-foreground mb-6">
                    We use Inter as our primary font family for all digital communications. 
                    It provides excellent readability across all device sizes and maintains a modern, professional appearance.
                  </p>
                  
                  <div className="grid gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Primary Font: Inter</h3>
                      <div className="space-y-4 pt-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                          <div className="md:w-32 font-medium">Light (300)</div>
                          <div className="font-light text-xl">The quick brown fox jumps over the lazy dog</div>
                        </div>
                        <Separator />
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                          <div className="md:w-32 font-medium">Regular (400)</div>
                          <div className="font-normal text-xl">The quick brown fox jumps over the lazy dog</div>
                        </div>
                        <Separator />
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                          <div className="md:w-32 font-medium">Medium (500)</div>
                          <div className="font-medium text-xl">The quick brown fox jumps over the lazy dog</div>
                        </div>
                        <Separator />
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                          <div className="md:w-32 font-medium">Semibold (600)</div>
                          <div className="font-semibold text-xl">The quick brown fox jumps over the lazy dog</div>
                        </div>
                        <Separator />
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                          <div className="md:w-32 font-medium">Bold (700)</div>
                          <div className="font-bold text-xl">The quick brown fox jumps over the lazy dog</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-semibold mb-4">Typography Scale</h2>
                  <p className="text-muted-foreground mb-6">
                    Consistent typography scales help maintain visual hierarchy and readability.
                  </p>
                  
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-4xl font-bold">Heading 1</h1>
                      <p className="text-muted-foreground mt-2">4xl (36px) / Bold</p>
                    </div>
                    <Separator />
                    <div>
                      <h2 className="text-3xl font-semibold">Heading 2</h2>
                      <p className="text-muted-foreground mt-2">3xl (30px) / Semibold</p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-2xl font-semibold">Heading 3</h3>
                      <p className="text-muted-foreground mt-2">2xl (24px) / Semibold</p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="text-xl font-medium">Heading 4</h4>
                      <p className="text-muted-foreground mt-2">xl (20px) / Medium</p>
                    </div>
                    <Separator />
                    <div>
                      <h5 className="text-lg font-medium">Heading 5</h5>
                      <p className="text-muted-foreground mt-2">lg (18px) / Medium</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-base">Body text (base)</p>
                      <p className="text-muted-foreground mt-2">base (16px) / Regular</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm">Small text</p>
                      <p className="text-muted-foreground mt-2">sm (14px) / Regular</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="usage" className="space-y-8">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-semibold mb-4">Logo Usage Guidelines</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Do's</h3>
                      <ul className="space-y-2 list-disc pl-5">
                        <li>Use the logo in its original proportions</li>
                        <li>Maintain adequate clear space around the logo</li>
                        <li>Use the logo on appropriate backgrounds with sufficient contrast</li>
                        <li>Use the primary blue version when possible</li>
                        <li>Scale the logo proportionally</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-3">Don'ts</h3>
                      <ul className="space-y-2 list-disc pl-5">
                        <li>Alter the logo colors outside of approved variations</li>
                        <li>Stretch or distort the logo</li>
                        <li>Add effects like shadows or gradients</li>
                        <li>Place the logo on busy backgrounds</li>
                        <li>Rotate or tilt the logo</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-semibold mb-4">Brand Voice</h2>
                  <p className="text-muted-foreground mb-6">
                    Our brand voice is as important as our visual identity. It's how we communicate with our audience across all channels.
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Professional</h3>
                      <p>We communicate with authority and expertise, but without being overly formal or technical.</p>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Friendly</h3>
                      <p>Our tone is approachable and conversational. We're helpers, not lecturers.</p>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Clear</h3>
                      <p>We value clarity over cleverness. Our communication is straightforward and jargon-free.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-semibold mb-4">Legal Usage</h2>
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      Our brand assets are protected by copyright and trademark laws. 
                      Unauthorized use is prohibited.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="mt-6 space-y-4">
                    <p>When referring to our brand in text:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Always use the correct capitalization: "Bra3n" (with a lowercase "a")</li>
                      <li>On first mention, include the ™ symbol: Bra3n™</li>
                      <li>Do not alter or modify our trademarks</li>
                      <li>Do not incorporate our trademarks into your own product names, service names, trademarks, logos, or company names</li>
                    </ul>
                    
                    <p className="mt-4">For any questions regarding the use of our brand assets, please contact our marketing department at brand@example.com</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
};

export default Brand;
