'use client'

import { useState } from 'react';
import { Box, Button, Container, FormControl, FormLabel, Heading, Input, VStack, useToast, Text } from '@chakra-ui/react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const toast = useToast();
    const router = useRouter();
    const loginStore = useAuthStore((state) => state.login);    
    const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
    toast({
        title: "Error",
        description: "Passwords do not match.",
        status: "error",
        duration: 3000,
        isClosable: true,
    });
    return;
    }

    setIsLoading(true);

    try {
      // 1. Create user with Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

      // 2. Get Token
    const token = await user.getIdToken();

      // 3. Outomatically login the user
    loginStore(user, token);

    toast({
        title: "Register Successful",
        description: "Your account has been created and you have been logged in.",
        status: "success",
        duration: 3000,
        isClosable: true,
    });

      // 4. Redirect to home page
    router.push('/');

    } catch (error: any) {
    toast({
        title: "Registration Error",
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
        <VStack spacing={6} as="form" onSubmit={handleRegister}>
        <Heading>Register</Heading>
        
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

        <FormControl isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <Input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            />
        </FormControl>

        <Button 
            type="submit" 
            colorScheme="blue" 
            width="full" 
            isLoading={isLoading}
        >
            Register
        </Button>

        <Text fontSize="sm">
            Do you already have an account? <Button variant="link" colorScheme="blue" onClick={() => router.push('/login')}>Giriş Yap</Button>
        </Text>
        </VStack>
    </Box>
    </Container>
);
}