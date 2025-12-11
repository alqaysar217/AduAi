
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowLeft,
  Image as ImageIcon, // Tool icon alias
  MoreVertical,
  Copy,
  Download,
  Share2,
  Printer,
  Trash2,
  Loader2, // Spinner icon
  AlertTriangle, // Error icon
  Sparkles, // Generate icon
  Wand2, // Style icon
  Maximize, // Size icon
} from 'lucide-react';
import Image from 'next/image'; // Use next/image

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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // For horizontal scroll

// Define Zod schema for the form
const imageGeneratorSchema = z.object({
  imageDescription: z.string().min(5, { message: 'Please provide a description of at least 5 characters.' }).max(1000, { message: 'Description cannot exceed 1000 characters.' }),
  artisticStyle: z.enum(['Realistic', 'Cartoon', 'OilPainting', 'Watercolor', 'PixelArt', 'Anime'], { required_error: 'Please select an artistic style.' }),
  imageSize: z.enum(['512x512', '1024x1024', '1024x768', '768x1024'], { required_error: 'Please select an image size.' }),
});

type ImageGeneratorFormValues = z.infer<typeof imageGeneratorSchema>;
type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';

// Mock artistic styles
const artisticStyles = [
  { code: 'Realistic', name: 'Realistic' },
  { code: 'Cartoon', name: 'Cartoon' },
  { code: 'OilPainting', name: 'Oil Painting' },
  { code: 'Watercolor', name: 'Watercolor' },
  { code: 'PixelArt', name: 'Pixel Art' },
  { code: 'Anime', name: 'Anime' },
];

// Mock image sizes
const imageSizes = [
  { code: '512x512', name: '512 x 512 (Square)' },
  { code: '1024x1024', name: '1024 x 1024 (Square Large)' },
  { code: '1024x768', name: '1024 x 768 (Landscape)' },
  { code: '768x1024', name: '768 x 1024 (Portrait)' },
];

// Mock example prompts
const examplePrompts = [
    { id: 1, text: "A futuristic cityscape at sunset, neon lights reflecting on wet streets.", style: "Realistic", size: "1024x768" },
    { id: 2, text: "A cute cartoon cat wearing a wizard hat, holding a glowing potion.", style: "Cartoon", size: "512x512" },
    { id: 3, text: "An oil painting of a serene mountain lake surrounded by autumn trees.", style: "OilPainting", size: "1024x1024" },
    { id: 4, text: "Watercolor illustration of a hummingbird sipping nectar from a flower.", style: "Watercolor", size: "768x1024" },
    { id: 5, text: "Pixel art scene of a knight battling a dragon in front of a castle.", style: "PixelArt", size: "512x512" },
];


export default function ImageGeneratorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]); // Array of image URLs

  const form = useForm<ImageGeneratorFormValues>({
    resolver: zodResolver(imageGeneratorSchema),
    defaultValues: {
      imageDescription: '',
      artisticStyle: undefined,
      imageSize: undefined,
    },
  });

  const onSubmit = async (values: ImageGeneratorFormValues) => {
    console.log('Image generation started:', values);
    setStatus('generating');
    setGeneratedImages([]); // Clear previous images
    toast({
      title: 'Generation Started',
      description: `Generating ${values.artisticStyle} image(s)...`,
    });

    // --- Simulate AI Image Generation ---
    await new Promise(resolve => setTimeout(resolve, 4000)); // Simulate processing time

    // Simulate success or error
    const success = Math.random() > 0.2; // 80% chance of success

    if (success) {
      // Generate 4 placeholder image URLs
      const sizeParts = values.imageSize.split('x');
      const width = parseInt(sizeParts[0], 10);
      const height = parseInt(sizeParts[1], 10);
      const urls = Array.from({ length: 4 }).map((_, i) =>
        `https://picsum.photos/seed/${values.artisticStyle}${Date.now() + i}/${width}/${height}`
      );
      setGeneratedImages(urls);
      setStatus('success');
      toast({
        title: 'Generation Complete',
        description: `Images generated successfully!`,
      });
    } else {
      setStatus('error');
      toast({
        title: 'Generation Failed',
        description: 'Could not generate images. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAll = () => {
    setGeneratedImages([]);
    setStatus('idle'); // Reset to allow new generation
    form.reset(); // Optionally reset form
    toast({ title: 'Images Cleared' });
  };

   const handleShare = () => {
      toast({ title: 'Share Images', description: 'Sharing functionality not implemented yet.' });
      // Share logic using navigator.share or specific platform APIs
   };

   const handleExport = () => {
      toast({ title: 'Export Images', description: 'Export functionality not implemented yet.' });
      // Logic to zip images or download individually
   };

   const handlePrint = () => {
      toast({ title: 'Print Images', description: 'Printing functionality not implemented yet.' });
      // Logic to open print dialog for images
   };

   const handleUseExample = (prompt: typeof examplePrompts[0]) => {
       form.setValue('imageDescription', prompt.text);
       form.setValue('artisticStyle', prompt.style as ImageGeneratorFormValues['artisticStyle']);
       form.setValue('imageSize', prompt.size as ImageGeneratorFormValues['imageSize']);
       setStatus('idle'); // Reset status
       setGeneratedImages([]); // Clear previous results
       toast({ title: 'Example Prompt Loaded', description: 'Adjust settings and generate.' });
       window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
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
          <ImageIcon className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">Image Generator</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">Options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => form.reset()}>Clear Inputs</DropdownMenuItem>
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
            <ImageIcon className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-heading">Image Generator</CardTitle>
            <CardDescription className="max-w-xl mx-auto">
              Create stunning images from text descriptions. Choose your desired artistic style and dimensions to bring your ideas to life.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Input Form */}
         <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <Card className="card-base">
                     <CardHeader>
                         <CardTitle className="text-lg font-heading">1. Describe Your Image</CardTitle>
                         <CardDescription>Be descriptive! Mention objects, colors, setting, mood, etc.</CardDescription>
                     </CardHeader>
                     <CardContent>
                         <FormField
                            control={form.control}
                            name="imageDescription"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="sr-only">Image Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="e.g., A majestic lion with a golden mane sitting on a rock at sunrise..."
                                        {...field}
                                        className="input-base min-h-[120px]"
                                        disabled={status === 'generating'}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                         />
                     </CardContent>
                 </Card>

                 <Card className="card-base">
                     <CardHeader>
                         <CardTitle className="text-lg font-heading">2. Configure Options</CardTitle>
                         <CardDescription>Select the style and size for your generated images.</CardDescription>
                     </CardHeader>
                     <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {/* Artistic Style Selection */}
                         <FormField
                            control={form.control}
                            name="artisticStyle"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Artistic Style</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={status === 'generating'}>
                                    <FormControl>
                                    <SelectTrigger className="input-base">
                                        <SelectValue placeholder="Select style" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {artisticStyles.map(style => (
                                        <SelectItem key={style.code} value={style.code}>{style.name}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                         />
                          {/* Image Size Selection */}
                         <FormField
                            control={form.control}
                            name="imageSize"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Image Size</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={status === 'generating'}>
                                    <FormControl>
                                    <SelectTrigger className="input-base">
                                        <SelectValue placeholder="Select size" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {imageSizes.map(size => (
                                        <SelectItem key={size.code} value={size.code}>{size.name}</SelectItem>
                                    ))}
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
                              disabled={status === 'generating'}
                          >
                            {status === 'generating' ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="mr-2 h-5 w-5" /> Generate Images
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
                    <p className="text-lg font-semibold text-muted-foreground">Generating Images...</p>
                    <p className="text-sm text-muted-foreground mt-1">Creating visual magic, please wait.</p>
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
                         We couldn't generate the images. Please check your description or try again.
                     </p>
                     <Button variant="destructive" onClick={() => setStatus('idle')} className="btn-base">
                         Try Again
                     </Button>
                 </CardContent>
              </Card>
         )}

        {/* Success State - Generated Images Display */}
        {status === 'success' && generatedImages.length > 0 && (
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-xl font-heading">Generated Images</CardTitle>
               <CardDescription>Here are the images based on your description:</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
               {generatedImages.map((url, index) => (
                   <div key={index} className="aspect-square overflow-hidden rounded-lg border border-muted">
                       <Image
                           src={url}
                           alt={`Generated image ${index + 1}`}
                           width={512} // Adjust width based on grid/layout
                           height={512} // Adjust height based on grid/layout
                           className="object-cover w-full h-full transition-transform hover:scale-105"
                           onError={() => toast({ title: `Error loading image ${index + 1}`, variant: "destructive" })}
                       />
                   </div>
               ))}
            </CardContent>
             <CardFooter className="flex flex-wrap justify-end gap-2 pt-4">
               <Button type="button" variant="destructive" onClick={handleDeleteAll}>
                 <Trash2 className="mr-2 h-4 w-4" /> Delete All
               </Button>
               <Button type="button" variant="outline" onClick={handleShare}>
                 <Share2 className="mr-2 h-4 w-4" /> Share
               </Button>
               <Button type="button" variant="outline" onClick={handleExport}>
                 <Download className="mr-2 h-4 w-4" /> Export
               </Button>
               <Button type="button" variant="outline" onClick={handlePrint}>
                 <Printer className="mr-2 h-4 w-4" /> Print
               </Button>
             </CardFooter>
          </Card>
        )}

        {/* Example Prompts Section */}
         <Card className="card-base">
             <CardHeader>
                 <CardTitle className="text-lg font-heading">Examples & Inspiration</CardTitle>
                 <CardDescription>Click an example to load its settings.</CardDescription>
             </CardHeader>
              <CardContent>
                 <ScrollArea className="w-full whitespace-nowrap">
                     <div className="flex space-x-4 pb-4">
                         {examplePrompts.map((prompt) => (
                             <button
                                 key={prompt.id}
                                 onClick={() => handleUseExample(prompt)}
                                 className="shrink-0 w-64 p-4 border rounded-lg hover:shadow-md transition-shadow text-left focus:outline-none focus:ring-2 focus:ring-primary card-base"
                             >
                                 <p className="text-sm font-medium mb-1 truncate">{prompt.text}</p>
                                 <p className="text-xs text-muted-foreground">
                                     Style: {prompt.style}, Size: {prompt.size}
                                 </p>
                             </button>
                         ))}
                     </div>
                     <ScrollBar orientation="horizontal" />
                 </ScrollArea>
             </CardContent>
         </Card>

      </main>
    </div>
  );
}
    
