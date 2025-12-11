
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Sparkles,
  Home,
  Heart,
  Bell,
  User,
} from 'lucide-react';

import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Define message type
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Define suggestion type
interface Suggestion {
    id: string;
    text: string;
}

const initialSuggestions: Suggestion[] = [
    { id: 'sug-1', text: 'Explain quantum physics' },
    { id: 'sug-2', text: 'Summarize the plot of Hamlet' },
    { id: 'sug-3', text: 'Help me practice Spanish verbs' },
];

export default function ChatPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Add initial bot welcome message
  useEffect(() => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        text: "Welcome! I'm your EduAI assistant. How can I help you learn today?",
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
        // Access the underlying viewport element to scroll
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);


  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSend = () => {
    if (inputValue.trim() === '') return;

    const userMessage: Message = {
      id: `msg-user-${Date.now()}`,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    // Add user message and simulate bot response
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setSuggestions([]); // Hide suggestions after user sends a message

    // Simulate bot thinking and responding
    setTimeout(() => {
      const botResponse: Message = {
        id: `msg-bot-${Date.now()}`,
        text: `Okay, let's talk about "${userMessage.text}". (This is a simulated response)`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, botResponse]);
    }, 1000);
  };

   const handleSuggestionClick = (suggestionText: string) => {
       setInputValue(suggestionText);
       // Optional: Automatically send the message when suggestion is clicked
       // Immediately call handleSend after setting input value
        const userMessage: Message = {
          id: `msg-user-${Date.now()}-sug`,
          text: suggestionText,
          sender: 'user',
          timestamp: new Date(),
        };

        setMessages(prevMessages => [...prevMessages, userMessage]);
        setInputValue(''); // Clear input after sending suggestion
        setSuggestions([]); // Hide suggestions

        setTimeout(() => {
          const botResponse: Message = {
            id: `msg-bot-${Date.now()}-sug`,
            text: `Great question about "${suggestionText}"! (This is a simulated response)`,
            sender: 'bot',
            timestamp: new Date(),
          };
          setMessages(prevMessages => [...prevMessages, botResponse]);
        }, 1000);
   };


  const handleAttachFile = () => {
    toast({
      title: 'Attach File',
      description: 'File attachment functionality is not implemented yet.',
      variant: 'default',
    });
  };

  // Handle Enter key press in input
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Button>

        {/* Page Title and Icon */}
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-heading text-lg font-bold">Virtual Assistant</span>
        </div>

        {/* Placeholder for alignment */}
        <div className="w-8"></div>
      </header>

      {/* Chat Area */}
      <ScrollArea className="flex-1 overflow-y-auto p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-end gap-2',
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.sender === 'bot' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback><Sparkles className="h-4 w-4" /></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[70%] rounded-lg px-4 py-2 card-base', // Apply card-base styling
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-muted text-foreground rounded-bl-none'
                )}
              >
                <p className="text-sm">{message.text}</p>
                 <p className="text-xs text-right mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </p>
              </div>
              {message.sender === 'user' && (
                 <Avatar className="h-8 w-8">
                  <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  {/* Potential: Add user image here */}
                </Avatar>
              )}
            </div>
          ))}
           {/* Display Suggestions */}
           {suggestions.length > 0 && (
             <div className="flex justify-start pl-10 pt-2"> {/* Align with bot messages */}
                <div className="flex flex-wrap gap-2">
                    {suggestions.map(suggestion => (
                         <Button
                             key={suggestion.id}
                             variant="outline"
                             size="sm"
                             className="h-auto py-1 px-3 text-xs"
                             onClick={() => handleSuggestionClick(suggestion.text)}
                         >
                             {suggestion.text}
                         </Button>
                    ))}
                </div>
             </div>
           )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="flex items-center gap-2 p-4 border-t bg-background">
        <Button variant="ghost" size="icon" onClick={handleAttachFile}>
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Attach File</span>
        </Button>
        <Input
          type="text"
          placeholder="Type your message..."
          className="flex-1 input-base"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress} // Handle Enter key
        />
        <Button size="icon" onClick={handleSend} disabled={inputValue.trim() === ''}>
          <Send className="h-5 w-5" />
          <span className="sr-only">Send Message</span>
        </Button>
      </div>

      {/* Bottom Navigation (Optional - Depending on whether chat is a main tab or a sub-page) */}
      {/* If chat is NOT a main tab, remove this. If it is, adjust active state */}
      {/*
      <nav className="sticky bottom-0 z-10 flex justify-around h-16 bg-background border-t">
         <Link href="/dashboard" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary pt-2 pb-1">
           <Home className="h-6 w-6" />
           <span className="text-xs mt-1">Home</span>
         </Link>
         <Link href="/favorites" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary pt-2 pb-1">
           <Heart className="h-6 w-6" />
           <span className="text-xs mt-1">Favorites</span>
         </Link>
         <Link href="/notifications" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary pt-2 pb-1">
           <Bell className="h-6 w-6" />
           <span className="text-xs mt-1">Notifications</span>
         </Link>
         <Link href="/profile" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary pt-2 pb-1">
           <User className="h-6 w-6" />
           <span className="text-xs mt-1">Profile</span>
         </Link>
       </nav>
       */}
    </div>
  );
}

    