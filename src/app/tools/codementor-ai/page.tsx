
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowLeft,
  Cpu, // Tool icon
  MoreVertical,
  Sparkles, // Generate icon
  Loader2,
  AlertTriangle,
  Download,
  Eye,
  Share2,
  Copy,
  CheckCircle,
  XCircle,
  Lightbulb,
  BarChartHorizontalBig, // For stats/progress
  BookCopy, // For optimal solution
  ThumbsUp, // For best practices
  Wrench, // For debugging
  LayoutDashboard, // For web dev
  Bot, // For AI domain
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const challengeConfigSchema = z.object({
  level: z.enum(['Beginner', 'Intermediate', 'Advanced'], { required_error: 'Please select a level.' }),
  language: z.enum(['Python', 'Java', 'JavaScript', 'C++', 'Other'], { required_error: 'Please select a language.' }),
  domain: z.enum(['Algorithms', 'WebDevelopment', 'AI', 'DataStructures', 'Debugging', 'MiniProject'], { required_error: 'Please select a domain.' }),
});

const codeSubmissionSchema = z.object({
  userCode: z.string().min(10, { message: 'Please enter some code to evaluate.' }),
});

type ChallengeConfigFormValues = z.infer<typeof challengeConfigSchema>;
type CodeSubmissionFormValues = z.infer<typeof codeSubmissionSchema>;

type ProcessingStatus = 'idle' | 'generating_challenge' | 'challenge_ready' | 'evaluating_code' | 'evaluation_complete' | 'error';

interface Challenge {
  id: string;
  title: string;
  description: string;
  language: string;
  level: string;
  domain: string;
  hints?: string[];
}

interface EvaluationReport {
  score: number;
  correctness: string; // e.g., "Passed 8/10 test cases"
  efficiency: string; // e.g., "Good time complexity"
  readability: string; // e.g., "Well-formatted, good variable names"
  bestPractices: string; // e.g., "Follows language conventions"
  feedback: string; // General feedback
  optimalSolution?: string; // Example of an optimal solution
  improvementSuggestions?: string[];
}

const programmingLevels = ['Beginner', 'Intermediate', 'Advanced'];
const programmingLanguages = ['Python', 'Java', 'JavaScript', 'C++', 'Other'];
const challengeDomains = ['Algorithms', 'WebDevelopment', 'AI', 'DataStructures', 'Debugging', 'MiniProject'];

export default function CodeMentorAIPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [evaluationReport, setEvaluationReport] = useState<EvaluationReport | null>(null);

  const configForm = useForm<ChallengeConfigFormValues>({
    resolver: zodResolver(challengeConfigSchema),
    defaultValues: {
      level: undefined,
      language: undefined,
      domain: undefined,
    },
  });

  const submissionForm = useForm<CodeSubmissionFormValues>({
    resolver: zodResolver(codeSubmissionSchema),
    defaultValues: {
      userCode: '',
    },
  });

  const onGenerateChallenge = async (values: ChallengeConfigFormValues) => {
    setStatus('generating_challenge');
    setCurrentChallenge(null);
    setEvaluationReport(null);
    submissionForm.reset();
    toast({ titleKey: 'codeMentorAI.toast.generatingChallenge' });

    await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate AI generation

    const success = Math.random() > 0.1;
    if (success) {
      setCurrentChallenge({
        id: `chal-${Date.now()}`,
        title: `${values.level} ${values.language} ${values.domain} Challenge`,
        description: t('codeMentorAI.mock.challengeDescription', {
          level: values.level,
          language: values.language,
          domain: values.domain,
        }),
        language: values.language,
        level: values.level,
        domain: values.domain,
        hints: [t('codeMentorAI.mock.hint1'), t('codeMentorAI.mock.hint2')],
      });
      setStatus('challenge_ready');
      toast({ titleKey: 'codeMentorAI.toast.challengeReady' });
    } else {
      setStatus('error');
      toast({ titleKey: 'codeMentorAI.toast.generationFailed', variant: 'destructive' });
    }
  };

  const onEvaluateCode = async (values: CodeSubmissionFormValues) => {
    if (!currentChallenge) return;
    setStatus('evaluating_code');
    setEvaluationReport(null);
    toast({ titleKey: 'codeMentorAI.toast.evaluatingCode' });

    await new Promise(resolve => setTimeout(resolve, 3500)); // Simulate AI evaluation

    const success = Math.random() > 0.1;
    if (success) {
      setEvaluationReport({
        score: Math.floor(Math.random() * 60) + 40, // Score between 40-100
        correctness: t('codeMentorAI.mock.correctness', { pass: Math.floor(Math.random()*5)+5, total: 10 }),
        efficiency: t(['codeMentorAI.mock.efficiencyGood', 'codeMentorAI.mock.efficiencyAverage', 'codeMentorAI.mock.efficiencyPoor'][Math.floor(Math.random()*3)]),
        readability: t(['codeMentorAI.mock.readabilityGood', 'codeMentorAI.mock.readabilityNeedsWork'][Math.floor(Math.random()*2)]),
        bestPractices: t(['codeMentorAI.mock.bestPracticesGood', 'codeMentorAI.mock.bestPracticesPartial'][Math.floor(Math.random()*2)]),
        feedback: t('codeMentorAI.mock.generalFeedback'),
        optimalSolution: t('codeMentorAI.mock.optimalSolution', { language: currentChallenge.language }),
        improvementSuggestions: [t('codeMentorAI.mock.suggestion1'), t('codeMentorAI.mock.suggestion2')],
      });
      setStatus('evaluation_complete');
      toast({ titleKey: 'codeMentorAI.toast.evaluationComplete' });
    } else {
      setStatus('error');
      toast({ titleKey: 'codeMentorAI.toast.evaluationFailed', variant: 'destructive' });
    }
  };
  
  const handleCopy = async (textToCopy: string | undefined) => {
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({ titleKey: 'codeMentorAI.toast.copied' });
    } catch (err) {
      toast({ titleKey: 'codeMentorAI.toast.copyFailed', variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className={cn("h-5 w-5", language === 'ar' && "transform scale-x-[-1]")} />
        </Button>
        <div className="flex items-center gap-2">
          <Cpu className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">{t('toolTitles.codeMentorAI')}</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-5 w-5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={language === 'ar' ? 'start' : 'end'}>
            <DropdownMenuItem onClick={() => { configForm.reset(); submissionForm.reset(); setCurrentChallenge(null); setEvaluationReport(null); setStatus('idle'); }}>{t('buttons.clearAll')}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ titleKey: 'buttons.help', descriptionKey: 'dashboard.notImplemented'})}>{t('buttons.help')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card className="card-base text-center">
          <CardHeader>
            <Cpu className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-heading">{t('toolTitles.codeMentorAI')}</CardTitle>
            <CardDescription className="max-w-xl mx-auto">{t('toolDescriptions.codeMentorAI')}</CardDescription>
          </CardHeader>
        </Card>

        {/* Challenge Configuration */}
        <Form {...configForm}>
          <form onSubmit={configForm.handleSubmit(onGenerateChallenge)} className="space-y-6">
            <Card className="card-base">
              <CardHeader>
                <CardTitle className="text-lg font-heading">{t('codeMentorAI.config.title')}</CardTitle>
                <CardDescription>{t('codeMentorAI.config.description')}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={configForm.control} name="level" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('codeMentorAI.config.levelLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={status === 'generating_challenge' || status === 'evaluating_code'}>
                      <FormControl><SelectTrigger className="input-base"><SelectValue placeholder={t('codeMentorAI.config.levelPlaceholder')} /></SelectTrigger></FormControl>
                      <SelectContent>{programmingLevels.map(lvl => <SelectItem key={lvl} value={lvl}>{t(`codeMentorAI.levels.${lvl.toLowerCase()}`)}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={configForm.control} name="language" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('codeMentorAI.config.languageLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={status === 'generating_challenge' || status === 'evaluating_code'}>
                      <FormControl><SelectTrigger className="input-base"><SelectValue placeholder={t('codeMentorAI.config.languagePlaceholder')} /></SelectTrigger></FormControl>
                      <SelectContent>{programmingLanguages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={configForm.control} name="domain" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('codeMentorAI.config.domainLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={status === 'generating_challenge' || status === 'evaluating_code'}>
                      <FormControl><SelectTrigger className="input-base"><SelectValue placeholder={t('codeMentorAI.config.domainPlaceholder')} /></SelectTrigger></FormControl>
                      <SelectContent>{challengeDomains.map(dom => <SelectItem key={dom} value={dom}>{t(`codeMentorAI.domains.${dom.toLowerCase()}`)}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full btn-base" disabled={status === 'generating_challenge' || status === 'evaluating_code'}>
                  {status === 'generating_challenge' ? <><Loader2 className="rtl:ml-2 ltr:mr-2 h-5 w-5 animate-spin" /> {t('codeMentorAI.buttons.generating')}</> : <><Sparkles className="rtl:ml-2 ltr:mr-2 h-5 w-5" /> {t('codeMentorAI.buttons.generateChallenge')}</>}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>

        {(status === 'generating_challenge') && (
          <Card className="card-base text-center">
            <CardContent className="p-8"><Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" /><p className="mt-2">{t('codeMentorAI.toast.generatingChallenge')}</p></CardContent>
          </Card>
        )}
        
        {status === 'error' && (
            <Alert variant="destructive" className="card-base">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t('codeMentorAI.error.title')}</AlertTitle>
                <AlertDescription>{t('codeMentorAI.error.message')}</AlertDescription>
                 <Button variant="outline" size="sm" className="mt-4" onClick={() => setStatus('idle')}>{t('buttons.tryAgain')}</Button>
            </Alert>
        )}

        {/* Challenge Display */}
        {currentChallenge && (status === 'challenge_ready' || status === 'evaluating_code' || status === 'evaluation_complete') && (
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-xl font-heading">{currentChallenge.title}</CardTitle>
              <CardDescription>{t('codeMentorAI.challenge.language')}: {currentChallenge.language} | {t('codeMentorAI.challenge.level')}: {t(`codeMentorAI.levels.${currentChallenge.level.toLowerCase()}`)} | {t('codeMentorAI.challenge.domain')}: {t(`codeMentorAI.domains.${currentChallenge.domain.toLowerCase()}`)}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{currentChallenge.description}</p>
              {currentChallenge.hints && currentChallenge.hints.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-primary">{t('codeMentorAI.challenge.showHints')}</summary>
                  <ul className="list-disc rtl:list-disc-rtl ltr:pl-5 rtl:pr-5 mt-2 space-y-1 text-xs text-muted-foreground">
                    {currentChallenge.hints.map((hint, i) => <li key={i}>{hint}</li>)}
                  </ul>
                </details>
              )}
            </CardContent>
          </Card>
        )}

        {/* Code Submission */}
        {currentChallenge && (status === 'challenge_ready' || status === 'evaluating_code' || status === 'evaluation_complete') && (
          <Form {...submissionForm}>
            <form onSubmit={submissionForm.handleSubmit(onEvaluateCode)} className="space-y-6">
              <Card className="card-base">
                <CardHeader><CardTitle className="text-lg font-heading">{t('codeMentorAI.submission.title')}</CardTitle></CardHeader>
                <CardContent>
                  <FormField control={submissionForm.control} name="userCode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('codeMentorAI.submission.codeLabel', { language: currentChallenge.language })}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('codeMentorAI.submission.codePlaceholder')}
                          {...field}
                          className="input-base min-h-[250px] font-mono text-sm"
                          disabled={status === 'evaluating_code'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full btn-base" disabled={status === 'evaluating_code'}>
                    {status === 'evaluating_code' ? <><Loader2 className="rtl:ml-2 ltr:mr-2 h-5 w-5 animate-spin" /> {t('codeMentorAI.buttons.evaluating')}</> : <>{t('codeMentorAI.buttons.submitAndEvaluate')}</>}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        )}
        
        {(status === 'evaluating_code') && (
          <Card className="card-base text-center">
            <CardContent className="p-8"><Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" /><p className="mt-2">{t('codeMentorAI.toast.evaluatingCode')}</p></CardContent>
          </Card>
        )}

        {/* Evaluation Report */}
        {evaluationReport && status === 'evaluation_complete' && (
          <Card className="card-base bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <CardHeader>
              <CardTitle className="text-xl font-heading">{t('codeMentorAI.report.title')}</CardTitle>
              <CardDescription>{t('codeMentorAI.report.overallScore')}: <span className="font-bold text-lg text-primary">{evaluationReport.score}/100</span></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <Card className="card-base p-3"><CheckCircle className="h-4 w-4 inline rtl:ml-1 ltr:mr-1 text-green-500"/><strong>{t('codeMentorAI.report.correctness')}:</strong> {evaluationReport.correctness}</Card>
                <Card className="card-base p-3"><BarChartHorizontalBig className="h-4 w-4 inline rtl:ml-1 ltr:mr-1 text-blue-500"/><strong>{t('codeMentorAI.report.efficiency')}:</strong> {evaluationReport.efficiency}</Card>
                <Card className="card-base p-3"><ThumbsUp className="h-4 w-4 inline rtl:ml-1 ltr:mr-1 text-yellow-500"/><strong>{t('codeMentorAI.report.readability')}:</strong> {evaluationReport.readability}</Card>
                <Card className="card-base p-3"><ThumbsUp className="h-4 w-4 inline rtl:ml-1 ltr:mr-1 text-yellow-500"/><strong>{t('codeMentorAI.report.bestPractices')}:</strong> {evaluationReport.bestPractices}</Card>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold mb-1">{t('codeMentorAI.report.feedbackTitle')}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{evaluationReport.feedback}</p>
              </div>
              {evaluationReport.optimalSolution && (
                <div>
                  <h4 className="font-semibold mb-1 flex items-center"><BookCopy className="h-4 w-4 rtl:ml-2 ltr:mr-2 text-primary"/>{t('codeMentorAI.report.optimalSolutionTitle')}
                    <Button variant="ghost" size="icon" className="h-6 w-6 rtl:mr-auto ltr:ml-auto" onClick={() => handleCopy(evaluationReport.optimalSolution)}><Copy className="h-3 w-3"/></Button>
                  </h4>
                  <Textarea value={evaluationReport.optimalSolution} readOnly className="input-base min-h-[150px] font-mono text-xs bg-muted/30" />
                </div>
              )}
              {evaluationReport.improvementSuggestions && evaluationReport.improvementSuggestions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-1 flex items-center"><Lightbulb className="h-4 w-4 rtl:ml-2 ltr:mr-2 text-yellow-400"/>{t('codeMentorAI.report.suggestionsTitle')}</h4>
                  <ul className="list-disc rtl:list-disc-rtl ltr:pl-5 rtl:pr-5 space-y-1 text-sm text-muted-foreground">
                    {evaluationReport.improvementSuggestions.map((suggestion, i) => <li key={i}>{suggestion}</li>)}
                  </ul>
                </div>
              )}
            </CardContent>
             <CardFooter className="flex justify-end">
                 <Button variant="outline" onClick={() => { submissionForm.reset(); setEvaluationReport(null); setStatus('challenge_ready'); }}>{t('codeMentorAI.buttons.tryAgainChallenge')}</Button>
            </CardFooter>
          </Card>
        )}

        {/* Placeholder for Adaptive Learning / User Stats */}
         {(status === 'idle' || status === 'challenge_ready' || status === 'evaluation_complete') && (
            <Card className="card-base">
                <CardHeader>
                    <CardTitle className="text-lg font-heading">{t('codeMentorAI.progress.title')}</CardTitle>
                    <CardDescription>{t('codeMentorAI.progress.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{t('codeMentorAI.progress.comingSoon')}</p>
                    {/* Future: Display stats like challenges completed, average score, areas of strength/weakness */}
                </CardContent>
            </Card>
        )}
      </main>
    </div>
  );
}
