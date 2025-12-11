
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowLeft,
  Brain, // Tool icon
  MoreVertical,
  Sparkles, // Generate icon
  Loader2,
  AlertTriangle,
  Download,
  Share2, // Share Map icon
  Printer, // Print Map icon
  UploadCloud, // For file upload
  Trash2,
} from 'lucide-react';
import NextImage from 'next/image'; // Renamed to avoid conflict

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const mindMapSchema = z.object({
  mainIdea: z.string().max(1000, { message: 'Main idea too long.' }).optional(),
  language: z.string().default('auto'),
  layoutStyle: z.enum(['hierarchical', 'circular', 'linear', 'tree'], { required_error: 'Layout style is required.' }).default('tree'),
});

type MindMapFormValues = z.infer<typeof mindMapSchema>;
type ProcessingStatus = 'idle' | 'configuring' | 'generating' | 'success' | 'error';
type InputMethod = 'text' | 'file';

const languageOptions = [
  { id: 'auto', labelKey: 'mindMapGeneratorPage.languageAuto' },
  { id: 'en', labelKey: 'languageSettingsPage.english' },
  { id: 'ar', labelKey: 'languageSettingsPage.arabic' },
];

const layoutStyleOptions = [
  { id: 'tree', labelKey: 'mindMapGeneratorPage.layoutStyleTree' },
  { id: 'hierarchical', labelKey: 'mindMapGeneratorPage.layoutStyleHierarchical' },
  { id: 'circular', labelKey: 'mindMapGeneratorPage.layoutStyleCircular' },
  { id: 'linear', labelKey: 'mindMapGeneratorPage.layoutStyleLinear' },
];


export default function MindMapGeneratorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [generatedMapUrl, setGeneratedMapUrl] = useState<string | null>(null);
  const [currentInputMethod, setCurrentInputMethod] = useState<InputMethod>('text');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<MindMapFormValues>({
    resolver: zodResolver(mindMapSchema),
    defaultValues: {
      mainIdea: '',
      language: 'auto',
      layoutStyle: 'tree',
    },
  });


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        toast({ title: t('mindMapGeneratorPage.errors.invalidFileType'), variant: 'destructive' });
        return;
      }
      setUploadedFile(file);
      toast({ title: t('mindMapGeneratorPage.fileSelected', { fileName: file.name }) });
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: t('mindMapGeneratorPage.fileRemoved') });
  };

  const onSubmit = async (values: MindMapFormValues) => {
    if (currentInputMethod === 'text' && (!values.mainIdea || values.mainIdea.trim().length < 5)) {
      form.setError('mainIdea', { type: 'manual', message: t('mindMapGeneratorPage.errors.mainIdeaRequired') });
      return;
    }
    if (currentInputMethod === 'file' && !uploadedFile) {
      toast({ title: t('mindMapGeneratorPage.errors.fileRequired'), variant: 'destructive' });
      return;
    }

    setStatus('generating');
    setGeneratedMapUrl(null);
    toast({ title: t('mindMapGeneratorPage.generatingMessage') });

    await new Promise(resolve => setTimeout(resolve, 3000));

    const success = Math.random() > 0.2;
    if (success) {
      const layoutStyleLabelKey = layoutStyleOptions.find(opt => opt.id === values.layoutStyle)?.labelKey || values.layoutStyle;
      const mapTitle = `${t('mindMapGeneratorPage.generatedMindMapTitle')} (${t(layoutStyleLabelKey)})`;
      setGeneratedMapUrl(`https://placehold.co/800x500.png?text=${encodeURIComponent(mapTitle)}&font=roboto`);
      setStatus('success');
      toast({ title: t('mindMapGeneratorPage.generationSuccessMessage') });
    } else {
      setStatus('error');
      toast({ title: t('mindMapGeneratorPage.generationFailedMessage'), variant: 'destructive' });
    }
  };

  const handleDownloadImage = () => {
    if (!generatedMapUrl || status !== 'success') {
        toast({ title: t("mindMapGeneratorPage.errors.noMapToDownload"), description: t("mindMapGeneratorPage.errors.generateFirst"), variant: "default"});
        return;
    }
    const link = document.createElement('a');
    link.href = generatedMapUrl;
    link.download = "mind_map.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: t('mindMapGeneratorPage.downloadImageButton') });
  };

  const handleDownloadPDF = () => {
    if (!generatedMapUrl || status !== 'success') {
        toast({ title: t("mindMapGeneratorPage.errors.noMapToDownload"), description: t("mindMapGeneratorPage.errors.generateFirst"), variant: "default"});
        return;
    }
    toast({ title: t('mindMapGeneratorPage.downloadPdfButton'), description: t('dashboard.notImplemented') });
  };

  const handleShareMap = () => {
     if (!generatedMapUrl || status !== 'success') {
       toast({ title: t("mindMapGeneratorPage.errors.noMapToShare"), description: t("mindMapGeneratorPage.errors.generateFirst"), variant: "default"});
       return;
    }
    navigator.clipboard.writeText(generatedMapUrl)
      .then(() => toast({ title: t('mindMapGeneratorPage.shareMapButton'), description: t('mindMapGeneratorPage.shareLinkCopied') }))
      .catch(() => toast({ title: t('mindMapGeneratorPage.errors.copyFailed'), variant: 'destructive' }));
  };

  const handlePrintMap = () => {
    if (!generatedMapUrl || status !== 'success') {
       toast({ title: t("mindMapGeneratorPage.errors.noMapToPrint"), description: t("mindMapGeneratorPage.errors.generateFirst"), variant: "default"});
       return;
    }
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`<html><head><title>${t('mindMapGeneratorPage.printMapButton')}</title></head><body style="text-align:center;"><img src="${generatedMapUrl}" style="max-width:100%;" onload="window.print(); setTimeout(function(){ window.close(); }, 100);" /></body></html>`);
        printWindow.document.close();
    } else {
        toast({ title: t('mindMapGeneratorPage.errors.printError'), variant: 'destructive'});
    }
  };

  const handleClearAndReset = () => {
    form.reset();
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setGeneratedMapUrl(null);
    setStatus('idle');
    setCurrentInputMethod('text');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className={cn("h-5 w-5", language === 'ar' && "transform scale-x-[-1]")} />
        </Button>
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">{t('toolTitles.mindMapGenerator')}</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={language === 'ar' ? 'start' : 'end'}>
            <DropdownMenuItem onClick={handleClearAndReset}>{t('mindMapGeneratorPage.optionsMenu.clearAll')}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: t('mindMapGeneratorPage.optionsMenu.help'), description: t('dashboard.notImplemented')})}>{t('mindMapGeneratorPage.optionsMenu.help')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card className="card-base text-center">
          <CardHeader>
            <Brain className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-heading">{t('toolTitles.mindMapGenerator')}</CardTitle>
            <CardDescription className="max-w-xl mx-auto">
              {t('toolDescriptions.mindMapGenerator')}
            </CardDescription>
          </CardHeader>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="card-base">
              <CardHeader>
                <CardTitle className="text-lg font-heading">{t('mindMapGeneratorPage.inputSectionTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={currentInputMethod} onValueChange={(value) => setCurrentInputMethod(value as InputMethod)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text">{t('mindMapGeneratorPage.inputTextTab')}</TabsTrigger>
                    <TabsTrigger value="file">{t('mindMapGeneratorPage.uploadFileTab')}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="text" className="pt-4">
                    <FormField
                      control={form.control}
                      name="mainIdea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('mindMapGeneratorPage.mainIdeaLabel')}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t('mindMapGeneratorPage.textInputPlaceholder')}
                              {...field}
                              className="input-base min-h-[120px]"
                              disabled={status === 'generating' || currentInputMethod !== 'text'}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  <TabsContent value="file" className="pt-4 space-y-2">
                    <Label htmlFor="file-upload-mm">{t('mindMapGeneratorPage.uploadFileLabel')}</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="file-upload-mm"
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="input-base flex-1"
                            accept=".txt,.pdf,.docx"
                            disabled={status === 'generating' || currentInputMethod !== 'file'}
                        />
                        {uploadedFile && <Button type="button" variant="ghost" size="icon" onClick={handleRemoveFile} disabled={status === 'generating'}><Trash2 className="h-4 w-4"/></Button>}
                    </div>
                    {uploadedFile && <FormDescription className="text-xs">{t('mindMapGeneratorPage.fileSelected', { fileName: uploadedFile.name })}</FormDescription>}
                     {currentInputMethod === 'file' && !uploadedFile && <FormMessage>{t('mindMapGeneratorPage.errors.fileRequired')}</FormMessage>}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="card-base">
              <CardHeader>
                <CardTitle className="text-lg font-heading">{t('mindMapGeneratorPage.customizationOptionsTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('mindMapGeneratorPage.languageDetectionLabel')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={status === 'generating'}>
                        <FormControl><SelectTrigger className="input-base"><SelectValue placeholder={t('mindMapGeneratorPage.languageDetectionLabel')} /></SelectTrigger></FormControl>
                        <SelectContent>
                          {languageOptions.map(opt => <SelectItem key={opt.id} value={opt.id}>{t(opt.labelKey)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="layoutStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('mindMapGeneratorPage.layoutStyleLabel')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={status === 'generating'}>
                        <FormControl><SelectTrigger className="input-base"><SelectValue placeholder={t('mindMapGeneratorPage.layoutStyleLabel')} /></SelectTrigger></FormControl>
                        <SelectContent>
                          {layoutStyleOptions.map(opt => <SelectItem key={opt.id} value={opt.id}>{t(opt.labelKey)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full btn-base" disabled={status === 'generating'}>
                  {status === 'generating' ? (
                    <><Loader2 className="rtl:ml-2 ltr:mr-2 h-5 w-5 animate-spin" /> {t('mindMapGeneratorPage.generatingMessage')}</>
                  ) : (
                    <><Sparkles className="rtl:ml-2 ltr:mr-2 h-5 w-5" /> {t('mindMapGeneratorPage.generateButton')}</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>

        {status === 'generating' && (
          <Card className="card-base text-center">
            <CardContent className="p-8 space-y-4">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
              <p className="text-lg font-semibold text-muted-foreground">{t('mindMapGeneratorPage.generatingMessage')}</p>
            </CardContent>
          </Card>
        )}

        {status === 'error' && (
          <Card className="card-base border-destructive bg-destructive/10 text-center">
            <CardContent className="p-8 space-y-3">
              <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
              <p className="text-lg font-semibold text-destructive">{t('mindMapGeneratorPage.generationFailedMessage')}</p>
              <Button variant="destructive" onClick={() => setStatus('idle')} className="btn-base mt-2">{t('mindMapGeneratorPage.tryAgainButton')}</Button>
            </CardContent>
          </Card>
        )}

        {status === 'success' && generatedMapUrl && (
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-xl font-heading">
                {t('mindMapGeneratorPage.generatedMindMapTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-4 bg-muted/30 rounded-lg border min-h-[300px]">
              <NextImage
                src={generatedMapUrl}
                alt={t('mindMapGeneratorPage.generatedMindMapTitle')}
                width={800}
                height={500}
                className="max-w-full h-auto rounded"
                data-ai-hint="mind map diagram"
              />
            </CardContent>
            <CardFooter className="flex flex-wrap justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleDownloadImage}><Download className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('mindMapGeneratorPage.downloadImageButton')}</Button>
              <Button variant="outline" onClick={handleDownloadPDF}><Download className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('mindMapGeneratorPage.downloadPdfButton')}</Button>
              <Button variant="outline" onClick={handleShareMap}><Share2 className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('mindMapGeneratorPage.shareMapButton')}</Button>
              <Button variant="outline" onClick={handlePrintMap}><Printer className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('mindMapGeneratorPage.printMapButton')}</Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
}
