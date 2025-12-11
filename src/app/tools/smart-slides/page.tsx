
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowLeft,
  Presentation as PresentationIcon, // Tool icon
  MoreVertical,
  UploadCloud,
  FileText as FileTextIcon, // Renamed for clarity
  FileUp, // Added for File Input Tab
  FileSearch, // Added for Topic Input Tab
  Type as TypeIcon,
  Palette,
  ListOrdered,
  Settings2, // For Design Tone
  Sparkles, // Generate icon
  Loader2,
  AlertTriangle,
  Download,
  Eye,
  Share2,
  Trash2,
  Copy,
  CaseSensitive,
  Image as ImageIconLucide,
} from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; // Import DropdownMenu components

const smartSlidesSchema = z.object({
  inputMethod: z.enum(['text', 'file', 'topic'], { required_error: 'Please select an input method.' }),
  topic: z.string().optional(),
  textInput: z.string().optional(),
  numSlides: z.enum(['5-7', '8-10', '11-15', '15+'], { required_error: 'Select number of slides.' }),
  colorTheme: z.enum(['professional_blue', 'vibrant_orange', 'minimalist_gray', 'creative_green', 'dark_mode'], { required_error: 'Select a color theme.' }),
  fontStyle: z.enum(['sans_serif', 'serif', 'modern_display', 'handwritten'], { required_error: 'Select a font style.' }),
  designTone: z.enum(['formal', 'creative', 'playful', 'educational', 'corporate'], { required_error: 'Select a design tone.' }),
}).refine(data => {
    if (data.inputMethod === 'topic' && (!data.topic || data.topic.trim().length < 3)) return false;
    if (data.inputMethod === 'text' && (!data.textInput || data.textInput.trim().length < 20)) return false;
    // File validation will be handled outside Zod
    return true;
}, {
    message: "Please provide valid input for the selected method (topic min 3 chars, text min 20 chars, or upload a file).",
    path: ["inputMethod"],
});

type SmartSlidesFormValues = z.infer<typeof smartSlidesSchema>;
type ProcessingStatus = 'idle' | 'generating' | 'success' | 'error';

interface GeneratedSlide {
  id: string;
  title: string;
  content: string;
  imageUrl?: string; // Picsum URL for demo
  notes?: string;
}

export default function SmartSlidesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generatedSlides, setGeneratedSlides] = useState<GeneratedSlide[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<SmartSlidesFormValues>({
    resolver: zodResolver(smartSlidesSchema),
    defaultValues: {
      inputMethod: 'topic',
      topic: '',
      textInput: '',
      numSlides: undefined,
      colorTheme: undefined,
      fontStyle: undefined,
      designTone: undefined,
    },
  });

  const currentInputMethod = form.watch('inputMethod');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // Max 10MB
        toast({ title: 'File Too Large', description: 'Please upload a file smaller than 10MB.', variant: 'destructive' });
        return;
      }
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        toast({ title: 'Invalid File Type', description: 'Allowed: PDF, Word, TXT.', variant: 'destructive' });
        return;
      }
      setUploadedFile(file);
      toast({ title: 'File Selected', description: `File "${file.name}" ready.` });
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: 'File Removed' });
  };

  const onSubmit = async (values: SmartSlidesFormValues) => {
    if (values.inputMethod === 'file' && !uploadedFile) {
      toast({ title: 'File Missing', description: 'Please upload a file for the file input method.', variant: 'destructive' });
      form.setError('inputMethod', { message: 'File is required for this input method.' });
      return;
    }

    console.log('Presentation generation started:', values);
    setStatus('generating');
    setGeneratedSlides([]);
    toast({ title: 'Generating Slides...', description: 'Creating your presentation, please wait.' });

    await new Promise(resolve => setTimeout(resolve, 4000)); // Simulate AI processing

    const success = Math.random() > 0.2; // 80% success
    if (success) {
      const numSlides = parseInt(values.numSlides.split('-')[0]) || 5; // Basic parsing
      const mockSlides: GeneratedSlide[] = Array.from({ length: numSlides }).map((_, i) => ({
        id: `slide-${i + 1}`,
        title: `Slide ${i + 1}: Introduction to ${values.topic || 'Generated Topic'}`,
        content: `This slide discusses key point ${String.fromCharCode(65 + i)} related to the ${values.designTone} ${values.fontStyle} presentation about ${values.topic || values.textInput?.substring(0,20) || 'your content'}. The color theme is ${values.colorTheme}.`,
        imageUrl: `https://picsum.photos/seed/${values.topic || 'slide'}${i}/400/225`, // Placeholder image
        notes: `Speaker notes for slide ${i + 1}. Emphasize the connection to overall theme.`,
      }));
      setGeneratedSlides(mockSlides);
      setStatus('success');
      toast({ title: 'Presentation Generated!', description: 'Your slides are ready for preview and export.' });
    } else {
      setStatus('error');
      toast({ title: 'Generation Failed', description: 'Could not generate the presentation. Please try again.', variant: 'destructive' });
    }
  };

  const handleExport = (format: 'pdf' | 'pptx') => {
    toast({ title: `Exporting as ${format.toUpperCase()}`, description: `Preparing download... (Not implemented)` });
    // Dummy download for demo
    const textContent = generatedSlides.map(s => `Title: ${s.title}\nContent: ${s.content}\nNotes: ${s.notes || ''}\n\n`).join('');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart_slides_presentation.${format === 'pdf' ? 'txt' : 'txt'}`; // txt for demo
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    toast({ title: 'Share Presentation', description: 'Sharing functionality not implemented yet.' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <PresentationIcon className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">Smart Slides</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-5 w-5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { form.reset(); setUploadedFile(null); setGeneratedSlides([]); setStatus('idle'); }}>Clear All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: "Help clicked" })}>Help</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card className="card-base text-center">
          <CardHeader>
            <PresentationIcon className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-heading">Smart Slides Generator</CardTitle>
            <CardDescription className="max-w-xl mx-auto">
              Create professional presentations from text, files, or topics. Customize themes, fonts, add auto-generated images/charts, and export to PDF/PPTX.
            </CardDescription>
          </CardHeader>
        </Card>

        {status !== 'success' && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card className="card-base">
                <CardHeader><CardTitle className="text-lg font-heading">1. Provide Content</CardTitle></CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="inputMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Input Method</FormLabel>
                        <FormControl>
                          <Tabs defaultValue={field.value || 'topic'} onValueChange={(value) => field.onChange(value as 'text'|'file'|'topic')} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="topic"><FileSearch className="mr-2 h-4 w-4 sm:hidden md:inline-block" />Topic</TabsTrigger>
                              <TabsTrigger value="text"><FileTextIcon className="mr-2 h-4 w-4 sm:hidden md:inline-block" />Text</TabsTrigger>
                              <TabsTrigger value="file"><FileUp className="mr-2 h-4 w-4 sm:hidden md:inline-block" />File</TabsTrigger>
                            </TabsList>
                            <TabsContent value="topic" className="pt-4">
                              <FormField control={form.control} name="topic" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Presentation Topic</FormLabel>
                                  <FormControl><Input placeholder="e.g., The Future of Renewable Energy" {...field} className="input-base" /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                            </TabsContent>
                            <TabsContent value="text" className="pt-4">
                              <FormField control={form.control} name="textInput" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Paste Your Text</FormLabel>
                                  <FormControl><Textarea placeholder="Enter the main content for your presentation..." {...field} className="input-base min-h-[150px]" /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                            </TabsContent>
                            <TabsContent value="file" className="pt-4">
                              <FormItem>
                                <FormLabel>Upload File (PDF, DOCX, TXT)</FormLabel>
                                <div className="flex items-center gap-2">
                                  <Input id="file-upload" type="file" ref={fileInputRef} onChange={handleFileChange} className="input-base flex-1" accept=".pdf,.doc,.docx,.txt" />
                                  {uploadedFile && <Button type="button" variant="ghost" size="icon" onClick={handleRemoveFile}><Trash2 className="h-4 w-4" /></Button>}
                                </div>
                                {uploadedFile && <FormDescription className="text-xs">Selected: {uploadedFile.name}</FormDescription>}
                                {!uploadedFile && currentInputMethod === 'file' && <FormMessage>Please upload a file.</FormMessage>}
                              </FormItem>
                            </TabsContent>
                          </Tabs>
                        </FormControl>
                        <FormMessage>{form.formState.errors.inputMethod?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="card-base">
                <CardHeader><CardTitle className="text-lg font-heading">2. Customize Your Slides</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="numSlides" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Slides</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="input-base"><SelectValue placeholder="Select range" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="5-7">5-7 Slides</SelectItem>
                          <SelectItem value="8-10">8-10 Slides</SelectItem>
                          <SelectItem value="11-15">11-15 Slides</SelectItem>
                          <SelectItem value="15+">15+ Slides</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="colorTheme" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color Theme</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="input-base"><SelectValue placeholder="Select theme" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="professional_blue">Professional Blue</SelectItem>
                          <SelectItem value="vibrant_orange">Vibrant Orange</SelectItem>
                          <SelectItem value="minimalist_gray">Minimalist Gray</SelectItem>
                          <SelectItem value="creative_green">Creative Green</SelectItem>
                          <SelectItem value="dark_mode">Dark Mode Theme</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="fontStyle" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Font Style</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="input-base"><SelectValue placeholder="Select font style" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="sans_serif">Sans Serif (Modern)</SelectItem>
                          <SelectItem value="serif">Serif (Classic)</SelectItem>
                          <SelectItem value="modern_display">Modern Display</SelectItem>
                          <SelectItem value="handwritten">Handwritten (Creative)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="designTone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Design Tone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="input-base"><SelectValue placeholder="Select tone" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                          <SelectItem value="playful">Playful</SelectItem>
                          <SelectItem value="educational">Educational</SelectItem>
                          <SelectItem value="corporate">Corporate</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full btn-base" disabled={status === 'generating'}>
                    {status === 'generating' ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Generating...</> : <><Sparkles className="mr-2 h-5 w-5" />Create Presentation</>}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        )}

        {status === 'generating' && (
          <Card className="card-base text-center">
            <CardContent className="p-8 space-y-4">
              <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary" />
              <p className="text-lg font-semibold text-muted-foreground">Crafting Your Slides...</p>
              <p className="text-sm text-muted-foreground">This might take a few moments.</p>
            </CardContent>
          </Card>
        )}

        {status === 'error' && (
          <Card className="card-base border-destructive bg-destructive/10 text-center">
            <CardContent className="p-8 space-y-3">
              <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-2" />
              <p className="text-lg font-semibold text-destructive">Generation Failed</p>
              <p className="text-sm text-destructive/90">Could not generate presentation. Please check inputs or try again.</p>
              <Button variant="destructive" onClick={() => setStatus('idle')} className="btn-base mt-2">Try Again</Button>
            </CardContent>
          </Card>
        )}

        {status === 'success' && generatedSlides.length > 0 && (
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-xl font-heading">Presentation Preview</CardTitle>
              <CardDescription>Review your generated slides. Actual export may have richer formatting.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                <div className="flex space-x-4 p-4">
                  {generatedSlides.map((slide) => (
                    <Card key={slide.id} className="shrink-0 w-[320px] h-[180px] card-base overflow-hidden relative group/slide">
                       {slide.imageUrl && (
                        <Image
                          src={slide.imageUrl}
                          alt={slide.title}
                          layout="fill"
                          objectFit="cover"
                          className="transition-transform group-hover/slide:scale-105"
                          data-ai-hint="presentation slide abstract"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-3">
                        <h3 className="text-sm font-semibold text-white truncate">{slide.title}</h3>
                      </div>
                    </Card>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
               <p className="text-xs text-muted-foreground mt-2 text-center">This is a simplified preview. Export for full presentation.</p>
            </CardContent>
            <CardFooter className="flex flex-wrap justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => handleExport('pdf')}><FileTextIcon className="mr-2 h-4 w-4" />Export as PDF</Button>
              <Button variant="outline" onClick={() => handleExport('pptx')}><PresentationIcon className="mr-2 h-4 w-4" />Export as PPTX</Button>
              <Button variant="default" onClick={handleShare}><Share2 className="mr-2 h-4 w-4" />Share</Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
}
