'use client'
import { Container, Heading, Text, Button, VStack } from '@chakra-ui/react'

export default function Home() {
  return (
    <Container maxW="container.md" centerContent py={10}>
      <VStack spacing={5}>
        <Heading>To-Do Uygulaması</Heading>
        <Text fontSize="xl">Frontend kurulumu başarıyla tekrar tamamlandı! 🚀</Text>
        <Button colorScheme="teal" size="lg">
          Başla
        </Button>
      </VStack>
    </Container>
  )
}