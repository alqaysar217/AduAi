
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ArrowLeft,
  BarChart3, // Tool icon
  MoreVertical,
  Table, // Icon for data input
  Download,
  Edit,
  FileText, // Export PDF icon
  Loader2, // Spinner icon
  AlertTriangle, // Error icon
  CheckSquare, // Validation success icon
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
  ScatterChart, Scatter, ZAxis,
} from 'recharts'; // Import recharts components

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'; // Assuming chart components exist

// Define Zod schema for the form
const dataVisualizerSchema = z.object({
  rawData: z.string().min(10, { message: 'Please provide some data (min 10 characters).' }).max(10000, { message: 'Data input cannot exceed 10,000 characters.' }),
  chartType: z.enum(['BarChart', 'PieChart', 'LineGraph', 'ScatterPlot'], { required_error: 'Please select a chart type.' }),
});

type DataVisualizerFormValues = z.infer<typeof dataVisualizerSchema>;
type ProcessingStatus = 'idle' | 'validating' | 'generating' | 'success' | 'error';

// Simple CSV/TSV parser (basic example)
const parseData = (data: string): Record<string, any>[] => {
  const lines = data.trim().split('\n');
  if (lines.length < 2) return []; // Need header and at least one data row

  // Detect separator (comma, tab, or semicolon)
  let separator = ',';
  if (lines[0].includes('\t')) separator = '\t';
  else if (lines[0].includes(';')) separator = ';';

  const headers = lines[0].split(separator).map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const values = line.split(separator);
    const rowData: Record<string, any> = {};
    headers.forEach((header, index) => {
      const value = values[index]?.trim();
      // Attempt to convert to number if possible
      const numValue = Number(value);
      rowData[header] = isNaN(numValue) || value === '' ? value : numValue;
    });
    return rowData;
  });
  return rows;
};

// Recharts expects data in a specific format, adjust parsing/mapping as needed
// Example: for Bar chart, [{ name: 'Category A', value: 10 }, { name: 'Category B', value: 20 }]

export default function DataVisualizerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [parsedData, setParsedData] = useState<Record<string, any>[]>([]);
  const [chartConfig, setChartConfig] = useState<any>(null); // To store chart-specific settings/data mapping

  const form = useForm<DataVisualizerFormValues>({
    resolver: zodResolver(dataVisualizerSchema),
    defaultValues: {
      rawData: '',
      chartType: undefined,
    },
  });

  // Validate and parse data when rawData changes
  const rawDataValue = form.watch('rawData');
  const parsedDataMemo = useMemo(() => {
      if (!rawDataValue || rawDataValue.length < 10) return [];
      try {
          const data = parseData(rawDataValue);
          if (data.length > 0 && Object.keys(data[0]).length > 0) {
              return data;
          }
      } catch (e) {
          console.error("Data parsing error:", e);
      }
      return [];
  }, [rawDataValue]);

  React.useEffect(() => {
      setParsedData(parsedDataMemo);
      if (parsedDataMemo.length > 0) {
          setStatus('idle'); // Reset status if valid data is present
      }
  }, [parsedDataMemo]);

  const onSubmit = async (values: DataVisualizerFormValues) => {
    setStatus('validating');
    if (parsedData.length === 0) {
      setStatus('error');
      toast({ title: 'Invalid Data', description: 'Could not parse the data. Please ensure it is valid CSV/TSV format with headers.', variant: 'destructive' });
      return;
    }
    // Basic validation passed
    toast({ title: 'Data Validated', description: 'Data seems okay, generating visualization...' });
    setStatus('generating');

    // --- Simulate Chart Configuration & Generation ---
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate config time

    // Determine data keys and config based on chart type and data
    const headers = Object.keys(parsedData[0]);
    let generatedConfig = null;
    try {
        switch (values.chartType) {
            case 'BarChart':
            case 'LineGraph':
                generatedConfig = {
                    dataKey: headers[0], // Assume first column is category/x-axis
                    valueKeys: headers.slice(1), // Assume rest are values
                };
                break;
            case 'PieChart':
                 generatedConfig = {
                    nameKey: headers[0], // Assume first column is name
                    dataKey: headers[1], // Assume second column is value
                    colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'], // Example colors
                 };
                 break;
            case 'ScatterPlot':
                 generatedConfig = {
                    xKey: headers[0],
                    yKey: headers[1],
                    zKey: headers[2] || undefined, // Optional third dimension for bubble size
                 };
                 break;
            default:
                throw new Error("Invalid chart type");
        }
        setChartConfig(generatedConfig);
        setStatus('success');
        toast({ title: 'Visualization Generated', description: 'Chart created successfully!' });
    } catch (e) {
        setStatus('error');
        toast({ title: 'Generation Failed', description: 'Could not configure the chart with the provided data.', variant: 'destructive' });
        console.error("Chart config error:", e);
    }
  };

   const handleEditData = () => {
       setStatus('idle'); // Go back to editing state
       setChartConfig(null); // Clear generated chart
       toast({ title: 'Editing Data', description: 'You can now modify the raw data.' });
   };

   const handleDownloadChart = () => {
       toast({ title: 'Download Chart', description: 'Chart download functionality not implemented yet.' });
       // This would typically involve using a library like html2canvas or saving SVG/PNG from the chart component if supported.
   };

   const handleExportPDF = () => {
       toast({ title: 'Export to PDF', description: 'PDF export functionality not implemented yet.' });
        // This often involves server-side rendering or libraries like jsPDF + html2canvas.
   };

  // Render specific chart based on type and config
  const renderChart = () => {
    if (!chartConfig || parsedData.length === 0) return null;

    const chartType = form.getValues('chartType');

    switch (chartType) {
      case 'BarChart':
        return (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={parsedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={chartConfig.dataKey} />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                {chartConfig.valueKeys.map((key: string, index: number) => (
                    <Bar key={key} dataKey={key} fill={chartConfig.colors?.[index % chartConfig.colors.length] || `hsl(var(--chart-${(index % 5) + 1}))`} />
                ))}
                </BarChart>
            </ResponsiveContainer>
        );
      case 'PieChart':
        return (
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                <Pie
                    data={parsedData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey={chartConfig.dataKey}
                    nameKey={chartConfig.nameKey}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                    {parsedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartConfig.colors[index % chartConfig.colors.length]} />
                    ))}
                </Pie>
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                </PieChart>
            </ResponsiveContainer>
        );
        case 'LineGraph':
            return (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={parsedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={chartConfig.dataKey} />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        {chartConfig.valueKeys.map((key: string, index: number) => (
                            <Line key={key} type="monotone" dataKey={key} stroke={chartConfig.colors?.[index % chartConfig.colors.length] || `hsl(var(--chart-${(index % 5) + 1}))`} />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            );
        case 'ScatterPlot':
            return (
                <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart>
                        <CartesianGrid />
                        <XAxis type="number" dataKey={chartConfig.xKey} name={chartConfig.xKey} />
                        <YAxis type="number" dataKey={chartConfig.yKey} name={chartConfig.yKey} />
                        {chartConfig.zKey && <ZAxis type="number" dataKey={chartConfig.zKey} range={[60, 400]} name={chartConfig.zKey} />}
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
                        <Legend />
                        <Scatter name="Data Points" data={parsedData} fill={chartConfig.colors?.[0] || `hsl(var(--chart-1))`} />
                    </ScatterChart>
                </ResponsiveContainer>
            );
      default:
        return <p className="text-center text-muted-foreground">Select a chart type to visualize.</p>;
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
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">Data Visualizer</h1>
        </div>
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">Options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => form.reset()}>Clear Data & Chart</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: "Help clicked" })}>Help</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Tool Overview */}
        <Card className="card-base text-center">
          <CardHeader>
            <BarChart3 className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-heading">Data Visualizer</CardTitle>
            <CardDescription className="max-w-xl mx-auto">
              Turn your raw data into insightful charts and graphs. Paste your data (CSV, TSV format with headers), choose a chart type, and generate your visualization instantly.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Input Form */}
         <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <Card className="card-base">
                     <CardHeader>
                         <CardTitle className="text-lg font-heading">1. Input Your Data</CardTitle>
                         <CardDescription>Paste your data below (e.g., from Excel, CSV). Ensure the first row contains headers.</CardDescription>
                     </CardHeader>
                     <CardContent>
                         <FormField
                            control={form.control}
                            name="rawData"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="sr-only">Raw Data Input</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder={`Example:\nCategory,Value1,Value2\nGroup A,10,15\nGroup B,20,25\nGroup C,15,30`}
                                        {...field}
                                        className="input-base min-h-[180px] font-mono text-xs" // Monospace for data
                                        disabled={status === 'generating' || status === 'success'}
                                    />
                                </FormControl>
                                 <FormMessage />
                                 {parsedData.length > 0 && status !== 'generating' && status !== 'success' && (
                                     <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                                        <CheckSquare className="h-4 w-4"/>
                                        Data parsed successfully ({parsedData.length} rows). Ready to visualize.
                                     </div>
                                 )}
                                </FormItem>
                            )}
                         />
                     </CardContent>
                 </Card>
                 <Card className="card-base">
                     <CardHeader>
                         <CardTitle className="text-lg font-heading">2. Choose Chart Type</CardTitle>
                     </CardHeader>
                     <CardContent>
                         <FormField
                            control={form.control}
                            name="chartType"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="sr-only">Chart Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={status === 'generating' || status === 'success'}>
                                    <FormControl>
                                    <SelectTrigger className="input-base">
                                        <SelectValue placeholder="Select chart type" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="BarChart">Bar Chart</SelectItem>
                                        <SelectItem value="PieChart">Pie Chart</SelectItem>
                                        <SelectItem value="LineGraph">Line Graph</SelectItem>
                                        <SelectItem value="ScatterPlot">Scatter Plot</SelectItem>
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
                              disabled={status === 'generating' || status === 'success' || parsedData.length === 0}
                          >
                            {status === 'generating' ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...
                              </>
                            ) : (
                              <>
                                <BarChart3 className="mr-2 h-5 w-5" /> Generate Visualization
                              </>
                            )}
                          </Button>
                      </CardFooter>
                 </Card>
             </form>
         </Form>

         {/* Processing/Generating State Placeholder */}
         {(status === 'validating' || status === 'generating') && (
             <Card className="card-base text-center">
                 <CardContent className="p-8">
                    <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
                    <p className="text-lg font-semibold text-muted-foreground">
                       {status === 'validating' ? 'Validating Data...' : 'Generating Chart...'}
                    </p>
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
                         Could not process the data or generate the chart. Please check your data format or try a different chart type.
                     </p>
                     <Button variant="destructive" onClick={() => setStatus('idle')} className="btn-base">
                         Try Again
                     </Button>
                 </CardContent>
              </Card>
         )}

        {/* Success State - Generated Chart Display */}
        {status === 'success' && chartConfig && (
          <Card className="card-base">
            <CardHeader>
              <CardTitle className="text-xl font-heading">Generated Visualization</CardTitle>
               <CardDescription>Your {form.getValues('chartType')} based on the provided data.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[350px] flex items-center justify-center">
               <ChartContainer config={{}} className="w-full h-[300px]"> {/* Basic container */}
                  {renderChart()}
               </ChartContainer>
            </CardContent>
             <CardFooter className="flex flex-wrap justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleEditData}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Data
                </Button>
               <Button type="button" variant="outline" onClick={handleDownloadChart}>
                 <Download className="mr-2 h-4 w-4" /> Download Chart
               </Button>
                <Button type="button" variant="outline" onClick={handleExportPDF}>
                 <FileText className="mr-2 h-4 w-4" /> Export to PDF
               </Button>
             </CardFooter>
          </Card>
        )}

      </main>
    </div>
  );
}
