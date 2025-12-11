
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowLeft,
  AudioWaveform, // Tool icon
  MoreVertical,
  UploadCloud,
  FileText as FileTextIcon,
  Mic as MicIcon,
  Play,
  Download,
  Share2,
  Printer,
  Mail,
  Copy,
  Settings2,
  Volume2,
  Pause,
  Trash2,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; 

const ttsSchema = z.object({
  textInput: z.string().min(1, { message: 'Text input is required.' }).max(5000, { message: 'Text cannot exceed 5000 characters.' }),
  voiceType: z.string({ required_error: 'Please select a voice type.' }),
  voiceTone: z.string({ required_error: 'Please select a voice tone.' }),
  speakingSpeed: z.number().min(0.5).max(2.0).default(1.0),
  languageAccent: z.string({ required_error: 'Please select language/accent.' }),
  outputFormat: z.enum(['mp3', 'wav', 'ogg']).default('mp3'),
});

const sttSchema = z.object({
  audioLanguage: z.string({ required_error: 'Please select audio language.' }),
  noiseReduction: z.boolean().default(true),
  autoSplit: z.boolean().default(false),
});

type TtsFormValues = z.infer<typeof ttsSchema>;
type SttFormValues = z.infer<typeof sttSchema>;

type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error';

export default function AudioTextConverterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const [ttsStatus, setTtsStatus] = useState<ProcessingStatus>('idle');
  const [sttStatus, setSttStatus] = useState<ProcessingStatus>('idle');
  const [ttsUploadedFile, setTtsUploadedFile] = useState<File | null>(null);
  const [sttUploadedFile, setSttUploadedFile] = useState<File | null>(null);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState<string>('');
  
  const ttsFileInputRef = useRef<HTMLInputElement>(null);
  const sttFileInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  const ttsForm = useForm<TtsFormValues>({
    resolver: zodResolver(ttsSchema),
    defaultValues: {
      textInput: '',
      voiceType: undefined,
      voiceTone: undefined,
      speakingSpeed: 1.0,
      languageAccent: undefined,
      outputFormat: 'mp3',
    },
  });

  const sttForm = useForm<SttFormValues>({
    resolver: zodResolver(sttSchema),
    defaultValues: {
      audioLanguage: undefined,
      noiseReduction: true,
      autoSplit: false,
    },
  });

  const handleTtsFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        toast({ titleKey: 'audioTextConverter.errors.invalidTextFile', variant: 'destructive' });
        return;
      }
      setTtsUploadedFile(file);
      // Simulate reading file content into textarea
      const reader = new FileReader();
      reader.onload = (e) => ttsForm.setValue('textInput', e.target?.result as string);
      reader.readAsText(file);
      toast({ titleKey: 'audioTextConverter.tts.fileSelected', titleReplacements: { fileName: file.name } });
    }
  };
  
  const handleSttFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        if (!['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a'].includes(file.type)) { // Common audio types for .mp3, .wav, .ogg, .m4a
            toast({ titleKey: 'audioTextConverter.errors.invalidAudioFile', variant: 'destructive' });
            return;
        }
        setSttUploadedFile(file);
        toast({ titleKey: 'audioTextConverter.stt.fileSelected', titleReplacements: { fileName: file.name } });
    }
  };

  const onTtsSubmit = async (values: TtsFormValues) => {
    setTtsStatus('processing');
    setGeneratedAudioUrl(null);
    toast({ titleKey: 'audioTextConverter.tts.processing' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    const success = Math.random() > 0.2;
    if (success) {
      setGeneratedAudioUrl('/example-podcast.mp3'); // Placeholder
      setTtsStatus('success');
      toast({ titleKey: 'audioTextConverter.tts.success' });
    } else {
      setTtsStatus('error');
      toast({ titleKey: 'audioTextConverter.errors.ttsFailed', variant: 'destructive' });
    }
  };

  const onSttSubmit = async (values: SttFormValues) => {
    if (!sttUploadedFile && !t('audioTextConverter.stt.simulatedRecording')) { // Second part is for simulated recording
        toast({ titleKey: 'audioTextConverter.errors.noAudioFile', variant: 'destructive' });
        return;
    }
    setSttStatus('processing');
    setTranscribedText('');
    toast({ titleKey: 'audioTextConverter.stt.processing' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    const success = Math.random() > 0.2;
    if (success) {
      setTranscribedText(t('audioTextConverter.stt.mockTranscription'));
      setSttStatus('success');
      toast({ titleKey: 'audioTextConverter.stt.success' });
    } else {
      setSttStatus('error');
      toast({ titleKey: 'audioTextConverter.errors.sttFailed', variant: 'destructive' });
    }
  };
  
  const handleRecordLiveAudio = () => {
      toast({ titleKey: 'audioTextConverter.stt.recordLiveAudio', descriptionKey: 'audioTextConverter.stt.simulatedRecording'});
      // Simulate providing a file for STT
      onSttSubmit(sttForm.getValues());
  };
  
  const handleDownload = (type: 'tts' | 'stt') => {
      if (type === 'tts' && generatedAudioUrl) {
          const link = document.createElement('a');
          link.href = generatedAudioUrl;
          link.download = `generated_audio.${ttsForm.getValues('outputFormat')}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast({ titleKey: 'audioTextConverter.tts.downloadAudio'});
      } else if (type === 'stt' && transcribedText) {
          const blob = new Blob([transcribedText], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'transcribed_text.txt';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast({ titleKey: 'audioTextConverter.stt.downloadText'});
      }
  };

  const handleClear = (type: 'tts' | 'stt') => {
    if (type === 'tts') {
        ttsForm.reset();
        setTtsUploadedFile(null);
        if (ttsFileInputRef.current) ttsFileInputRef.current.value = '';
        setGeneratedAudioUrl(null);
        setTtsStatus('idle');
    } else {
        sttForm.reset();
        setSttUploadedFile(null);
        if (sttFileInputRef.current) sttFileInputRef.current.value = '';
        setTranscribedText('');
        setSttStatus('idle');
    }
    toast({title: t('buttons.clear') + ' ' + (type === 'tts' ? "TTS" : "STT") + ' ' + t('audioTextConverter.inputsCleared')});
  };


  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className={cn("h-5 w-5", language === 'ar' && "transform scale-x-[-1]")} />
        </Button>
        <div className="flex items-center gap-2">
          <AudioWaveform className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">{t('toolTitles.audioTextConverter')}</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-5 w-5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={language === 'ar' ? 'start' : 'end'}>
            <DropdownMenuItem onClick={() => toast({ titleKey: 'buttons.help', descriptionKey: 'dashboard.notImplemented' })}>{t('buttons.help')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card className="card-base text-center">
          <CardHeader>
            <AudioWaveform className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-heading">{t('toolTitles.audioTextConverter')}</CardTitle>
            <CardDescription className="max-w-xl mx-auto">{t('toolDescriptions.audioTextConverter')}</CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="tts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tts">{t('audioTextConverter.tts.title')}</TabsTrigger>
            <TabsTrigger value="stt">{t('audioTextConverter.stt.title')}</TabsTrigger>
          </TabsList>

          {/* Text-to-Speech Section */}
          <TabsContent value="tts">
            <Form {...ttsForm}>
              <form onSubmit={ttsForm.handleSubmit(onTtsSubmit)} className="space-y-6 mt-4">
                <Card className="card-base">
                  <CardHeader><CardTitle>{t('audioTextConverter.tts.textInputSection')}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <FormField control={ttsForm.control} name="textInput" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('audioTextConverter.tts.textInputLabel')}</FormLabel>
                        <FormControl><Textarea placeholder={t('audioTextConverter.tts.textInputPlaceholder')} {...field} className="input-base min-h-[150px]" disabled={ttsStatus === 'processing'} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormItem>
                      <FormLabel>{t('audioTextConverter.tts.uploadFileLabel')}</FormLabel>
                      <div className="flex items-center gap-2">
                         <Input id="tts-file-upload" type="file" ref={ttsFileInputRef} onChange={handleTtsFileChange} className="input-base flex-1" accept=".txt,.pdf,.docx" disabled={ttsStatus === 'processing'} />
                         {ttsUploadedFile && <Button type="button" variant="ghost" size="icon" onClick={() => { setTtsUploadedFile(null); if(ttsFileInputRef.current) ttsFileInputRef.current.value = ''; ttsForm.setValue('textInput', ''); }} disabled={ttsStatus === 'processing'}><Trash2 className="h-4 w-4" /></Button>}
                      </div>
                      {ttsUploadedFile && <FormDescription className="text-xs">{t('audioTextConverter.tts.fileSelected', { fileName: ttsUploadedFile.name })}</FormDescription>}
                    </FormItem>
                  </CardContent>
                </Card>

                <Card className="card-base">
                  <CardHeader><CardTitle>{t('audioTextConverter.tts.voiceCustomizationSection')}</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={ttsForm.control} name="voiceType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('audioTextConverter.tts.voiceTypeLabel')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={ttsStatus === 'processing'}>
                          <FormControl><SelectTrigger className="input-base"><SelectValue placeholder={t('audioTextConverter.tts.voiceTypePlaceholder')} /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="male_deep">Male (Deep)</SelectItem>
                            <SelectItem value="male_medium">Male (Medium)</SelectItem>
                            <SelectItem value="female_soft">Female (Soft)</SelectItem>
                            <SelectItem value="female_neutral">Female (Neutral)</SelectItem>
                            <SelectItem value="child_lively">Child (Lively)</SelectItem>
                            <SelectItem value="ai_wavenet_a">AI Voice Alpha (WaveNet)</SelectItem>
                            <SelectItem value="ai_polly_joanna">AI Voice Beta (Polly)</SelectItem>
                          </SelectContent>
                        </Select><FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={ttsForm.control} name="voiceTone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('audioTextConverter.tts.voiceToneLabel')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={ttsStatus === 'processing'}>
                          <FormControl><SelectTrigger className="input-base"><SelectValue placeholder={t('audioTextConverter.tts.voiceTonePlaceholder')} /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="motivational">Motivational</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="dramatic">Dramatic</SelectItem>
                            <SelectItem value="humorous">Humorous</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                          </SelectContent>
                        </Select><FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={ttsForm.control} name="speakingSpeed" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('audioTextConverter.tts.speakingSpeedLabel')} ({field.value.toFixed(1)}x)</FormLabel>
                        <FormControl><Slider defaultValue={[field.value]} min={0.5} max={2} step={0.1} onValueChange={(val) => field.onChange(val[0])} className="pt-2" disabled={ttsStatus === 'processing'} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={ttsForm.control} name="languageAccent" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('audioTextConverter.tts.languageAccentLabel')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={ttsStatus === 'processing'}>
                          <FormControl><SelectTrigger className="input-base"><SelectValue placeholder={t('audioTextConverter.tts.languageAccentPlaceholder')} /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="en_us">English (US)</SelectItem>
                            <SelectItem value="en_gb">English (UK)</SelectItem>
                            <SelectItem value="ar_sa">Arabic (Gulf)</SelectItem>
                            <SelectItem value="ar_eg">Arabic (Egyptian)</SelectItem>
                            <SelectItem value="ar_msa">Arabic (Standard)</SelectItem>
                            <SelectItem value="es_es">Spanish (Spain)</SelectItem>
                            <SelectItem value="fr_fr">French (France)</SelectItem>
                          </SelectContent>
                        </Select><FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={ttsForm.control} name="outputFormat" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('audioTextConverter.tts.outputFormatLabel')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={ttsStatus === 'processing'}>
                            <FormControl><SelectTrigger className="input-base"><SelectValue placeholder={t('audioTextConverter.tts.outputFormatPlaceholder')} /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="mp3">MP3</SelectItem>
                                <SelectItem value="wav">WAV</SelectItem>
                                <SelectItem value="ogg">OGG</SelectItem>
                            </SelectContent>
                            </Select><FormMessage />
                        </FormItem>
                    )} />
                  </CardContent>
                   <CardFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => handleClear('tts')} disabled={ttsStatus === 'processing'}>
                            {t('buttons.clear')} TTS
                        </Button>
                        <Button type="submit" className="btn-base" disabled={ttsStatus === 'processing'}>
                            {ttsStatus === 'processing' ? <><Loader2 className="rtl:ml-2 ltr:mr-2 h-5 w-5 animate-spin" />{t('audioTextConverter.tts.converting')}</> : <><Volume2 className="rtl:ml-2 ltr:mr-2 h-5 w-5" />{t('audioTextConverter.tts.convertToSpeech')}</>}
                        </Button>
                  </CardFooter>
                </Card>

                {ttsStatus === 'success' && generatedAudioUrl && (
                  <Card className="card-base">
                    <CardHeader><CardTitle>{t('audioTextConverter.tts.generatedAudioTitle')}</CardTitle></CardHeader>
                    <CardContent>
                      <audio ref={audioPlayerRef} src={generatedAudioUrl} controls className="w-full" />
                    </CardContent>
                    <CardFooter className="flex flex-wrap justify-end gap-2">
                      <Button variant="outline" onClick={() => handleDownload('tts')}><Download className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('audioTextConverter.tts.downloadAudio')}</Button>
                      <Button variant="outline" onClick={() => toast({titleKey: 'buttons.share', descriptionKey: 'dashboard.notImplemented'})}><Share2 className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('buttons.share')}</Button>
                      <Button variant="outline" onClick={() => toast({titleKey: 'buttons.print', descriptionKey: 'dashboard.notImplemented'})}><Printer className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('audioTextConverter.tts.printMetadata')}</Button>
                      <Button variant="outline" onClick={() => toast({titleKey: 'buttons.send', descriptionKey: 'dashboard.notImplemented'})}><Mail className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('audioTextConverter.tts.sendByEmail')}</Button>
                    </CardFooter>
                  </Card>
                )}
                 {ttsStatus === 'error' && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{t('audioTextConverter.errors.ttsFailed')}</AlertTitle>
                        <AlertDescription>{t('audioTextConverter.errors.tryAgain')}</AlertDescription>
                    </Alert>
                )}
              </form>
            </Form>
          </TabsContent>

          {/* Speech-to-Text Section */}
          <TabsContent value="stt">
            <Form {...sttForm}>
              <form onSubmit={sttForm.handleSubmit(onSttSubmit)} className="space-y-6 mt-4">
                <Card className="card-base">
                  <CardHeader><CardTitle>{t('audioTextConverter.stt.audioInputSection')}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <FormItem>
                      <FormLabel>{t('audioTextConverter.stt.uploadAudioFile')}</FormLabel>
                      <div className="flex items-center gap-2">
                        <Input id="stt-file-upload" type="file" ref={sttFileInputRef} onChange={handleSttFileChange} className="input-base flex-1" accept="audio/*" disabled={sttStatus === 'processing'} />
                        {sttUploadedFile && <Button type="button" variant="ghost" size="icon" onClick={() => { setSttUploadedFile(null); if(sttFileInputRef.current) sttFileInputRef.current.value = ''; }} disabled={sttStatus === 'processing'}><Trash2 className="h-4 w-4" /></Button>}
                      </div>
                      {sttUploadedFile && <FormDescription className="text-xs">{t('audioTextConverter.stt.fileSelected', { fileName: sttUploadedFile.name })}</FormDescription>}
                    </FormItem>
                    <div className="text-center my-2 text-sm text-muted-foreground">{t('audioTextConverter.stt.orRecordLive')}</div>
                    <Button type="button" variant="outline" className="w-full" onClick={handleRecordLiveAudio} disabled={sttStatus === 'processing'}>
                      <MicIcon className="rtl:ml-2 ltr:mr-2 h-5 w-5" /> {t('audioTextConverter.stt.recordLiveAudio')}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="card-base">
                  <CardHeader><CardTitle>{t('audioTextConverter.stt.sttSettingsSection')}</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={sttForm.control} name="audioLanguage" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('audioTextConverter.stt.audioLanguageLabel')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={sttStatus === 'processing'}>
                          <FormControl><SelectTrigger className="input-base"><SelectValue placeholder={t('audioTextConverter.stt.audioLanguagePlaceholder')} /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="auto_detect">{t('audioTextConverter.stt.languageAutoDetect')}</SelectItem>
                            <SelectItem value="en_us">English (US)</SelectItem>
                            <SelectItem value="en_gb">English (UK)</SelectItem>
                            <SelectItem value="ar_sa">Arabic (Gulf)</SelectItem>
                             <SelectItem value="ar_msa">Arabic (Standard)</SelectItem>
                          </SelectContent>
                        </Select><FormMessage />
                      </FormItem>
                    )} />
                     <div className="space-y-3 pt-2 md:pt-0"> {/* Adjust spacing for switches */}
                        <FormField control={sttForm.control} name="noiseReduction" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/20">
                                <div className="space-y-0.5"><FormLabel>{t('audioTextConverter.stt.noiseReductionLabel')}</FormLabel></div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={sttStatus === 'processing'} /></FormControl>
                            </FormItem>
                        )} />
                        <FormField control={sttForm.control} name="autoSplit" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/20">
                                <div className="space-y-0.5"><FormLabel>{t('audioTextConverter.stt.autoSplitLabel')}</FormLabel></div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={sttStatus === 'processing'} /></FormControl>
                            </FormItem>
                        )} />
                    </div>
                  </CardContent>
                   <CardFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => handleClear('stt')} disabled={sttStatus === 'processing'}>
                           {t('buttons.clear')} STT
                        </Button>
                        <Button type="submit" className="btn-base" disabled={sttStatus === 'processing'}>
                            {sttStatus === 'processing' ? <><Loader2 className="rtl:ml-2 ltr:mr-2 h-5 w-5 animate-spin" />{t('audioTextConverter.stt.transcribing')}</> : <><AudioWaveform className="rtl:ml-2 ltr:mr-2 h-5 w-5" />{t('audioTextConverter.stt.convertToText')}</>}
                        </Button>
                   </CardFooter>
                </Card>

                {sttStatus === 'success' && transcribedText && (
                  <Card className="card-base">
                    <CardHeader><CardTitle>{t('audioTextConverter.stt.transcribedTextTitle')}</CardTitle></CardHeader>
                    <CardContent>
                      <Textarea value={transcribedText} onChange={(e) => setTranscribedText(e.target.value)} className="input-base min-h-[200px]" aria-label={t('audioTextConverter.stt.transcribedTextLabel')} />
                      <FormDescription className="text-xs mt-1">{t('audioTextConverter.stt.reviewHighlightHint')}</FormDescription>
                    </CardContent>
                    <CardFooter className="flex flex-wrap justify-end gap-2">
                      <Button variant="outline" onClick={() => toast({titleKey: 'audioTextConverter.stt.exportDocx', descriptionKey: 'dashboard.notImplemented'})}><FileTextIcon className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('audioTextConverter.stt.exportDocx')}</Button>
                      <Button variant="outline" onClick={() => toast({titleKey: 'audioTextConverter.stt.exportPdf', descriptionKey: 'dashboard.notImplemented'})}><FileTextIcon className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('audioTextConverter.stt.exportPdf')}</Button>
                      <Button variant="outline" onClick={() => toast({titleKey: 'buttons.print', descriptionKey: 'dashboard.notImplemented'})}><Printer className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('buttons.print')}</Button>
                      <Button variant="outline" onClick={() => toast({titleKey: 'audioTextConverter.stt.saveToCloud', descriptionKey: 'dashboard.notImplemented'})}><UploadCloud className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('audioTextConverter.stt.saveToCloud')}</Button>
                    </CardFooter>
                  </Card>
                )}
                 {sttStatus === 'error' && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{t('audioTextConverter.errors.sttFailed')}</AlertTitle>
                        <AlertDescription>{t('audioTextConverter.errors.tryAgain')}</AlertDescription>
                    </Alert>
                )}
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

