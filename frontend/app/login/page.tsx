'use client'

import { useState } from 'react';
import { 
Box, Button, Container, FormControl, FormLabel, Heading, 
Input, VStack, useToast, Text, Card, CardBody, Link 
} from '@chakra-ui/react';
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
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const token = await user.getIdToken()       
        loginStore(user, token)     
        toast({
        title: "Login Successful",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
    });

    router.push('/');

    } catch (error: any) {
        toast({
        title: "Login Failed",
        description: "Please check your email or password.",
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
            <VStack spacing={6} as="form" onSubmit={handleLogin}>
            <Heading color="teal.600" size="lg">Welcome Back</Heading>
            <Text color="gray.500">Enter your credentials to access your account</Text>
            
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
                    placeholder="********"
                />
            </FormControl>

            <Button 
                type="submit" 
                colorScheme="teal" 
                width="full" 
                size="lg"
                isLoading={isLoading}
                loadingText="Signing in..."
            >
                Sign In
            </Button>

            <Text fontSize="sm" color="gray.600">
                Don't have an account? {' '}
                <Link color="teal.500" fontWeight="bold" onClick={() => router.push('/register')}>
                Sign Up
                </Link>
            </Text>
            </VStack>
        </CardBody>
        </Card>
    </Container>
    </Box>
);
}