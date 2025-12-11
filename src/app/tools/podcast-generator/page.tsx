
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowLeft,
  Mic, // Tool icon
  UploadCloud,
  File,
  Play,
  Download,
  Loader2, // Spinner icon
  X, // Close icon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

// Define Zod schema for podcast settings form validation
const podcastSettingsSchema = z.object({
  title: z.string().min(1, { message: 'Podcast title is required.' }).max(100, {message: 'Title too long'}),
  voiceTone: z.enum(['formal', 'casual', 'enthusiastic', 'calm']).default('casual'),
  speakingSpeed: z.number().min(0.5).max(2.0).default(1.0), // Represent speed as a number (e.g., 1.0 for normal)
  addBackgroundMusic: z.boolean().default(false),
  addIntroOutro: z.boolean().default(false),
});

type PodcastSettingsFormValues = z.infer<typeof podcastSettingsSchema>;

type ConversionStatus = 'idle' | 'uploading' | 'converting' | 'success' | 'error';

export default function PodcastGeneratorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [conversionStatus, setConversionStatus] = useState<ConversionStatus>('idle');
  const [podcastUrl, setPodcastUrl] = useState<string | null>(null); // URL of the generated podcast
  const audioRef = useRef<HTMLAudioElement>(null);

  const form = useForm<PodcastSettingsFormValues>({
    resolver: zodResolver(podcastSettingsSchema),
    defaultValues: {
      title: '',
      voiceTone: 'casual',
      speakingSpeed: 1.0,
      addBackgroundMusic: false,
      addIntroOutro: false,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        // Basic validation (e.g., file type, size)
        if (file.size > 10 * 1024 * 1024) { // Max 10MB
             toast({
               title: 'File Too Large',
               description: 'Please upload a file smaller than 10MB.',
               variant: 'destructive',
             });
            return;
        }
         const allowedTypes = ['text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf'];
         if (!allowedTypes.includes(file.type)) {
             toast({
               title: 'Invalid File Type',
               description: 'Please upload a .txt, .docx, or .pdf file.',
               variant: 'destructive',
             });
             return;
         }

        setUploadedFile(file);
        setConversionStatus('idle'); // Reset status on new file upload
        setPodcastUrl(null);
        form.resetField('title'); // Reset title specifically, keep other settings
         toast({
           title: 'File Selected',
           description: `File "${file.name}" ready for conversion.`,
         });
    }
  };

  const handleRemoveFile = () => {
      setUploadedFile(null);
      setConversionStatus('idle');
      setPodcastUrl(null);
      // Clear the file input value
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      toast({
        title: 'File Removed',
        description: 'Upload area cleared.',
      });
  };

  const onSubmit = async (values: PodcastSettingsFormValues) => {
    if (!uploadedFile) {
      toast({
        title: 'Error',
        description: 'Please upload a file first.',
        variant: 'destructive',
      });
      return;
    }

    console.log('Conversion started with values:', values, 'and file:', uploadedFile.name);
    setConversionStatus('converting');
    setPodcastUrl(null);
    toast({
      title: 'Conversion Started',
      description: 'Your podcast is being generated...',
    });

    // Simulate conversion process
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate 3 seconds delay

    // Simulate success or error randomly
    const success = Math.random() > 0.2; // 80% chance of success

    if (success) {
        const generatedUrl = '/example-podcast.mp3'; // Simulate a real URL or blob URL
        setConversionStatus('success');
        setPodcastUrl(generatedUrl); // Use a placeholder MP3 for demo
        toast({
          title: 'Conversion Successful',
          description: 'Your podcast is ready!',
        });
         // Reset the file input for potential next upload
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    } else {
         setConversionStatus('error');
         toast({
           title: 'Conversion Failed',
           description: 'Something went wrong during conversion. Please try again.',
           variant: 'destructive',
         });
    }

  };

   const handlePlay = () => {
        if (audioRef.current) {
            audioRef.current.play().catch(e => {
                 toast({ title: 'Playback Error', description: 'Could not play audio.', variant: 'destructive' });
                 console.error("Audio playback error:", e);
            });
        }
   };

   const handleDownload = () => {
       if (podcastUrl) {
           toast({ title: 'Download Started', description: `Preparing download for ${form.getValues('title') || 'podcast'}.mp3` });
           // In a real app: Create a link and click it programmatically
           const link = document.createElement('a');
           link.href = podcastUrl; // Use the actual generated URL
           link.download = form.getValues('title').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.mp3' || 'podcast.mp3'; // Sanitize filename
           document.body.appendChild(link);
           link.click();
           document.body.removeChild(link);
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
        <div className="flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
          <Mic className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">Podcast Generator</h1>
        </div>
        {/* Placeholder for alignment */}
        <div className="w-8"></div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Tool Overview */}
        <Card className="card-base text-center">
          <CardHeader>
             {/* Icon */}
             <Mic className="h-16 w-16 text-primary mx-auto mb-4" />
             {/* Tool Name */}
            <CardTitle className="text-2xl font-heading">Podcast Generator</CardTitle>
            {/* Description */}
            <CardDescription className="max-w-md mx-auto">
              This tool converts your uploaded text documents or scripts into engaging audio podcasts with customizable voices and optional background sounds.
            </CardDescription>
          </CardHeader>
        </Card>

         {/* File Upload Section */}
         <Card className="card-base">
            <CardHeader>
               <CardTitle className="text-lg font-heading">1. Upload Your File</CardTitle>
               <CardDescription>Select or drag a document (.txt, .docx, .pdf, max 10MB) to convert.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Drag and Drop Area / File Input */}
                <div className="flex flex-col items-center justify-center w-full">
                    <Label
                        htmlFor="file-upload"
                        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/60 transition-colors ${
                            uploadedFile ? 'border-primary bg-primary/10' : 'border-border'
                        } ${ conversionStatus === 'converting' ? 'cursor-not-allowed opacity-70' : ''}`}
                    >
                        {uploadedFile ? (
                             <div className="relative text-center p-4 w-full">
                                <File className="h-12 w-12 mx-auto text-primary mb-2" />
                                <p className="mb-1 text-sm font-semibold text-foreground truncate px-8">{uploadedFile.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                {!['converting', 'success'].includes(conversionStatus) && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        type="button"
                                        className="absolute top-1 right-1 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveFile(); }} // Prevent label trigger
                                        aria-label="Remove file"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-muted-foreground">TXT, DOCX, PDF (MAX. 10MB)</p>
                            </div>
                        )}
                         {/* Hidden actual file input */}
                         <Input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".txt,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf" // Specify acceptable file types
                            disabled={conversionStatus === 'converting'}
                        />
                    </Label>
                </div>
            </CardContent>
         </Card>


        {/* Podcast Settings Form */}
         <Card className="card-base">
            <CardHeader>
               <CardTitle className="text-lg font-heading">2. Configure Settings</CardTitle>
                <CardDescription>Customize your podcast episode.</CardDescription>
            </CardHeader>
             <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Podcast Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Podcast Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter episode title" {...field} className="input-base" disabled={conversionStatus === 'converting'} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Speaker's Tone */}
                     <FormField
                        control={form.control}
                        name="voiceTone"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Speaker's Tone</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={conversionStatus === 'converting'}>
                                <FormControl>
                                <SelectTrigger className="input-base">
                                    <SelectValue placeholder="Select a voice tone" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="formal">Formal</SelectItem>
                                <SelectItem value="casual">Casual</SelectItem>
                                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                                <SelectItem value="calm">Calm</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                    {/* Speaking Speed */}
                     <FormField
                        control={form.control}
                        name="speakingSpeed"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Speaking Speed ({field.value.toFixed(1)}x)</FormLabel>
                             <FormControl>
                                <Slider
                                    min={0.5}
                                    max={2}
                                    step={0.1}
                                    defaultValue={[field.value]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                    disabled={conversionStatus === 'converting'}
                                    className="pt-2"
                                />
                              </FormControl>
                               <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>Slow (0.5x)</span>
                                    <span>Normal (1.0x)</span>
                                    <span>Fast (2.0x)</span>
                               </div>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                    {/* Sound Effects (Checkboxes using Switch) */}
                     <div className="space-y-4 pt-2">
                           <FormLabel>Sound Effects</FormLabel>
                          <FormField
                             control={form.control}
                             name="addBackgroundMusic"
                             render={({ field }) => (
                                 <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/30">
                                     <div className="space-y-0.5">
                                         <FormLabel className="text-sm">Background Music</FormLabel>
                                         <FormDescription className="text-xs">
                                             Add subtle background music.
                                         </FormDescription>
                                     </div>
                                     <FormControl>
                                         <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={conversionStatus === 'converting'}
                                            aria-label="Toggle Background Music"
                                         />
                                     </FormControl>
                                 </FormItem>
                             )}
                             />
                          <FormField
                             control={form.control}
                             name="addIntroOutro"
                             render={({ field }) => (
                                 <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/30">
                                     <div className="space-y-0.5">
                                         <FormLabel className="text-sm">Intro/Outro Sounds</FormLabel>
                                          <FormDescription className="text-xs">
                                             Include standard intro/outro sounds.
                                         </FormDescription>
                                     </div>
                                     <FormControl>
                                         <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={conversionStatus === 'converting'}
                                             aria-label="Toggle Intro/Outro Sounds"
                                         />
                                     </FormControl>
                                 </FormItem>
                             )}
                             />
                     </div>

                      <Separator className="my-4" />

                    {/* Conversion Button */}
                    <Button
                        type="submit"
                        className="w-full btn-base" // Ensure button uses base style and 48px height
                        disabled={!uploadedFile || conversionStatus === 'converting'}
                     >
                         {conversionStatus === 'converting' ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Converting...
                            </>
                         ) : (
                            <>
                                <Mic className="mr-2 h-5 w-5" /> Convert to Podcast
                            </>
                         )}
                    </Button>
                  </form>
                </Form>
             </CardContent>
         </Card>

         {/* Post-Conversion Section */}
          {conversionStatus === 'success' && podcastUrl && (
              <Card className="card-base bg-gradient-to-r from-primary/5 via-background to-secondary/5">
                 <CardHeader>
                    <CardTitle className="text-lg font-heading">Conversion Complete!</CardTitle>
                     <CardDescription>Your podcast "{form.getValues('title')}" is ready.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    {/* Audio Player */}
                     <div className="bg-muted p-3 rounded-lg">
                        <audio ref={audioRef} controls className="w-full" src={podcastUrl}>
                            Your browser does not support the audio element.
                         </audio>
                     </div>
                    {/* Download Button */}
                     <Button variant="outline" onClick={handleDownload} className="w-full btn-base">
                         <Download className="mr-2 h-5 w-5" /> Download Podcast File
                     </Button>
                 </CardContent>
              </Card>
          )}
          {conversionStatus === 'error' && (
                <Card className="card-base border-destructive bg-destructive/10">
                    <CardHeader>
                        <CardTitle className="text-lg font-heading text-destructive">Conversion Failed</CardTitle>
                        <CardDescription className="text-destructive/90">
                            There was an error generating your podcast. Please check your file and settings, then try again.
                        </CardDescription>
                    </CardHeader>
                     <CardContent className="flex justify-center">
                         <Button variant="destructive" onClick={() => setConversionStatus('idle')} className="btn-base">
                             Try Again
                         </Button>
                     </CardContent>
                </Card>
          )}

      </main>

      {/* No Bottom Navigation here, assuming it's a dedicated tool screen */}
    </div>
  );
}

