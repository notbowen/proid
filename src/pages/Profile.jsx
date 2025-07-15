import { useState } from 'react'
import { 
  Box, 
  Heading, 
  Text, 
  Container, 
  VStack,
  HStack,
  Avatar,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Button,
  useToast,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { useAuth } from '../contexts/AuthContext.jsx'

const Profile = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const { user, updatePassword } = useAuth()
  const toast = useToast()

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    
    if (!newPassword.trim()) {
      toast({
        title: 'Please enter a new password',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters long',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsUpdating(true)

    try {
      const { error } = await updatePassword(newPassword)
      
      if (error) {
        toast({
          title: 'Update failed',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } else {
        toast({
          title: 'Password updated successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        setNewPassword('')
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
      setIsUpdating(false)
    }
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" color="gray.800">
          Profile
        </Heading>
        
        <Card shadow="md" border="1px" borderColor="gray.200">
          <CardHeader>
            <HStack spacing={4}>
              <Avatar 
                size="lg" 
                name={user?.email} 
                src={user?.user_metadata?.avatar_url}
              />
              <Box>
                <Heading size="md" color="gray.800">
                  {user?.email}
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </Text>
              </Box>
            </HStack>
          </CardHeader>
          
          <CardBody pt={0}>
            <VStack spacing={6} align="stretch">
              <Box>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  Account Information
                </Text>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Email:</Text>
                    <Text fontSize="sm" color="gray.800">{user?.email}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Email Verified:</Text>
                    <Text fontSize="sm" color={user?.email_confirmed_at ? 'green.500' : 'red.500'}>
                      {user?.email_confirmed_at ? 'Yes' : 'No'}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">Last Sign In:</Text>
                    <Text fontSize="sm" color="gray.800">
                      {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Unknown'}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
              
              <Divider />
              
              <Box>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={3}>
                  Change Password
                </Text>
                <form onSubmit={handleUpdatePassword}>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel fontSize="sm">New Password</FormLabel>
                      <InputGroup>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          size="md"
                        />
                        <InputRightElement>
                          <IconButton
                            icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                            onClick={() => setShowPassword(!showPassword)}
                            variant="ghost"
                            size="sm"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>
                    
                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="md"
                      isLoading={isUpdating}
                      loadingText="Updating..."
                      alignSelf="flex-start"
                    >
                      Update Password
                    </Button>
                  </VStack>
                </form>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
}

export default Profile 