
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, History, MoreVertical, Filter, Search, LogIn, Settings, BookOpenCheck, FileText } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Added CardFooter
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// Define Activity Log Entry type
interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  type: 'Login' | 'ToolUsage' | 'SettingsChange' | 'Logout' | 'FileAccess'; // Example types
  description: string;
  ipAddress?: string; // Optional
  device?: string; // Optional
}

// Mock data for activity log (replace with actual data fetching)
const initialActivityLog: ActivityLogEntry[] = [
  { id: 'act-1', timestamp: new Date(Date.now() - 1000 * 60 * 5), type: 'ToolUsage', description: 'Used Essay Writer tool.', device: 'iPhone 14' },
  { id: 'act-2', timestamp: new Date(Date.now() - 1000 * 60 * 30), type: 'SettingsChange', description: 'Updated profile picture.', ipAddress: '192.168.1.10', device: 'Chrome on Windows' },
  { id: 'act-3', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), type: 'Login', description: 'Successful login.', ipAddress: '192.168.1.10', device: 'Chrome on Windows' },
  { id: 'act-4', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), type: 'ToolUsage', description: 'Generated diagram: Hospital System.', device: 'Android App' },
  { id: 'act-5', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), type: 'Logout', description: 'Logged out successfully.', device: 'iPhone 14' },
   { id: 'act-6', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), type: 'FileAccess', description: 'Uploaded document for Podcast Generator.', device: 'Chrome on Windows' },
];

// Helper to get icon based on type
const getTypeIcon = (type: ActivityLogEntry['type']) => {
  switch (type) {
    case 'Login': return <LogIn className="h-4 w-4" />;
    case 'Logout': return <LogIn className="h-4 w-4 transform rotate-180" />; // Re-use login icon flipped
    case 'ToolUsage': return <BookOpenCheck className="h-4 w-4" />;
    case 'SettingsChange': return <Settings className="h-4 w-4" />;
    case 'FileAccess': return <FileText className="h-4 w-4" />;
    default: return <History className="h-4 w-4" />;
  }
};

export default function ActivityLogPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');
  const [logEntries] = useState<ActivityLogEntry[]>(initialActivityLog); // Assuming static data for now

  const activityTypes = ['All', ...Array.from(new Set(logEntries.map(entry => entry.type)))];

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleTypeFilterChange = (value: string) => {
    setSelectedTypeFilter(value);
  };

  const filteredLogEntries = useMemo(() => {
    return logEntries.filter(entry => {
      const matchesType = selectedTypeFilter === 'All' || entry.type === selectedTypeFilter;
      const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            entry.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (entry.device && entry.device.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (entry.ipAddress && entry.ipAddress.includes(searchTerm));
      return matchesType && matchesSearch;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort newest first
  }, [searchTerm, selectedTypeFilter, logEntries]);

   const handleClearLog = () => {
      toast({
        title: "Clear Activity Log",
        description: "Clearing log functionality is not implemented in this demo.",
        variant: "default",
      });
      // Implement actual clearing logic here if needed
      // setLogEntries([]);
   };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
       <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex items-center gap-2">
          <History className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">Activity Log</h1>
        </div>
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">Options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleClearLog}>Clear Log</DropdownMenuItem>
             <DropdownMenuItem onClick={() => toast({ title: "Help clicked" })}>Help</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 flex flex-col">
         <Card className="card-base flex-1 flex flex-col overflow-hidden">
             <CardHeader className="pb-4">
                 <CardTitle className="text-xl font-heading">Recent Activity</CardTitle>
                 <CardDescription>Review recent actions performed in your account.</CardDescription>
                  {/* Filters and Search */}
                 <div className="flex flex-col md:flex-row gap-4 pt-4">
                     {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                        type="search"
                        placeholder="Search activities..."
                        className="w-full pl-9 input-base h-9"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        />
                    </div>
                    {/* Type Filter */}
                    <div className="flex items-center gap-2">
                         <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={selectedTypeFilter} onValueChange={handleTypeFilterChange}>
                            <SelectTrigger className="w-full md:w-[180px] h-9 input-base">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                {activityTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                 </div>
             </CardHeader>
             <CardContent className="flex-1 overflow-hidden p-0">
                 <ScrollArea className="h-full">
                      {filteredLogEntries.length > 0 ? (
                         <Table>
                             <TableHeader>
                                 <TableRow>
                                     <TableHead className="w-[50px]">Type</TableHead>
                                     <TableHead>Description</TableHead>
                                     <TableHead>Device/IP</TableHead>
                                     <TableHead className="text-right">Timestamp</TableHead>
                                 </TableRow>
                             </TableHeader>
                             <TableBody>
                                 {filteredLogEntries.map((entry) => (
                                     <TableRow key={entry.id}>
                                         <TableCell className="text-center">{getTypeIcon(entry.type)}</TableCell>
                                         <TableCell>{entry.description}</TableCell>
                                         <TableCell className="text-xs text-muted-foreground">
                                             {entry.device || entry.ipAddress || 'N/A'}
                                         </TableCell>
                                         <TableCell className="text-right text-xs text-muted-foreground">
                                             {format(entry.timestamp, 'Pp')}
                                         </TableCell>
                                     </TableRow>
                                 ))}
                             </TableBody>
                         </Table>
                     ) : (
                          <div className="flex flex-col items-center justify-center h-full p-10 text-center text-muted-foreground">
                             <History className="h-16 w-16 mb-4 opacity-50" />
                             <p>No activity found matching your criteria.</p>
                          </div>
                     )}
                 </ScrollArea>
             </CardContent>
             {/* Optional CardFooter can be added here if needed */}
         </Card>
      </main>
    </div>
  );
}
