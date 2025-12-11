
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowLeft,
  FileQuestion, // Tool icon
  MoreVertical,
  Search,
  Copy,
  Download,
  Heart, // Save to favorites icon
  Loader2, // Spinner icon
  AlertTriangle, // Error icon
  ClipboardCheck, // Copy success icon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

// Define Zod schema for the form
const researchAssistantSchema = z.object({
  researchTopic: z.string().min(5, { message: 'Please enter a topic or keywords (min 5 characters).' }).max(1000, { message: 'Input cannot exceed 1000 characters.' }),
  researchType: z.enum(['Summary', 'FullReport', 'KeyPoints'], { required_error: 'Please select a research type.' }),
});

type ResearchAssistantFormValues = z.infer<typeof researchAssistantSchema>;
type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error';

interface ResearchResult {
    id: string;
    title: string;
    content: string; // Can be summary, key points, or part of a report
    source?: string; // Optional source link or name
}

export default function ResearchAssistantPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);

  const form = useForm<ResearchAssistantFormValues>({
    resolver: zodResolver(researchAssistantSchema),
    defaultValues: {
      researchTopic: '',
      researchType: undefined,
    },
  });

  const onSubmit = async (values: ResearchAssistantFormValues) => {
    console.log('Research started:', values);
    setStatus('processing');
    setResults([]); // Clear previous results
    toast({
      title: 'Research Started',
      description: `Gathering information for "${values.researchTopic}"...`,
    });

    // --- Simulate AI Processing ---
    await new Promise(resolve => setTimeout(resolve, 3500)); // Simulate processing time

    // Simulate success or error
    const success = Math.random() > 0.2; // 80% chance of success

    if (success) {
      // Mock results based on type
      let mockResults: ResearchResult[] = [];
      const baseContent = `Based on the topic "${values.researchTopic}", here are the findings. `;
      switch (values.researchType) {
        case 'Summary':
          mockResults = [{ id: 'res-1', title: 'Overall Summary', content: baseContent + 'This is a concise overview covering the main aspects. It includes key finding A, discusses trend B, and concludes with implication C.', source: 'Multiple Sources Synthesis' }];
          break;
        case 'FullReport':
          mockResults = [
            { id: 'res-1', title: 'Introduction', content: baseContent + 'The introduction sets the stage for the research.', source: 'Source A' },
            { id: 'res-2', title: 'Methodology', content: 'Details on how the information was gathered.', source: 'Source B' },
            { id: 'res-3', title: 'Key Findings', content: 'Detailed findings and data points are presented here.', source: 'Source C' },
            { id: 'res-4', title: 'Conclusion', content: 'Summarizing the report and suggesting next steps.', source: 'Source D' },
          ];
          break;
        case 'KeyPoints':
          mockResults = [
            { id: 'res-1', title: 'Point 1', content: baseContent + 'First key takeaway from the research.', source: 'Source X' },
            { id: 'res-2', title: 'Point 2', content: 'Second important finding or insight.', source: 'Source Y' },
            { id: 'res-3', title: 'Point 3', content: 'Third crucial piece of information.', source: 'Source Z' },
          ];
          break;
      }
      setResults(mockResults);
      setStatus('success');
      toast({ title: 'Research Complete', description: 'Information gathered successfully!' });
    } else {
      setStatus('error');
      toast({ title: 'Research Failed', description: 'Could not gather information. Please try again.', variant: 'destructive' });
    }
  };

  const handleCopy = async (textToCopy: string, itemId: string) => {
    if (!textToCopy) return;
    try {
        await navigator.clipboard.writeText(textToCopy);
        setCopiedItemId(itemId);
        toast({ title: 'Copied to Clipboard' });
        setTimeout(() => setCopiedItemId(null), 2000); // Reset icon after delay
    } catch (err) {
        toast({ title: 'Copy Failed', description: 'Could not copy text.', variant: 'destructive' });
    }
  };

   const handleExport = (result: ResearchResult) => {
       const contentToExport = `Title: ${result.title}\nSource: ${result.source || 'N/A'}\n\nContent:\n${result.content}`;
       const blob = new Blob([contentToExport], { type: 'text/plain' });
       const url = URL.createObjectURL(blob);
       const link = document.createElement('a');
       link.href = url;
       link.download = `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
       URL.revokeObjectURL(url);
       toast({ title: 'Exported Result', description: `${result.title} exported as text file.` });
   };

   const handleSaveFavorite = (result: ResearchResult) => {
       toast({ title: 'Save to Favorites', description: `"${result.title}" saved (Not implemented yet).` });
       // Add favorite saving logic here
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
          <FileQuestion className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">Research Assistant</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">Options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => form.reset()}>Clear Input & Results</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: "Settings clicked (Not implemented)" })}>Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: "Help clicked" })}>Help</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Tool Overview */}
        <Card className="card-base text-center">
          <CardHeader>
            <FileQuestion className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-heading">Research Assistant</CardTitle>
            <CardDescription className="max-w-xl mx-auto">
              Need info fast? Enter your topic or keywords, choose the type of research you need (summary, full report, or key points), and let the assistant gather and organize information for you.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Input Form */}
         <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <Card className="card-base">
                     <CardHeader>
                         <CardTitle className="text-lg font-heading">1. Define Your Research</CardTitle>
                         <CardDescription>Enter the topic and select the desired output type.</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-4">
                         {/* Research Topic Input */}
                         <FormField
                            control={form.control}
                            name="researchTopic"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Topic or Keywords</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="e.g., The impact of AI on climate change, key figures in the Renaissance..."
                                        {...field}
                                        className="input-base min-h-[100px]"
                                        disabled={status === 'processing'}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                         />
                          {/* Research Type Selection */}
                         <FormField
                            control={form.control}
                            name="researchType"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Research Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={status === 'processing'}>
                                    <FormControl>
                                    <SelectTrigger className="input-base">
                                        <SelectValue placeholder="Select output type" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Summary">Summary</SelectItem>
                                        <SelectItem value="FullReport">Full Report</SelectItem>
                                        <SelectItem value="KeyPoints">Key Points</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                         />
                     </CardContent>
                       <CardFooter>
                          <Button
                              type="submit"
                              className="w-full btn-base"
                              disabled={status === 'processing'}
                          >
                            {status === 'processing' ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Researching...
                              </>
                            ) : (
                              <>
                                <Search className="mr-2 h-5 w-5" /> Search
                              </>
                            )}
                          </Button>
                      </CardFooter>
                 </Card>
             </form>
         </Form>

         {/* Processing State Placeholder */}
         {status === 'processing' && (
             <Card className="card-base text-center">
                 <CardContent className="p-8">
                    <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
                    <p className="text-lg font-semibold text-muted-foreground">Gathering Information...</p>
                    <p className="text-sm text-muted-foreground mt-1">Please wait while we conduct the research.</p>
                 </CardContent>
             </Card>
         )}

         {/* Error State */}
         {status === 'error' && (
              <Card className="card-base border-destructive bg-destructive/10 text-center">
                 <CardContent className="p-8">
                     <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
                     <p className="text-lg font-semibold text-destructive">Research Failed</p>
                     <p className="text-sm text-destructive/90 mt-1 mb-4">
                         We couldn't find information for your request. Please refine your topic or try again.
                     </p>
                     <Button variant="destructive" onClick={() => setStatus('idle')} className="btn-base">
                         Try Again
                     </Button>
                 </CardContent>
              </Card>
         )}

        {/* Success State - Research Results Display */}
        {status === 'success' && results.length > 0 && (
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-xl font-heading">Research Results</CardTitle>
               <CardDescription>Found {results.length} result(s) for "{form.getValues('researchTopic')}":</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {results.map((result) => (
                    <Card key={result.id} className="card-base overflow-hidden">
                        <CardHeader className="pb-2 bg-muted/30">
                            <CardTitle className="text-base font-heading">{result.title}</CardTitle>
                            {result.source && <CardDescription className="text-xs">Source: {result.source}</CardDescription>}
                        </CardHeader>
                        <CardContent className="pt-3 pb-3">
                           <p className="text-sm text-foreground line-clamp-4"> {/* Allow more lines for content */}
                                {result.content}
                            </p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 pt-2 pb-3 px-4 border-t bg-muted/20">
                            <Button variant="outline" size="sm" onClick={() => handleCopy(result.content, result.id)}>
                               {copiedItemId === result.id ? <ClipboardCheck className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />} Copy
                            </Button>
                             <Button variant="outline" size="sm" onClick={() => handleExport(result)}>
                               <Download className="mr-1 h-4 w-4" /> Export
                            </Button>
                             <Button variant="outline" size="sm" onClick={() => handleSaveFavorite(result)}>
                               <Heart className="mr-1 h-4 w-4" /> Save
                            </Button>
                        </CardFooter>
                    </Card>
               ))}
            </CardContent>
          </Card>
        )}
         {status === 'success' && results.length === 0 && (
             <Card className="card-base text-center">
                 <CardContent className="p-8">
                     <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                     <p className="text-lg font-semibold text-muted-foreground">No Results Found</p>
                     <p className="text-sm text-muted-foreground mt-1">Try adjusting your topic or keywords.</p>
                 </CardContent>
             </Card>
         )}

      </main>
    </div>
  );
}
