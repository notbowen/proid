import { Box, Heading, Text, Container, VStack } from '@chakra-ui/react'

const Home = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" color="gray.800">
          URA Draft Master Plan 2025
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Welcome to Bob the Builder's URA DMP 2025 prototype website!
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
            Check out our{' '}
            <a
              href="https://www.figma.com/proto/vJLiknb7zWrcL530jwlKvx/PROID-Asg3-Prototype?page-id=0%3A1&node-id=12-278&p=f&viewport=314%2C153%2C0.04&t=oYqKMAkA3Ux9gTAG-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=12%3A278"
              style={{
                color: '#E53E3E',
                textDecoration: 'underline',
                fontWeight: 600,
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Figma prototype
            </a>{' '}
            for the rest of the website!
          </Text>
        </Box>
      </VStack>
    </Container>
  )
}

export default Home 