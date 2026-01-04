'use client'

import { Box, Flex, Heading, Button, useColorModeValue, Container } from '@chakra-ui/react';
import { useAuthStore } from '../../store/authStore';
import { auth } from '../../lib/firebase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);

  // Background color for the navbar (Light mode / Dark mode compatible)
    const bg = useColorModeValue('white', 'gray.800');
    const borderBottom = useColorModeValue('gray.200', 'gray.700');

    const handleLogout = async () => {
        await auth.signOut(); // Sign out from Firebase
        logout();             // Clear local store
        router.push('/login'); // Redirect to login page
    };

    return (
        <Box bg={bg} borderBottom="1px" borderColor={borderBottom} py={4} mb={8} position="sticky" top={0} zIndex={10}>
        <Container maxW="container.md">
        <Flex justify="space-between" align="center">
          {/* App Logo / Title */}
            <Heading size="md" color="teal.500" letterSpacing="tight">
            TodoApp
            </Heading>

          {/* Logout Button */}
            <Button 
            colorScheme="red" 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            _hover={{ bg: 'red.50', color: 'red.600' }}
            >
            Log out
            </Button>
        </Flex>
        </Container>
    </Box>
    );
}