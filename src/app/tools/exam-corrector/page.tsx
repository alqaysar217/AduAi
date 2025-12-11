
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowLeft,
  FileCheck as FileCheckIcon, // Renamed for clarity
  GraduationCap,
  MoreVertical,
  UploadCloud,
  FileText,
  Trash2,
  Download,
  Share2,
  Loader2,
  AlertTriangle,
  ListChecks,
  Percent,
  Settings2,
  Check as CheckIconLucide, // Renamed for clarity
  X as XIconLucide, // Renamed for clarity
  Sparkles,
  BookCopy,
  History,
  Mail,
  Info,
  Award, // For Top Students
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


const questionTypesOptions = [
  { id: 'auto', label: 'Auto-detect' },
  { id: 'mcq', label: 'Multiple Choice (MCQ)' },
  { id: 'short_answer', label: 'Short Answer' },
  { id: 'essay', label: 'Essay/Long Answer' },
  { id: 'true_false', label: 'True or False' },
  { id: 'matching', label: 'Matching Questions' },
];


const aiSmartExamGraderSchema = z.object({
  examFile: z.any().optional(),
  answerKeyFile: z.any().optional(),
  questionType: z.string().optional().default('auto'),
  leniencyPercentage: z.number().min(0).max(100).optional().default(10),
});

type AiSmartExamGraderFormValues = z.infer<typeof aiSmartExamGraderSchema>;
type GradingStatus = 'idle' | 'uploading' | 'grading' | 'success' | 'error';

// For detailed breakdown per question (might be used in PDF)
interface QuestionResult {
  id: string;
  questionText: string;
  userAnswer: string;
  correctAnswer?: string;
  feedback: string;
  score: number;
  maxScore: number;
  isCorrect?: boolean;
  aiFeedbackPerQuestion?: string;
}

// For individual student summary
interface StudentScore {
  studentName: string;
  correctAnswers: number;
  incorrectAnswers: number;
  finalScore: number;
  totalQuestions: number;
}

// For the overall batch result display
interface ExamBatchResult {
  successRate: number;
  failureRate: number;
  topStudents: StudentScore[];
  allStudentScores?: StudentScore[]; // For full PDF report
}

export default function AiSmartExamGraderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<GradingStatus>('idle');
  const [examFile, setExamFile] = useState<File | null>(null);
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
  const [examBatchResult, setExamBatchResult] = useState<ExamBatchResult | null>(null); // Updated state type
  const [gradingProgress, setGradingProgress] = useState(0);

  const examFileInputRef = useRef<HTMLInputElement>(null);
  const answerKeyFileInputRef = useRef<HTMLInputElement>(null);
  
  const progressToastIdRef = useRef<string | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const currentMessageIndexRef = React.useRef(0);


  const form = useForm<AiSmartExamGraderFormValues>({
    resolver: zodResolver(aiSmartExamGraderSchema),
    defaultValues: {
      questionType: 'auto',
      leniencyPercentage: 10,
    },
  });

  useEffect(() => {
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      if (progressToastIdRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        toast({id: progressToastIdRef.current, title: "", description: ""}); 
      }
    };
  }, [toast]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'exam' | 'answerKey') => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({ title: 'File Too Large', description: 'Please upload a file smaller than 50MB.', variant: 'destructive' });
        return;
      }
      const allowedTypes = [
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg', 'image/png', 'text/plain'
      ];
      if (!allowedTypes.includes(file.type)) {
        toast({ title: 'Invalid File Type', description: 'Allowed: PDF, Word, Excel, JPG, PNG, TXT.', variant: 'destructive' });
        return;
      }

      if (fileType === 'exam') setExamFile(file);
      else setAnswerKeyFile(file);

      toast({ title: `${fileType === 'exam' ? 'Exam' : 'Answer Key'} File Selected`, description: `File "${file.name}" ready.` });
      setStatus('idle');
      setExamBatchResult(null);
    }
  };

  const handleRemoveFile = (fileType: 'exam' | 'answerKey') => {
    if (fileType === 'exam') {
      setExamFile(null);
      if (examFileInputRef.current) examFileInputRef.current.value = '';
    } else {
      setAnswerKeyFile(null);
      if (answerKeyFileInputRef.current) answerKeyFileInputRef.current.value = '';
    }
    toast({ title: `${fileType === 'exam' ? 'Exam' : 'Answer Key'} File Removed` });
  };

  const onSubmit = async (values: AiSmartExamGraderFormValues) => {
    if (!examFile) {
      toast({ title: 'Exam File Missing', description: 'Please upload an exam file.', variant: 'destructive' });
      return;
    }
    if (!answerKeyFile) {
      toast({ title: 'Answer Key Missing', description: 'Please upload an answer key file.', variant: 'destructive' });
      return;
    }

    console.log('AI Smart Exam Grading started:', values);
    setStatus('grading');
    setExamBatchResult(null);
    setGradingProgress(0);
    currentMessageIndexRef.current = 0;

    const progressMessages = [
        "Uploading files...", "Analyzing exam structure...", "Detecting question types...",
        "Matching answers with key...", "Applying semantic comparison...", "Calculating scores...", "Generating feedback..."
    ];
    
    // Check if toast is available before calling
    if (toast && typeof toast === 'function') {
        const { id: toastId, update: updateToast, dismiss: dismissToast } = toast({
            title: 'Grading Progress',
            description: progressMessages[currentMessageIndexRef.current]
        });
        progressToastIdRef.current = toastId;
    }


    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current); 
    }

    intervalIdRef.current = setInterval(() => {
        setGradingProgress(prevProgress => {
            const newInnerProgress = prevProgress + Math.floor(100 / progressMessages.length / 2);
            const nextInnerProgress = Math.min(newInnerProgress, 100);

            const progressPerMessageBoundary = 100 / progressMessages.length;

            if (nextInnerProgress >= (currentMessageIndexRef.current + 1) * progressPerMessageBoundary &&
                currentMessageIndexRef.current < progressMessages.length - 1) {

                currentMessageIndexRef.current = currentMessageIndexRef.current + 1;
                
                setTimeout(() => {
                    if (progressToastIdRef.current && toast && typeof toast === 'function') {
                        // Assuming update functionality exists within your toast hook or is aliased correctly
                        const currentToast = toast({ id: progressToastIdRef.current, title: 'Grading Progress', description: progressMessages[currentMessageIndexRef.current] });
                        if(currentToast.update) currentToast.update({ id: progressToastIdRef.current, description: progressMessages[currentMessageIndexRef.current] });

                    }
                }, 0);
            }

            if (nextInnerProgress >= 100) {
                if (intervalIdRef.current) clearInterval(intervalIdRef.current);
            }
            return nextInnerProgress;
        });
    }, 500);

    await new Promise(resolve => setTimeout(resolve, progressMessages.length * 1000 + 500));
    if (intervalIdRef.current) clearInterval(intervalIdRef.current); 
    setGradingProgress(100);

    if (progressToastIdRef.current && toast && typeof toast === 'function') {
        setTimeout(() => {
           if (progressToastIdRef.current) {
             const currentToast = toast({ id: progressToastIdRef.current, title: 'Grading Progress', description: "Finalizing results..."});
             if(currentToast.update) currentToast.update({ id: progressToastIdRef.current, description: "Finalizing results..." });
           }
        }, 0);
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    if (progressToastIdRef.current && toast && typeof toast === 'function') {
        const currentToast = toast({id: progressToastIdRef.current, title:"", description:""});
        if(currentToast.dismiss) currentToast.dismiss();
        progressToastIdRef.current = null;
    }

    const success = Math.random() > 0.2;
    if (success) {
      // Mock data for a batch of students
      const mockStudentScores: StudentScore[] = [
        { studentName: 'Mahmoud', correctAnswers: 8, incorrectAnswers: 2, finalScore: 80, totalQuestions: 10 },
        { studentName: 'Walid', correctAnswers: 9, incorrectAnswers: 1, finalScore: 90, totalQuestions: 10 },
        { studentName: 'Sultan', correctAnswers: 7, incorrectAnswers: 3, finalScore: 70, totalQuestions: 10 },
        { studentName: 'Aisha', correctAnswers: 6, incorrectAnswers: 4, finalScore: 60, totalQuestions: 10 },
        { studentName: 'Omar', correctAnswers: 9, incorrectAnswers: 1, finalScore: 95, totalQuestions: 10 }, // score 95 to test sorting
      ];

      const totalCorrect = mockStudentScores.reduce((sum, s) => sum + s.correctAnswers, 0);
      const totalQuestionsOverall = mockStudentScores.reduce((sum, s) => sum + s.totalQuestions, 0);
      
      const overallSuccessRate = totalQuestionsOverall > 0 ? (totalCorrect / totalQuestionsOverall) * 100 : 0;
      
      // Sort students by finalScore descending to get top students
      const sortedStudents = [...mockStudentScores].sort((a, b) => b.finalScore - a.finalScore);
      const topStudents = sortedStudents.slice(0, 3);

      setExamBatchResult({
        successRate: overallSuccessRate,
        failureRate: 100 - overallSuccessRate,
        topStudents: topStudents,
        allStudentScores: mockStudentScores, // For the PDF report
      });
      setStatus('success');
      toast({ title: 'Grading Complete!', description: 'Exam results are ready.' });
    } else {
      setStatus('error');
      toast({ title: 'Grading Failed', description: 'Could not grade the exam due to an unexpected issue.', variant: 'destructive' });
    }
  };

  const handleDownloadReport = () => {
    if (!examBatchResult) return;
    const filename = `Exam_Batch_Grading_Report.pdf`;
    toast({ title: 'Download Full Report', description: `Preparing ${filename}... (Not implemented)` });
    // Actual PDF generation logic for all students would go here.
  };

  const handleShareReport = () => {
       if (!examBatchResult) return;
       toast({ title: 'Share Report', description: 'Sharing functionality not implemented yet.' });
   };


  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">AI Smart Exam Grader</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { form.reset(); setExamFile(null); setAnswerKeyFile(null); setExamBatchResult(null); setStatus('idle'); if(intervalIdRef.current) clearInterval(intervalIdRef.current); setGradingProgress(0); }}>Clear All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: 'Help not available' })}>Help</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card className="card-base text-center">
          <CardHeader>
            <GraduationCap className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-heading">AI Smart Exam Grader</CardTitle>
            <CardDescription className="max-w-xl mx-auto">
              Upload exams (PDF, Word, image, text) and answer keys. Get AI-powered grading and detailed reports.
            </CardDescription>
          </CardHeader>
        </Card>

        {status !== 'success' && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card className="card-base">
                <CardHeader><CardTitle className="text-lg font-heading">1. Upload Files & Options</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormItem>
                    <FormLabel>Upload Exam (PDF, Word, JPG, PNG, TXT)</FormLabel>
                    <div className="flex items-center gap-2">
                      <Input id="exam-file-upload" type="file" ref={examFileInputRef} onChange={(e) => handleFileChange(e, 'exam')} className="input-base flex-1" disabled={status === 'grading'} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt" />
                      {examFile && <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveFile('exam')} disabled={status === 'grading'}><Trash2 className="h-4 w-4" /></Button>}
                    </div>
                    {examFile && <FormDescription className="text-xs">Selected: {examFile.name}</FormDescription>}
                  </FormItem>
                  <FormItem>
                    <FormLabel>Upload Answer Key (PDF, Word, JPG, PNG, TXT)</FormLabel>
                    <div className="flex items-center gap-2">
                      <Input id="answer-key-upload" type="file" ref={answerKeyFileInputRef} onChange={(e) => handleFileChange(e, 'answerKey')} className="input-base flex-1" disabled={status === 'grading'} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt" />
                      {answerKeyFile && <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveFile('answerKey')} disabled={status === 'grading'}><Trash2 className="h-4 w-4" /></Button>}
                    </div>
                    {answerKeyFile && <FormDescription className="text-xs">Selected: {answerKeyFile.name}</FormDescription>}
                  </FormItem>

                  <FormField control={form.control} name="questionType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Type (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={status === 'grading'}>
                        <FormControl><SelectTrigger className="input-base"><SelectValue placeholder="Select question type or Auto-detect" /></SelectTrigger></FormControl>
                        <SelectContent>{questionTypesOptions.map(qt => <SelectItem key={qt.id} value={qt.id}>{qt.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="leniencyPercentage" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leniency for Open-ended Questions ({field.value}%)</FormLabel>
                      <FormControl>
                        <Slider defaultValue={[field.value || 10]} min={0} max={100} step={5} onValueChange={(val) => field.onChange(val[0])} disabled={status === 'grading'} className="pt-2" />
                      </FormControl>
                    </FormItem>
                  )} />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full btn-base" disabled={status === 'grading' || !examFile || !answerKeyFile}>
                    {status === 'grading' ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Grading Exam...</> : <><GraduationCap className="mr-2 h-5 w-5" /> Grade Exam</>}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        )}

        {status === 'grading' && (
          <Card className="card-base text-center">
            <CardHeader><CardTitle className="text-xl font-heading">Grading in Progress</CardTitle></CardHeader>
            <CardContent className="p-8 space-y-4">
              <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary" />
              <p className="text-muted-foreground">AI is evaluating the exam. This may take a few moments...</p>
              <Progress value={gradingProgress} className="w-full" />
              <p className="text-sm text-primary">{gradingProgress}% Complete</p>
            </CardContent>
          </Card>
        )}

        {status === 'error' && (
          <Card className="card-base border-destructive bg-destructive/10 text-center">
            <CardContent className="p-8 space-y-3">
              <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-2" />
              <p className="text-lg font-semibold text-destructive">Grading Failed</p>
              <p className="text-sm text-destructive/90">We couldn't grade the exam. Please check files and try again.</p>
              <Button variant="destructive" onClick={() => setStatus('idle')} className="btn-base mt-2">Try Again</Button>
            </CardContent>
          </Card>
        )}

        {status === 'success' && examBatchResult && (
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-2xl font-heading">Grading Report</CardTitle>
              <CardDescription>Summary of the exam evaluation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Final Summary Report */}
              <Card className="bg-muted/30">
                <CardHeader><CardTitle className="text-lg font-heading">Final Summary Report</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <Percent className="h-8 w-8 mx-auto text-green-500 mb-1" />
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold text-green-500">{examBatchResult.successRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <Percent className="h-8 w-8 mx-auto text-destructive mb-1" />
                    <p className="text-xs text-muted-foreground">Failure Rate</p>
                    <p className="text-2xl font-bold text-destructive">{examBatchResult.failureRate.toFixed(1)}%</p>
                  </div>
                </CardContent>
              </Card>

              {/* Top 3 Students Section */}
              <Card>
                <CardHeader><CardTitle className="text-lg font-heading flex items-center gap-2"><Award className="text-yellow-500"/> Top 3 Students</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {examBatchResult.topStudents.map((student, index) => (
                    <Card key={index} className="card-base p-4">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-md font-semibold text-primary">{index + 1}. {student.studentName}</p>
                        <Badge variant="secondary" className="text-sm">Score: {student.finalScore}/{student.totalQuestions * (100/student.totalQuestions)}</Badge> 
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <p><strong className="text-muted-foreground">Correct:</strong> <span className="text-green-600">{student.correctAnswers}</span></p>
                        <p><strong className="text-muted-foreground">Incorrect:</strong> <span className="text-destructive">{student.incorrectAnswers}</span></p>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </CardContent>
            <CardFooter className="flex flex-wrap justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleDownloadReport}><Download className="mr-2 h-4 w-4" /> Download Full Report (PDF)</Button>
              <Button variant="outline" onClick={handleShareReport}><Share2 className="mr-2 h-4 w-4"/> Share Report</Button>
            </CardFooter>
          </Card>
        )}
         <Card className="card-base">
             <CardHeader><CardTitle className="text-lg font-heading">Extra Features (Coming Soon)</CardTitle></CardHeader>
             <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                 <Button variant="outline" className="flex-col h-auto py-3" disabled><BookCopy className="mb-1"/>Bulk Grading</Button>
                 <Button variant="outline" className="flex-col h-auto py-3" disabled><History className="mb-1"/>Save Reports</Button>
                 <Button variant="outline" className="flex-col h-auto py-3" disabled><Mail className="mb-1"/>Share Report (Advanced)</Button>
             </CardContent>
         </Card>
      </main>
    </div>
  );
}

