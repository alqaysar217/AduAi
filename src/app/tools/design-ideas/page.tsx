
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowLeft,
  Palette, // Tool icon
  MoreVertical,
  Heart, // Favorite icon
  Save, // Save icon
  Share2, // Share icon
  Loader2, // Spinner icon
  AlertTriangle, // Error icon
  Image as ImageIcon, // Placeholder image icon
} from 'lucide-react';
import Image from 'next/image'; // Import next/image

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
const designIdeasSchema = z.object({
  projectType: z.string().min(3, 'Project type must be at least 3 characters.').max(100, 'Project type too long.'),
  designStyle: z.enum(['Minimalist', 'Modern', 'Classic', 'Futuristic', 'Playful', 'Corporate'], { required_error: 'Please select a design style.' }),
});

type DesignIdeasFormValues = z.infer<typeof designIdeasSchema>;
type ProcessingStatus = 'idle' | 'generating' | 'success' | 'error';

interface DesignIdea {
    id: string;
    title: string;
    description: string;
    imageUrl?: string; // Optional image URL
}

export default function DesignIdeasPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [ideas, setIdeas] = useState<DesignIdea[]>([]);

  const form = useForm<DesignIdeasFormValues>({
    resolver: zodResolver(designIdeasSchema),
    defaultValues: {
      projectType: '',
      designStyle: undefined,
    },
  });

  const onSubmit = async (values: DesignIdeasFormValues) => {
    console.log('Generating design ideas:', values);
    setStatus('generating');
    setIdeas([]);
    toast({ title: 'Generating Ideas...', description: `Finding ${values.designStyle} ideas for a ${values.projectType}...` });

    // --- Simulate AI Idea Generation ---
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simulate success or error
    const success = Math.random() > 0.15; // 85% chance of success

    if (success) {
      // Mock design ideas
      const mockIdeas: DesignIdea[] = [
        {
          id: 'idea-1',
          title: `${values.designStyle} Concept 1`,
          description: `A clean ${values.designStyle.toLowerCase()} approach focusing on typography and white space for the ${values.projectType}.`,
          imageUrl: `https://picsum.photos/seed/${values.projectType}1/300/200`,
        },
        {
          id: 'idea-2',
          title: `Interactive ${values.designStyle} Element`,
          description: `Incorporate micro-interactions with a ${values.designStyle.toLowerCase()} feel to enhance user engagement for the ${values.projectType}.`,
          // No image for this one
        },
        {
          id: 'idea-3',
          title: `${values.designStyle} Color Palette`,
          description: `Utilize a ${values.designStyle.toLowerCase()} color scheme with muted tones and a single accent color for the ${values.projectType}.`,
           imageUrl: `https://picsum.photos/seed/${values.projectType}3/300/200`,
        },
         {
          id: 'idea-4',
          title: `Bold ${values.designStyle} Layout`,
          description: `Experiment with asymmetric layouts while maintaining ${values.designStyle.toLowerCase()} principles for the ${values.projectType}.`,
           imageUrl: `https://picsum.photos/seed/${values.projectType}4/300/200`,
        },
      ];
      setIdeas(mockIdeas);
      setStatus('success');
      toast({ title: 'Ideas Generated Successfully!' });
    } else {
      setStatus('error');
      toast({ title: 'Generation Failed', description: 'Could not generate design ideas.', variant: 'destructive' });
    }
  };

  const handleSaveIdea = (idea: DesignIdea) => {
      toast({ title: 'Save Idea', description: `"${idea.title}" saved (Not implemented).` });
      // Implement saving logic
  };

   const handleFavoriteIdea = (idea: DesignIdea) => {
      toast({ title: 'Add to Favorites', description: `"${idea.title}" favorited (Not implemented).` });
       // Implement favorite logic
  };

  const handleShareIdea = (idea: DesignIdea) => {
     const shareText = `Design Idea: ${idea.title}\nDescription: ${idea.description}${idea.imageUrl ? `\nImage: ${idea.imageUrl}` : ''}`;
     if (navigator.share) {
       navigator.share({ title: `Design Idea: ${idea.title}`, text: shareText })
         .catch(err => {
             console.error("Share failed:", err);
             navigator.clipboard.writeText(shareText);
             toast({title: 'Share failed', description: 'Idea copied to clipboard.', variant: 'default'})
          });
     } else {
        navigator.clipboard.writeText(shareText);
        toast({ title: 'Share Not Supported', description: 'Idea copied to clipboard.' });
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
        <div className="flex items-center gap-2">
          <Palette className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">Design Ideas</h1>
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
             <DropdownMenuItem onClick={() => toast({ title: "Help clicked" })}>Help</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Tool Overview */}
        <Card className="card-base text-center">
          <CardHeader>
            <Palette className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-heading">Design Ideas Generator</CardTitle>
            <CardDescription className="max-w-xl mx-auto">
              Stuck in a creative rut? Describe your project type, choose a style, and get visual design inspirations and concepts.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Input Form */}
         <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <Card className="card-base">
                     <CardHeader>
                         <CardTitle className="text-lg font-heading">Generate Design Inspiration</CardTitle>
                         <CardDescription>Tell us about your project and desired style.</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-4">
                         {/* Project Type Input */}
                         <FormField
                            control={form.control}
                            name="projectType"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Project Type</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Mobile App, Website Landing Page, Logo" {...field} className="input-base" disabled={status === 'generating'} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                         />
                          {/* Design Style Selection */}
                         <FormField
                            control={form.control}
                            name="designStyle"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Design Style</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={status === 'generating'}>
                                    <FormControl>
                                    <SelectTrigger className="input-base">
                                        <SelectValue placeholder="Select design style" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Minimalist">Minimalist</SelectItem>
                                        <SelectItem value="Modern">Modern</SelectItem>
                                        <SelectItem value="Classic">Classic</SelectItem>
                                        <SelectItem value="Futuristic">Futuristic</SelectItem>
                                        <SelectItem value="Playful">Playful</SelectItem>
                                         <SelectItem value="Corporate">Corporate</SelectItem>
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
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Ideas...
                              </>
                            ) : (
                              <>
                                <Palette className="mr-2 h-5 w-5" /> Generate Ideas
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
                    <p className="text-lg font-semibold text-muted-foreground">Generating Ideas...</p>
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
                         Could not generate design ideas at this time. Please try again.
                     </p>
                     <Button variant="destructive" onClick={() => setStatus('idle')} className="btn-base">
                         Try Again
                     </Button>
                 </CardContent>
              </Card>
         )}

        {/* Success State - Design Ideas Display */}
        {status === 'success' && ideas.length > 0 && (
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-xl font-heading">Design Ideas</CardTitle>
               <CardDescription>Here are some {form.getValues('designStyle')} ideas for your {form.getValues('projectType')}:</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {ideas.map((idea) => (
                 <Card key={idea.id} className="card-base overflow-hidden flex flex-col">
                   {idea.imageUrl && (
                     <div className="relative h-32 w-full bg-muted overflow-hidden">
                        <Image
                            src={idea.imageUrl}
                            alt={`Preview for ${idea.title}`}
                            layout="fill"
                            objectFit="cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }} // Hide if image fails
                        />
                        {/* Fallback Icon if image fails or is missing */}
                        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                           <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                     </div>
                   )}
                    <CardHeader className="pb-2 pt-3">
                        <CardTitle className="text-base font-heading">{idea.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 pb-3">
                        <p className="text-sm text-muted-foreground">{idea.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-1 p-2 border-t bg-muted/20">
                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleFavoriteIdea(idea)}>
                            <Heart className="h-4 w-4" />
                            <span className="sr-only">Favorite</span>
                         </Button>
                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleSaveIdea(idea)}>
                            <Save className="h-4 w-4" />
                            <span className="sr-only">Save</span>
                         </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleShareIdea(idea)}>
                            <Share2 className="h-4 w-4" />
                            <span className="sr-only">Share</span>
                         </Button>
                    </CardFooter>
                 </Card>
               ))}
            </CardContent>
          </Card>
        )}
        {status === 'success' && ideas.length === 0 && (
            <Card className="card-base text-center">
                 <CardContent className="p-8">
                     <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                     <p className="text-lg font-semibold text-muted-foreground">No Ideas Found</p>
                     <p className="text-sm text-muted-foreground mt-1">Try broadening your project type or style.</p>
                 </CardContent>
             </Card>
        )}
      </main>
    </div>
  );
}
