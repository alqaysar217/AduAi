
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowLeft,
  Languages as LanguagesIcon,
  MoreVertical,
  UploadCloud,
  FileText as FileTextIcon,
  Image as ImageIconLucide,
  Copy,
  Download,
  Loader2,
  AlertTriangle,
  Trash2,
  Printer,
  Share2,
} from 'lucide-react';
import NextImage from 'next/image'; // Renamed to avoid conflict with lucide-react Image

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const smartTranslatorSchema = z.object({
  contentDomain: z.string({ required_error: 'Please select a content domain.' }),
  targetLanguage: z.string({ required_error: 'Please select a target language.' }),
});

type SmartTranslatorFormValues = z.infer<typeof smartTranslatorSchema>;
type ProcessingStatus = 'idle' | 'uploaded' | 'translating' | 'success' | 'error';

const contentDomains = [
  { id: 'cybersecurity', labelKey: 'smartTranslatorTool.domains.cybersecurity' },
  { id: 'medicine', labelKey: 'smartTranslatorTool.domains.medicine' },
  { id: 'engineering', labelKey: 'smartTranslatorTool.domains.engineering' },
  { id: 'business', labelKey: 'smartTranslatorTool.domains.business' },
  { id: 'science', labelKey: 'smartTranslatorTool.domains.science' },
  { id: 'history', labelKey: 'smartTranslatorTool.domains.history' },
  { id: 'law', labelKey: 'smartTranslatorTool.domains.law' },
  { id: 'literature', labelKey: 'smartTranslatorTool.domains.literature' },
  { id: 'archaeology', labelKey: 'smartTranslatorTool.domains.archaeology' },
  { id: 'databases', labelKey: 'smartTranslatorTool.domains.databases' },
  { id: 'other', labelKey: 'smartTranslatorTool.domains.other' },
];

const targetLanguages = [
  { id: 'en', labelKey: 'languageSettingsPage.english' },
  { id: 'ar', labelKey: 'languageSettingsPage.arabic' },
  { id: 'fr', labelKey: 'languageSettingsPage.french' },
  { id: 'pt', labelKey: 'languageSettingsPage.portuguese' },
  { id: 'ja', labelKey: 'languageSettingsPage.japanese' },
  { id: 'hi', labelKey: 'languageSettingsPage.hindi' },
  { id: 'ur', labelKey: 'languageSettingsPage.urdu' },
  { id: 'de', labelKey: 'languageSettingsPage.german' },
  { id: 'zh', labelKey: 'languageSettingsPage.chinese_simplified' },
  { id: 'es', labelKey: 'languageSettingsPage.spanish' },
];


export default function SmartDocImageTranslatorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState<string>('');
  const [translatedImageUrl, setTranslatedImageUrl] = useState<string | null>(null);
  const [isImageFile, setIsImageFile] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<SmartTranslatorFormValues>({
    resolver: zodResolver(smartTranslatorSchema),
    defaultValues: {
      contentDomain: undefined,
      targetLanguage: undefined,
    },
  });

  useEffect(() => {
    // Clean up blob URLs
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (translatedImageUrl && translatedImageUrl.startsWith('blob:')) URL.revokeObjectURL(translatedImageUrl);
    };
  }, [previewUrl, translatedImageUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) { // Max 20MB
        toast({ title: t('smartTranslatorTool.errors.fileTooLarge'), variant: 'destructive' });
        return;
      }
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpeg']; // Updated to include jpeg
      const allowedDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      
      const isImg = allowedImageTypes.includes(file.type);
      const isDoc = allowedDocTypes.includes(file.type);

      if (!isImg && !isDoc) {
        toast({ title: t('smartTranslatorTool.errors.invalidFileType'), description: t('smartTranslatorTool.uploadBoxHint'), variant: 'destructive' });
        return;
      }

      setUploadedFile(file);
      setIsImageFile(isImg);

      if (isImg) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null); // No preview for non-image files
      }
      setStatus('uploaded');
      setTranslatedText('');
      setTranslatedImageUrl(null);
      toast({ title: t('smartTranslatorTool.fileSelectedMessage', { fileName: file.name }) });
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setIsImageFile(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setStatus('idle');
    setTranslatedText('');
    setTranslatedImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: t('smartTranslatorTool.fileRemovedMessage') });
  };

  const onSubmit = async (values: SmartTranslatorFormValues) => {
    if (!uploadedFile) {
      toast({ title: t('smartTranslatorTool.errors.noFile'), variant: 'destructive' });
      return;
    }
    setStatus('translating');
    setTranslatedText('');
    setTranslatedImageUrl(null);
    toast({ title: t('smartTranslatorTool.translationStartedMessage') });

    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate API call

    const success = Math.random() > 0.2;
    if (success) {
      const domainName = contentDomains.find(d => d.id === values.contentDomain)?.labelKey || 'Selected Domain';
      const langName = targetLanguages.find(l => l.id === values.targetLanguage)?.labelKey || 'Selected Language';
      
      if (isImageFile) {
        // Simulate generating a translated image URL (e.g., with overlaid text)
        // For demo, use a different placeholder or a modified one
        const translatedImgPlaceholder = `https://placehold.co/600x400.png?text=Translated:${uploadedFile.name.substring(0,10)}...%0Ato ${t(langName).substring(0,10)}`;
        setTranslatedImageUrl(translatedImgPlaceholder);
      } else {
        setTranslatedText(
          `${t('smartTranslatorTool.mockTranslationPrefix')} "${uploadedFile.name}" ${t('smartTranslatorTool.mockTranslationDomain')} ${t(domainName)} ${t('smartTranslatorTool.mockTranslationTo')} ${t(langName)}.\n\n${t('smartTranslatorTool.mockTranslationBodyDoc')}`
        );
      }
      setStatus('success');
      toast({ title: t('smartTranslatorTool.translationSuccessMessage') });
    } else {
      setStatus('error');
      toast({ title: t('smartTranslatorTool.translationFailedMessage'), variant: 'destructive' });
    }
  };

  const handleCopyText = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText)
      .then(() => toast({ title: t('smartTranslatorTool.copySuccessMessage') }))
      .catch(() => toast({ title: t('smartTranslatorTool.copyFailedMessage'), variant: 'destructive' }));
  };

  const handleDownload = () => {
    if (isImageFile && translatedImageUrl) {
        const link = document.createElement('a');
        link.href = translatedImageUrl; // This would be a direct link to the generated image
        link.download = `translated_${uploadedFile?.name || 'image.png'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: t('smartTranslatorTool.downloadImageButton') });
    } else if (!isImageFile && translatedText) {
        // Simulate DOCX download as text file for demo
        const filename = `translated_${uploadedFile?.name.split('.')[0] || 'document'}.txt`; // Simulate .docx by .txt
        const blob = new Blob([`Translated Content (Simulated .docx):\n\nDomain: ${form.getValues('contentDomain')}\nTarget Language: ${form.getValues('targetLanguage')}\n\n${translatedText}`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({ title: t('smartTranslatorTool.downloadFileButton')});
    } else {
        toast({title: t('smartTranslatorTool.errors.noResultToDownload'), variant: 'default'})
    }
  };

  const handlePrint = () => {
      if ((isImageFile && translatedImageUrl) || (!isImageFile && translatedText)) {
          toast({ title: t('buttons.print') + " (Not Implemented)"});
      } else {
          toast({title: t('smartTranslatorTool.errors.noResultToPrint'), variant: 'default'})
      }
  };
  
  const handleShare = () => {
      if ((isImageFile && translatedImageUrl) || (!isImageFile && translatedText)) {
          toast({ title: t('buttons.share') + " (Not Implemented)"});
      } else {
           toast({title: t('smartTranslatorTool.errors.noResultToShare'), variant: 'default'})
      }
  };


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className={cn("h-5 w-5", language === 'ar' && "transform scale-x-[-1]")} />
        </Button>
        <div className="flex items-center gap-2">
          <LanguagesIcon className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">{t('toolTitles.smartDocImageTranslator')}</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-5 w-5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={language === 'ar' ? 'start' : 'end'}>
            <DropdownMenuItem onClick={() => { form.reset(); handleRemoveFile(); }}>{t('buttons.clearAll')}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: t('buttons.help') + " (Not Implemented)"})}>{t('buttons.help')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card className="card-base text-center">
          <CardHeader>
            <LanguagesIcon className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-heading">{t('toolTitles.smartDocImageTranslator')}</CardTitle>
            <CardDescription className="max-w-xl mx-auto">
              {t('smartTranslatorTool.description')}
            </CardDescription>
          </CardHeader>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="card-base">
              <CardHeader>
                <CardTitle className="text-lg font-heading">{t('smartTranslatorTool.uploadSectionTitleV2')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Label
                  htmlFor="file-upload-sdi"
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors",
                    uploadedFile ? "border-primary" : "border-border"
                  )}
                >
                  {uploadedFile ? (
                    <div className="text-center p-4">
                      {previewUrl && isImageFile ? (
                        <div className="relative w-24 h-24 mx-auto mb-2 rounded overflow-hidden border">
                          <NextImage src={previewUrl} alt="File preview" layout="fill" objectFit="cover" data-ai-hint="document abstract" />
                        </div>
                      ) : (
                        <FileTextIcon className="h-12 w-12 text-primary mx-auto mb-2" />
                      )}
                      <p className="text-sm font-semibold truncate max-w-xs">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{Math.round(uploadedFile.size / 1024)} KB</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-destructive hover:text-destructive-foreground hover:bg-destructive/80"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveFile(); }}
                      >
                        <Trash2 className="rtl:ml-1 ltr:mr-1 h-4 w-4" /> {t('buttons.delete')}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="h-12 w-12 text-muted-foreground mb-3" />
                      <span className="text-sm font-semibold">{t('smartTranslatorTool.uploadBoxLabelV2')}</span>
                      <p className="text-xs text-muted-foreground mt-1">{t('smartTranslatorTool.uploadBoxHintV2')}</p>
                    </>
                  )}
                </Label>
                <Input
                  id="file-upload-sdi"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                  ref={fileInputRef}
                  disabled={status === 'translating'}
                />
              </CardContent>
            </Card>

            {status !== 'idle' && uploadedFile && (
              <Card className="card-base">
                <CardHeader>
                  <CardTitle className="text-lg font-heading">{t('smartTranslatorTool.settingsSectionTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contentDomain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('smartTranslatorTool.domainSelectLabel')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={status === 'translating'}>
                          <FormControl><SelectTrigger className="input-base"><SelectValue placeholder={t('smartTranslatorTool.domainSelectPlaceholder')} /></SelectTrigger></FormControl>
                          <SelectContent>
                            {contentDomains.map(domain => <SelectItem key={domain.id} value={domain.id}>{t(domain.labelKey)}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="targetLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('smartTranslatorTool.languageSelectLabel')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={status === 'translating'}>
                          <FormControl><SelectTrigger className="input-base"><SelectValue placeholder={t('smartTranslatorTool.languageSelectPlaceholder')} /></SelectTrigger></FormControl>
                          <SelectContent>
                            {targetLanguages.map(lang => <SelectItem key={lang.id} value={lang.id}>{t(lang.labelKey)}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full btn-base bg-primary hover:bg-primary/90 text-primary-foreground" disabled={status === 'translating' || !uploadedFile}>
                    {status === 'translating' ? (
                      <><Loader2 className="rtl:ml-2 ltr:mr-2 h-5 w-5 animate-spin" /> {t('smartTranslatorTool.translatingButton')}</>
                    ) : (
                      <>{t('smartTranslatorTool.translateButton')}</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </form>
        </Form>

        {status === 'translating' && (
          <Card className="card-base text-center">
            <CardContent className="p-8 space-y-4">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
              <p className="text-lg font-semibold text-muted-foreground">{t('smartTranslatorTool.translatingMessage')}</p>
            </CardContent>
          </Card>
        )}

        {status === 'error' && (
          <Card className="card-base border-destructive bg-destructive/10 text-center">
            <CardContent className="p-8 space-y-3">
              <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
              <p className="text-lg font-semibold text-destructive">{t('smartTranslatorTool.translationFailedMessage')}</p>
              <Button variant="destructive" onClick={() => setStatus(uploadedFile ? 'uploaded' : 'idle')} className="btn-base mt-2">{t('buttons.tryAgain')}</Button>
            </CardContent>
          </Card>
        )}

        {status === 'success' && (
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-xl font-heading">{t('smartTranslatorTool.resultTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isImageFile && translatedImageUrl ? (
                <div className="flex justify-center items-center p-4 bg-muted/30 rounded-lg border min-h-[300px]">
                   <NextImage
                      src={translatedImageUrl}
                      alt={t('smartTranslatorTool.translatedImageLabel')}
                      width={600}
                      height={400}
                      className="max-w-full h-auto rounded"
                      data-ai-hint="text translation overlay"
                    />
                </div>
              ) : !isImageFile && translatedText ? (
                <Textarea
                  value={translatedText}
                  readOnly
                  className="input-base min-h-[200px] bg-muted/30"
                  aria-label={t('smartTranslatorTool.translatedTextLabel')}
                />
              ) : null}
            </CardContent>
            <CardFooter className="flex flex-wrap justify-end gap-2 pt-4 border-t">
              {isImageFile ? (
                <>
                  <Button variant="outline" onClick={handleDownload}><Download className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('smartTranslatorTool.downloadImageButton')}</Button>
                  <Button variant="outline" onClick={handlePrint}><Printer className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('smartTranslatorTool.printImageButton')}</Button>
                  <Button variant="outline" onClick={handleShare}><Share2 className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('smartTranslatorTool.shareImageButton')}</Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={handleDownload}><Download className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('smartTranslatorTool.downloadFileButton')}</Button>
                  <Button variant="outline" onClick={handlePrint}><Printer className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('smartTranslatorTool.printDocumentButton')}</Button>
                  <Button variant="outline" onClick={handleShare}><Share2 className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('smartTranslatorTool.shareDocumentButton')}</Button>
                  <Button variant="outline" onClick={handleCopyText} disabled={!translatedText}><Copy className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('smartTranslatorTool.copyTextButton')}</Button>
                </>
              )}
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
}

