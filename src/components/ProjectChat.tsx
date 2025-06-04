
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Info, FileText, Image, Users, Settings, Bell, File } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useProjectChat } from '@/hooks/useProjectChat';
import ProjectChatMessage from '@/components/project/chat/ProjectChatMessage';
import ProjectChatInput from '@/components/project/chat/ProjectChatInput';
import ProjectChatSuggestions from '@/components/project/chat/ProjectChatSuggestions';
import ProjectChatWelcome from '@/components/project/chat/ProjectChatWelcome';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProjectChatProps {
  projectId: string;
  disableAutoScroll?: boolean;
  onNavigate?: (tab: string) => void;
}

const ProjectChat: React.FC<ProjectChatProps> = ({ 
  projectId, 
  disableAutoScroll = false,
  onNavigate 
}) => {
  const { messages, isLoading, error, predefinedQuestions, sendMessage } = useProjectChat(projectId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Scroll to bottom when new messages are added, unless disableAutoScroll is true
  useEffect(() => {
    if (messagesEndRef.current && !disableAutoScroll) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, disableAutoScroll]);

  // Questions plus loose et conversationnelles
  const casualQuestions = [
    "Quoi de neuf sur ce projet ? 🚀",
    "Résume-moi mes notes importantes",
    "Montre-moi mes derniers docs",
    "Comment ça avance ?",
    "Qu'est-ce qui mérite mon attention ?",
    "Aide-moi à faire le point",
    "Mes favoris du moment ?",
    "Dernières actus de l'équipe"
  ];

  // Actions rapides avec navigation
  const quickActions = [
    { label: "📝 Mes notes", tab: "notes", icon: FileText },
    { label: "🖼️ Images", tab: "images", icon: Image },
    { label: "📄 Documents", tab: "documents", icon: File },
    { label: "👥 Équipe", tab: "members", icon: Users },
    { label: "🔔 Updates", tab: "updates", icon: Bell },
    { label: "⚙️ Réglages", tab: "settings", icon: Settings }
  ];

  const handleQuickAction = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handlePredefinedQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <div className="flex flex-col h-full">
      {/* En-tête casual */}
      <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center space-x-2">
          <span className="text-lg">💬</span>
          <h3 className="text-lg font-medium">Parlons projet...</h3>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-background/80">
              <Info className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium">Ce que je sais sur ton projet</h4>
              <p className="text-sm text-muted-foreground">
                J'ai accès à :
              </p>
              <ul className="text-sm space-y-1 list-disc pl-4">
                <li>Tes notes et leurs statuts (favoris, importants)</li>
                <li>Les résumés d'images</li>
                <li>Le contenu des documents</li>
                <li>Les mises à jour récentes</li>
                <li>Les infos de l'équipe</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                Les éléments favoris et importants sont prioritaires dans mes réponses.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Zone de chat principale */}
      <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-background/50 to-background/30">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <div className="mb-6">
                <span className="text-4xl mb-4 block">👋</span>
                <h3 className="text-xl font-medium mb-2">Salut ! Que veux-tu savoir ?</h3>
                <p className="text-muted-foreground">
                  Pose-moi une question ou explore ton projet avec ces raccourcis
                </p>
              </div>
              
              {/* Actions rapides */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                {quickActions.map((action) => (
                  <Button
                    key={action.tab}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action.tab)}
                    className="text-left justify-start"
                  >
                    <action.icon className="h-4 w-4 mr-2" />
                    {action.label}
                  </Button>
                ))}
              </div>
              
              {/* Questions suggérées */}
              <div className="text-left">
                <p className="text-sm font-medium text-muted-foreground mb-3">Ou demande-moi :</p>
                <div className="grid gap-2">
                  {casualQuestions.slice(0, 4).map((question, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePredefinedQuestion(question)}
                      className="text-left justify-start text-sm h-auto py-2 whitespace-normal"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {messages.map((message, index) => (
            <ProjectChatMessage key={index} message={message} />
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="glass-panel p-3 rounded-lg flex items-center space-x-2.5">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                <span className="text-sm text-muted-foreground">Je réfléchis...</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-destructive/10 rounded-md text-destructive text-sm">
              Oups, une erreur : {error}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Zone de saisie avec suggestions contextuelles */}
      <div className="p-4 border-t bg-white">
        {messages.length > 0 && (
          <div className="mb-3">
            <div className="mb-2 text-xs font-medium text-muted-foreground">Suggestions</div>
            <div className="flex flex-wrap gap-2">
              {casualQuestions.slice(4, 7).map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePredefinedQuestion(question)}
                  className="text-xs h-7"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}
        <ProjectChatInput 
          onSendMessage={sendMessage} 
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ProjectChat;
