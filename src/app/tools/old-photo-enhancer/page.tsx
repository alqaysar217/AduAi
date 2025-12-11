
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowLeft,
  Wand2 as Wand2Icon, // Tool icon
  MoreVertical,
  UploadCloud,
  Download as DownloadIcon,
  Loader2,
  AlertTriangle,
  Image as ImageIconLucide, // Placeholder for preview
  Trash2, // Icon to remove uploaded file
} from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const enhancementSettingsSchema = z.object({
  resolutionLevel: z.enum(['Low', 'Medium', 'High'], { required_error: "Please select a resolution level."}).default('Medium'),
  colorization: z.boolean().default(true),
  outputSize: z.enum(['Original', '2x', '4x'], { required_error: "Please select an output size." }).default('Original'),
  restoreFaces: z.boolean().default(false),
});

type EnhancementSettingsFormValues = z.infer<typeof enhancementSettingsSchema>;
type ProcessingStatus = 'idle' | 'uploaded' | 'enhancing' | 'success' | 'error';

const resolutionOptions = [
  { id: 'Low', label: 'Low (e.g., ~800px)' },
  { id: 'Medium', label: 'Medium (e.g., ~1200px)' },
  { id: 'High', label: 'High (e.g., ~2000px+)' },
];

const outputSizeOptions = [
  { id: 'Original', label: 'Original Size' },
  { id: '2x', label: '2x Upscaled' },
  { id: '4x', label: '4x Upscaled' },
];


export default function OldPhotoEnhancerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const settingsForm = useForm<EnhancementSettingsFormValues>({
    resolver: zodResolver(enhancementSettingsSchema),
    defaultValues: {
      resolutionLevel: 'Medium',
      colorization: true,
      outputSize: 'Original',
      restoreFaces: false,
    },
  });

  useEffect(() => {
    // Clean up blob URLs
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (enhancedImageUrl && enhancedImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(enhancedImageUrl);
      }
    };
  }, [previewUrl, enhancedImageUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Invalid File Type', description: 'Please upload an image file (JPG, PNG, etc.).', variant: 'destructive' });
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      if (file.size > 25 * 1024 * 1024) { // Max 25MB
        toast({ title: 'File Too Large', description: 'Please upload an image smaller than 25MB.', variant: 'destructive' });
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setUploadedFile(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl); // Revoke old preview
      setPreviewUrl(URL.createObjectURL(file));
      setStatus('uploaded');
      setEnhancedImageUrl(null); // Clear previous enhanced image
      toast({ title: 'Image Uploaded', description: `Ready to enhance "${file.name}".` });
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setStatus('idle');
    setEnhancedImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: 'Image Removed' });
  };

  const onSubmitSettings = async (settings: EnhancementSettingsFormValues) => {
    if (!uploadedFile) {
        toast({ title: 'No Image', description: 'Please upload an image first.', variant: 'destructive' });
        return;
    }
    console.log("Enhancement started with settings:", settings);
    setStatus('enhancing');
    setEnhancedImageUrl(null);
    toast({ title: 'Enhancing Photo...', description: `Applying AI magic to your image...` });

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 4000));

    const success = Math.random() > 0.1; // 90% chance of success
    if (success) {
      const seed = Date.now();
      let baseWidth = 800; 
      let baseHeight = Math.round(baseWidth * (3/4)); // Default aspect ratio for placeholder

      if (settings.outputSize === '2x') {
        baseWidth = 1600;
        baseHeight = Math.round(baseWidth * (3/4));
      } else if (settings.outputSize === '4x') {
        baseWidth = 2400; // Adjusted for more common large image sizes
        baseHeight = Math.round(baseWidth * (3/4));
      }
      
      const mockEnhancedUrl = `https://picsum.photos/seed/${seed}/${baseWidth}/${baseHeight}`;
      setEnhancedImageUrl(mockEnhancedUrl);
      setStatus('success');
      toast({ title: 'Enhancement Complete!', description: 'Your photo has been beautifully enhanced.' });
    } else {
      setStatus('error');
      toast({ title: 'Enhancement Failed', description: 'Oops! Something went wrong. Please try again.', variant: 'destructive' });
    }
  };

  const handleDownloadEnhanced = () => {
    if (!enhancedImageUrl) return;
    if (enhancedImageUrl.startsWith('https://picsum.photos')) {
      window.open(enhancedImageUrl, '_blank');
      toast({ title: 'Opening Enhanced Image', description: 'Download manually from the new tab.' });
    } else {
        const link = document.createElement('a');
        link.href = enhancedImageUrl;
        link.download = `enhanced_${uploadedFile?.name || 'photo.jpg'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (enhancedImageUrl.startsWith('blob:')) URL.revokeObjectURL(enhancedImageUrl); 
        toast({ title: 'Download Started' });
    }
  };

  const handleClearAll = () => {
    setStatus('idle');
    setUploadedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setEnhancedImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    settingsForm.reset();
    toast({ title: 'Cleared and ready for a new masterpiece!' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Wand2Icon className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">Old Photo Enhancer</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-5 w-5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleClearAll}>Clear All & Start Over</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: "Help clicked (Not implemented)" })}>Help</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card className="card-base text-center bg-gradient-to-br from-primary/10 via-background to-background">
          <CardHeader>
            <Wand2Icon className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-heading">Old Photo Enhancer</CardTitle>
            <CardDescription className="max-w-xl mx-auto text-muted-foreground">
              Breathe new life into your old memories. Upload an image to automatically improve resolution, add color, and restore details.
            </CardDescription>
          </CardHeader>
        </Card>
        
        {status === 'idle' && (
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-lg font-heading">Upload Your Photo</CardTitle>
              <CardDescription>Drag & drop or click to select an image file (JPG, PNG).</CardDescription>
            </CardHeader>
            <CardContent>
              <Label
                htmlFor="image-upload-input"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <UploadCloud className="h-12 w-12 text-muted-foreground mb-3" />
                <span className="text-sm font-semibold text-foreground">Drag & Drop or Click to Upload</span>
                <p className="text-xs text-muted-foreground mt-1">Max file size: 25MB</p>
              </Label>
              <Input
                id="image-upload-input"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/jpeg, image/png"
                ref={fileInputRef}
              />
            </CardContent>
          </Card>
        )}

        {status === 'uploaded' && uploadedFile && previewUrl && (
          <Form {...settingsForm}>
            <form onSubmit={settingsForm.handleSubmit(onSubmitSettings)} className="space-y-6">
              <Card className="card-base">
                <CardHeader>
                  <CardTitle className="text-lg font-heading">1. Preview & Configure</CardTitle>
                  <CardDescription>Review your uploaded image and adjust enhancement settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="relative group w-full max-w-md mx-auto aspect-[4/3] rounded-lg overflow-hidden border shadow-md bg-muted">
                    <Image src={previewUrl} alt="Uploaded preview" layout="fill" objectFit="contain" data-ai-hint="old photo vintage" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleRemoveFile}
                      aria-label="Remove image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <FormField
                      control={settingsForm.control}
                      name="resolutionLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resolution Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger className="input-base"><SelectValue placeholder="Select resolution" /></SelectTrigger></FormControl>
                            <SelectContent>{resolutionOptions.map(opt => <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={settingsForm.control}
                      name="outputSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Output Size</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger className="input-base"><SelectValue placeholder="Select output size" /></SelectTrigger></FormControl>
                            <SelectContent>{outputSizeOptions.map(opt => <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-3 pt-2">
                    <FormField
                        control={settingsForm.control}
                        name="colorization"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/20">
                                <div className="space-y-0.5"><FormLabel>Auto Colorization</FormLabel></div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={settingsForm.control}
                        name="restoreFaces"
                        render={({ field }) => (
                             <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/20">
                                <div className="space-y-0.5"><FormLabel>Restore Facial Details</FormLabel></div>
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} id="restore-faces" /></FormControl>
                             </FormItem>
                        )}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full btn-base bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Wand2Icon className="mr-2 h-5 w-5" /> Start Enhancement
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        )}

        {status === 'enhancing' && (
          <Card className="card-base text-center">
            <CardContent className="p-10 space-y-4">
              <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary" />
              <p className="text-lg font-semibold text-muted-foreground">Enhancing Your Photo...</p>
              <p className="text-sm text-muted-foreground">This might take a moment, please wait.</p>
            </CardContent>
          </Card>
        )}

        {status === 'error' && (
          <Card className="card-base border-destructive bg-destructive/10 text-center">
            <CardContent className="p-10 space-y-3">
              <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-2" />
              <p className="text-lg font-semibold text-destructive">Enhancement Failed</p>
              <p className="text-sm text-destructive/90">Something went wrong. Please try again or use a different photo.</p>
              <Button variant="destructive" onClick={handleClearAll} className="btn-base mt-4">Try Another Photo</Button>
            </CardContent>
          </Card>
        )}

        {status === 'success' && enhancedImageUrl && (
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-xl font-heading">Your Enhanced Photo!</CardTitle>
              <CardDescription>The AI has worked its magic. Download your improved image below.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-4">
              <div className="relative w-full max-w-xl aspect-[4/3] rounded-lg overflow-hidden border-2 border-primary shadow-xl bg-muted">
                 <Image 
                    src={enhancedImageUrl} 
                    alt="Enhanced Photo" 
                    layout="fill"
                    objectFit="contain"
                    className="rounded-md" 
                    data-ai-hint="enhanced photo vivid"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-6 border-t">
              <Button onClick={handleDownloadEnhanced} className="btn-base w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                <DownloadIcon className="mr-2 h-5 w-5" /> Download Enhanced Photo
              </Button>
               <Button variant="outline" onClick={handleClearAll} className="w-full sm:w-auto">
                <Wand2Icon className="mr-2 h-5 w-5" /> Enhance Another
              </Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
}

