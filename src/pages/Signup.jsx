import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Box, 
  Heading, 
  Text, 
  Container, 
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  Divider,
  HStack,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { useAuth } from '../contexts/AuthContext.jsx'

const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleSignup = async (e) => {
    e.preventDefault()
    
    if (!email.trim() || !password || !confirmPassword) {
      toast({
        title: 'Please fill in all fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters long',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await signUp(email.trim(), password)
      
      if (error) {
        toast({
          title: 'Signup failed',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } else {
        toast({
          title: 'Account created successfully!',
          description: 'Please check your email to confirm your account.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        navigate('/login')
      }
    } catch (error) {
      toast({
        title: 'An error occurred',
        description: 'Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)

    try {
      const { error } = await signInWithGoogle()
      
      if (error) {
        toast({
          title: 'Google sign-in failed',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
      // Note: No success toast here as user will be redirected to Google
    } catch (error) {
      toast({
        title: 'An error occurred',
        description: 'Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <Container maxW="container.sm" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" color="gray.800" textAlign="center">
          Create Account
        </Heading>
        <Text fontSize="lg" color="gray.600" textAlign="center">
          Join us to submit and track your suggestions
        </Text>
        
        <Box 
          bg="white" 
          p={8} 
          borderRadius="lg" 
          border="1px"
          borderColor="gray.200"
          shadow="sm"
        >
          <form onSubmit={handleSignup}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel>Email Address</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  size="lg"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                  <InputRightElement>
                    <IconButton
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                  />
                  <InputRightElement>
                    <IconButton
                      icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      variant="ghost"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                isLoading={isLoading}
                loadingText="Creating account..."
                w="full"
              >
                Create Account
              </Button>
            </VStack>
          </form>
          
          <Divider my={6} />
          
          <VStack spacing={4}>
            <Text fontSize="sm" color="gray.600">Or continue with</Text>
            
            <Button
              onClick={handleGoogleSignIn}
              isLoading={isGoogleLoading}
              loadingText="Redirecting to Google..."
              w="full"
              variant="outline"
              leftIcon={
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              }
            >
              Continue with Google
            </Button>
          </VStack>
          
          <Divider my={6} />
          
          <VStack spacing={4}>
            <HStack spacing={1}>
              <Text color="gray.600">Already have an account?</Text>
              <Link to="/login" style={{ color: '#3182CE', textDecoration: 'underline' }}>
                Sign in
              </Link>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Container>
  )
}

export default Signup 