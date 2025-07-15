import { Box, Heading, Text, Container, VStack } from '@chakra-ui/react'

const InteractiveMap = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" color="gray.800">
          Interactive Map
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Collaboratively build your dream Singapore
        </Text>
        <Box 
          bg="gray.100" 
          p={8} 
          borderRadius="lg" 
          textAlign="center"
          minH="400px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="xl" color="gray.500">
            Interactive Map Content Coming Soon
          </Text>
        </Box>
      </VStack>
    </Container>
  )
}

export default InteractiveMap 