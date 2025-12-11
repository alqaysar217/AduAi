
'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowLeft,
  FileCog, // Tool icon
  MoreVertical,
  UploadCloud,
  Download,
  Printer,
  Share2,
  Loader2,
  AlertTriangle,
  Trash2,
  FileText,
  FileImage,
  FileAudio,
  FileVideo,
  Archive,
  Replace,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface FileTypeInfo {
  mime: string | string[];
  extension: string;
  nameKey: string; // Localization key for display name
  category: 'document' | 'spreadsheet' | 'presentation' | 'image' | 'audio' | 'video' | 'archive';
  icon: React.ElementType;
  printable?: boolean;
}

const fileTypeDetails: Record<string, FileTypeInfo> = {
  DOCX: { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", extension: "docx", nameKey: "universalConverter.types.docx", category: 'document', icon: FileText, printable: true },
  PDF: { mime: "application/pdf", extension: "pdf", nameKey: "universalConverter.types.pdf", category: 'document', icon: FileText, printable: true },
  TXT: { mime: "text/plain", extension: "txt", nameKey: "universalConverter.types.txt", category: 'document', icon: FileText, printable: true },
  HTML: { mime: "text/html", extension: "html", nameKey: "universalConverter.types.html", category: 'document', icon: FileText, printable: true },
  ODT: { mime: "application/vnd.oasis.opendocument.text", extension: "odt", nameKey: "universalConverter.types.odt", category: 'document', icon: FileText, printable: true },
  XLSX: { mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", extension: "xlsx", nameKey: "universalConverter.types.xlsx", category: 'spreadsheet', icon: FileText, printable: true },
  CSV: { mime: "text/csv", extension: "csv", nameKey: "universalConverter.types.csv", category: 'spreadsheet', icon: FileText, printable: true },
  PPTX: { mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", extension: "pptx", nameKey: "universalConverter.types.pptx", category: 'presentation', icon: FileText, printable: true },
  PPT: { mime: ["application/vnd.ms-powerpoint", "application/mspowerpoint", "application/x-mspowerpoint"], extension: "ppt", nameKey: "universalConverter.types.ppt", category: 'presentation', icon: FileText, printable: true },
  ODP: { mime: "application/vnd.oasis.opendocument.presentation", extension: "odp", nameKey: "universalConverter.types.odp", category: 'presentation', icon: FileText, printable: true },
  JPG: { mime: "image/jpeg", extension: "jpg", nameKey: "universalConverter.types.jpg", category: 'image', icon: FileImage, printable: true },
  PNG: { mime: "image/png", extension: "png", nameKey: "universalConverter.types.png", category: 'image', icon: FileImage, printable: true },
  SVG: { mime: "image/svg+xml", extension: "svg", nameKey: "universalConverter.types.svg", category: 'image', icon: FileImage, printable: true },
  WEBP: { mime: "image/webp", extension: "webp", nameKey: "universalConverter.types.webp", category: 'image', icon: FileImage, printable: true },
  MP3: { mime: "audio/mpeg", extension: "mp3", nameKey: "universalConverter.types.mp3", category: 'audio', icon: FileAudio },
  WAV: { mime: "audio/wav", extension: "wav", nameKey: "universalConverter.types.wav", category: 'audio', icon: FileAudio },
  OGG: { mime: ["audio/ogg", "application/ogg"], extension: "ogg", nameKey: "universalConverter.types.ogg", category: 'audio', icon: FileAudio },
  AAC: { mime: "audio/aac", extension: "aac", nameKey: "universalConverter.types.aac", category: 'audio', icon: FileAudio },
  M4A: { mime: ["audio/mp4", "audio/x-m4a"], extension: "m4a", nameKey: "universalConverter.types.m4a", category: 'audio', icon: FileAudio },
  MP4: { mime: "video/mp4", extension: "mp4", nameKey: "universalConverter.types.mp4", category: 'video', icon: FileVideo },
  AVI: { mime: "video/x-msvideo", extension: "avi", nameKey: "universalConverter.types.avi", category: 'video', icon: FileVideo },
  MKV: { mime: "video/x-matroska", extension: "mkv", nameKey: "universalConverter.types.mkv", category: 'video', icon: FileVideo },
  MOV: { mime: "video/quicktime", extension: "mov", nameKey: "universalConverter.types.mov", category: 'video', icon: FileVideo },
  FLV: { mime: "video/x-flv", extension: "flv", nameKey: "universalConverter.types.flv", category: 'video', icon: FileVideo },
  RAR: { mime: ["application/vnd.rar", "application/x-rar-compressed"], extension: "rar", nameKey: "universalConverter.types.rar", category: 'archive', icon: Archive },
  ZIP: { mime: ["application/zip", "application/x-zip-compressed"], extension: "zip", nameKey: "universalConverter.types.zip", category: 'archive', icon: Archive },
  TAR: { mime: "application/x-tar", extension: "tar", nameKey: "universalConverter.types.tar", category: 'archive', icon: Archive },
};

const conversionMap: Record<string, string[]> = {
  DOCX: ["PDF", "HTML", "TXT", "ODT"],
  PDF: ["DOCX", "ODT", "JPG", "TXT", "HTML"],
  TXT: ["PDF", "DOCX", "HTML"],
  HTML: ["DOCX", "PDF"],
  ODT: ["PDF", "DOCX"],
  XLSX: ["CSV", "PDF"],
  CSV: ["XLSX"],
  PPTX: ["PDF", "PPT"],
  PPT: ["ODP", "PDF", "PPTX"],
  ODP: ["PPT", "PDF"],
  JPG: ["PNG", "PDF", "WEBP"],
  PNG: ["JPG", "PDF", "WEBP"],
  SVG: ["PNG", "PDF"],
  WEBP: ["JPG", "PNG"],
  MP3: ["WAV", "OGG", "AAC", "M4A"],
  WAV: ["MP3", "OGG", "AAC", "M4A"],
  OGG: ["MP3", "WAV"],
  AAC: ["MP3", "M4A"],
  M4A: ["MP3", "AAC"],
  MP4: ["AVI", "MKV", "MOV", "FLV", "MP3"],
  AVI: ["MP4"],
  MKV: ["MP4"],
  MOV: ["MP4"],
  FLV: ["MP4"],
  RAR: ["ZIP", "TAR"],
  ZIP: ["TAR"], // Typically ZIP is a target, not source for RAR/TAR in simple converters
  TAR: ["ZIP"],
};

const getAllowedExtensions = () => Object.values(fileTypeDetails).map(ft => `.${ft.extension}`).join(',');
const getAllowedMimeTypes = () => Object.values(fileTypeDetails).flatMap(ft => ft.mime).join(',');


const universalConverterSchema = z.object({
  targetFormatKey: z.string({ required_error: 'Please select a target format.' }),
});

type UniversalConverterFormValues = z.infer<typeof universalConverterSchema>;
type ProcessingStatus = 'idle' | 'uploaded' | 'converting' | 'success' | 'error';

export default function UniversalFileConverterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const [detectedFileTypeKey, setDetectedFileTypeKey] = useState<string | null>(null);
  const [availableTargetFormats, setAvailableTargetFormats] = useState<FileTypeInfo[]>([]);
  
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null);
  const [convertedFileName, setConvertedFileName] = useState<string>('');
  const [isConvertedFilePrintable, setIsConvertedFilePrintable] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UniversalConverterFormValues>({
    resolver: zodResolver(universalConverterSchema),
    defaultValues: {
      targetFormatKey: undefined,
    },
  });

  const detectFileType = (file: File): string | null => {
    const fileMime = file.type;
    const fileName = file.name.toLowerCase();
    const fileExt = fileName.substring(fileName.lastIndexOf('.') + 1);

    for (const key in fileTypeDetails) {
      const typeInfo = fileTypeDetails[key];
      if (
        (typeof typeInfo.mime === 'string' && typeInfo.mime.toLowerCase() === fileMime.toLowerCase()) ||
        (Array.isArray(typeInfo.mime) && typeInfo.mime.map(m => m.toLowerCase()).includes(fileMime.toLowerCase())) ||
        typeInfo.extension.toLowerCase() === fileExt.toLowerCase()
      ) {
        return key;
      }
    }
     // More lenient fallback for common specific mimes if primary detection fails
    if (fileMime === "application/x-zip-compressed" || fileExt === "zip") return "ZIP";
    if (fileMime === "application/x-rar-compressed" || fileExt === "rar") return "RAR";
    if (fileMime === "application/x-tar" || fileExt === "tar") return "TAR";
    if (fileMime === "audio/x-m4a") return "M4A";
    if (fileMime === "application/octet-stream") { // Generic binary stream, try by extension
        for (const key in fileTypeDetails) {
            if (fileTypeDetails[key].extension.toLowerCase() === fileExt.toLowerCase()) return key;
        }
    }
    return null;
  };


  useEffect(() => {
    if (uploadedFile) {
      const detectedKey = detectFileType(uploadedFile);
      setDetectedFileTypeKey(detectedKey);
      form.resetField('targetFormatKey'); // Reset target format when file changes

      if (detectedKey && conversionMap[detectedKey]) {
        const targets = conversionMap[detectedKey]
          .map(key => fileTypeDetails[key])
          .filter(Boolean); // Filter out undefined if a key isn't in fileTypeDetails
        setAvailableTargetFormats(targets as FileTypeInfo[]);
      } else {
        setAvailableTargetFormats([]);
        if (detectedKey === null) {
            toast({ title: t('universalConverter.errors.unsupportedType'), description: t('universalConverter.errors.checkFormats'), variant: 'destructive' });
        }
      }
    } else {
      setDetectedFileTypeKey(null);
      setAvailableTargetFormats([]);
    }
  }, [uploadedFile, form, t, toast]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({ title: t('universalConverter.errors.fileTooLarge', { maxSize: MAX_FILE_SIZE_MB }), variant: 'destructive' });
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      const detectedKey = detectFileType(file);
      if (!detectedKey) {
        toast({ title: t('universalConverter.errors.unsupportedType'), description: t('universalConverter.errors.checkFormats'), variant: 'destructive' });
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setUploadedFile(file);
      setStatus('uploaded');
      setConvertedFileUrl(null);
      setConvertedFileName('');
      toast({ title: t('universalConverter.fileSelectedMessage', { fileName: file.name }) });
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setStatus('idle');
    setConvertedFileUrl(null);
    setConvertedFileName('');
    setDetectedFileTypeKey(null);
    setAvailableTargetFormats([]);
    form.reset();
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({ title: t('universalConverter.fileRemovedMessage') });
  };

  const onSubmit = async (values: UniversalConverterFormValues) => {
    if (!uploadedFile || !detectedFileTypeKey) {
      toast({ title: t('universalConverter.errors.noFileSelected'), variant: 'destructive' });
      return;
    }
    if (!values.targetFormatKey) {
      toast({ title: t('universalConverter.errors.noTargetFormat'), variant: 'destructive' });
      return;
    }

    setStatus('converting');
    toast({ title: t('universalConverter.conversionStartedMessage') });

    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate conversion

    const success = Math.random() > 0.2; // 80% success rate
    if (success) {
      const originalName = uploadedFile.name.substring(0, uploadedFile.name.lastIndexOf('.'));
      const targetTypeInfo = fileTypeDetails[values.targetFormatKey];
      const newFileName = `${originalName}_converted.${targetTypeInfo.extension}`;
      
      // Simulate a blob URL for download
      const mimeTypeForBlob = Array.isArray(targetTypeInfo.mime) ? targetTypeInfo.mime[0] : targetTypeInfo.mime;
      const blob = new Blob([`Mock converted content: ${newFileName}`], { type: mimeTypeForBlob });
      const url = URL.createObjectURL(blob);
      
      setConvertedFileUrl(url);
      setConvertedFileName(newFileName);
      setIsConvertedFilePrintable(targetTypeInfo.printable || false);
      setStatus('success');
      toast({ title: t('universalConverter.conversionSuccessMessage') });
    } else {
      setStatus('error');
      toast({ title: t('universalConverter.conversionFailedMessage'), variant: 'destructive' });
    }
  };

  const handleDownload = () => {
    if (!convertedFileUrl || !convertedFileName) return;
    const link = document.createElement('a');
    link.href = convertedFileUrl;
    link.download = convertedFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: t('universalConverter.downloadStartedMessage') });
  };
  
  const handlePrint = () => {
    if (!convertedFileUrl || !isConvertedFilePrintable) {
        toast({ title: t('universalConverter.errors.cannotPrint'), variant: 'default' });
        return;
    }
    toast({ title: t('universalConverter.printMessage'), description: t('dashboard.notImplemented') });
  };
  
  const handleShare = () => {
    if (!convertedFileUrl || !convertedFileName) return;
    toast({ title: t('buttons.share'), description: t('dashboard.notImplemented') });
  };

  const handleClearAll = () => {
    form.reset();
    handleRemoveFile();
  };
  
  const DetectedFileIcon = detectedFileTypeKey ? fileTypeDetails[detectedFileTypeKey]?.icon || FileText : UploadCloud;


  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className={cn("h-5 w-5", language === 'ar' && "transform scale-x-[-1]")} />
        </Button>
        <div className="flex items-center gap-2">
          <Replace className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">{t('toolTitles.universalConverter')}</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={language === 'ar' ? 'start' : 'end'}>
            <DropdownMenuItem onClick={handleClearAll}>{t('buttons.clearAll')}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: t('buttons.help'), description: t('dashboard.notImplemented')})}>{t('buttons.help')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card className="card-base text-center">
          <CardHeader>
            <Replace className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-heading">{t('toolTitles.universalConverter')}</CardTitle>
            <CardDescription className="max-w-xl mx-auto">
              {t('toolDescriptions.universalConverter')}
            </CardDescription>
          </CardHeader>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="card-base">
              <CardHeader>
                <CardTitle className="text-lg font-heading">{t('universalConverter.step1Title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Label
                  htmlFor="file-upload-universal"
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors",
                    uploadedFile ? "border-primary" : "border-border"
                  )}
                >
                  {uploadedFile && detectedFileTypeKey ? (
                    <div className="text-center p-4">
                      <DetectedFileIcon className="h-12 w-12 text-primary mx-auto mb-2" />
                      <p className="text-sm font-semibold truncate max-w-xs">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{t(fileTypeDetails[detectedFileTypeKey]?.nameKey || 'universalConverter.unknownType')} - {Math.round(uploadedFile.size / 1024)} KB</p>
                      <Button
                        type="button" variant="ghost" size="sm"
                        className="mt-2 text-destructive hover:text-destructive-foreground hover:bg-destructive/80"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveFile(); }}
                      >
                        <Trash2 className="rtl:ml-1 ltr:mr-1 h-4 w-4" /> {t('buttons.delete')}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="h-12 w-12 text-muted-foreground mb-3" />
                      <span className="text-sm font-semibold">{t('universalConverter.uploadBoxLabel')}</span>
                      <p className="text-xs text-muted-foreground mt-1">{t('universalConverter.uploadBoxHint', {maxSize: MAX_FILE_SIZE_MB})}</p>
                    </>
                  )}
                </Label>
                <Input
                  id="file-upload-universal"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept={getAllowedExtensions()}
                  ref={fileInputRef}
                  disabled={status === 'converting'}
                />
              </CardContent>
            </Card>

            {uploadedFile && availableTargetFormats.length > 0 && (
              <Card className="card-base">
                <CardHeader>
                  <CardTitle className="text-lg font-heading">{t('universalConverter.step2Title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="targetFormatKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('universalConverter.targetFormatLabel')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={status === 'converting'}>
                          <FormControl><SelectTrigger className="input-base"><SelectValue placeholder={t('universalConverter.targetFormatPlaceholder')} /></SelectTrigger></FormControl>
                          <SelectContent>
                            {availableTargetFormats.map(formatInfo => (
                              <SelectItem key={formatInfo.extension} value={Object.keys(fileTypeDetails).find(key => fileTypeDetails[key].extension === formatInfo.extension)!}>
                                {t(formatInfo.nameKey)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}
             {uploadedFile && availableTargetFormats.length === 0 && detectedFileTypeKey && (
                <Card className="card-base border-amber-500/50 bg-amber-500/10">
                    <CardContent className="p-4 text-center text-sm text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="h-5 w-5 inline mr-2" />
                        {t('universalConverter.errors.noConversionPath', {fileType: t(fileTypeDetails[detectedFileTypeKey]?.nameKey || detectedFileTypeKey)})}
                    </CardContent>
                </Card>
            )}


            {uploadedFile && form.watch('targetFormatKey') && availableTargetFormats.length > 0 && (
              <Card className="card-base">
                <CardHeader>
                  <CardTitle className="text-lg font-heading">{t('universalConverter.step3Title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button type="submit" className="w-full btn-base" disabled={status === 'converting' || !uploadedFile || !form.watch('targetFormatKey')}>
                    {status === 'converting' ? (
                      <><Loader2 className="rtl:ml-2 ltr:mr-2 h-5 w-5 animate-spin" /> {t('universalConverter.convertingButton')}</>
                    ) : (
                      <>{t('universalConverter.convertButton')}</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </form>
        </Form>

        {status === 'converting' && (
          <Card className="card-base text-center">
            <CardContent className="p-8 space-y-4">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
              <p className="text-lg font-semibold text-muted-foreground">{t('universalConverter.convertingMessage')}</p>
            </CardContent>
          </Card>
        )}

        {status === 'error' && (
          <Card className="card-base border-destructive bg-destructive/10 text-center">
            <CardContent className="p-8 space-y-3">
              <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
              <p className="text-lg font-semibold text-destructive">{t('universalConverter.conversionFailedMessage')}</p>
              <Button variant="destructive" onClick={() => setStatus(uploadedFile ? 'uploaded' : 'idle')} className="btn-base mt-2">{t('buttons.tryAgain')}</Button>
            </CardContent>
          </Card>
        )}

        {status === 'success' && convertedFileUrl && (
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-xl font-heading">{t('universalConverter.outputSectionTitle')}</CardTitle>
              <CardDescription>{t('universalConverter.outputDescription', {fileName: convertedFileName})}</CardDescription>
            </CardHeader>
            <CardContent className="text-center p-6 bg-muted/30 rounded-lg border">
              <FileText className="h-20 w-20 text-primary mx-auto mb-4" />
              <p className="font-semibold">{convertedFileName}</p>
              <p className="text-xs text-muted-foreground">{t('universalConverter.previewPlaceholder')}</p>
            </CardContent>
            <CardFooter className="flex flex-wrap justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleDownload}><Download className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('universalConverter.downloadButton')}</Button>
              {isConvertedFilePrintable && <Button variant="outline" onClick={handlePrint}><Printer className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('buttons.print')}</Button>}
              <Button variant="outline" onClick={handleShare}><Share2 className="rtl:ml-2 ltr:mr-2 h-4 w-4" />{t('buttons.share')}</Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
}

    