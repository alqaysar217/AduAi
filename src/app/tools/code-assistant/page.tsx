
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowLeft,
  Code, // Tool icon
  MoreVertical,
  Copy,
  Play, // Run icon
  Download, // Export icon (using Download for now)
  Loader2, // Spinner icon
  AlertTriangle, // Error icon
  ClipboardCheck, // Copy success icon
  Sparkles, // Generate icon
  Bug, // Debug icon
  HelpingHand, // Explain icon (using HelpingHand)
  Wand2, // Improve icon (using Wand2)
  Replace, // Convert icon (using Replace)
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

// Define Zod schema for the form
const codeAssistantSchema = z.object({
  programmingLanguage: z.enum(['python', 'javascript', 'php', 'csharp', 'java', 'other'], { required_error: 'Please select a programming language.' }),
  userPrompt: z.string().min(10, { message: 'Please provide a description or code of at least 10 characters.' }).max(5000, { message: 'Input cannot exceed 5000 characters.' }),
});

type CodeAssistantFormValues = z.infer<typeof codeAssistantSchema>;
type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error';
type ActionType = 'generate' | 'debug' | 'explain' | 'improve' | 'convert' | 'none';

// Mock language list (extend as needed)
const languages = [
  { code: 'python', name: 'Python' },
  { code: 'javascript', name: 'JavaScript' },
  { code: 'php', name: 'PHP' },
  { code: 'csharp', name: 'C#' },
  { code: 'java', name: 'Java' },
  { code: 'other', name: 'Other' },
  // Add more languages
];

// Button explanations
const buttonExplanations = {
    generate: "Generates new code based on your description.",
    debug: "Finds and suggests fixes for errors in your provided code.",
    explain: "Provides a detailed explanation of what your code does.",
    improve: "Suggests ways to enhance the quality, efficiency, or readability of your code.",
    convert: "Translates your code from one programming language to another (specify target language in description)."
};

export default function CodeAssistantPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [action, setAction] = useState<ActionType>('none');
  const [outputText, setOutputText] = useState<string>('');
  const [isOutputCopied, setIsOutputCopied] = useState(false);

  const form = useForm<CodeAssistantFormValues>({
    resolver: zodResolver(codeAssistantSchema),
    defaultValues: {
      programmingLanguage: undefined,
      userPrompt: '',
    },
  });

   // Reset copy icon state when output changes
   React.useEffect(() => {
    setIsOutputCopied(false);
  }, [outputText]);


  const handleAction = async (actionType: ActionType) => {
    // Trigger validation before proceeding
    const isValid = await form.trigger();
    if (!isValid) {
        toast({ title: 'Validation Error', description: 'Please check the form for errors.', variant: 'destructive'});
        return;
    }

    const values = form.getValues();
    const langName = languages.find(l => l.code === values.programmingLanguage)?.name || 'Selected Language';
    console.log(`${actionType} action started for ${langName}:`, values.userPrompt);

    setAction(actionType);
    setStatus('processing');
    setOutputText(''); // Clear previous output
    toast({
      title: `Processing Request`,
      description: `Performing ${actionType} action for ${langName}...`,
    });

    // --- Simulate AI Processing ---
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing time

    // Simulate success or error
    const success = Math.random() > 0.15; // 85% chance of success

    if (success) {
        // Mock output based on action
        let mockOutput = `// Output for ${actionType} action on ${langName} code:\n\n`;
        switch (actionType) {
            case 'generate':
                mockOutput += `function helloWorld() {\n  console.log("Hello from ${langName}!");\n}`;
                break;
            case 'debug':
                 mockOutput += `// Found potential issue:\n// Line 5: Variable 'x' used before assignment.\n// Suggestion: Initialize 'x' before use.`;
                break;
            case 'explain':
                 mockOutput += `// Explanation:\n// This code defines a function that prints a greeting.\n// It uses the standard output method for ${langName}.`;
                break;
             case 'improve':
                 mockOutput += `// Improvement Suggestion:\n// Consider using async/await for better readability if handling asynchronous operations.\n// Add comments to complex logic sections.`;
                 break;
             case 'convert':
                  mockOutput += `// Converted to [Target Language]:\n// (Conversion logic simulation - replace with actual result)\n// Note: Conversion may require manual adjustments.`;
                  break;
            default:
                 mockOutput += `// Action result goes here.`;
        }
        setOutputText(mockOutput);
        setStatus('success');
        toast({
            title: 'Action Complete',
            description: `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} action completed successfully!`,
        });
    } else {
        setStatus('error');
        toast({
            title: 'Action Failed',
            description: `Could not perform ${actionType} action. Please try again.`,
            variant: 'destructive',
        });
    }
  };

  const handleCopyOutput = async () => {
    if (!outputText) return;
    try {
        await navigator.clipboard.writeText(outputText);
        setIsOutputCopied(true);
        toast({ title: 'Copied to Clipboard', description: 'Output copied.' });
        setTimeout(() => setIsOutputCopied(false), 2000); // Reset icon after delay
    } catch (err) {
        toast({ title: 'Copy Failed', description: 'Could not copy output.', variant: 'destructive' });
    }
  };

   const handleRunCode = () => {
       toast({ title: 'Run Code', description: 'Code execution environment is not available in this demo.', variant: 'default' });
       // In a real app, this would involve sending the code to a secure execution environment.
   };

   const handleExportOutput = () => {
       if (!outputText) return;
       try {
           const blob = new Blob([outputText], { type: 'text/plain' });
           const url = URL.createObjectURL(blob);
           const link = document.createElement('a');
           link.href = url;
           const lang = form.getValues('programmingLanguage') || 'code';
           const actionType = action || 'output';
           link.download = `${lang}_${actionType}_output.txt`; // Example filename
           document.body.appendChild(link);
           link.click();
           document.body.removeChild(link);
           URL.revokeObjectURL(url);
           toast({ title: 'Exported Output', description: 'Output saved as a text file.' });
       } catch (err) {
           toast({ title: 'Export Failed', description: 'Could not export output.', variant: 'destructive' });
       }
   };


  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        {/* Centered Icon and Name */}
        <div className="flex items-center gap-2">
          <Code className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">Coding Assistant</h1>
        </div>
        {/* Options Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">Options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
             <DropdownMenuItem onClick={() => form.reset()}>Clear Input & Output</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: "Language Settings clicked (Not implemented)" })}>Language Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: "Help clicked" })}>Help</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Tool Overview */}
        <Card className="card-base text-center">
          <CardHeader>
            <Code className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-heading">Coding Assistant</CardTitle>
            <CardDescription className="max-w-xl mx-auto">
              Your AI partner for coding. Generate, debug, explain, improve, and convert code snippets across various programming languages effortlessly.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Input Form */}
         <Form {...form}>
             <form onSubmit={(e) => e.preventDefault()} className="space-y-6"> {/* Prevent default form submission */}
                 <Card className="card-base">
                     <CardHeader>
                         <CardTitle className="text-lg font-heading">1. Configure & Input</CardTitle>
                         <CardDescription>Select the language and provide your code or description.</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-4">
                         {/* Programming Language Selection */}
                         <FormField
                            control={form.control}
                            name="programmingLanguage"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Programming Language</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={status === 'processing'}>
                                    <FormControl>
                                    <SelectTrigger className="input-base">
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {languages.map(lang => (
                                        <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                         />
                         {/* Input Text Area */}
                         <FormField
                            control={form.control}
                            name="userPrompt"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Description or Code</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Enter your code description, question, or code snippet here..."
                                        {...field}
                                        className="input-base min-h-[180px] font-mono text-sm" // Font mono for code
                                        disabled={status === 'processing'}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                         />
                     </CardContent>
                 </Card>

                 {/* Action Buttons */}
                  <Card className="card-base">
                      <CardHeader>
                          <CardTitle className="text-lg font-heading">2. Choose Action</CardTitle>
                          <CardDescription>Select what you want the assistant to do.</CardDescription>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                         <Button type="button" onClick={() => handleAction('generate')} className="btn-base" disabled={status === 'processing'}>
                           <Sparkles className="mr-2 h-5 w-5" /> Generate
                         </Button>
                         <Button type="button" onClick={() => handleAction('debug')} className="btn-base" disabled={status === 'processing'}>
                           <Bug className="mr-2 h-5 w-5" /> Debug
                         </Button>
                          <Button type="button" onClick={() => handleAction('explain')} className="btn-base" disabled={status === 'processing'}>
                            <HelpingHand className="mr-2 h-5 w-5" /> Explain
                          </Button>
                           <Button type="button" onClick={() => handleAction('improve')} className="btn-base" disabled={status === 'processing'}>
                             <Wand2 className="mr-2 h-5 w-5" /> Improve
                           </Button>
                           <Button type="button" onClick={() => handleAction('convert')} className="btn-base" disabled={status === 'processing'}>
                             <Replace className="mr-2 h-5 w-5" /> Convert
                           </Button>
                      </CardContent>
                  </Card>
             </form>
         </Form>

         {/* Processing State Placeholder */}
         {status === 'processing' && (
             <Card className="card-base text-center">
                 <CardContent className="p-8">
                    <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
                    <p className="text-lg font-semibold text-muted-foreground">Processing Request...</p>
                    <p className="text-sm text-muted-foreground mt-1">Performing {action} action, please wait.</p>
                 </CardContent>
             </Card>
         )}

         {/* Error State */}
         {status === 'error' && (
              <Card className="card-base border-destructive bg-destructive/10 text-center">
                 <CardContent className="p-8">
                     <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
                     <p className="text-lg font-semibold text-destructive">Action Failed</p>
                     <p className="text-sm text-destructive/90 mt-1 mb-4">
                         We couldn't complete the "{action}" action. Please check your input or try again.
                     </p>
                     <Button variant="destructive" onClick={() => {setStatus('idle'); setAction('none');}} className="btn-base">
                         Try Again
                     </Button>
                 </CardContent>
              </Card>
         )}

        {/* Success State - Output Display */}
        {status === 'success' && outputText && (
          <Card className="card-base bg-gradient-to-r from-primary/5 via-background to-secondary/5">
            <CardHeader>
              <CardTitle className="text-xl font-heading">Output</CardTitle>
               <CardDescription>Result of the "{action}" action:</CardDescription>
            </CardHeader>
            <CardContent>
               <Textarea
                    value={outputText}
                    readOnly
                    className="input-base min-h-[200px] bg-muted/50 font-mono text-sm" // Font mono for code output
                    aria-label="Generated code or explanation"
                />
            </CardContent>
             <CardFooter className="flex flex-wrap justify-end gap-2 pt-4">
               <Button type="button" variant="outline" onClick={handleCopyOutput} disabled={!outputText}>
                 {isOutputCopied ? <ClipboardCheck className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />} Copy
               </Button>
               <Button type="button" variant="outline" onClick={handleRunCode} disabled={!outputText || !['generate', 'debug', 'improve'].includes(action)}> {/* Enable Run only for certain actions */}
                 <Play className="mr-2 h-4 w-4" /> Run
               </Button>
               <Button type="button" variant="outline" onClick={handleExportOutput} disabled={!outputText}>
                 <Download className="mr-2 h-4 w-4" /> Export
               </Button>
             </CardFooter>
          </Card>
        )}

         {/* Button Explanations Section */}
          <Card className="card-base">
             <CardHeader>
                 <CardTitle className="text-lg font-heading">Action Explanations</CardTitle>
             </CardHeader>
             <CardContent className="space-y-2 text-sm text-muted-foreground">
                 {Object.entries(buttonExplanations).map(([key, desc]) => (
                     <p key={key}><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {desc}</p>
                 ))}
             </CardContent>
          </Card>

      </main>
    </div>
  );
}

    