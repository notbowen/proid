import { useState } from 'react'
import { 
  Box, 
  Heading, 
  Text, 
  Container, 
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { suggestionsService } from '../services/suggestionsService.js'
import { useAuth } from '../contexts/AuthContext.jsx'

const Suggest = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { user } = useAuth()
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create new suggestion object
      const newSuggestion = {
        title: title.trim(),
        content: content.trim()
      }
      
      // Save to Supabase
      await suggestionsService.createSuggestion(newSuggestion)
      
      // Reset form
      setTitle('')
      setContent('')
      setIsSubmitted(true)
      
      toast({
        title: 'Suggestion submitted successfully!',
        description: 'Your suggestion has been saved and can be tracked in the Progress Tracker.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error submitting suggestion:', error)
      toast({
        title: 'Error saving suggestion',
        description: 'Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setTitle('')
    setContent('')
    setIsSubmitted(false)
  }

  if (isSubmitted) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="xl" color="gray.800">
            Suggestion Submitted
          </Heading>
          <Alert status="success">
            <AlertIcon />
            Your suggestion has been successfully submitted and saved to Supabase.
          </Alert>
          <Text fontSize="lg" color="gray.600">
            You can track the progress of your suggestion in the{' '}
            <a href="/progress-tracker" style={{ color: '#E53E3E', textDecoration: 'underline' }}>
              Progress Tracker
            </a>
            .
          </Text>
          <Button onClick={handleReset} colorScheme="blue">
            Submit Another Suggestion
          </Button>
        </VStack>
      </Container>
    )
  }

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
          bg="white" 
          p={8} 
          borderRadius="lg" 
          border="1px"
          borderColor="gray.200"
          shadow="sm"
        >
          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel>Suggestion Title</FormLabel>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a brief title for your suggestion"
                  size="lg"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Suggestion Content</FormLabel>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe your suggestion in detail..."
                  size="lg"
                  minH="200px"
                  resize="vertical"
                />
              </FormControl>
              
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                isLoading={isSubmitting}
                loadingText="Submitting..."
                w="full"
              >
                Submit Suggestion
              </Button>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Container>
  )
}

export default Suggest 