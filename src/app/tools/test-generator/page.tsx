
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowLeft,
  FileQuestion, // Replaced TestTubeDiagonal with FileQuestion
  MoreVertical,
  UploadCloud,
  FileText, // Icon for text input/uploaded file
  Type, // Icon for lesson name input
  X, // Close icon
  Check, // Icon for selected item
  ListChecks, // Icon for Question Types
  Languages as LanguagesIcon, // Icon for Language
  Clock, // Icon for Duration
  Loader2, // Spinner icon
  AlertTriangle, // Error icon
  Download,
  Share2,
  Printer,
  RotateCcw, // Icon for Create Another Test
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

// Define Zod schema for test generation form validation
const questionTypes = [
    { id: 'mcq', label: 'Multiple Choice' },
    { id: 'tf', label: 'True/False' },
    { id: 'match', label: 'Matching' },
    { id: 'short', label: 'Short Answer' },
] as const;

const testGeneratorSchema = z.object({
  inputMethod: z.enum(['text', 'file', 'lesson'], { required_error: 'Please select an input method.' }),
  inputText: z.string().optional(),
  lessonName: z.string().optional(),
  // File handling is separate, not part of Zod schema here
  numQuestions: z.number().min(1, {message: 'Must have at least 1 question.'}).max(50, {message: 'Maximum 50 questions.'}).default(5),
  questionTypes: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one question type.",
  }),
  language: z.enum(['en', 'ar'], { required_error: 'Please select a language.'}).default('en'),
  duration: z.number().min(0).max(180).optional(), // Optional duration in minutes
}).refine((data) => {
    if (data.inputMethod === 'text') return !!data.inputText && data.inputText.length >= 20; // Require min length for text
    if (data.inputMethod === 'lesson') return !!data.lessonName;
    // File validation happens outside Zod
    return true;
}, {
    message: "Please provide valid input for the selected method (e.g., text content, lesson name, or upload a file). Text input requires at least 20 characters.",
    path: ["inputMethod"], // Attach error to the method selection field for visibility
});


type TestGeneratorFormValues = z.infer<typeof testGeneratorSchema>;
type GenerationStatus = 'idle' | 'configuring' | 'generating' | 'success' | 'error';

export default function TestGeneratorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generatedTest, setGeneratedTest] = useState<string | null>(null); // Store generated test content
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TestGeneratorFormValues>({
    resolver: zodResolver(testGeneratorSchema),
    defaultValues: {
      inputMethod: undefined,
      inputText: '',
      lessonName: '',
      numQuestions: 5,
      questionTypes: [],
      language: 'en',
      duration: undefined,
    },
  });

  const selectedInputMethod = form.watch('inputMethod');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic validation (e.g., file type, size)
      if (file.size > 10 * 1024 * 1024) { // Max 10MB
        toast({ title: 'File Too Large', description: 'Please upload a file smaller than 10MB.', variant: 'destructive' });
        return;
      }
      const allowedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({ title: 'Invalid File Type', description: 'Please upload a .txt, .pdf, or .docx file.', variant: 'destructive' });
        return;
      }
      setUploadedFile(file);
      form.setValue('inputMethod', 'file'); // Set input method when file is chosen
      setStatus('configuring'); // Move to configuration step
      toast({ title: 'File Selected', description: `File "${file.name}" ready.` });
    }
  };

   const handleRemoveFile = () => {
      setUploadedFile(null);
      form.resetField('inputMethod'); // Reset method selection
      setStatus('idle');
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast({ title: 'File Removed' });
   };

   // Update status when input method changes
   React.useEffect(() => {
       if (selectedInputMethod === 'text' || selectedInputMethod === 'lesson') {
           setStatus('configuring');
           setUploadedFile(null); // Clear file if text/lesson is chosen
           if (fileInputRef.current) fileInputRef.current.value = '';
       } else if (selectedInputMethod === 'file' && !uploadedFile) {
           // If file method is selected but no file, wait for upload
           setStatus('idle');
       } else if (!selectedInputMethod) {
           setStatus('idle');
       }
   }, [selectedInputMethod, uploadedFile]);


  const onSubmit = async (values: TestGeneratorFormValues) => {
    // Final validation before submitting
    if (values.inputMethod === 'file' && !uploadedFile) {
      toast({ title: 'Error', description: 'Please upload a file for the file input method.', variant: 'destructive' });
      form.setError('inputMethod', { message: 'File is required.' });
      return;
    }
    if (values.inputMethod === 'text' && (!values.inputText || values.inputText.length < 20)) {
       toast({ title: 'Error', description: 'Text input must be at least 20 characters.', variant: 'destructive' });
       form.setError('inputText', { message: 'Minimum 20 characters required.' });
       return;
    }
     if (values.inputMethod === 'lesson' && !values.lessonName) {
       toast({ title: 'Error', description: 'Lesson name cannot be empty.', variant: 'destructive' });
       form.setError('lessonName', { message: 'Lesson name is required.' });
       return;
    }

    console.log('Test generation started with values:', values);
    setStatus('generating');
    setGeneratedTest(null);
    toast({ title: 'Generation Started', description: 'Creating your test...' });

    // --- Simulate AI Test Generation ---
    await new Promise(resolve => setTimeout(resolve, 3500));

    // Simulate success or error
    const success = Math.random() > 0.2; // 80% success rate

    if (success) {
      const simulatedTest = `## Test: ${values.lessonName || uploadedFile?.name || 'Generated Test'}

**Instructions:** Answer all questions to the best of your ability.
**Duration:** ${values.duration ? values.duration + ' minutes' : 'N/A'}
**Language:** ${values.language === 'en' ? 'English' : 'Arabic'}

---

**Section: Multiple Choice (${values.questionTypes.includes('mcq') ? values.numQuestions : 0} questions)**

1.  What is the primary goal of AI?
    a) To replicate human intelligence
    b) To replace human workers
    c) To create sentient machines
    d) To play chess

**Section: True/False (${values.questionTypes.includes('tf') ? values.numQuestions : 0} questions)**

1.  True or False: Machine Learning is a subset of AI.

---
*(More questions based on configuration would appear here...)*
`;
      setGeneratedTest(simulatedTest);
      setStatus('success');
      toast({ title: 'Test Generated', description: 'Your test has been successfully created!' });
    } else {
      setStatus('error');
      toast({ title: 'Generation Failed', description: 'Could not generate the test. Please check your input or try again.', variant: 'destructive' });
    }
  };

   const handleExport = () => {
      if (!generatedTest) return;
      const blob = new Blob([generatedTest], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'generated_test.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: 'Test Exported', description: 'Test downloaded as generated_test.txt' });
   };

   const handleShare = () => {
     if (!generatedTest) return;
     if (navigator.share) {
       navigator.share({ title: 'EduAI Generated Test', text: generatedTest })
         .then(() => toast({ title: 'Test Shared' }))
         .catch((error) => {
             console.error('Share failed:', error);
             // Fallback: Copy to clipboard if share fails or is cancelled
             navigator.clipboard.writeText(generatedTest);
             toast({ title: 'Share Failed/Cancelled', description: 'Test copied to clipboard instead.', variant: 'default' });
         });
     } else {
       navigator.clipboard.writeText(generatedTest);
       toast({ title: 'Share Not Supported', description: 'Test copied to clipboard.' });
     }
   };

   const handlePrint = () => {
      if (!generatedTest) return;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
         printWindow.document.write(`<html><head><title>Print Test</title><style>pre { white-space: pre-wrap; word-wrap: break-word; }</style></head><body><pre>${generatedTest}</pre></body></html>`);
         printWindow.document.close();
         printWindow.focus(); // Focus is necessary for some browsers
         // Delay print command slightly to ensure content is loaded
         setTimeout(() => {
             printWindow.print();
             printWindow.close();
         }, 250);
         toast({ title: 'Preparing Print...' });
      } else {
          toast({ title: 'Print Error', description: 'Could not open print window. Please check browser settings.', variant: 'destructive' });
      }
   };

   const handleCreateAnother = () => {
       form.reset();
       setUploadedFile(null);
       setGeneratedTest(null);
       setStatus('idle');
       if (fileInputRef.current) fileInputRef.current.value = '';
       toast({ title: 'Ready for New Test' });
       window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <FileQuestion className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">Test Generator</h1>
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
            <DropdownMenuItem onClick={() => toast({ title: "View History clicked (Not implemented)" })}>View History</DropdownMenuItem>
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
            <CardTitle className="text-2xl font-heading">Test Generator</CardTitle>
            <CardDescription className="max-w-xl mx-auto">
               Easily create quizzes and tests based on a text, file, or lesson name.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Form */}
         <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 {/* Input Method Selection */}
                 <Card className="card-base">
                     <CardHeader>
                         <CardTitle className="text-lg font-heading">1. Choose Input Method</CardTitle>
                         <CardDescription>How do you want to provide the content for the test?</CardDescription>
                     </CardHeader>
                     <CardContent>
                        <FormField
                          control={form.control}
                          name="inputMethod"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                  disabled={status === 'generating'}
                                >
                                  {/* Text Input Option */}
                                  <FormItem>
                                    <Label htmlFor="input-text" className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors ${field.value === 'text' ? 'border-primary bg-primary/10' : 'border-border'}`}>
                                      <RadioGroupItem value="text" id="input-text" className="sr-only" />
                                      <FileText className="mb-3 h-6 w-6" />
                                      <span className="block w-full text-center text-sm font-medium">Paste Text</span>
                                    </Label>
                                  </FormItem>
                                  {/* File Upload Option */}
                                  <FormItem>
                                     <Label htmlFor="input-file" className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors ${field.value === 'file' ? 'border-primary bg-primary/10' : 'border-border'}`}>
                                      <RadioGroupItem value="file" id="input-file" className="sr-only" />
                                      <UploadCloud className="mb-3 h-6 w-6" />
                                       <span className="block w-full text-center text-sm font-medium">Upload File</span>
                                    </Label>
                                  </FormItem>
                                  {/* Lesson Name Option */}
                                  <FormItem>
                                     <Label htmlFor="input-lesson" className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors ${field.value === 'lesson' ? 'border-primary bg-primary/10' : 'border-border'}`}>
                                       <RadioGroupItem value="lesson" id="input-lesson" className="sr-only" />
                                       <Type className="mb-3 h-6 w-6" />
                                       <span className="block w-full text-center text-sm font-medium">Lesson Name</span>
                                     </Label>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage /> {/* Error message for the group */}
                            </FormItem>
                          )}
                        />
                     </CardContent>
                 </Card>

                 {/* Input Content Area (Conditional) */}
                 {selectedInputMethod && status !== 'generating' && (
                    <Card className="card-base">
                        <CardHeader>
                            <CardTitle className="text-lg font-heading">2. Provide Content</CardTitle>
                             <CardDescription>
                                {selectedInputMethod === 'text' && 'Paste your text content below.'}
                                {selectedInputMethod === 'file' && (uploadedFile ? `Selected file: ${uploadedFile.name}` : 'Upload your file.')}
                                {selectedInputMethod === 'lesson' && 'Enter the name of the lesson or topic.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Text Input */}
                            {selectedInputMethod === 'text' && (
                                <FormField
                                    control={form.control}
                                    name="inputText"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">Text Content</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Paste your text content here (minimum 20 characters)..."
                                                    {...field}
                                                    className="input-base min-h-[150px]"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                             {/* File Upload Input */}
                             {selectedInputMethod === 'file' && (
                                <div className="flex flex-col items-center gap-4">
                                     <Label htmlFor="file-upload-input" className={`w-full flex items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer ${uploadedFile ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/60'}`}>
                                        {uploadedFile ? (
                                            <div className="relative text-center">
                                                <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
                                                <p className="text-sm font-semibold truncate px-2">{uploadedFile.name}</p>
                                                <Button
                                                    type="button" variant="ghost" size="sm"
                                                    className="absolute top-[-5px] right-[-5px] h-6 w-6 p-1 text-muted-foreground hover:text-destructive"
                                                    onClick={handleRemoveFile} aria-label="Remove file">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                                <span className="text-sm font-semibold">Click or Drag to Upload</span>
                                                <p className="text-xs text-muted-foreground mt-1">.txt, .pdf, .docx (Max 10MB)</p>
                                            </div>
                                        )}
                                     </Label>
                                     <Input
                                        id="file-upload-input"
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept=".txt,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        ref={fileInputRef}
                                      />
                                      {/* Show message if file method selected but no file uploaded */}
                                      {!uploadedFile && <FormMessage>Please upload a file.</FormMessage>}
                                </div>
                             )}
                              {/* Lesson Name Input */}
                             {selectedInputMethod === 'lesson' && (
                                 <FormField
                                     control={form.control}
                                     name="lessonName"
                                     render={({ field }) => (
                                         <FormItem>
                                             <FormLabel>Lesson/Topic Name</FormLabel>
                                             <FormControl>
                                                 <Input placeholder="e.g., Introduction to Photosynthesis" {...field} className="input-base" />
                                             </FormControl>
                                             <FormMessage />
                                         </FormItem>
                                     )}
                                 />
                             )}
                        </CardContent>
                    </Card>
                 )}


                 {/* Test Configuration Section */}
                 {status === 'configuring' && selectedInputMethod && (
                     <Card className="card-base">
                         <CardHeader>
                             <CardTitle className="text-lg font-heading">3. Configure Test</CardTitle>
                             <CardDescription>Set the parameters for your test.</CardDescription>
                         </CardHeader>
                         <CardContent className="space-y-6">
                             {/* Number of Questions */}
                             <FormField
                                control={form.control}
                                name="numQuestions"
                                render={({ field: { onChange, value, ...restField } }) => (
                                    <FormItem>
                                        <FormLabel>Number of Questions</FormLabel>
                                        <FormControl>
                                             <Input
                                                type="number"
                                                placeholder="e.g., 10"
                                                min="1" max="50" step="1"
                                                value={value || ''}
                                                onChange={e => onChange(parseInt(e.target.value, 10) || 0)}
                                                className="input-base"
                                                {...restField}
                                              />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                             {/* Question Types */}
                             <FormField
                                control={form.control}
                                name="questionTypes"
                                render={() => (
                                    <FormItem>
                                        <div className="mb-4">
                                            <FormLabel className="text-base">Question Types</FormLabel>
                                            <FormDescription>
                                            Select the types of questions to include.
                                            </FormDescription>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {questionTypes.map((item) => (
                                            <FormField
                                                key={item.id}
                                                control={form.control}
                                                name="questionTypes"
                                                render={({ field }) => {
                                                return (
                                                    <FormItem
                                                    key={item.id}
                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                    >
                                                    <FormControl>
                                                        <Checkbox
                                                        checked={field.value?.includes(item.id)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                            ? field.onChange([...field.value, item.id])
                                                            : field.onChange(
                                                                field.value?.filter(
                                                                (value) => value !== item.id
                                                                )
                                                            )
                                                        }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        {item.label}
                                                    </FormLabel>
                                                    </FormItem>
                                                )
                                                }}
                                            />
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                             />

                             {/* Language */}
                              <FormField
                                 control={form.control}
                                 name="language"
                                 render={({ field }) => (
                                     <FormItem>
                                     <FormLabel>Language</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                         <FormControl>
                                         <SelectTrigger className="input-base">
                                             <SelectValue placeholder="Select language" />
                                         </SelectTrigger>
                                         </FormControl>
                                         <SelectContent>
                                         <SelectItem value="en">English</SelectItem>
                                         <SelectItem value="ar">Arabic</SelectItem>
                                         {/* Add other languages as needed */}
                                         </SelectContent>
                                     </Select>
                                     <FormMessage />
                                     </FormItem>
                                 )}
                                 />

                              {/* Test Duration (Optional) */}
                             <FormField
                                control={form.control}
                                name="duration"
                                render={({ field: { onChange, value, ...restField } }) => (
                                    <FormItem>
                                        <FormLabel>Test Duration (Optional)</FormLabel>
                                        <FormControl>
                                             <Input
                                                type="number"
                                                placeholder="Minutes (e.g., 30)"
                                                min="0" max="180" step="5"
                                                value={value || ''}
                                                 onChange={e => onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                                                className="input-base"
                                                {...restField}
                                              />
                                        </FormControl>
                                         <FormDescription className="text-xs">
                                            Leave blank for no time limit. Max 180 minutes.
                                         </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                         </CardContent>
                         <CardFooter>
                              <Button
                                type="submit"
                                className="w-full btn-base"
                                disabled={status === 'generating'}
                              >
                                {status === 'generating' ? (
                                  <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Test...
                                  </>
                                ) : (
                                  <>
                                    <FileQuestion className="mr-2 h-5 w-5" /> Create Test
                                  </>
                                )}
                              </Button>
                         </CardFooter>
                     </Card>
                 )}
             </form>
         </Form>


         {/* Generating State */}
         {status === 'generating' && (
             <Card className="card-base text-center">
                 <CardContent className="p-8">
                    <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
                    <p className="text-lg font-semibold text-muted-foreground">Generating Test...</p>
                    <p className="text-sm text-muted-foreground mt-1">Please wait while we create your questions.</p>
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
                         We couldn't generate the test. Please check your input or configuration and try again.
                     </p>
                     <Button variant="destructive" onClick={() => setStatus('configuring')} className="btn-base">
                         Try Again
                     </Button>
                 </CardContent>
              </Card>
         )}

        {/* Success State - Generated Test Display */}
        {status === 'success' && generatedTest && (
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-xl font-heading">Generated Test</CardTitle>
              <CardDescription>Your test is ready. Review and use the options below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Display generated test - using pre for basic formatting */}
               <Textarea
                    value={generatedTest}
                    readOnly
                    className="w-full h-80 resize-y input-base bg-muted/50 text-sm leading-relaxed font-mono"
                    aria-label="Generated test content"
                />
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Export Test
                </Button>
                 <Button variant="outline" onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" /> Share Test
                 </Button>
                 <Button variant="outline" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" /> Print Test
                 </Button>
                 <Button variant="default" onClick={handleCreateAnother}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Create Another
                 </Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
}
