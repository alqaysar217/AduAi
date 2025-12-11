
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MoreVertical,
  Search,
  Mic, 
  Clapperboard, 
  Languages, 
  BookOpenCheck, 
  Code, 
  Palette, 
  MessageSquare, 
  FileText, 
  BarChart3, 
  Pencil, 
  Image as ImageIcon, 
  FileQuestion, 
  Filter,
  Settings, 
  Workflow, 
  FileCheck, 
  Presentation, 
  Clock, 
  Wand2, 
  Brain, 
  AudioWaveform, 
  Cpu,
  Replace as UniversalConverterIcon, // Updated Icon
} from 'lucide-react';

import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge'; 
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext'; 
import { cn } from '@/lib/utils'; 

interface Tool {
  icon: React.ElementType;
  name: string; 
  category: string; 
  description: string; 
  path: string; 
}

const allTools: Tool[] = [
  { icon: Mic, name: 'toolTitles.podcastGenerator', category: 'toolCategories.audio', description: 'toolDescriptions.podcastGenerator', path: '/tools/podcast-generator' },
  { icon: Clapperboard, name: 'toolTitles.videoSummarizer', category: 'toolCategories.summarization', description: 'toolDescriptions.videoSummarizer', path: '/tools/video-summarizer' },
  { icon: Languages, name: 'toolTitles.smartTranslation', category: 'toolCategories.translation', description: 'toolDescriptions.smartTranslation', path: '/tools/smart-translation' },
  { icon: BookOpenCheck, name: 'toolTitles.virtualTeacher', category: 'toolCategories.education', description: 'toolDescriptions.virtualTeacher', path: '/tools/virtual-teacher' },
  { icon: Code, name: 'toolTitles.codeAssistant', category: 'toolCategories.programming', description: 'toolDescriptions.codeAssistant', path: '/tools/code-assistant' },
  { icon: Palette, name: 'toolTitles.designIdeas', category: 'toolCategories.design', description: 'toolDescriptions.designIdeas', path: '/tools/design-ideas' },
  { icon: MessageSquare, name: 'toolTitles.chatbotBuilder', category: 'toolCategories.chat', description: 'toolDescriptions.chatbotBuilder', path: '/tools/chatbot-builder' },
  { icon: FileText, name: 'toolTitles.essayWriter', category: 'toolCategories.writing', description: 'toolDescriptions.essayWriter', path: '/tools/essay-writer' },
  { icon: BarChart3, name: 'toolTitles.dataVisualizer', category: 'toolCategories.charts', description: 'toolDescriptions.dataVisualizer', path: '/tools/data-visualizer' },
  { icon: Workflow, name: 'toolTitles.diagramGenerator', category: 'toolCategories.diagramming', description: 'toolDescriptions.diagramGenerator', path: '/tools/diagram-generator' },
  { icon: Pencil, name: 'toolTitles.grammarChecker', category: 'toolCategories.writing', description: 'toolDescriptions.grammarChecker', path: '/tools/grammar-checker' },
  { icon: ImageIcon, name: 'toolTitles.imageGenerator', category: 'toolCategories.design', description: 'toolDescriptions.imageGenerator', path: '/tools/image-generator' },
  { icon: FileQuestion, name: 'toolTitles.researchAssistant', category: 'toolCategories.research', description: 'toolDescriptions.researchAssistant', path: '/tools/research-assistant' },
  { icon: FileQuestion, name: 'toolTitles.testGenerator', category: 'toolCategories.assessment', description: 'toolDescriptions.testGenerator', path: '/tools/test-generator' },
  { icon: FileCheck, name: 'toolTitles.examCorrector', category: 'toolCategories.education', description: 'toolDescriptions.examCorrector', path: '/tools/exam-corrector' },
  { icon: Presentation, name: 'toolTitles.smartSlides', category: 'toolCategories.design', description: 'toolDescriptions.smartSlides', path: '/tools/smart-slides' },
  { icon: Clock, name: 'toolTitles.taskReminder', category: 'toolCategories.organization', description: 'toolDescriptions.taskReminder', path: '/tools/task-reminder' },
  { icon: Wand2, name: 'toolTitles.oldPhotoEnhancer', category: 'toolCategories.imageEnhancement', description: 'toolDescriptions.oldPhotoEnhancer', path: '/tools/old-photo-enhancer' },
  { icon: Brain, name: 'toolTitles.mindMapGenerator', category: 'toolCategories.organizingSummarizing', description: 'toolDescriptions.mindMapGenerator', path: '/tools/mind-map-generator' },
  { icon: Languages, name: 'toolTitles.smartDocImageTranslator', category: 'toolCategories.translation', description: 'toolDescriptions.smartDocImageTranslator', path: '/tools/smart-doc-image-translator' },
  { icon: AudioWaveform, name: 'toolTitles.audioTextConverter', category: 'toolCategories.aiProdTools', description: 'toolDescriptions.audioTextConverter', path: '/tools/audio-text-converter' },
  { icon: Cpu, name: 'toolTitles.codeMentorAI', category: 'toolCategories.programmingAndDevelopment', description: 'toolDescriptions.codeMentorAI', path: '/tools/codementor-ai' },
  { icon: UniversalConverterIcon, name: 'toolTitles.universalConverter', category: 'toolCategories.utilities', description: 'toolDescriptions.universalConverter', path: '/tools/universal-file-converter' },
];

const categories = ['All', ...Array.from(new Set(allTools.map(tool => tool.category)))];

const implementedPaths = [
    '/tools/podcast-generator',
    '/tools/video-summarizer',
    '/tools/diagram-generator',
    '/tools/test-generator',
    '/tools/smart-translation',
    '/tools/code-assistant',
    '/tools/image-generator',
    '/tools/virtual-teacher',
    '/tools/research-assistant',
    '/tools/grammar-checker',
    '/tools/data-visualizer',
    '/tools/essay-writer',
    '/tools/chatbot-builder',
    '/tools/design-ideas',
    '/tools/exam-corrector',
    '/tools/smart-slides',
    '/tools/task-reminder',
    '/tools/old-photo-enhancer',
    '/tools/mind-map-generator', 
    '/tools/smart-doc-image-translator',
    '/tools/audio-text-converter',
    '/tools/codementor-ai',
    '/tools/universal-file-converter',
];

export default function ToolsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { language, t } = useLanguage(); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

   const handleToolClick = (toolNameKey: string, toolPath: string) => {
     if (!implementedPaths.includes(toolPath)) {
          toast({
            title: t(toolNameKey),
            descriptionKey: "dashboard.toolNotImplemented",
          });
      }
   };

  const filteredTools = useMemo(() => {
    return allTools.filter(tool => {
      const toolName = t(tool.name);
      const toolDescription = t(tool.description);
      const toolCategory = t(tool.category);
      
      const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
      const matchesSearch = toolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            toolDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            toolCategory.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    }).sort((a,b) => t(a.name).localeCompare(t(b.name))); 
  }, [searchTerm, selectedCategory, t]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className={cn("h-5 w-5", (language === 'ar' || language === 'ur') && "transform scale-x-[-1]")} />
          <span className="sr-only">{t('buttons.back')}</span>
        </Button>

        <div className="flex items-center gap-2">
          <AppLogo className="h-6 w-6 text-primary" />
          <span className="font-heading text-lg font-bold">{t('tools.title')}</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">{t('buttons.options')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={language === 'ar' ? 'start' : 'end'}>
            <DropdownMenuItem onClick={() => toast({ titleKey: "buttons.sort", description: t('dashboard.notImplemented')})}>{t('buttons.sort')}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ titleKey: "buttons.help" })}>{t('buttons.help')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="relative mb-4">
          <Search className="absolute rtl:right-3 ltr:left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('tools.searchPlaceholder')}
            className="w-full rtl:pr-10 ltr:pl-10 input-base" 
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="mb-6 overflow-x-auto pb-2"> 
          <Tabs value={selectedCategory} onValueChange={handleCategoryChange}>
            <TabsList className="flex w-max"> 
              {categories.map(categoryKey => (
                <TabsTrigger key={categoryKey} value={categoryKey} className="flex-shrink-0">
                  {categoryKey === 'All' ? t('buttons.all', {defaultValue: 'All'}) : t(categoryKey)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredTools.length > 0 ? (
             filteredTools.map(tool => {
               const isImplemented = implementedPaths.includes(tool.path);
               const ToolCard = (
                 <Card
                   key={t(tool.name)}
                   className={`card-base hover:shadow-lg transition-shadow ${isImplemented ? 'cursor-pointer' : 'cursor-default'}`}
                   onClick={!isImplemented ? () => handleToolClick(tool.name, tool.path) : undefined}
                 >
                   <CardHeader className="flex flex-row items-start gap-4 pb-2">
                     <tool.icon className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                     <div className="flex-1">
                       <CardTitle className="text-lg font-heading">{t(tool.name)}</CardTitle>
                       <Badge variant="secondary" className="mt-1 text-xs">{t(tool.category)}</Badge>
                     </div>
                   </CardHeader>
                   <CardContent>
                     <p className="text-sm text-muted-foreground">{t(tool.description)}</p>
                   </CardContent>
                 </Card>
               );

               return isImplemented ? (
                 <Link href={tool.path} key={t(tool.name)} legacyBehavior>
                   <a className="block">{ToolCard}</a>
                 </Link>
               ) : (
                 ToolCard
               );
             })
          ) : (
            <p className="text-muted-foreground col-span-full text-center">{t('tools.noToolsFound')}</p>
          )}
        </div>
      </main>
    </div>
  );
}

    