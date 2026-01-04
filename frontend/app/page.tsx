'use client'

import { useEffect, useState } from 'react';
import { 
  Container, Heading, VStack, HStack, Input, Button, 
  Text, Checkbox, IconButton, Spinner, useToast, Box, Spacer 
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { auth } from '../lib/firebase';

// To-Do
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
  const { user, logout } = useAuthStore();
  const toast = useToast();

  // Runs when the page loads
  useEffect(() => {
    // If the user is not logged in, redirect to login
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        fetchTodos();
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 1. READ: Get To-Dos
  const fetchTodos = async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    setLoading(true);
    const response = await api.get<Todo[]>('/todos/');
    setTodos(response.data);
  } catch (error) {
    console.error("Fetch error:", error);
  } finally {
    setLoading(false);
  }
};

  // 2. CREATE: Create To-Do
  const addTodo = async () => {
    if (!newTodo.trim()) return;
    try {
      const response = await api.post<Todo>('/todos/', { 
        title: newTodo,
        is_completed: false 
      });
      setTodos([...todos, response.data]); // Listeye ekle
      setNewTodo('');
      toast({ status: 'success', title: 'Task Added' });
    } catch (error) {
      toast({ status: 'error', title: 'Addition Failed' });
    }
  };

  // 3. UPDATE: Check/Uncheck To-Do
  const toggleTodo = async (id: number, currentStatus: boolean) => {
    try {
      // First Update UI
      const updatedTodos = todos.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t);
      setTodos(updatedTodos);

      await api.put(`/todos/${id}`, { is_completed: !currentStatus });
    } catch (error) {
      toast({ status: 'error', title: 'Güncelleme hatası' });
      fetchTodos();
    }
  };

  // 4. DELETE: Delete To-Do
  const deleteTodo = async (id: number) => {
    try {
      await api.delete(`/todos/${id}`);
      setTodos(todos.filter(t => t.id !== id));
      toast({ status: 'info', title: 'Task deleted.' });
    } catch (error) {
      toast({ status: 'error', title: 'Deletion Error' });
    }
  };

  if (loading && todos.length === 0) {
    return <Container centerContent py={20}><Spinner size="xl" /></Container>;
  }

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={8} align="stretch">
        <HStack>
          <Heading>My To-Do List</Heading>
          <Spacer />
          <Button colorScheme="red" variant="outline" size="sm" onClick={() => { logout(); auth.signOut(); }}>
            Log out
          </Button>
        </HStack>

        {/* Add Task */}
        <HStack>
          <Input 
            placeholder="Write new task..." 
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          />
          <Button colorScheme="teal" onClick={addTodo}>ADD</Button>
        </HStack>

        {/* List */}
        <VStack align="stretch" spacing={4}>
          {todos.length === 0 && <Text color="gray.500">You don't have any tasks yet. Go ahead and add one!</Text>}
          
          {todos.map((todo) => (
            <Box key={todo.id} p={4} borderWidth="1px" borderRadius="lg" bg={todo.is_completed ? "gray.50" : "white"}>
              <HStack>
                <Checkbox 
                  isChecked={todo.is_completed} 
                  onChange={() => toggleTodo(todo.id, todo.is_completed)}
                  colorScheme="green"
                  size="lg"
                />
                <Text 
                  as={todo.is_completed ? 's' : 'span'} 
                  color={todo.is_completed ? 'gray.500' : 'black'}
                  fontSize="lg"
                >
                  {todo.title}
                </Text>
                <Spacer />
                <Button size="sm" colorScheme="red" variant="ghost" onClick={() => deleteTodo(todo.id)}>
                  Delete
                </Button>
              </HStack>
            </Box>
          ))}
        </VStack>
      </VStack>
    </Container>
  );
}