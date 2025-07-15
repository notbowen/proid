import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Container, 
  VStack, 
  Spinner, 
  Text, 
  Alert, 
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box
} from '@chakra-ui/react'
import { supabase } from '../lib/supabase.js'

const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          // Redirect to login with error
          navigate('/login', { 
            state: { error: 'Authentication failed. Please try again.' }
          })
          return
        }

        if (data.session) {
          // Successful authentication
          navigate('/', { 
            state: { message: 'Successfully signed in!' }
          })
        } else {
          // No session found
          navigate('/login', { 
            state: { error: 'Authentication failed. Please try again.' }
          })
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error)
        navigate('/login', { 
          state: { error: 'An unexpected error occurred. Please try again.' }
        })
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <Container maxW="container.sm" py={8}>
      <VStack spacing={6} align="stretch">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text fontSize="lg" color="gray.600">
            Completing sign in...
          </Text>
        </VStack>
        
        <Alert status="info">
          <AlertIcon />
          <Box>
            <AlertTitle>Processing authentication</AlertTitle>
            <AlertDescription>
              Please wait while we complete your sign in process.
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>
    </Container>
  )
}

export default AuthCallback 