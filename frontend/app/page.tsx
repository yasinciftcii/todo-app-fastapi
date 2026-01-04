'use client'

import { useEffect, useState } from 'react';
import { 
  Container, VStack, Input, Button, Text, 
  Spinner, useToast, HStack, Badge, IconButton, 
  Card, CardBody, Divider, Flex, Spacer, Box
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon, CheckIcon } from '@chakra-ui/icons'; 
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { auth } from '../lib/firebase';
import Navbar from './components/Navbar';

// To-Do Interface
interface Todo {
  id: number;
  title: string;
  description?: string;
  is_completed: boolean;
  owner_uid: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const toast = useToast();

  // Check authentication status on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        fetchTodos();
      }
    });
    return () => unsubscribe();
  }, [router]);

  // --- API OPERATIONS ---

  // 1. Fetch Todos
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await api.get<Todo[]>('/todos/');
      // Sort: Pending tasks first, then completed ones
      const sortedTodos = response.data.sort((a, b) => Number(a.is_completed) - Number(b.is_completed));
      setTodos(sortedTodos);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Add Todo
  const addTodo = async () => {
    if (!newTodo.trim()) return;
    try {
      const response = await api.post<Todo>('/todos/', { 
        title: newTodo,
        is_completed: false 
      });
      // Add new task to the top of the list
      setTodos([response.data, ...todos]);
      setNewTodo('');
      toast({ status: 'success', title: 'Task created.', position: 'bottom-right' });
    } catch (error) {
      toast({ status: 'error', title: 'Failed to create task.', position: 'bottom-right' });
    }
  };

  // 3. Toggle Status (Complete/Incomplete)
  const toggleTodo = async (id: number, currentStatus: boolean) => {
    try {
      // Optimistic UI update: Update state immediately for better UX
      const updatedTodos = todos.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t);
      // Re-sort to move completed items to the bottom
      setTodos(updatedTodos.sort((a, b) => Number(a.is_completed) - Number(b.is_completed)));

      await api.put(`/todos/${id}`, { is_completed: !currentStatus });
    } catch (error) {
      toast({ status: 'error', title: 'Update failed.', position: 'bottom-right' });
      fetchTodos(); // Revert on error
    }
  };

  // 4. Delete Todo
  const deleteTodo = async (id: number) => {
    try {
      await api.delete(`/todos/${id}`);
      setTodos(todos.filter(t => t.id !== id));
      toast({ status: 'info', title: 'Task deleted.', position: 'bottom-right' });
    } catch (error) {
      toast({ status: 'error', title: 'Delete failed.', position: 'bottom-right' });
    }
  };

  // --- RENDER ---

  if (loading && todos.length === 0) {
    return (
      <Container centerContent py={20}>
        <Spinner size="xl" color="teal.500" thickness='4px' />
        <Text mt={4} color="gray.500">Loading your tasks...</Text>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* 1. Navbar Component */}
      <Navbar />

      <Container maxW="container.md">
        <VStack spacing={6} align="stretch">
          
          {/* 2. Add Task Section */}
          <Card variant="outline" borderColor="teal.200" boxShadow="sm">
            <CardBody>
              <HStack>
                <Input 
                  placeholder="What needs to be done?" 
                  size="lg"
                  variant="filled"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                  autoFocus
                />
                <Button 
                  leftIcon={<AddIcon />} 
                  colorScheme="teal" 
                  size="lg" 
                  onClick={addTodo}
                  px={8}
                >
                  Add
                </Button>
              </HStack>
            </CardBody>
          </Card>

          {/* 3. Task Stats (Optional) */}
          <HStack justify="space-between" px={2}>
            <Text color="gray.600" fontWeight="medium">
              You have {todos.filter(t => !t.is_completed).length} pending tasks
            </Text>
          </HStack>

          {/* 4. Task List */}
          <VStack align="stretch" spacing={3}>
            {todos.length === 0 && (
              <Box textAlign="center" py={10} color="gray.400">
                <Text fontSize="6xl">🎉</Text>
                <Text fontSize="xl" mt={4}>No tasks yet.</Text>
                <Text>Enjoy your day or add a new task above!</Text>
              </Box>
            )}
            
            {todos.map((todo) => (
              <Card 
                key={todo.id} 
                variant="elevated" 
                size="sm"
                opacity={todo.is_completed ? 0.7 : 1}
                _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                transition="all 0.2s"
              >
                <CardBody>
                  <Flex align="center">
                    {/* Toggle Button */}
                    <IconButton
                      aria-label="Complete Task"
                      icon={<CheckIcon />}
                      isRound
                      colorScheme={todo.is_completed ? "green" : "gray"}
                      variant={todo.is_completed ? "solid" : "outline"}
                      onClick={() => toggleTodo(todo.id, todo.is_completed)}
                      mr={4}
                      size="sm"
                    />

                    {/* Task Title & Badge */}
                    <Box>
                      <Text 
                        fontSize="lg" 
                        fontWeight={todo.is_completed ? "normal" : "semibold"}
                        textDecoration={todo.is_completed ? "line-through" : "none"}
                        color={todo.is_completed ? "gray.500" : "gray.800"}
                      >
                        {todo.title}
                      </Text>
                      <Badge 
                        mt={1} 
                        colorScheme={todo.is_completed ? "green" : "yellow"} 
                        fontSize="xs"
                      >
                        {todo.is_completed ? "COMPLETED" : "PENDING"}
                      </Badge>
                    </Box>

                    <Spacer />

                    {/* Delete Button */}
                    <IconButton 
                      aria-label="Delete Task" 
                      icon={<DeleteIcon />} 
                      colorScheme="red" 
                      variant="ghost" 
                      onClick={() => deleteTodo(todo.id)}
                      _hover={{ bg: 'red.100' }}
                    />
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </VStack>

        </VStack>
      </Container>
    </Box>
  );
}