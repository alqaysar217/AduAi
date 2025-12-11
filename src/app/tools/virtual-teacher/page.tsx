
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpenCheck, // Tool icon
  MoreVertical,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Edit3, // Whiteboard icon (alternative: SquarePen)
  Users, // Change Teacher icon
  Send,
  Paperclip,
  UserCheck, // Attendance icon
  UserPlus, // Invite icon
  Sparkles, // Bot icon
  User as UserIcon, // Student icon
  Download, // Download summary icon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; // Import DropdownMenu components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select
import { Label } from '@/components/ui/label'; // Import Label

// Define message type
interface Message {
  id: string;
  text: string;
  sender: 'teacher' | 'student';
  timestamp: Date;
}

// Mock participants
const initialParticipants = [
    { id: 'p1', name: 'Virtual Teacher', status: 'Online' },
    { id: 'p2', name: 'You', status: 'Online' },
];

// Define Session State
type SessionStatus = 'idle' | 'configuring' | 'active' | 'ended';

export default function VirtualTeacherPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('configuring');
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(undefined);
  const [selectedLessonType, setSelectedLessonType] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [participants, setParticipants] = useState(initialParticipants);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

   // Scroll to bottom when new messages are added or session starts
   useEffect(() => {
    if (sessionStatus === 'active' && scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            // Use setTimeout to ensure DOM updates before scrolling
            setTimeout(() => {
                viewport.scrollTop = viewport.scrollHeight;
            }, 100);
        }
    }
  }, [messages, sessionStatus]);

  const startSession = () => {
    if (!selectedSubject || !selectedLessonType) {
        toast({ title: "Configuration Missing", description: "Please select a subject and lesson type.", variant: "destructive" });
        return;
    }
    setSessionStatus('active');
    setMessages([
      {
        id: `msg-${Date.now()}`,
        text: `Great! Let's start our ${selectedLessonType} session on ${selectedSubject}. What would you like to begin with?`,
        sender: 'teacher',
        timestamp: new Date(),
      },
    ]);
    toast({ title: "Session Started", description: `Virtual lesson on ${selectedSubject} begins.` });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSend = () => {
    if (inputValue.trim() === '' || sessionStatus !== 'active') return;

    const userMessage: Message = {
      id: `msg-student-${Date.now()}`,
      text: inputValue,
      sender: 'student',
      timestamp: new Date(),
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');

    // Simulate teacher response based on lesson type (very basic)
    setTimeout(() => {
        let responseText = `Regarding "${userMessage.text.substring(0, 20)}...", let's explore that. (Simulated response)`;
        if (selectedLessonType === 'Q&A Session') {
            responseText = `Good question about "${userMessage.text.substring(0, 20)}...". Here's an explanation: [Simulated explanation]. Any other questions?`;
        } else if (selectedLessonType === 'Problem-Solving') {
            responseText = `Okay, let's tackle "${userMessage.text.substring(0, 20)}...". First step is... [Simulated problem-solving step]. What do you think comes next?`;
        }

      const botResponse: Message = {
        id: `msg-teacher-${Date.now()}`,
        text: responseText,
        sender: 'teacher',
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, botResponse]);
    }, 1500);
  };

  const handleAttachFile = () => {
    toast({ title: 'Attach File', description: 'File attachment not implemented yet.' });
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  const handleToggleCamera = () => {
    setIsCameraOn(prev => !prev);
    toast({ title: `Camera ${!isCameraOn ? 'On' : 'Off'}` });
  };

  const handleToggleMic = () => {
    setIsMicOn(prev => !prev);
    toast({ title: `Microphone ${!isMicOn ? 'On' : 'Off'}` });
  };

  const handleWhiteboardAccess = () => {
    toast({ title: 'Whiteboard Access', description: 'Whiteboard feature not implemented yet.' });
  };

   const handleChangeTeacher = () => {
    toast({ title: 'Change Teacher', description: 'Functionality to change teacher is not available.' });
  };

   const handleInviteOthers = () => {
       toast({ title: 'Invite Others', description: 'Invitation functionality not implemented yet.' });
   };

    const handleAskQuestion = () => {
        if (sessionStatus !== 'active') return;
        setInputValue("Can you explain [topic] again?"); // Pre-fill input
        toast({ title: 'Ask a Question', description: 'Input field pre-filled. Edit and send.' });
         document.getElementById('chat-input')?.focus(); // Focus the input field
    };

    const handleRequestExplanation = () => {
         if (sessionStatus !== 'active') return;
         setInputValue("Could you elaborate on the last point?"); // Pre-fill input
         toast({ title: 'Request Explanation', description: 'Input field pre-filled. Edit and send.' });
          document.getElementById('chat-input')?.focus(); // Focus the input field
    };

    const handleDownloadSummary = () => {
        if (sessionStatus !== 'active' || messages.length < 2) {
            toast({ title: 'Cannot Download', description: 'No session content to download.'});
            return;
        };
        let summaryContent = `## Virtual Teacher Session Summary\n\n`;
        summaryContent += `**Subject:** ${selectedSubject}\n`;
        summaryContent += `**Lesson Type:** ${selectedLessonType}\n\n`;
        summaryContent += `**Transcript:**\n`;
        messages.forEach(msg => {
            summaryContent += `[${msg.timestamp.toLocaleTimeString()}] ${msg.sender === 'teacher' ? 'Teacher' : 'Student'}: ${msg.text}\n`;
        });

        const blob = new Blob([summaryContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `virtual_teacher_${selectedSubject}_summary.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({ title: 'Summary Downloaded' });
    };

     const handleLeaveSession = () => {
        setSessionStatus('ended');
        setMessages([]);
        setSelectedSubject(undefined);
        setSelectedLessonType(undefined);
        toast({ title: 'Session Ended' });
     };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
       <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex items-center gap-2">
          <BookOpenCheck className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">Virtual Teacher</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={sessionStatus !== 'active'}>
              <MoreVertical className="h-5 w-5" />
              <span className="sr-only">Options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDownloadSummary} disabled={messages.length < 2}>Download Session Summary</DropdownMenuItem>
            <DropdownMenuItem onClick={handleLeaveSession}>Leave Session</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: "Help clicked" })}>Help</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
          {/* Left Panel (Classroom View & Controls) */}
          <div className="flex flex-col flex-1 border-r overflow-hidden">

             {/* Configuration Screen (if sessionStatus is 'configuring') */}
             {sessionStatus === 'configuring' && (
                 <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6 bg-muted/30">
                     <BookOpenCheck className="h-20 w-20 text-primary/70" />
                     <h2 className="text-2xl font-heading text-center">Configure Your Lesson</h2>
                     <p className="text-muted-foreground text-center max-w-md">Select the subject and lesson type to start your virtual learning session.</p>
                     <Card className="w-full max-w-md card-base">
                         <CardContent className="p-6 space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="subject-select">Subject</Label>
                                <Select onValueChange={setSelectedSubject} value={selectedSubject}>
                                    <SelectTrigger id="subject-select" className="input-base">
                                        <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                                        <SelectItem value="Science">Science</SelectItem>
                                        <SelectItem value="History">History</SelectItem>
                                        <SelectItem value="Literature">Literature</SelectItem>
                                        <SelectItem value="Programming">Programming</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="lesson-type-select">Lesson Type</Label>
                                <Select onValueChange={setSelectedLessonType} value={selectedLessonType}>
                                     <SelectTrigger id="lesson-type-select" className="input-base">
                                        <SelectValue placeholder="Select lesson type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Lecture">Lecture</SelectItem>
                                        <SelectItem value="Q&A Session">Q&A Session</SelectItem>
                                        <SelectItem value="Problem-Solving">Problem-Solving</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                             <Button onClick={startSession} className="w-full btn-base mt-4" disabled={!selectedSubject || !selectedLessonType}>
                                 Start Session
                             </Button>
                         </CardContent>
                     </Card>
                 </div>
             )}

              {/* Classroom Screen & Chat (if sessionStatus is 'active') */}
             {sessionStatus === 'active' && (
                 <>
                 {/* Classroom Screen Placeholder */}
                    <div className="relative flex-1 bg-muted/50 flex items-center justify-center p-4 min-h-[200px]">
                        <div className="text-center text-muted-foreground">
                            <BookOpenCheck className="h-20 w-20 mx-auto mb-4 text-primary/50" />
                            <p className="font-semibold">Session on {selectedSubject} ({selectedLessonType})</p>
                            <p className="text-sm">Ask questions or follow the lesson below.</p>
                            <div className="absolute bottom-2 left-2 flex gap-2">
                                <Badge variant={isCameraOn ? "secondary" : "destructive"}>
                                    {isCameraOn ? <Video className="h-3 w-3 mr-1" /> : <VideoOff className="h-3 w-3 mr-1" />} Cam
                                </Badge>
                                <Badge variant={isMicOn ? "secondary" : "destructive"}>
                                    {isMicOn ? <Mic className="h-3 w-3 mr-1" /> : <MicOff className="h-3 w-3 mr-1" />} Mic
                                </Badge>
                            </div>
                        </div>
                    </div>

                     {/* Action Buttons */}
                    <div className="flex justify-center gap-2 p-3 border-t bg-background">
                        <Button variant="outline" size="icon" onClick={handleToggleCamera} aria-label={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}>
                            {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5 text-destructive" />}
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleToggleMic} aria-label={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}>
                            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5 text-destructive" />}
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleWhiteboardAccess} aria-label="Access Whiteboard">
                            <Edit3 className="h-5 w-5" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleAskQuestion}>Ask Question</Button>
                        <Button variant="outline" size="sm" onClick={handleRequestExplanation}>Request Explanation</Button>
                    </div>


                     {/* Chat Area */}
                     <ScrollArea className="flex-1 p-4 overflow-y-auto" ref={scrollAreaRef}>
                        <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                            key={message.id}
                            className={cn(
                                'flex items-end gap-2',
                                message.sender === 'student' ? 'justify-end' : 'justify-start'
                            )}
                            >
                            {message.sender === 'teacher' && (
                                <Avatar className="h-8 w-8">
                                <AvatarFallback><Sparkles className="h-4 w-4 text-primary" /></AvatarFallback>
                                </Avatar>
                            )}
                            <div
                                className={cn(
                                'max-w-[70%] rounded-lg px-4 py-2 card-base',
                                message.sender === 'student'
                                    ? 'bg-primary text-primary-foreground rounded-br-none'
                                    : 'bg-muted text-foreground rounded-bl-none'
                                )}
                            >
                                <p className="text-sm">{message.text}</p>
                                <p className="text-xs text-right mt-1 opacity-70">
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            {message.sender === 'student' && (
                                <Avatar className="h-8 w-8">
                                <AvatarFallback><UserIcon className="h-4 w-4" /></AvatarFallback>
                                </Avatar>
                            )}
                            </div>
                        ))}
                        </div>
                    </ScrollArea>

                      {/* Chat Input */}
                    <div className="flex items-center gap-2 p-4 border-t bg-background">
                        <Button variant="ghost" size="icon" onClick={handleAttachFile} aria-label="Attach File">
                        <Paperclip className="h-5 w-5" />
                        </Button>
                        <Input
                        id="chat-input"
                        type="text"
                        placeholder="Type your question or response..."
                        className="flex-1 input-base h-10"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        />
                        <Button size="icon" onClick={handleSend} disabled={inputValue.trim() === ''} aria-label="Send Message">
                        <Send className="h-5 w-5" />
                        </Button>
                    </div>
                 </>
             )}

             {/* Session Ended Screen */}
             {sessionStatus === 'ended' && (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4 bg-muted/30">
                     <BookOpenCheck className="h-20 w-20 text-primary/50" />
                     <h2 className="text-2xl font-heading text-center">Session Ended</h2>
                     <p className="text-muted-foreground text-center">Your virtual lesson has concluded.</p>
                     <Button onClick={() => setSessionStatus('configuring')} className="btn-base">
                         Start New Session
                     </Button>
                  </div>
             )}
          </div>

          {/* Right Panel (Participants & Invite) - Shown only when session is active */}
           <div className={`hidden md:flex flex-col w-64 border-l p-4 space-y-4 bg-muted/30 ${sessionStatus === 'active' ? '' : 'md:hidden'}`}>
                 <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" /> Participants ({participants.length})
                </h2>
                 <div className="space-y-2">
                     {participants.map(p => (
                         <div key={p.id} className="flex items-center justify-between text-sm">
                             <span className="font-medium">{p.name}</span>
                             <Badge variant={p.status === 'Online' ? 'secondary' : 'outline'}>
                                 {p.status}
                             </Badge>
                         </div>
                     ))}
                 </div>
                 <Separator />
                 <Button variant="outline" className="w-full" onClick={handleInviteOthers}>
                      <UserPlus className="mr-2 h-5 w-5" /> Invite Others
                 </Button>
           </div>
      </div>

       {/* Bottom section for mobile (Participants/Invite) - Shown only when session is active */}
       <div className={`md:hidden sticky bottom-0 z-10 flex items-center justify-between h-14 px-4 bg-background border-t ${sessionStatus === 'active' ? '' : 'hidden'}`}>
            <div className="flex items-center gap-2 text-sm">
                <UserCheck className="h-5 w-5 text-primary" />
                 <span>{participants.length} Participant(s)</span>
            </div>
            <Button variant="link" className="text-primary p-0 h-auto text-sm" onClick={handleInviteOthers}>
                 <UserPlus className="mr-1 h-4 w-4" /> Invite
            </Button>
       </div>
    </div>
  );
}

