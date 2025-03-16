
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowRight, FileText, Loader2, Brain, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { summarizeText } from '@/utils/summaryUtils';
import SummaryResult from '@/components/summarize-demo/SummaryResult';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const SummarizeDemo = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setIsComplete(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleSummarize = async () => {
    if (text.trim().length < 50) {
      toast.error('Please enter at least 50 characters to generate a meaningful summary');
      return;
    }

    setIsGenerating(true);
    setIsComplete(false);
    setSummary('');

    try {
      const result = await summarizeText({
        text,
        model: 'claude',
        title,
      });

      setSummary(result);
      setIsComplete(true);
      toast.success('Summary generated successfully!');
    } catch (error: any) {
      console.error('Error generating summary:', error);
      toast.error(`Failed to generate summary: ${error.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSignUp = () => {
    navigate('/auth?tab=register');
  };

  const addSampleText = () => {
    setText(`The Rise of Artificial Intelligence in Business Operations

Artificial intelligence (AI) has transformed from a futuristic concept to a critical business tool in recent years. Companies across industries are leveraging AI technologies to streamline operations, enhance customer experiences, and drive innovation. This shift represents one of the most significant technological revolutions since the advent of the internet.

Key Applications of AI in Business:

1. Customer Service and Engagement
AI-powered chatbots and virtual assistants are handling customer inquiries with increasing sophistication. These systems can manage routine questions, process simple transactions, and escalate complex issues to human agents when necessary. Companies report significant cost savings while maintaining or improving customer satisfaction metrics.

2. Data Analysis and Decision Making
Business intelligence systems enhanced with AI can process vast amounts of data to identify patterns and insights that would be impossible for human analysts to discover unaided. These systems help leaders make more informed decisions based on comprehensive data analysis rather than intuition alone.

3. Process Automation
Robotic Process Automation (RPA) combined with AI is eliminating repetitive tasks across accounting, human resources, and operations departments. This not only reduces costs but also minimizes human error and frees employees to focus on higher-value activities.

4. Predictive Maintenance
In manufacturing and industrial settings, AI systems monitor equipment performance to predict failures before they occur. This proactive approach reduces downtime and extends the lifespan of critical assets.

5. Personalization at Scale
AI enables companies to analyze individual customer preferences and behavior to deliver highly personalized experiences, recommendations, and marketing messages without requiring massive human teams.

Implementation Challenges:

Despite its benefits, AI implementation comes with significant challenges. Organizations face difficulties with:

- Data quality and accessibility
- Integration with legacy systems
- Skills gaps in the workforce
- Ethical considerations and regulatory compliance
- Building trust in AI-driven decisions
- Managing change across the organization

Future Outlook:

As AI technology continues to mature, we can expect further democratization through more accessible tools and platforms. This will allow smaller organizations to benefit from AI capabilities previously available only to large enterprises with substantial resources.

The most successful organizations will be those that view AI not as a standalone solution but as part of a broader digital transformation strategy aligned with clear business objectives. Companies that effectively combine human expertise with AI capabilities will gain sustainable competitive advantages in their respective markets.

The path forward involves thoughtful implementation, continued learning, and adaptability as AI technologies and applications evolve.`);
    setTitle('The Rise of AI in Business');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
        
        {/* Logo and Hero Text - Centered */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          {/* Logo */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
          </div>
          
          <div className="inline-flex items-center justify-center px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            AI-Powered Knowledge Hub
          </div>
          
          {/* Title can wrap on mobile */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-2 sm:mb-3">
            Summarize any document in seconds
          </h1>
          
          {/* Subtitle can wrap on mobile */}
          <p className="text-lg sm:text-xl text-muted-foreground mx-auto mb-6 sm:mb-8">
            Bra<span className="text-primary">3</span>n is a next-gen collaborative knowledge management system
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 mb-10 sm:mb-16">
          {/* Input Form */}
          <div className="bg-background rounded-xl shadow-md p-4 sm:p-6 border border-border/30">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
              Try Our Summarization Tool
            </h2>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Document Title (Optional)
                </label>
                <Input
                  id="title"
                  placeholder="Enter document title"
                  value={title}
                  onChange={handleTitleChange}
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="text" className="block text-sm font-medium mb-1">
                  Paste your text below
                </label>
                <Textarea
                  id="text"
                  placeholder="Paste your document text here (min. 50 characters)"
                  value={text}
                  onChange={handleTextChange}
                  className="min-h-[200px] sm:min-h-[300px] font-mono text-sm"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={addSampleText} 
                  type="button"
                  className="w-full sm:w-auto"
                >
                  Use Sample Text
                </Button>
                
                <Button 
                  onClick={handleSummarize} 
                  disabled={isGenerating || text.trim().length < 50}
                  className={cn(
                    "relative w-full sm:w-auto",
                    isComplete && "bg-green-600 hover:bg-green-700"
                  )}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : isComplete ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Generated!
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Summarize with Claude
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Summary Output */}
          <div className="bg-background rounded-xl shadow-md p-4 sm:p-6 border border-border/30">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center">
              <Brain className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
              AI Summary
            </h2>
            
            <SummaryResult
              summary={summary}
              isGenerating={isGenerating}
            />
            
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border/30">
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Ready to unlock the full power of Bra3n for your team?
              </p>
              <Button onClick={handleSignUp} className="w-full">
                Create Your Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="mb-10 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-6 sm:mb-8">
            Everything your team needs to manage knowledge
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                title: "AI-Powered Summaries",
                description: "Turn long documents into concise, actionable summaries with just one click",
                icon: <Brain className="h-5 w-5 text-primary" />
              },
              {
                title: "Collaborative Workspace",
                description: "Share knowledge, collaborate on documents, and keep your team aligned",
                icon: <FileText className="h-5 w-5 text-primary" />
              },
              {
                title: "Smart Search",
                description: "Find exactly what you need across all your documents with semantic search",
                icon: <Sparkles className="h-5 w-5 text-primary" />
              }
            ].map((feature, index) => (
              <div key={index} className="bg-background rounded-lg p-4 sm:p-5 border border-border/30">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  {feature.icon}
                </div>
                <h3 className="text-base sm:text-lg font-medium mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-primary/5 rounded-2xl p-6 sm:p-8 text-center mb-10 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
            Ready to transform how your team manages information?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mb-4 sm:mb-6">
            Join thousands of teams already using Bra3n to summarize documents,
            extract insights, and make knowledge accessible to everyone.
          </p>
          <Button onClick={handleSignUp} size={isMobile ? "default" : "lg"} className="bg-primary hover:bg-primary/90">
            Get Started Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default SummarizeDemo;
