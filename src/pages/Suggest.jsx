import { Box, Heading, Text, Container, VStack } from '@chakra-ui/react'

const Suggest = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" color="gray.800">
          Suggest
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Send in your suggestion to URA!
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
            Suggestion Form Coming Soon
          </Text>
        </Box>
      </VStack>
    </Container>
  )
}

export default Suggest 