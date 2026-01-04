'use client'

import { useState } from 'react';
import { 
Box, Button, Container, FormControl, FormLabel, Heading, 
Input, VStack, useToast, Text, Card, CardBody, Link 
} from '@chakra-ui/react';
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
            position: "top",
    });
    return;
    }

    if (password.length < 6) {
        toast({
            title: "Weak Password",
            description: "Password must be at least 6 characters.",
            status: "warning",
            duration: 3000,
            isClosable: true,
            position: "top",
        });
        return;
    }

    setIsLoading(true);

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const token = await user.getIdToken();  

        loginStore(user, token);    
        
        toast({
            title: "Account Created",
            description: "Welcome to TodoApp!",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top",
    });

    router.push('/');

    } catch (error: any) {
    toast({
        title: "Registration Failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
    });
    } finally {
        setIsLoading(false);
    }
};

return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
    <Container maxW="container.sm">
        <Card variant="outline" boxShadow="md" borderRadius="lg" bg="white">
        <CardBody p={8}>
            <VStack spacing={6} as="form" onSubmit={handleRegister}>
            <Heading color="teal.600" size="lg">Create Account</Heading>
            <Text color="gray.500">Join us to manage your tasks efficiently</Text>
            
            <FormControl isRequired>
                <FormLabel>Email Address</FormLabel>
                <Input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    focusBorderColor="teal.500"
                    placeholder="name@example.com"
                />
            </FormControl>

            <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    focusBorderColor="teal.500"
                    placeholder="At least 6 characters"
                />
            </FormControl>

            <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    focusBorderColor="teal.500"
                    placeholder="********"
                />
            </FormControl>

            <Button 
                type="submit" 
                colorScheme="teal" 
                width="full" 
                size="lg"
                isLoading={isLoading}
                loadingText="Creating Account..."
            >
                Sign Up
            </Button>

            <Text fontSize="sm" color="gray.600">
                Already have an account? {' '}
                <Link color="teal.500" fontWeight="bold" onClick={() => router.push('/login')}>
                Log In
                </Link>
            </Text>
            </VStack>
        </CardBody>
        </Card>
    </Container>
    </Box>
);
}