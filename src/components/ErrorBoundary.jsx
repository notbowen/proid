import React from 'react'
import { Box, Text, Button, VStack } from '@chakra-ui/react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          p={8}
          textAlign="center"
          bg="red.50"
          border="1px solid"
          borderColor="red.200"
          borderRadius="md"
        >
          <VStack spacing={4}>
            <Text fontSize="lg" fontWeight="bold" color="red.600">
              Something went wrong
            </Text>
            <Text color="gray.600">
              The map encountered an error. Please refresh the page to try again.
            </Text>
            <Button
              colorScheme="red"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </VStack>
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 