
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowLeft,
  FileText, // Tool icon
  MoreVertical,
  Copy,
  Download,
  Save, // Save icon
  Loader2, // Spinner icon
  AlertTriangle, // Error icon
  ClipboardCheck, // Copy success icon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
const essayWriterSchema = z.object({
  topic: z.string().min(5, { message: 'Please provide a topic (min 5 characters).' }).max(200, { message: 'Topic cannot exceed 200 characters.' }),
  style: z.enum(['Persuasive', 'Descriptive', 'Narrative', 'Expository'], { required_error: 'Please select an essay style.' }),
  length: z.enum(['Short', 'Medium', 'Long'], { required_error: 'Please select the desired length.' }),
});

type EssayWriterFormValues = z.infer<typeof essayWriterSchema>;
type ProcessingStatus = 'idle' | 'generating' | 'success' | 'error';

export default function EssayWriterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [generatedEssay, setGeneratedEssay] = useState<string>('');
  const [isOutputCopied, setIsOutputCopied] = useState(false);

  const form = useForm<EssayWriterFormValues>({
    resolver: zodResolver(essayWriterSchema),
    defaultValues: {
      topic: '',
      style: undefined,
      length: undefined,
    },
  });

   // Reset copy icon state when output changes
   React.useEffect(() => {
     setIsOutputCopied(false);
   }, [generatedEssay]);

  const onSubmit = async (values: EssayWriterFormValues) => {
    console.log('Essay generation started:', values);
    setStatus('generating');
    setGeneratedEssay('');
    toast({ title: 'Generating Essay...', description: `Creating a ${values.length}, ${values.style} essay on "${values.topic}"...` });

    // --- Simulate AI Essay Generation ---
    await new Promise(resolve => setTimeout(resolve, 5000)); // Longer delay for essay generation

    // Simulate success or error
    const success = Math.random() > 0.2; // 80% chance of success

    if (success) {
      // Mock essay content
      let mockEssay = `## ${values.topic} (${values.style}, ${values.length})\n\n`;
      mockEssay += `Introduction:\nThis essay explores the topic of ${values.topic} from a ${values.style.toLowerCase()} perspective. The scope will cover... [Intro content depending on length and style].\n\n`;
      mockEssay += `Body Paragraph 1:\n[Content relevant to the topic and style...]\n\n`;
      if (values.length === 'Medium' || values.length === 'Long') {
          mockEssay += `Body Paragraph 2:\n[Further elaboration or arguments...]\n\n`;
      }
       if (values.length === 'Long') {
          mockEssay += `Body Paragraph 3:\n[Deeper analysis or additional examples...]\n\n`;
      }
      mockEssay += `Conclusion:\nIn conclusion, the exploration of ${values.topic} reveals... [Concluding remarks reflecting the style and length].`;

      setGeneratedEssay(mockEssay);
      setStatus('success');
      toast({ title: 'Essay Generated Successfully!' });
    } else {
      setStatus('error');
      toast({ title: 'Generation Failed', description: 'Could not generate the essay. Please try again.', variant: 'destructive' });
    }
  };

  const handleCopyOutput = async () => {
    if (!generatedEssay) return;
    try {
        await navigator.clipboard.writeText(generatedEssay);
        setIsOutputCopied(true);
        toast({ title: 'Copied to Clipboard', description: 'Essay copied.' });
        setTimeout(() => setIsOutputCopied(false), 2000);
    } catch (err) {
        toast({ title: 'Copy Failed', description: 'Could not copy text.', variant: 'destructive' });
    }
  };

   const handleSaveDraft = () => {
       if (!generatedEssay) return;
       toast({ title: 'Save Draft', description: 'Draft saved successfully (Not implemented yet).' });
       // Implement local storage or backend saving logic here
   };

   const handleDownload = () => {
       if (!generatedEssay) return;
       const blob = new Blob([generatedEssay], { type: 'text/plain' });
       const url = URL.createObjectURL(blob);
       const link = document.createElement('a');
       link.href = url;
        const filename = `${form.getValues('topic').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_essay.txt`;
       link.download = filename;
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
       URL.revokeObjectURL(url);
       toast({ title: 'Essay Downloaded', description: `Essay saved as ${filename}.` });
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
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">Essay Writer</h1>
        </div>
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">Options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
             <DropdownMenuItem onClick={() => form.reset()}>Clear Inputs & Essay</DropdownMenuItem>
             <DropdownMenuItem onClick={() => toast({ title: "Help clicked" })}>Help</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Tool Overview */}
        <Card className="card-base text-center">
          <CardHeader>
            <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-heading">Essay Writer</CardTitle>
            <CardDescription className="max-w-xl mx-auto">
              Need help structuring your thoughts? Provide a topic, choose a style and length, and let the AI assist you in generating a structured essay.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Input Form */}
         <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <Card className="card-base">
                     <CardHeader>
                         <CardTitle className="text-lg font-heading">Configure Your Essay</CardTitle>
                         <CardDescription>Define the topic, style, and length.</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-4">
                         {/* Topic Input */}
                         <FormField
                            control={form.control}
                            name="topic"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Essay Topic</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., The Future of Renewable Energy"
                                        {...field}
                                        className="input-base"
                                        disabled={status === 'generating'}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                         />
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {/* Style Selection */}
                             <FormField
                                control={form.control}
                                name="style"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Style</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={status === 'generating'}>
                                        <FormControl>
                                        <SelectTrigger className="input-base">
                                            <SelectValue placeholder="Select style" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Persuasive">Persuasive</SelectItem>
                                            <SelectItem value="Descriptive">Descriptive</SelectItem>
                                            <SelectItem value="Narrative">Narrative</SelectItem>
                                            <SelectItem value="Expository">Expository</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                             />
                              {/* Length Selection */}
                             <FormField
                                control={form.control}
                                name="length"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Length</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={status === 'generating'}>
                                        <FormControl>
                                        <SelectTrigger className="input-base">
                                            <SelectValue placeholder="Select length" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Short">Short (~3 paragraphs)</SelectItem>
                                            <SelectItem value="Medium">Medium (~5 paragraphs)</SelectItem>
                                            <SelectItem value="Long">Long (5+ paragraphs)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                             />
                         </div>
                     </CardContent>
                       <CardFooter>
                          <Button
                              type="submit"
                              className="w-full btn-base"
                              disabled={status === 'generating'}
                          >
                            {status === 'generating' ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Essay...
                              </>
                            ) : (
                              <>
                                <FileText className="mr-2 h-5 w-5" /> Generate Essay
                              </>
                            )}
                          </Button>
                      </CardFooter>
                 </Card>
             </form>
         </Form>

         {/* Generating State Placeholder */}
         {status === 'generating' && (
             <Card className="card-base text-center">
                 <CardContent className="p-8">
                    <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
                    <p className="text-lg font-semibold text-muted-foreground">Writing Essay...</p>
                    <p className="text-sm text-muted-foreground mt-1">Crafting your masterpiece, please wait.</p>
                 </CardContent>
             </Card>
         )}

         {/* Error State */}
         {status === 'error' && (
              <Card className="card-base border-destructive bg-destructive/10 text-center">
                 <CardContent className="p-8">
                     <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
                     <p className="text-lg font-semibold text-destructive">Generation Failed</p>
                     <p className="text-sm text-destructive/90 mt-1 mb-4">
                         We couldn't generate the essay. Please try adjusting the inputs or try again later.
                     </p>
                     <Button variant="destructive" onClick={() => setStatus('idle')} className="btn-base">
                         Try Again
                     </Button>
                 </CardContent>
              </Card>
         )}

        {/* Success State - Generated Essay Display */}
        {status === 'success' && generatedEssay && (
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-xl font-heading">Generated Essay</CardTitle>
               <CardDescription>Your generated {form.getValues('style')} essay on "{form.getValues('topic')}":</CardDescription>
            </CardHeader>
            <CardContent>
               <Textarea
                    value={generatedEssay}
                    readOnly
                    className="input-base min-h-[300px] bg-muted/50" // Adjust height as needed
                    aria-label="Generated essay content"
                />
            </CardContent>
             <CardFooter className="flex flex-wrap justify-end gap-2 pt-4">
               <Button type="button" variant="outline" onClick={handleCopyOutput}>
                 {isOutputCopied ? <ClipboardCheck className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />} Copy
               </Button>
               <Button type="button" variant="outline" onClick={handleSaveDraft}>
                 <Save className="mr-2 h-4 w-4" /> Save Draft
               </Button>
               <Button type="button" variant="outline" onClick={handleDownload}>
                 <Download className="mr-2 h-4 w-4" /> Download
               </Button>
             </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
}
