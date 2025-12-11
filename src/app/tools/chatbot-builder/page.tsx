
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowLeft,
  MessageSquare, // Tool icon
  MoreVertical,
  Bot, // Bot icon
  PlusCircle, // Add Q&A icon
  Trash2, // Delete Q&A icon
  Download, // Export icon
  Play, // Test bot icon
  Loader2, // Spinner icon
  AlertTriangle, // Error icon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

// Define Zod schema for Q&A pair
const qaPairSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty.'),
  answer: z.string().min(1, 'Answer cannot be empty.'),
});

// Define Zod schema for the main form
const chatbotBuilderSchema = z.object({
  botName: z.string().min(3, 'Bot name must be at least 3 characters.').max(50, 'Bot name too long.'),
  botStyle: z.enum(['Friendly', 'Formal', 'Technical'], { required_error: 'Please select a bot style.' }),
  mainPurpose: z.string().min(10, 'Purpose must be at least 10 characters.').max(500, 'Purpose too long.'),
  qaPairs: z.array(qaPairSchema).min(1, 'Add at least one question and answer pair.'),
});

type ChatbotBuilderFormValues = z.infer<typeof chatbotBuilderSchema>;
type ProcessingStatus = 'idle' | 'generating' | 'success' | 'error';

export default function ChatbotBuilderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [generatedScript, setGeneratedScript] = useState<string>(''); // Store script or flowchart representation

  const form = useForm<ChatbotBuilderFormValues>({
    resolver: zodResolver(chatbotBuilderSchema),
    defaultValues: {
      botName: '',
      botStyle: undefined,
      mainPurpose: '',
      qaPairs: [{ question: '', answer: '' }], // Start with one empty Q&A pair
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'qaPairs',
  });

  const onSubmit = async (values: ChatbotBuilderFormValues) => {
    console.log('Chatbot generation started:', values);
    setStatus('generating');
    setGeneratedScript('');
    toast({ title: 'Generating Bot Script...', description: `Creating script for ${values.botName}...` });

    // --- Simulate AI Script Generation ---
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing time

    // Simulate success or error
    const success = Math.random() > 0.2; // 80% chance of success

    if (success) {
      // Mock script generation
      let script = `## Chatbot Script: ${values.botName}\n\n`;
      script += `**Style:** ${values.botStyle}\n`;
      script += `**Purpose:** ${values.mainPurpose}\n\n`;
      script += `**Dialog Flow:**\n\n`;
      script += `START\n`;
      script += `  Bot: [Greeting based on style, e.g., "Hello! How can I help you today?" or "Greetings. State your query."]\n`;
      script += `  User: [User Input]\n\n`;

      values.qaPairs.forEach((pair, index) => {
          script += `  IF UserInput contains keywords related to "${pair.question.substring(0, 30)}..." THEN\n`;
          script += `    Bot: ${pair.answer}\n`;
          script += `    GOTO END_RESPONSE\n`;
      });

      script += `  ELSE\n`;
      script += `    Bot: [Fallback message, e.g., "Sorry, I didn't understand that. Can you rephrase?" or "I am unable to assist with that query."]\n`;
      script += `  END_IF\n\n`;
      script += `END_RESPONSE\n`;
      script += `  Bot: [Closing remark, e.g., "Is there anything else?" or "Query addressed."]\n`;
      script += `END\n`;


      setGeneratedScript(script);
      setStatus('success');
      toast({ title: 'Bot Script Generated Successfully!' });
    } else {
      setStatus('error');
      toast({ title: 'Generation Failed', description: 'Could not generate the bot script.', variant: 'destructive' });
    }
  };

   const handleExportScript = () => {
       if (!generatedScript) return;
       const blob = new Blob([generatedScript], { type: 'text/plain' });
       const url = URL.createObjectURL(blob);
       const link = document.createElement('a');
       link.href = url;
       link.download = `${form.getValues('botName').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_script.txt`;
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
       URL.revokeObjectURL(url);
       toast({ title: 'Script Exported', description: 'Bot script saved as text file.' });
   };

   const handleTestChatbot = () => {
       if (!generatedScript) return;
       toast({ title: 'Test Chatbot', description: 'Chatbot simulation feature is not implemented yet.' });
       // In a real app, this could open a modal simulating the chat based on the generated script/rules.
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
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">Chatbot Builder</h1>
        </div>
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">Options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => form.reset()}>Clear All Inputs</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: "Help clicked" })}>Help</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Tool Overview */}
        <Card className="card-base text-center">
          <CardHeader>
            <MessageSquare className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-heading">Chatbot Builder</CardTitle>
            <CardDescription className="max-w-xl mx-auto">
              Create simple chatbot scripts quickly. Define the bot's name, style, purpose, and add question-answer pairs to build its knowledge base.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Input Form */}
         <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <Card className="card-base">
                     <CardHeader>
                         <CardTitle className="text-lg font-heading">1. Configure Your Bot</CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                         {/* Bot Name */}
                         <FormField
                            control={form.control}
                            name="botName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Bot Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Support Helper, FAQ Bot" {...field} className="input-base" disabled={status === 'generating'} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                         />
                          {/* Bot Style */}
                         <FormField
                            control={form.control}
                            name="botStyle"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Bot Style</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={status === 'generating'}>
                                    <FormControl>
                                    <SelectTrigger className="input-base">
                                        <SelectValue placeholder="Select interaction style" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Friendly">Friendly</SelectItem>
                                        <SelectItem value="Formal">Formal</SelectItem>
                                        <SelectItem value="Technical">Technical</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                         />
                         {/* Main Purpose */}
                          <FormField
                            control={form.control}
                            name="mainPurpose"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Main Purpose</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Describe what the bot is supposed to help users with..."
                                        {...field}
                                        className="input-base min-h-[80px]"
                                        disabled={status === 'generating'}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                         />
                     </CardContent>
                 </Card>

                 {/* Q&A Pairs Section */}
                  <Card className="card-base">
                      <CardHeader>
                          <CardTitle className="text-lg font-heading">2. Add Questions & Answers</CardTitle>
                           <CardDescription>Build the bot's knowledge. Add keywords or questions users might ask and the corresponding answers.</CardDescription>
                      </CardHeader>
                       <CardContent className="space-y-4">
                           {fields.map((field, index) => (
                               <div key={field.id} className="p-4 border rounded-lg relative space-y-3 bg-muted/30">
                                  <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="absolute top-1 right-1 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                      onClick={() => remove(index)}
                                      disabled={fields.length <= 1 || status === 'generating'}
                                      aria-label="Remove Q&A pair"
                                   >
                                      <Trash2 className="h-4 w-4" />
                                   </Button>
                                   <FormField
                                       control={form.control}
                                       name={`qaPairs.${index}.question`}
                                       render={({ field }) => (
                                           <FormItem>
                                               <FormLabel>User Question/Keywords {index + 1}</FormLabel>
                                               <FormControl>
                                                   <Input placeholder="e.g., How to reset password?" {...field} className="input-base bg-background" disabled={status === 'generating'} />
                                               </FormControl>
                                               <FormMessage />
                                           </FormItem>
                                       )}
                                   />
                                   <FormField
                                       control={form.control}
                                       name={`qaPairs.${index}.answer`}
                                       render={({ field }) => (
                                           <FormItem>
                                               <FormLabel>Bot Answer {index + 1}</FormLabel>
                                               <FormControl>
                                                    <Textarea placeholder="e.g., You can reset your password by clicking..." {...field} className="input-base bg-background min-h-[60px]" disabled={status === 'generating'} />
                                               </FormControl>
                                               <FormMessage />
                                           </FormItem>
                                       )}
                                   />
                               </div>
                           ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ question: '', answer: '' })}
                                disabled={status === 'generating'}
                                className="mt-2"
                             >
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Q&A Pair
                            </Button>
                            {/* Display top-level error for minimum Q&A pairs */}
                           <FormMessage>{form.formState.errors.qaPairs?.root?.message}</FormMessage>
                       </CardContent>
                       <CardFooter>
                           <Button
                               type="submit"
                               className="w-full btn-base"
                               disabled={status === 'generating'}
                           >
                             {status === 'generating' ? (
                               <>
                                 <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Bot...
                               </>
                             ) : (
                               <>
                                 <Bot className="mr-2 h-5 w-5" /> Generate Bot
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
                    <p className="text-lg font-semibold text-muted-foreground">Building Bot...</p>
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
                         Could not generate the bot script. Please check your inputs and try again.
                     </p>
                     <Button variant="destructive" onClick={() => setStatus('idle')} className="btn-base">
                         Try Again
                     </Button>
                 </CardContent>
              </Card>
         )}

        {/* Success State - Generated Script/Flowchart Display */}
        {status === 'success' && generatedScript && (
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-xl font-heading">Generated Bot Script</CardTitle>
               <CardDescription>Review the generated script for "{form.getValues('botName')}":</CardDescription>
            </CardHeader>
            <CardContent>
               <Textarea
                    value={generatedScript}
                    readOnly
                    className="input-base min-h-[300px] bg-muted/50 font-mono text-xs" // Use smaller mono font for script
                    aria-label="Generated bot script"
                />
            </CardContent>
             <CardFooter className="flex flex-wrap justify-end gap-2 pt-4">
               <Button type="button" variant="outline" onClick={handleExportScript}>
                 <Download className="mr-2 h-4 w-4" /> Export Script
               </Button>
               <Button type="button" variant="outline" onClick={handleTestChatbot}>
                 <Play className="mr-2 h-4 w-4" /> Test Chatbot
               </Button>
             </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
}
