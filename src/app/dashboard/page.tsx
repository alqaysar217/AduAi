
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bot,
  Heart,
  Home,
  MoreVertical,
  Bell,
  BookOpenCheck,
  Clapperboard,
  Languages,
  Mic,
  User,
  Sparkles,
  Code,
  Palette,
  Workflow, 
  HelpCircle,
  FileQuestion,
  Settings,
  ImageIcon,
  Pencil,
  BarChart3,
  FileText,
  MessageSquare, 
  FileCheck,
  Presentation,
  Clock,
  Wand2,
  LogOut, 
  Brain, 
  AudioWaveform, 
  Cpu,
  Replace as UniversalConverterIcon, // Updated Icon
} from 'lucide-react';

import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext'; 

interface Tool {
  icon: React.ElementType;
  nameKey: string; 
  fieldKey: string; 
  descriptionKey: string; 
  path: string;
}

const popularTools: Tool[] = [
  { icon: Mic, nameKey: 'toolTitles.podcastGenerator', fieldKey: 'toolCategories.audio', descriptionKey: 'toolDescriptions.podcastGenerator', path: '/tools/podcast-generator' },
  { icon: Clapperboard, nameKey: 'toolTitles.videoSummarizer', fieldKey: 'toolCategories.summarization', descriptionKey: 'toolDescriptions.videoSummarizer', path: '/tools/video-summarizer' },
  { icon: Presentation, nameKey: 'toolTitles.smartSlides', fieldKey: 'toolCategories.design', descriptionKey: 'toolDescriptions.smartSlides', path: '/tools/smart-slides' },
  { icon: ImageIcon, nameKey: 'toolTitles.imageGenerator', fieldKey: 'toolCategories.design', descriptionKey: 'toolDescriptions.imageGenerator', path: '/tools/image-generator' },
  { icon: Code, nameKey: 'toolTitles.codeAssistant', fieldKey: 'toolCategories.programming', descriptionKey: 'toolDescriptions.codeAssistant', path: '/tools/code-assistant' },
  { icon: Cpu, nameKey: 'toolTitles.codeMentorAI', fieldKey: 'toolCategories.programmingAndDevelopment', descriptionKey: 'toolDescriptions.codeMentorAI', path: '/tools/codementor-ai'},
  { icon: FileQuestion, nameKey: 'toolTitles.testGenerator', fieldKey: 'toolCategories.assessment', descriptionKey: 'toolDescriptions.testGenerator', path: '/tools/test-generator' },
  { icon: BookOpenCheck, nameKey: 'toolTitles.virtualTeacher', fieldKey: 'toolCategories.education', descriptionKey: 'toolDescriptions.virtualTeacher', path: '/tools/virtual-teacher' },
  { icon: FileText, nameKey: 'toolTitles.essayWriter', fieldKey: 'toolCategories.writing', descriptionKey: 'toolDescriptions.essayWriter', path: '/tools/essay-writer' },
  { icon: FileCheck, nameKey: 'toolTitles.examCorrector', fieldKey: 'toolCategories.education', descriptionKey: 'toolDescriptions.examCorrector', path: '/tools/exam-corrector' },
  { icon: Clock, nameKey: 'toolTitles.taskReminder', fieldKey: 'toolCategories.organization', descriptionKey: 'toolDescriptions.taskReminder', path: '/tools/task-reminder' },
  { icon: Wand2, nameKey: 'toolTitles.oldPhotoEnhancer', fieldKey: 'toolCategories.imageEnhancement', descriptionKey: 'toolDescriptions.oldPhotoEnhancer', path: '/tools/old-photo-enhancer' },
  { icon: Brain, nameKey: 'toolTitles.mindMapGenerator', fieldKey: 'toolCategories.organizingSummarizing', descriptionKey: 'toolDescriptions.mindMapGenerator', path: '/tools/mind-map-generator' },
  { icon: Languages, nameKey: 'toolTitles.smartDocImageTranslator', fieldKey: 'toolCategories.translation', descriptionKey: 'toolDescriptions.smartDocImageTranslator', path: '/tools/smart-doc-image-translator' },
  { icon: AudioWaveform, nameKey: 'toolTitles.audioTextConverter', fieldKey: 'toolCategories.aiProdTools', descriptionKey: 'toolDescriptions.audioTextConverter', path: '/tools/audio-text-converter' },
  { icon: UniversalConverterIcon, nameKey: 'toolTitles.universalConverter', fieldKey: 'toolCategories.utilities', descriptionKey: 'toolDescriptions.universalConverter', path: '/tools/universal-file-converter' },
];

const implementedPaths = [
    '/tools/podcast-generator', '/tools/video-summarizer', '/tools/diagram-generator', '/tools/test-generator',
    '/tools/smart-translation', '/tools/code-assistant', '/tools/image-generator', '/tools/virtual-teacher',
    '/tools/research-assistant', '/tools/grammar-checker', '/tools/data-visualizer', '/tools/essay-writer',
    '/tools/chatbot-builder', '/tools/design-ideas', '/tools/exam-corrector', '/tools/smart-slides',
    '/tools/task-reminder', '/tools/old-photo-enhancer', '/tools/mind-map-generator', 
    '/tools/smart-doc-image-translator', '/tools/audio-text-converter', '/tools/codementor-ai',
    '/tools/universal-file-converter',
];

export default function DashboardPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { t, language } = useLanguage(); 

  const handleChatClick = () => {
    router.push('/chat');
  };

  const handleToolClick = (toolNameKey: string, toolPath: string) => {
    if (!implementedPaths.includes(toolPath)) {
         toast({
           title: t(toolNameKey),
           description: t('dashboard.toolNotImplemented', {defaultValue: "This tool is not implemented yet."}),
         });
     }
   };

  const handleLogout = () => {
    console.log("Logging out...");
    toast({
        title: t('dashboard.logoutSuccessTitle', {defaultValue: "Logged Out"}),
        description: t('dashboard.logoutSuccessDesc', {defaultValue: "You have been successfully logged out."}),
    });
    setTimeout(() => {
        window.location.href = '/login';
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background border-b">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">{t('buttons.options')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent alignOffset={language === 'ar' ? -100 : 0} align={language === 'ar' ? 'end' : 'start'}>
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className="rtl:ml-2 ltr:mr-2 h-4 w-4" />
              <span>{t('dashboard.profile')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
               <Settings className="rtl:ml-2 ltr:mr-2 h-4 w-4" />
              <span>{t('buttons.settings')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: t('buttons.help') + " (" + t('dashboard.notImplemented', {defaultValue: "Not implemented"}) + ")" })}>
                <HelpCircle className="rtl:ml-2 ltr:mr-2 h-4 w-4" />
                {t('buttons.help')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <LogOut className="rtl:ml-2 ltr:mr-2 h-4 w-4" />
                {t('buttons.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2">
          <AppLogo className="h-6 w-6 text-primary" />
          <span className="font-heading text-lg font-bold">{t('appName')}</span>
        </div>
        <div className="w-8"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 pb-20">
        <section className="flex flex-col items-center text-center mb-8">
          <AppLogo className="h-24 w-24 text-primary mb-4" data-ai-hint="logo app"/>
          <h1 className="text-2xl font-heading mb-2">{t('dashboard.welcomeMessage')}</h1>
          <p className="text-muted-foreground mb-4">{t('dashboard.welcomeSubMessage')}</p>
          <Button onClick={handleChatClick} className="btn-base">
            <Sparkles className="rtl:ml-2 ltr:mr-2 h-5 w-5" /> {t('buttons.startChat')}
          </Button>
        </section>

        <Separator className="my-6" />

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading">{t('dashboard.popularTools')}</h2>
            <Button variant="link" className="text-primary p-0 h-auto" asChild>
               <Link href="/tools">{t('buttons.showAll')}</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {popularTools.map((tool) => {
              const isImplemented = implementedPaths.includes(tool.path);
              const ToolCard = (
                 <Card
                    key={t(tool.nameKey)}
                    className={`card-base hover:shadow-lg transition-shadow ${isImplemented ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={!isImplemented ? () => handleToolClick(tool.nameKey, tool.path) : undefined}
                 >
                    <CardHeader className="flex flex-row items-start gap-4 pb-2">
                      <tool.icon className="h-8 w-8 text-primary mt-1" />
                       <div className="flex-1">
                        <CardTitle className="text-lg font-heading">{t(tool.nameKey)}</CardTitle>
                         <CardDescription className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full inline-block mt-1">
                            {t(tool.fieldKey)}
                        </CardDescription>
                       </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{t(tool.descriptionKey)}</p>
                    </CardContent>
                 </Card>
              );

              return isImplemented ? (
                 <Link href={tool.path} key={t(tool.nameKey)} legacyBehavior>
                    <a className="block">{ToolCard}</a>
                 </Link>
              ) : (
                ToolCard
              );
            })}
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-10 flex justify-around h-16 bg-background border-t">
        <Link href="/dashboard" className="flex flex-col items-center justify-center text-primary pt-2 pb-1">
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">{t('dashboard.home')}</span>
        </Link>
        <Link href="/favorites" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary pt-2 pb-1">
          <Heart className="h-6 w-6" />
          <span className="text-xs mt-1">{t('dashboard.favorites')}</span>
        </Link>
        <Link href="/notifications" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary pt-2 pb-1">
           <div className="relative">
             <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-background bg-destructive"></span>
           </div>
          <span className="text-xs mt-1">{t('dashboard.notifications')}</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary pt-2 pb-1">
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">{t('dashboard.profile')}</span>
        </Link>
      </nav>
    </div>
  );
}

    