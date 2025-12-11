
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowLeft,
  Pencil, // Tool icon
  MoreVertical,
  Copy,
  Download,
  Info, // Explain icon
  Loader2, // Spinner icon
  AlertTriangle, // Error icon
  ClipboardCheck, // Copy success icon
  CheckCircle2, // No errors found icon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For explanations

// Define Zod schema for the form
const grammarCheckerSchema = z.object({
  inputText: z.string().min(1, { message: 'Please enter text to check.' }).max(10000, { message: 'Text cannot exceed 10,000 characters.' }),
});

type GrammarCheckerFormValues = z.infer<typeof grammarCheckerSchema>;
type ProcessingStatus = 'idle' | 'checking' | 'success' | 'error';

interface Correction {
    id: string;
    original: string;
    corrected: string;
    explanation: string;
}

export default function GrammarCheckerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [correctedText, setCorrectedText] = useState<string>('');
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [isOutputCopied, setIsOutputCopied] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);


  const form = useForm<GrammarCheckerFormValues>({
    resolver: zodResolver(grammarCheckerSchema),
    defaultValues: {
      inputText: '',
    },
  });

   // Reset copy icon state when output changes
   React.useEffect(() => {
     setIsOutputCopied(false);
   }, [correctedText]);


  const onSubmit = async (values: GrammarCheckerFormValues) => {
    console.log('Grammar check started:', values.inputText.substring(0, 50) + '...');
    setStatus('checking');
    setCorrectedText('');
    setCorrections([]);
    setShowExplanations(false);
    toast({ title: 'Checking Grammar...' });

    // --- Simulate AI Processing ---
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing time

    // Simulate success or error
    const success = Math.random() > 0.15; // 85% chance of success

    if (success) {
        // Mock corrections and corrected text
        const inputText = values.inputText;
        let mockCorrectedText = inputText;
        let mockCorrections: Correction[] = [];

        // Simulate finding errors (simple example)
        if (inputText.toLowerCase().includes('their going')) {
             mockCorrectedText = mockCorrectedText.replace(/their going/gi, "they're going");
             mockCorrections.push({ id: 'corr-1', original: 'their going', corrected: "they're going", explanation: "Use 'they're' (they are) instead of 'their' (possessive)." });
        }
         if (inputText.toLowerCase().includes('its fun')) {
             mockCorrectedText = mockCorrectedText.replace(/its fun/gi, "it's fun");
             mockCorrections.push({ id: 'corr-2', original: 'its fun', corrected: "it's fun", explanation: "Use 'it's' (it is) instead of 'its' (possessive)." });
        }
        if (inputText.includes(' .')) {
             mockCorrectedText = mockCorrectedText.replace(/ \./g, ".");
             mockCorrections.push({ id: 'corr-3', original: 'space before period', corrected: 'removed space', explanation: "Remove unnecessary space before punctuation like periods." });
        }


        setCorrectedText(mockCorrectedText);
        setCorrections(mockCorrections);
        setStatus('success');
        toast({ title: 'Grammar Check Complete', description: mockCorrections.length > 0 ? `Found ${mockCorrections.length} potential issues.` : 'No major issues found.' });
    } else {
        setStatus('error');
        toast({ title: 'Check Failed', description: 'Could not check the grammar. Please try again.', variant: 'destructive' });
    }
  };

  const handleCopyOutput = async () => {
    if (!correctedText) return;
    try {
        await navigator.clipboard.writeText(correctedText);
        setIsOutputCopied(true);
        toast({ title: 'Copied to Clipboard', description: 'Corrected text copied.' });
        setTimeout(() => setIsOutputCopied(false), 2000); // Reset icon after delay
    } catch (err) {
        toast({ title: 'Copy Failed', description: 'Could not copy text.', variant: 'destructive' });
    }
  };

   const handleDownloadReport = () => {
        if (!corrections.length && !correctedText) return;
        let reportContent = `Grammar Check Report\n\nOriginal Text:\n${form.getValues('inputText')}\n\nCorrected Text:\n${correctedText}\n\n`;
        if (corrections.length > 0) {
            reportContent += 'Corrections:\n';
            corrections.forEach((corr, index) => {
                reportContent += `${index + 1}. Original: "${corr.original}" -> Corrected: "${corr.corrected}"\n   Explanation: ${corr.explanation}\n`;
            });
        } else {
            reportContent += 'Corrections: No major issues identified.\n';
        }

        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'grammar_report.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({ title: 'Report Downloaded', description: 'Grammar report saved as text file.' });
   };

   const toggleExplanations = () => {
      setShowExplanations(prev => !prev);
   };

   // Function to render text with highlighted corrections (basic example)
    const renderHighlightedText = (original: string, corrected: string, corrs: Correction[]): React.ReactNode => {
        if (!corrs.length || status !== 'success') return corrected; // Return corrected text if no corrections or not success

        // Very basic highlighting - just showing the corrected text for now.
        // A real implementation would involve diffing and span wrapping.
        // Example: Highlight differences using spans. This requires a diff library.
        // For simplicity, we'll just show the corrected text.
        return corrected;
    };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex items-center gap-2">
          <Pencil className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">Grammar Checker</h1>
        </div>
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">Options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => form.reset()}>Clear Text</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: "Settings clicked (Not implemented)" })}>Checker Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: "Help clicked" })}>Help</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Tool Overview */}
        <Card className="card-base text-center">
          <CardHeader>
            <Pencil className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-heading">Grammar Checker</CardTitle>
            <CardDescription className="max-w-xl mx-auto">
              Improve your writing effortlessly. Paste your text below to check for grammar, spelling, and punctuation errors.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Input Form */}
         <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <Card className="card-base">
                     <CardHeader>
                         <CardTitle className="text-lg font-heading">Enter Text to Check</CardTitle>
                     </CardHeader>
                     <CardContent>
                         <FormField
                            control={form.control}
                            name="inputText"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="sr-only">Text Input</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Paste or type your text here..."
                                        {...field}
                                        className="input-base min-h-[200px]"
                                        disabled={status === 'checking'}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                         />
                     </CardContent>
                       <CardFooter>
                          <Button
                              type="submit"
                              className="w-full btn-base"
                              disabled={status === 'checking'}
                          >
                            {status === 'checking' ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Checking...
                              </>
                            ) : (
                              <>
                                <Pencil className="mr-2 h-5 w-5" /> Check Grammar
                              </>
                            )}
                          </Button>
                      </CardFooter>
                 </Card>
             </form>
         </Form>

         {/* Processing State Placeholder */}
         {status === 'checking' && (
             <Card className="card-base text-center">
                 <CardContent className="p-8">
                    <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
                    <p className="text-lg font-semibold text-muted-foreground">Analyzing Text...</p>
                 </CardContent>
             </Card>
         )}

         {/* Error State */}
         {status === 'error' && (
              <Card className="card-base border-destructive bg-destructive/10 text-center">
                 <CardContent className="p-8">
                     <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
                     <p className="text-lg font-semibold text-destructive">Check Failed</p>
                     <p className="text-sm text-destructive/90 mt-1 mb-4">
                         We couldn't check the grammar. Please try again.
                     </p>
                     <Button variant="destructive" onClick={() => setStatus('idle')} className="btn-base">
                         Try Again
                     </Button>
                 </CardContent>
              </Card>
         )}

        {/* Success State - Corrected Text Display */}
        {status === 'success' && (
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-xl font-heading">Corrected Text</CardTitle>
               <CardDescription>
                    {corrections.length > 0
                       ? `Found ${corrections.length} suggestions. Changes are highlighted below.`
                       : "Looks good! No major issues found."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Display corrected text - highlighting would be complex */}
                 <Textarea
                     value={correctedText} // Show corrected text simply for now
                     readOnly
                     className="input-base min-h-[200px] bg-muted/50"
                     aria-label="Corrected text"
                  />
                   {corrections.length === 0 && (
                      <div className="mt-4 p-4 border border-green-500 bg-green-50 rounded-md flex items-center gap-2 text-green-700">
                          <CheckCircle2 className="h-5 w-5" />
                          <p className="text-sm font-medium">No major grammar or spelling errors detected.</p>
                      </div>
                   )}
            </CardContent>
             <CardFooter className="flex flex-wrap justify-end gap-2 pt-4">
               <Button type="button" variant="outline" onClick={handleCopyOutput} disabled={!correctedText}>
                 {isOutputCopied ? <ClipboardCheck className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />} Copy Corrected
               </Button>
               <Button type="button" variant="outline" onClick={handleDownloadReport} disabled={!correctedText}>
                 <Download className="mr-2 h-4 w-4" /> Download Report
               </Button>
               {corrections.length > 0 && (
                 <Button type="button" variant="outline" onClick={toggleExplanations}>
                   <Info className="mr-2 h-4 w-4" /> {showExplanations ? 'Hide' : 'Show'} Explanations
                 </Button>
               )}
             </CardFooter>
          </Card>
        )}

         {/* Explanations Section (Conditional) */}
         {status === 'success' && showExplanations && corrections.length > 0 && (
             <Card className="card-base">
                 <CardHeader>
                     <CardTitle className="text-lg font-heading">Correction Explanations</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                     {corrections.map((corr) => (
                         <Alert key={corr.id}>
                             <Info className="h-4 w-4" />
                             <AlertTitle>Original: "{corr.original}" {'->'} Corrected: "{corr.corrected}"</AlertTitle>
                             <AlertDescription>
                                 {corr.explanation}
                             </AlertDescription>
                         </Alert>
                     ))}
                 </CardContent>
             </Card>
         )}

      </main>
    </div>
  );
}
