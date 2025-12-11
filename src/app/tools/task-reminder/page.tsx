
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format, parseISO, compareAsc, compareDesc } from 'date-fns';
import {
  ArrowLeft,
  Clock,
  MoreVertical,
  PlusCircle,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  ListFilter,
  Calendar as CalendarIconLucide,
  AlertTriangle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label'; // Added import for Label

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // Store as ISO string for localStorage
  category: 'Homework' | 'Exam' | 'Assignment' | 'Review' | 'Presentation' | 'Other';
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
  createdAt: string; // Store as ISO string
}

const taskCategories: Task['category'][] = ['Homework', 'Exam', 'Assignment', 'Review', 'Presentation', 'Other'];
const taskPriorities: Task['priority'][] = ['Low', 'Medium', 'High'];

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(100, 'Title too long.'),
  description: z.string().max(500, 'Description too long.').optional(),
  dueDate: z.date({ required_error: 'Due date is required.' }),
  category: z.enum(taskCategories, { required_error: 'Category is required.' }),
  priority: z.enum(taskPriorities, { required_error: 'Priority is required.' }),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function TaskReminderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [sortCriteria, setSortCriteria] = useState<'dueDateAsc' | 'dueDateDesc' | 'priority' | 'createdAtNewest' | 'createdAtOldest'>('createdAtNewest');

  // Load tasks from localStorage on initial render
  useEffect(() => {
    const storedTasks = localStorage.getItem('eduai-tasks');
    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks));
      } catch (error) {
        console.error("Failed to parse tasks from localStorage", error);
        setTasks([]);
      }
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('eduai-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: new Date(),
      category: 'Homework',
      priority: 'Medium',
    },
  });

  useEffect(() => {
    if (editingTask) {
      form.reset({
        title: editingTask.title,
        description: editingTask.description || '',
        dueDate: parseISO(editingTask.dueDate),
        category: editingTask.category,
        priority: editingTask.priority,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        dueDate: new Date(),
        category: 'Homework',
        priority: 'Medium',
      });
    }
  }, [editingTask, form, isDialogOpen]);


  const handleAddTask = (values: TaskFormValues) => {
    const newTask: Task = {
      id: editingTask ? editingTask.id : `task-${Date.now()}`,
      ...values,
      dueDate: values.dueDate.toISOString(),
      completed: editingTask ? editingTask.completed : false,
      createdAt: editingTask ? editingTask.createdAt : new Date().toISOString(),
    };

    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? newTask : t));
      toast({ title: 'Task Updated', description: `"${newTask.title}" has been updated.` });
    } else {
      setTasks([...tasks, newTask]);
      toast({ title: 'Task Added', description: `"${newTask.title}" has been added.` });
      // Simulate reminder
      const timeDiff = new Date(newTask.dueDate).getTime() - new Date().getTime();
      if (timeDiff > 0 && timeDiff < 24 * 60 * 60 * 1000) { // Due within 24 hours
        setTimeout(() => {
          toast({
            title: 'Task Reminder!',
            description: `"${newTask.title}" is due soon!`,
            variant: 'default',
            duration: 10000,
          });
        }, 5000); // Show toast after 5 seconds for demo
      }
    }
    setIsDialogOpen(false);
    setEditingTask(null);
    form.reset();
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
    const task = tasks.find(t => t.id === taskId);
    if(task) {
        toast({ title: `Task ${task.completed ? 'Marked Incomplete' : 'Completed'}`, description: `"${task.title}" status updated.`});
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    setTasks(tasks.filter(task => task.id !== taskId));
    if (taskToDelete) {
        toast({ title: 'Task Deleted', description: `"${taskToDelete.title}" removed.`, variant: 'destructive' });
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };
  
  const openAddTaskDialog = () => {
    setEditingTask(null); // Ensure form is for new task
    form.reset();
    setIsDialogOpen(true);
  };

  const sortedTasks = useMemo(() => {
    let sorted = [...tasks];
    const priorityOrder: Record<Task['priority'], number> = { 'High': 1, 'Medium': 2, 'Low': 3 };

    switch (sortCriteria) {
      case 'dueDateAsc':
        sorted.sort((a, b) => compareAsc(parseISO(a.dueDate), parseISO(b.dueDate)));
        break;
      case 'dueDateDesc':
        sorted.sort((a, b) => compareDesc(parseISO(a.dueDate), parseISO(b.dueDate)));
        break;
      case 'priority':
        sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || compareAsc(parseISO(a.dueDate), parseISO(b.dueDate)));
        break;
      case 'createdAtNewest':
        sorted.sort((a, b) => compareDesc(parseISO(a.createdAt), parseISO(b.createdAt)));
        break;
      case 'createdAtOldest':
        sorted.sort((a, b) => compareAsc(parseISO(a.createdAt), parseISO(b.createdAt)));
        break;
      default:
        break;
    }
    return sorted;
  }, [tasks, sortCriteria]);

  const activeTasks = sortedTasks.filter(task => !task.completed);
  const completedTasks = sortedTasks.filter(task => task.completed);

  const getPriorityBadgeVariant = (priority: Task['priority']): "default" | "secondary" | "destructive" | "warning" => {
    if (priority === 'High') return 'destructive';
    if (priority === 'Medium') return 'warning';
    return 'default'; // Low
  };


  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background border-b">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-heading font-bold">Task Reminder</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-5 w-5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTasks([])}>Clear All Tasks</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast({ title: 'Help not available' })}>Help</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card className="card-base text-center">
          <CardHeader>
            <Clock className="h-16 w-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl font-heading">Task & Homework Reminder</CardTitle>
            <CardDescription className="max-w-xl mx-auto">
              Manage your tasks and homework with smart reminders, priority levels, and calendar sync. Never miss a deadline again!
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
             <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingTask(null); }}>
              <DialogTrigger asChild>
                <Button className="btn-base" onClick={openAddTaskDialog}>
                  <PlusCircle className="mr-2 h-5 w-5" /> Add New Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px] card-base">
                <DialogHeader>
                  <DialogTitle className="font-heading text-xl">{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
                  <DialogDescription>
                    {editingTask ? 'Update the details of your task.' : 'Fill in the details for your new task.'}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddTask)} className="space-y-4 py-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl><Input placeholder="e.g., Math Homework Chapter 5" {...field} className="input-base" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl><Textarea placeholder="e.g., Complete exercises 1-10..." {...field} className="input-base min-h-[80px]" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="dueDate" render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant={"outline"} className={cn("input-base justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                <CalendarIconLucide className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 card-base" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                       <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger className="input-base"><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                            <SelectContent>{taskCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="priority" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger className="input-base"><SelectValue placeholder="Select priority" /></SelectTrigger></FormControl>
                            <SelectContent>{taskPriorities.map(pri => <SelectItem key={pri} value={pri}>{pri}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <DialogFooter className="pt-4">
                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit" className="btn-base">{editingTask ? 'Save Changes' : 'Add Task'}</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>

        {/* Task List and Filters */}
        <Card className="card-base">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg font-heading">Your Tasks</CardTitle>
            <div className="flex items-center gap-2">
                <ListFilter className="h-4 w-4 text-muted-foreground" />
                <Select value={sortCriteria} onValueChange={(value) => setSortCriteria(value as any)}>
                    <SelectTrigger className="w-[180px] h-9 input-base text-xs">
                        <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="createdAtNewest">Created: Newest</SelectItem>
                        <SelectItem value="createdAtOldest">Created: Oldest</SelectItem>
                        <SelectItem value="dueDateAsc">Due Date: Soonest</SelectItem>
                        <SelectItem value="dueDateDesc">Due Date: Latest</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
                <TabsTrigger value="active">Active ({activeTasks.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="p-4 space-y-3 min-h-[200px]">
                {activeTasks.length > 0 ? activeTasks.map(task => (
                  <TaskItemCard key={task.id} task={task} onToggleComplete={handleToggleComplete} onDelete={handleDeleteTask} onEdit={handleEditTask} />
                )) : <EmptyState message="No active tasks. Add some!" />}
              </TabsContent>
              <TabsContent value="completed" className="p-4 space-y-3 min-h-[200px]">
                {completedTasks.length > 0 ? completedTasks.map(task => (
                  <TaskItemCard key={task.id} task={task} onToggleComplete={handleToggleComplete} onDelete={handleDeleteTask} onEdit={handleEditTask} />
                )) : <EmptyState message="No completed tasks yet." />}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

const TaskItemCard: React.FC<{ task: Task; onToggleComplete: (id: string) => void; onDelete: (id: string) => void; onEdit: (task: Task) => void; }> = ({ task, onToggleComplete, onDelete, onEdit }) => {
  const { toast } = useToast();
  const isOverdue = !task.completed && new Date(task.dueDate) < new Date();

  const getPriorityBadgeVariant = (priority: Task['priority']): "default" | "secondary" | "destructive" | "warning" | "outline" | "accent" | null | undefined => {
    if (priority === 'High') return 'destructive';
    if (priority === 'Medium') return 'warning';
    return 'secondary'; // Low
  };

  return (
    <Card className={cn("card-base transition-all", task.completed && "opacity-60 bg-muted/50", isOverdue && "border-destructive")}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2 pt-4 px-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={() => onToggleComplete(task.id)}
            className="mt-1"
          />
          <div className="flex-1">
            <Label htmlFor={`task-${task.id}`} className={cn("text-base font-heading cursor-pointer", task.completed && "line-through text-muted-foreground")}>
              {task.title}
            </Label>
            {task.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(task)}>
            <Edit className="h-4 w-4" /> <span className="sr-only">Edit</span>
          </Button>
          <Dialog>
              <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" /> <span className="sr-only">Delete</span>
                  </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px] card-base">
                  <DialogHeader>
                      <DialogTitle className="font-heading">Delete Task?</DialogTitle>
                      <DialogDescription>
                          Are you sure you want to delete the task "{task.title}"? This action cannot be undone.
                      </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                      <Button variant="destructive" onClick={() => onDelete(task.id)}>Delete Task</Button>
                  </DialogFooter>
              </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarIconLucide className="h-3.5 w-3.5" />
            <span>Due: {format(parseISO(task.dueDate), "MMM d, yyyy")}</span>
            {isOverdue && <Badge variant="destructive" className="text-xs px-1.5 py-0.5">Overdue</Badge>}
          </div>
          <div className="flex items-center gap-1">
            <ListFilter className="h-3.5 w-3.5" />
            <span>{task.category}</span>
          </div>
           <Badge variant={getPriorityBadgeVariant(task.priority)} className="text-xs px-1.5 py-0.5">{task.priority} Priority</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyState: React.FC<{message: string}> = ({message}) => (
    <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-10">
        <Clock className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-sm">{message}</p>
    </div>
);

