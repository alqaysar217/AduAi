
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowLeft,
  Clapperboard, // Tool icon
  MoreVertical,
  UploadCloud,
  Link2, // Icon for link input
  Copy,
  Download,
  Share2,
  Loader2, // Spinner icon
  FileVideo, // Icon for uploaded file
  X, // Close icon
  AlertTriangle, // Error icon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Define Zod schema for link input
const linkSchema = z.object({
  videoLink: z.string().url({ message: 'Please enter a valid video URL (e.g., YouTube).' }),
});
type LinkFormValues = z.infer<typeof linkSchema>;

// Define summarization state
type SummarizationStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';
type InputMethod = 'none' | 'upload' | 'link';

export default function VideoSummarizerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [videoLink, setVideoLink] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [status, setStatus] = useState<SummarizationStatus>('idle');
  const [inputMethod, setInputMethod] = useState<InputMethod>('none');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const linkForm = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      videoLink: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic validation (e.g., file type, size - adjust as needed)
      if (file.size > 100 * 1024 * 1024) { // Max 100MB example
        toast({
          title: 'File Too Large',
          description: 'Please upload a video file smaller than 100MB.',
          variant: 'destructive',
        });
        return;
      }
      // Add video type validation if necessary
      // const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      // if (!allowedTypes.includes(file.type)) {
      //   toast({ title: 'Invalid File Type', description: 'Please upload a supported video format.', variant: 'destructive' });
      //   return;
      // }

      setUploadedFile(file);
      setVideoLink(''); // Clear link if a file is uploaded
      setInputMethod('upload');
      setStatus('idle');
      setSummary('');
      toast({ title: 'File Selected', description: `Video "${file.name}" ready for summarization.` });
      // Optionally trigger summarization immediately or require button click
      // handleSummarize(); // Uncomment to summarize immediately
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setInputMethod('none');
    setStatus('idle');
    setSummary('');
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input
    }
    toast({ title: 'File Removed' });
  };

  const onLinkSubmit = (values: LinkFormValues) => {
    console.log('Link submitted:', values.videoLink);
    setVideoLink(values.videoLink);
    setUploadedFile(null); // Clear file if a link is submitted
    setInputMethod('link');
    setStatus('idle');
    setSummary('');
    toast({ title: 'Link Entered', description: 'Video link ready for summarization.' });
    // Optionally trigger summarization immediately or require button click
    // handleSummarize(); // Uncomment to summarize immediately
    linkForm.reset(); // Clear the form
  };

  const handleSummarize = async () => {
    if (inputMethod === 'none' || (inputMethod === 'upload' && !uploadedFile) || (inputMethod === 'link' && !videoLink)) {
      toast({ title: 'Input Missing', description: 'Please upload a video or enter a link first.', variant: 'destructive' });
      return;
    }

    setStatus('processing');
    setSummary('');
    toast({ title: 'Summarization Started', description: 'Processing the video...' });

    // --- Simulate AI Summarization ---
    await new Promise(resolve => setTimeout(resolve, 4000)); // Simulate network delay + processing time

    // Simulate success or error
    const success = Math.random() > 0.15; // 85% chance of success

    if (success) {
        const simulatedSummary = `## Summary of ${uploadedFile ? uploadedFile.name : 'Video Link'}

**Main Ideas:**
*   The video discusses the future of artificial intelligence in education.
*   It highlights the potential benefits for personalized learning paths.
*   Ethical considerations and challenges are also addressed.

**Key Points:**
*   AI tutors can provide instant feedback and adapt to student needs.
*   Data privacy and algorithmic bias are significant concerns.
*   Collaboration between educators and AI developers is crucial.

**Conclusion:**
AI offers transformative possibilities for education, but careful implementation and oversight are necessary to ensure equitable and effective use.
`;
        setSummary(simulatedSummary);
        setStatus('success');
        toast({ title: 'Summarization Complete', description: 'Video summary generated successfully!' });
    } else {
        setStatus('error');
        toast({ title: 'Summarization Failed', description: 'Could not summarize the video. Please try again.', variant: 'destructive' });
    }
     // Reset inputs after processing
    // setUploadedFile(null);
    // setVideoLink('');
    // setInputMethod('none');
    // if (fileInputRef.current) fileInputRef.current.value = '';
    // linkForm.reset();
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summary)
      .then(() => toast({ title: 'Copied to Clipboard', description: 'Summary copied successfully.' }))
      .catch(err => toast({ title: 'Copy Failed', description: 'Could not copy summary.', variant: 'destructive' }));
  };

  const handleExportSummary = (format: 'txt' | 'pdf') => {
    toast({ title: 'Export Summary', description: `Exporting as ${format.toUpperCase()}... (Not implemented)` });
    // Actual export logic would go here (e.g., creating a Blob and download link)
    const blob = new Blob([summary], { type: format === 'txt' ? 'text/plain' : 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `video_summary.${format}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShareSummary = async (platform: 'email' | 'whatsapp' | 'other') => {
     const shareData = {
       title: 'Video Summary',
       text: summary,
       // url: videoLink || undefined // Optionally share the original link too
     };

     if (platform === 'email') {
         window.location.href = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text)}`;
         toast({title: 'Sharing via Email'});
     } else if (platform === 'whatsapp') {
          window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text)}`, '_blank');
          toast({title: 'Sharing via WhatsApp'});
     } else if (navigator.share) { // Use Web Share API if available
        try {
            await navigator.share(shareData);
            toast({ title: 'Shared Successfully' });
        } catch (err) {
            console.error("Share failed:", err);
            toast({ title: 'Share Failed', description: 'Could not share summary.', variant: 'destructive' });
        }
     } else {
         // Fallback for browsers without Web Share API
         handleCopySummary(); // Copy to clipboard as a fallback
         toast({ title: 'Share Not Supported', description: 'Summary copied to clipboard instead.' });
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
          <Clapperboard className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">Video Summarizer</h1>
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
            <DropdownMenuItem onClick={() => toast({ title: "Clear Input clicked" })}>Clear Input</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: "Help clicked" })}>Help</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Tool Overview */}
        <Card className="card-base text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-heading">Summarize Video</CardTitle>
            <CardDescription className="max-w-xl mx-auto">
              This tool helps you quickly summarize the key points and important ideas from any video file or link. Get the essence without watching the whole thing.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Input Section */}
        {status !== 'processing' && status !== 'success' && (
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-lg font-heading">1. Provide Video Source</CardTitle>
              <CardDescription>Upload a video file or enter a link (e.g., YouTube).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload Button */}
              <Label
                htmlFor="video-upload"
                className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/60 transition-colors ${
                  inputMethod === 'upload' ? 'border-primary bg-primary/10' : 'border-border'
                }`}
              >
                {uploadedFile ? (
                    <div className="relative text-center w-full">
                        <FileVideo className="h-10 w-10 mx-auto text-primary mb-2" />
                        <p className="mb-1 text-sm font-semibold text-foreground truncate px-4">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                         <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="absolute top-0 right-0 h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveFile(); }}
                            aria-label="Remove file"
                         >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                        <span className="font-semibold">Upload Video File</span>
                        <span className="text-xs text-muted-foreground mt-1">Max 100MB</span>
                    </div>
                )}
                 <Input
                    id="video-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="video/*" // Accept all video types
                    ref={fileInputRef}
                />
              </Label>

              <div className="relative flex items-center">
                  <Separator className="flex-1" />
                  <span className="mx-4 text-sm text-muted-foreground">OR</span>
                  <Separator className="flex-1" />
              </div>

              {/* Link Input Form */}
               <Form {...linkForm}>
                 <form onSubmit={linkForm.handleSubmit(onLinkSubmit)} className="flex items-center gap-2">
                     <FormField
                         control={linkForm.control}
                         name="videoLink"
                         render={({ field }) => (
                             <FormItem className="flex-1">
                                 {/* <FormLabel className="sr-only">Video Link</FormLabel> */}
                                 <FormControl>
                                     <div className="relative">
                                          <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                          <Input
                                             type="url"
                                             placeholder="Enter video link (e.g., YouTube)"
                                             {...field}
                                             className={`input-base pl-9 ${inputMethod === 'link' ? 'border-primary' : ''}`} // Highlight if link is active input
                                          />
                                     </div>
                                 </FormControl>
                                  <FormMessage className="text-xs pt-1" />
                             </FormItem>
                         )}
                     />
                     <Button type="submit" size="icon" variant="outline" aria-label="Submit link">
                         <ArrowLeft className="h-5 w-5 transform rotate-180" /> {/* Right arrow */}
                     </Button>
                 </form>
              </Form>
            </CardContent>
            <CardFooter>
                 <Button
                    onClick={handleSummarize}
                    className="w-full btn-base"
                    disabled={inputMethod === 'none'}
                 >
                    <Clapperboard className="mr-2 h-5 w-5" /> Summarize Now
                 </Button>
            </CardFooter>
          </Card>
        )}

         {/* Processing State */}
         {status === 'processing' && (
             <Card className="card-base text-center">
                 <CardContent className="p-8">
                    <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
                    <p className="text-lg font-semibold text-muted-foreground">Processing Video...</p>
                    <p className="text-sm text-muted-foreground mt-1">This might take a moment.</p>
                 </CardContent>
             </Card>
         )}

         {/* Error State */}
         {status === 'error' && (
              <Card className="card-base border-destructive bg-destructive/10 text-center">
                 <CardContent className="p-8">
                     <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
                     <p className="text-lg font-semibold text-destructive">Summarization Failed</p>
                     <p className="text-sm text-destructive/90 mt-1 mb-4">
                         We couldn't process the video. Please check the file/link and try again.
                     </p>
                     <Button variant="destructive" onClick={() => setStatus('idle')} className="btn-base">
                         Try Again
                     </Button>
                 </CardContent>
              </Card>
         )}

        {/* Success State - Summary Display */}
        {status === 'success' && summary && (
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-xl font-heading">Video Summary</CardTitle>
              <CardDescription>Here are the key points from the video:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Display formatted summary - using pre for basic formatting */}
               <Textarea
                    value={summary}
                    readOnly
                    className="w-full h-64 resize-none input-base bg-muted/50 text-sm leading-relaxed"
                    aria-label="Generated video summary"
                />
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end gap-2">
                <Button variant="outline" onClick={handleCopySummary}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
                <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                       <Button variant="outline">
                           <Download className="mr-2 h-4 w-4" /> Export
                       </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end">
                       <DropdownMenuItem onClick={() => handleExportSummary('txt')}>Export as .TXT</DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleExportSummary('pdf')} disabled>Export as .PDF (Soon)</DropdownMenuItem>
                   </DropdownMenuContent>
                </DropdownMenu>
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                        <Button variant="default">
                            <Share2 className="mr-2 h-4 w-4" /> Share
                        </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end">
                       <DropdownMenuItem onClick={() => handleShareSummary('email')}>Share via Email</DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleShareSummary('whatsapp')}>Share via WhatsApp</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShareSummary('other')}>Share via Other...</DropdownMenuItem>
                   </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
}
