
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowLeft,
  Languages as LanguagesIcon, // Rename imported icon
  MoreVertical,
  Copy,
  ClipboardPaste,
  Volume2,
  Loader2, // Spinner icon
  AlertTriangle, // Error icon
  ClipboardCheck, // Icon for Copy Success
  ArrowRightLeft, // Icon for Swap Languages
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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

// Define Zod schema for translation form validation
const translationSchema = z.object({
  inputText: z.string().min(1, { message: 'Please enter text to translate.' }).max(5000, {message: 'Text cannot exceed 5000 characters.'}),
  sourceLanguage: z.enum(['auto', 'en', 'ar', 'es', 'fr', 'de', 'ja', 'zh'], { required_error: 'Please select a source language.' }).default('auto'), // Added source language with auto-detect default
  targetLanguage: z.enum(['en', 'ar', 'es', 'fr', 'de', 'ja', 'zh'], { required_error: 'Please select a target language.' }), // Example target languages
}).refine(data => data.sourceLanguage !== data.targetLanguage || data.sourceLanguage === 'auto', {
    message: "Source and target languages cannot be the same (unless source is Auto-detect).",
    path: ["targetLanguage"], // Attach error to target language for simplicity
});


type TranslationFormValues = z.infer<typeof translationSchema>;
type TranslationStatus = 'idle' | 'translating' | 'success' | 'error';

// Mock language list (extend as needed)
const languages = [
  { code: 'auto', name: 'Auto-detect' },
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'Arabic' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  // Add more languages
];

// Filter out 'Auto-detect' for target languages
const targetLanguages = languages.filter(lang => lang.code !== 'auto');

export default function SmartTranslatorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<TranslationStatus>('idle');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isInputCopied, setIsInputCopied] = useState(false);
  const [isOutputCopied, setIsOutputCopied] = useState(false);


  const form = useForm<TranslationFormValues>({
    resolver: zodResolver(translationSchema),
    defaultValues: {
      inputText: '',
      sourceLanguage: 'auto',
      targetLanguage: undefined,
    },
  });

  // Watch input text to reset copy status
  const inputTextValue = form.watch('inputText');
  React.useEffect(() => {
    setIsInputCopied(false);
  }, [inputTextValue]);

  React.useEffect(() => {
      setIsOutputCopied(false);
  }, [translatedText]);


  const onSubmit = async (values: TranslationFormValues) => {
    const sourceLangName = languages.find(l => l.code === values.sourceLanguage)?.name || 'Auto-detect';
    const targetLangName = languages.find(l => l.code === values.targetLanguage)?.name || 'selected language';
    console.log(`Translation started from ${sourceLangName} to ${targetLangName}:`, values.inputText);

    setStatus('translating');
    setTranslatedText(''); // Clear previous translation
    toast({
      title: 'Translation Started',
      description: `Translating text from ${sourceLangName} to ${targetLangName}...`,
    });

    // --- Simulate AI Translation ---
    await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate processing time

    // Simulate success or error
    const success = Math.random() > 0.15; // 85% chance of success

    if (success) {
        // Mock translation (replace with actual API call)
        const mockTranslated = `[Translated from ${sourceLangName} to ${targetLangName}]: ${values.inputText}`;
        setTranslatedText(mockTranslated);
        setStatus('success');
        toast({
            title: 'Translation Complete',
            description: 'Text translated successfully!',
        });
    } else {
        setStatus('error');
        toast({
            title: 'Translation Failed',
            description: 'Could not translate the text. Please try again.',
            variant: 'destructive',
        });
    }
  };

   const handleSwapLanguages = () => {
       const currentSource = form.getValues('sourceLanguage');
       const currentTarget = form.getValues('targetLanguage');

       // Prevent swapping if source is 'auto'
       if (currentSource === 'auto') {
           toast({ title: 'Cannot Swap', description: 'Select a specific source language to swap.', variant: 'default' });
           return;
       }
       if (!currentTarget) return; // Should not happen if form is valid, but good check

       form.setValue('sourceLanguage', currentTarget as TranslationFormValues['sourceLanguage']);
       form.setValue('targetLanguage', currentSource as TranslationFormValues['targetLanguage']);
       toast({ title: 'Languages Swapped' });
   };

  const handleCopy = async (text: string, type: 'input' | 'output') => {
    if (!text) return;
    try {
        await navigator.clipboard.writeText(text);
        if (type === 'input') setIsInputCopied(true);
        if (type === 'output') setIsOutputCopied(true);
        toast({ title: 'Copied to Clipboard', description: `${type === 'input' ? 'Original' : 'Translated'} text copied.` });
        // Reset icon after a delay
        setTimeout(() => {
            if (type === 'input') setIsInputCopied(false);
            if (type === 'output') setIsOutputCopied(false);
        }, 2000);
    } catch (err) {
        toast({ title: 'Copy Failed', description: 'Could not copy text.', variant: 'destructive' });
    }
  };

  const handlePaste = async (type: 'input' | 'output') => {
    try {
        const text = await navigator.clipboard.readText();
        if (type === 'input') {
            form.setValue('inputText', text);
            toast({ title: 'Pasted Text', description: 'Pasted into input box.' });
        } else {
             toast({ title: 'Paste Action', description: 'Paste into output box is not typical. Paste into input instead.', variant: 'default' });
        }
    } catch (err) {
        toast({ title: 'Paste Failed', description: 'Could not read clipboard.', variant: 'destructive' });
    }
  };

  const handleListen = (text: string, lang?: string) => {
      if (!text) return;
      if ('speechSynthesis' in window) {
          try {
            const utterance = new SpeechSynthesisUtterance(text);
            // Use language code if provided and not 'auto'
            if (lang && lang !== 'auto') {
                utterance.lang = lang;
            }
            window.speechSynthesis.cancel(); // Cancel previous speech
            window.speechSynthesis.speak(utterance);
            toast({ title: 'Speaking Text...' });
          } catch (error) {
              console.error("Speech synthesis error:", error);
              toast({ title: 'Speech Error', description: 'Could not play audio.', variant: 'destructive' });
          }
      } else {
          toast({ title: 'Not Supported', description: 'Text-to-speech is not supported in your browser.', variant: 'destructive' });
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
          <LanguagesIcon className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">Smart Translator</h1>
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
             <DropdownMenuItem onClick={() => { form.resetField('inputText'); setTranslatedText(''); }}>Clear Text</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: "Language Settings clicked (Not implemented)" })}>Language Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: "Help clicked" })}>Help</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Tool Overview */}
        <Card className="card-base text-center">
          <CardHeader>
            <LanguagesIcon className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-heading">Smart Translator</CardTitle>
            <CardDescription className="max-w-xl mx-auto">
              Effortlessly translate text between multiple languages with high accuracy. Enter your text, select the source and target languages, and let EduAI handle the rest.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Translation Form */}
         <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 {/* Input Text Section */}
                 <Card className="card-base">
                     <CardHeader>
                         <CardTitle className="text-lg font-heading">1. Enter Text</CardTitle>
                         <CardDescription>Type or paste the text you want to translate.</CardDescription>
                     </CardHeader>
                     <CardContent>
                         <FormField
                            control={form.control}
                            name="inputText"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="sr-only">Text to Translate</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Enter text here..."
                                        {...field}
                                        className="input-base min-h-[150px]" // Adjust height
                                        disabled={status === 'translating'}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                         />
                     </CardContent>
                      <CardFooter className="flex justify-end gap-2 pt-0 pb-4 px-4">
                        <Button type="button" variant="outline" size="sm" onClick={() => handleCopy(form.getValues('inputText'), 'input')} disabled={!form.getValues('inputText')}>
                           {isInputCopied ? <ClipboardCheck className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />} Copy
                        </Button>
                         <Button type="button" variant="outline" size="sm" onClick={() => handlePaste('input')}>
                           <ClipboardPaste className="mr-1 h-4 w-4" /> Paste
                        </Button>
                         <Button type="button" variant="outline" size="sm" onClick={() => handleListen(form.getValues('inputText'), form.getValues('sourceLanguage'))} disabled={!form.getValues('inputText')}>
                           <Volume2 className="mr-1 h-4 w-4" /> Listen
                        </Button>
                      </CardFooter>
                 </Card>

                 {/* Language Selection & Translate Button Section */}
                  <Card className="card-base">
                     <CardHeader>
                         <CardTitle className="text-lg font-heading">2. Select Languages & Translate</CardTitle>
                         <CardDescription>Choose the source and target languages.</CardDescription>
                     </CardHeader>
                      <CardContent className="space-y-4">
                         <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3">
                             {/* Source Language */}
                             <FormField
                                control={form.control}
                                name="sourceLanguage"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>From</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={status === 'translating'}>
                                        <FormControl>
                                        <SelectTrigger className="input-base">
                                            <SelectValue placeholder="Select source language" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {languages.map(lang => (
                                            <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                                        ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                             />

                             {/* Swap Button */}
                             <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handleSwapLanguages}
                                disabled={status === 'translating' || form.getValues('sourceLanguage') === 'auto'}
                                className="mt-6 mx-auto sm:mx-0" // Adjust margin for alignment
                                aria-label="Swap languages"
                              >
                                <ArrowRightLeft className="h-5 w-5 text-primary" />
                             </Button>

                            {/* Target Language */}
                             <FormField
                                control={form.control}
                                name="targetLanguage"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>To</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={status === 'translating'}>
                                        <FormControl>
                                        <SelectTrigger className="input-base">
                                            <SelectValue placeholder="Select target language" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {targetLanguages.map(lang => (
                                            <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                                        ))}
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
                                disabled={status === 'translating'}
                            >
                            {status === 'translating' ? (
                                <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Translating...
                                </>
                            ) : (
                                <>
                                <LanguagesIcon className="mr-2 h-5 w-5" /> Translate
                                </>
                            )}
                           </Button>
                      </CardFooter>
                  </Card>
             </form>
         </Form>


         {/* Translating State Placeholder (Alternative to disabling form) */}
         {/* {status === 'translating' && ( ... show spinner card ... )} */}

         {/* Error State */}
         {status === 'error' && (
              <Card className="card-base border-destructive bg-destructive/10 text-center">
                 <CardContent className="p-8">
                     <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
                     <p className="text-lg font-semibold text-destructive">Translation Failed</p>
                     <p className="text-sm text-destructive/90 mt-1 mb-4">
                         We couldn't translate the text. Please check your input or try again.
                     </p>
                     <Button variant="destructive" onClick={() => setStatus('idle')} className="btn-base">
                         Try Again
                     </Button>
                 </CardContent>
              </Card>
         )}

        {/* Success State - Translated Text Display */}
        {status === 'success' && translatedText && (
          <Card className="card-base bg-gradient-to-r from-primary/5 via-background to-secondary/5">
            <CardHeader>
              <CardTitle className="text-xl font-heading">Translated Text</CardTitle>
               <CardDescription>Here is the translation to {languages.find(l => l.code === form.getValues('targetLanguage'))?.name || 'the selected language'}.</CardDescription>
            </CardHeader>
            <CardContent>
               <Textarea
                    value={translatedText}
                    readOnly
                    className="input-base min-h-[150px] bg-muted/50" // Make output distinct
                    aria-label="Translated text"
                />
            </CardContent>
             <CardFooter className="flex justify-end gap-2 pt-0 pb-4 px-4">
               <Button type="button" variant="outline" size="sm" onClick={() => handleCopy(translatedText, 'output')} disabled={!translatedText}>
                 {isOutputCopied ? <ClipboardCheck className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />} Copy
               </Button>
               <Button type="button" variant="outline" size="sm" onClick={() => handlePaste('output')} disabled> {/* Disable paste for output */}
                 <ClipboardPaste className="mr-1 h-4 w-4" /> Paste
               </Button>
               <Button type="button" variant="outline" size="sm" onClick={() => handleListen(translatedText, form.getValues('targetLanguage'))} disabled={!translatedText}>
                 <Volume2 className="mr-1 h-4 w-4" /> Listen
               </Button>
             </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
}


    