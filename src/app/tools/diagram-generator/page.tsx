
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowLeft,
  Workflow, // Tool icon
  MoreVertical,
  Eraser, // For Clear button
  Printer,
  Download,
  Share2,
  Loader2, // Spinner icon
  AlertTriangle, // Error icon
  Image as ImageIcon, // Placeholder for generated diagram
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea'; // Use Textarea for description
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
import Image from 'next/image'; // Use next/image for diagram display
import { Badge } from '@/components/ui/badge'; // Import Badge


// Define Zod schema for diagram generation form validation
const diagramGeneratorSchema = z.object({
  diagramType: z.enum(['UseCase', 'DFD', 'ERD', 'Flowchart'], { required_error: 'Please select a diagram type.' }),
  systemDescription: z.string().min(10, { message: 'Please provide a description of at least 10 characters.' }).max(1000, { message: 'Description cannot exceed 1000 characters.' }),
});

type DiagramGeneratorFormValues = z.infer<typeof diagramGeneratorSchema>;

type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';

// Mock template data
const templates = [
  { name: 'Hospital System', type: 'UseCase', description: 'Basic use case diagram for a hospital management system.' },
  { name: 'School Registration', type: 'DFD', description: 'Data Flow Diagram for a student registration process.' },
  { name: 'Banking System', type: 'ERD', description: 'Entity Relationship Diagram for a simple banking application.' },
];

export default function DiagramGeneratorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [generatedDiagramUrl, setGeneratedDiagramUrl] = useState<string | null>(null); // URL or data URI of the generated diagram

  const form = useForm<DiagramGeneratorFormValues>({
    resolver: zodResolver(diagramGeneratorSchema),
    defaultValues: {
      diagramType: undefined, // No default type selected
      systemDescription: '',
    },
  });

  const onSubmit = async (values: DiagramGeneratorFormValues) => {
    console.log('Diagram generation started with values:', values);
    setStatus('generating');
    setGeneratedDiagramUrl(null); // Clear previous diagram
    toast({
      title: 'Generation Started',
      description: `Generating ${values.diagramType} diagram...`,
    });

    // --- Simulate AI Diagram Generation ---
    await new Promise(resolve => setTimeout(resolve, 3500)); // Simulate processing time

    // Simulate success or error
    const success = Math.random() > 0.2; // 80% chance of success

    if (success) {
      // Use a placeholder image URL for the generated diagram
      const placeholderUrl = `https://picsum.photos/seed/${values.diagramType}${Date.now()}/800/600`; // Use picsum for demo
      setGeneratedDiagramUrl(placeholderUrl);
      setStatus('success');
      toast({
        title: 'Generation Complete',
        description: `${values.diagramType} diagram generated successfully!`,
      });
    } else {
      setStatus('error');
      toast({
        title: 'Generation Failed',
        description: 'Could not generate the diagram. Please check your description or try again.',
        variant: 'destructive',
      });
    }
  };

  const handleClearDescription = () => {
    form.resetField('systemDescription');
    toast({ title: 'Description Cleared' });
  };

  const handleUseTemplate = (template: typeof templates[0]) => {
     form.setValue('diagramType', template.type as 'UseCase' | 'DFD' | 'ERD' | 'Flowchart'); // Set type from template
     form.setValue('systemDescription', template.description); // Set description from template
     setStatus('idle'); // Reset status
     setGeneratedDiagramUrl(null); // Clear any existing diagram
     toast({ title: `Template Loaded: ${template.name}` });
     // Scroll to the top or focus the description field if needed
     window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrint = () => {
    if (generatedDiagramUrl) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head><title>Print Diagram</title></head>
                <body style="text-align:center;">
                    <img src="${generatedDiagramUrl}" style="max-width:100%;" onload="window.print(); window.close();" />
                </body>
                </html>
            `);
            printWindow.document.close();
            toast({ title: 'Preparing Print...' });
        } else {
             toast({ title: 'Print Error', description: 'Could not open print window. Please check browser settings.', variant: 'destructive' });
        }
    }
  };

  const handleExport = () => {
    if (generatedDiagramUrl) {
      // Simulate download - in a real app, generate file or use server endpoint
      const link = document.createElement('a');
      link.href = generatedDiagramUrl; // Use the actual image URL
      link.download = `${form.getValues('diagramType')}_diagram.png`; // Suggest filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: 'Export Started', description: 'Downloading diagram image...' });
    }
  };

  const handleShare = () => {
      if (generatedDiagramUrl) {
         toast({ title: 'Share Diagram', description: 'Sharing functionality not fully implemented.' });
          // Basic share example using navigator.share if available
          if (navigator.share) {
             navigator.share({
                title: `${form.getValues('diagramType')} Diagram`,
                text: `Check out this diagram: ${form.getValues('systemDescription').substring(0, 50)}...`,
                // Files API might be needed for direct image sharing, which is complex
                // url: generatedDiagramUrl // Sharing the URL might work sometimes
             }).catch(err => console.error("Share failed:", err));
          } else {
             // Fallback: Copy link or message
             navigator.clipboard.writeText(generatedDiagramUrl);
             toast({title: 'Share API not supported', description: 'Diagram image URL copied to clipboard.'})
          }
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
          <Workflow className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">Diagram Generator</h1>
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
            <Workflow className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-heading">Diagram Generator</CardTitle>
            <CardDescription className="max-w-xl mx-auto">
              Easily generate software system diagrams like Use Case, DFD, ERD based on a simple description.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Diagram Generation Form */}
         <Card className="card-base">
             <CardHeader>
                 <CardTitle className="text-lg font-heading">1. Describe Your System</CardTitle>
                 <CardDescription>Select the diagram type and provide a detailed description.</CardDescription>
             </CardHeader>
             <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Diagram Type Selection */}
                    <FormField
                      control={form.control}
                      name="diagramType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diagram Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={status === 'generating'}>
                            <FormControl>
                              <SelectTrigger className="input-base">
                                <SelectValue placeholder="Select a diagram type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="UseCase">Use Case Diagram</SelectItem>
                              <SelectItem value="DFD">Data Flow Diagram (DFD)</SelectItem>
                              <SelectItem value="ERD">Entity Relationship Diagram (ERD)</SelectItem>
                              <SelectItem value="Flowchart">Flowchart</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* System Description */}
                    <FormField
                      control={form.control}
                      name="systemDescription"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                             <FormLabel>System Description</FormLabel>
                              <Button
                                 type="button"
                                 variant="ghost"
                                 size="sm"
                                 onClick={handleClearDescription}
                                 disabled={status === 'generating' || !field.value}
                                 className="text-xs h-7"
                              >
                                 <Eraser className="mr-1 h-3 w-3" /> Clear
                              </Button>
                          </div>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the system, its components, interactions, data flow, or process steps..."
                              {...field}
                              className="input-base min-h-[120px]" // Adjust height
                              disabled={status === 'generating'}
                            />
                          </FormControl>
                           <FormDescription className="text-xs">
                                Be specific for better results. Include actors, entities, processes, data stores, etc.
                           </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Generation Button */}
                    <Button
                      type="submit"
                      className="w-full btn-base"
                      disabled={status === 'generating'}
                    >
                      {status === 'generating' ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Diagram...
                        </>
                      ) : (
                        <>
                          <Workflow className="mr-2 h-5 w-5" /> Generate Diagram
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
             </CardContent>
         </Card>


         {/* Processing State Placeholder (alternative to disabling form) */}
         {/* {status === 'generating' && ( ... show spinner card ... )} */}

         {/* Error State */}
         {status === 'error' && (
              <Card className="card-base border-destructive bg-destructive/10 text-center">
                 <CardContent className="p-8">
                     <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
                     <p className="text-lg font-semibold text-destructive">Generation Failed</p>
                     <p className="text-sm text-destructive/90 mt-1 mb-4">
                         We couldn't generate the diagram. Please refine your description or try again.
                     </p>
                     <Button variant="destructive" onClick={() => setStatus('idle')} className="btn-base">
                         Try Again
                     </Button>
                 </CardContent>
              </Card>
         )}

        {/* Success State - Generated Diagram Display */}
        {status === 'success' && generatedDiagramUrl && (
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-xl font-heading">Generated Diagram</CardTitle>
              <CardDescription>Here is the {form.getValues('diagramType')} diagram based on your description.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center bg-muted/30 p-4 rounded-lg border min-h-[300px]">
              {/* Display the generated diagram image */}
              <Image
                  src={generatedDiagramUrl}
                  alt={`Generated ${form.getValues('diagramType')} Diagram`}
                  width={800} // Adjust dimensions as needed
                  height={600}
                  className="max-w-full h-auto rounded"
                  onError={() => {
                       toast({title: "Image Load Error", variant: "destructive"});
                       setGeneratedDiagramUrl(null); // Clear if image fails to load
                       setStatus('error');
                   }}
              />
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" /> Print
                </Button>
                 <Button variant="outline" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Export
                 </Button>
                 <Button variant="default" onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" /> Share
                 </Button>
            </CardFooter>
          </Card>
        )}

        {/* Ready-made Templates Section */}
         <Card className="card-base">
            <CardHeader>
               <CardTitle className="text-lg font-heading">Ready-Made Templates</CardTitle>
                <CardDescription>Use these examples as a starting point for your diagram.</CardDescription>
            </CardHeader>
             <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {templates.map((template) => (
                     <Card key={template.name} className="card-base hover:shadow-md transition-shadow">
                         <CardHeader className="pb-2">
                            <CardTitle className="text-base font-heading">{template.name}</CardTitle>
                            <Badge variant="secondary" className="text-xs w-fit">{template.type}</Badge>
                         </CardHeader>
                          <CardContent className="text-sm text-muted-foreground pb-3 pt-0">
                             {template.description}
                          </CardContent>
                         <CardFooter className="pt-0 pb-3">
                             <Button variant="link" size="sm" className="p-0 h-auto text-primary" onClick={() => handleUseTemplate(template)}>
                                 Use this Template
                             </Button>
                         </CardFooter>
                     </Card>
                 ))}
             </CardContent>
         </Card>

      </main>
    </div>
  );
}
