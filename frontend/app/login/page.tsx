'use client'

import { useState } from 'react';
import { Box, Button, Container, FormControl, FormLabel, Heading, Input, VStack, useToast, Text } from '@chakra-ui/react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const toast = useToast();
    const router = useRouter();
    const loginStore = useAuthStore((state) => state.login);    
    const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Login with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

      // 2. Get Token
    const token = await user.getIdToken();

      // 3. Save user to global state
    loginStore(user, token);

    toast({
        title: "Login Successful",
        status: "success",
        duration: 3000,
        isClosable: true,
    });

      // 4. Redirect to home page
    router.push('/');

    } catch (error: any) {
    toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
    });
    } finally {
    setIsLoading(false);
    }
};

return (
    <Container maxW="container.sm" centerContent py={20}>
    <Box p={8} borderWidth={1} borderRadius={8} boxShadow="lg" w="100%">
        <VStack spacing={6} as="form" onSubmit={handleLogin}>
        <Heading>Login</Heading>
        
        <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            />
        </FormControl>

        <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            />
        </FormControl>

        <Button 
            type="submit" 
            colorScheme="teal" 
            width="full" 
            isLoading={isLoading}
        >
            Login
        </Button>

        <Text fontSize="sm">
            Do you already have an account? <Button variant="link" colorScheme="teal" onClick={() => router.push('/register')}>Register</Button>
        </Text>
        </VStack>
    </Box>
    </Container>
);
}