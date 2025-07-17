import { useState, useEffect } from 'react'
import { 
  Box, 
  Heading, 
  Text, 
  Container, 
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Icon,
  Flex,
  Spacer,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center
} from '@chakra-ui/react'
import { 
  CheckCircleIcon, 
  TimeIcon, 
  InfoIcon, 
  WarningIcon,
  StarIcon,
  ChatIcon,
  SettingsIcon,
  CheckIcon
} from '@chakra-ui/icons'
import { suggestionsService } from '../services/suggestionsService.js'
import { useAuth } from '../contexts/AuthContext.jsx'

const ProgressTracker = () => {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        setLoading(true)
        const data = await suggestionsService.getAllSuggestions()
        setSuggestions(data)
      } catch (err) {
        console.error('Error loading suggestions:', err)
        setError('Failed to load suggestions. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadSuggestions()
  }, [])

  // Deterministic status progression based on suggestion ID
  const getSuggestionStatus = (suggestionId) => {
    const statuses = [
      'submitted',
      'under_review', 
      'approved',
      'in_development',
      'testing',
      'completed',
      'rejected'
    ]
    
    // Use the suggestion ID to deterministically select a status
    const hash = String(suggestionId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const statusIndex = hash % statuses.length
    return statuses[statusIndex]
  }

  // Deterministic randomization for timeline dates
  const getDeterministicDate = (suggestionId, stage, baseDate) => {
    // Create a deterministic seed based on suggestion ID and stage
    const seed = String(suggestionId) + stage
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    
    // Define realistic time ranges for each stage (in milliseconds)
    const timeRanges = {
      'under_review': { min: 2 * 24 * 60 * 60 * 1000, max: 7 * 24 * 60 * 60 * 1000 }, // 2-7 days
      'approved': { min: 1 * 24 * 60 * 60 * 1000, max: 3 * 24 * 60 * 60 * 1000 }, // 1-3 days after review
      'in_development': { min: 7 * 24 * 60 * 60 * 1000, max: 21 * 24 * 60 * 60 * 1000 }, // 1-3 weeks
      'testing': { min: 3 * 24 * 60 * 60 * 1000, max: 10 * 24 * 60 * 60 * 1000 }, // 3-10 days
      'completed': { min: 1 * 24 * 60 * 60 * 1000, max: 5 * 24 * 60 * 60 * 1000 }, // 1-5 days after testing
      'rejected': { min: 1 * 24 * 60 * 60 * 1000, max: 5 * 24 * 60 * 60 * 1000 } // 1-5 days after review
    }
    
    const range = timeRanges[stage]
    if (!range) return baseDate
    
    // Use hash to deterministically select a time within the range
    const randomFactor = (hash % 1000) / 1000 // 0 to 1
    const timeOffset = range.min + (randomFactor * (range.max - range.min))
    
    return new Date(baseDate.getTime() + timeOffset)
  }

  // Get timeline dates for a suggestion
  const getTimelineDates = (suggestionId, createdDate) => {
    const baseDate = new Date(createdDate)
    
    return {
      submitted: baseDate,
      under_review: getDeterministicDate(suggestionId, 'under_review', baseDate),
      approved: getDeterministicDate(suggestionId, 'approved', getDeterministicDate(suggestionId, 'under_review', baseDate)),
      in_development: getDeterministicDate(suggestionId, 'in_development', getDeterministicDate(suggestionId, 'approved', getDeterministicDate(suggestionId, 'under_review', baseDate))),
      testing: getDeterministicDate(suggestionId, 'testing', getDeterministicDate(suggestionId, 'in_development', getDeterministicDate(suggestionId, 'approved', getDeterministicDate(suggestionId, 'under_review', baseDate)))),
      completed: getDeterministicDate(suggestionId, 'completed', getDeterministicDate(suggestionId, 'testing', getDeterministicDate(suggestionId, 'in_development', getDeterministicDate(suggestionId, 'approved', getDeterministicDate(suggestionId, 'under_review', baseDate))))),
      rejected: getDeterministicDate(suggestionId, 'rejected', getDeterministicDate(suggestionId, 'under_review', baseDate))
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'blue',
      under_review: 'yellow',
      approved: 'green',
      in_development: 'purple',
      testing: 'orange',
      completed: 'green',
      rejected: 'red'
    }
    return colors[status] || 'gray'
  }

  const getStatusIcon = (status) => {
    const icons = {
      submitted: InfoIcon,
      under_review: TimeIcon,
      approved: CheckCircleIcon,
      in_development: SettingsIcon,
      testing: WarningIcon,
      completed: StarIcon,
      rejected: WarningIcon
    }
    return icons[status] || InfoIcon
  }

  const getStatusDescription = (status) => {
    const descriptions = {
      submitted: 'Your suggestion has been received and is waiting to be reviewed',
      under_review: 'Your suggestion is currently being reviewed by our team',
      approved: 'Your suggestion has been approved and is being considered for implementation',
      in_development: 'Your suggestion is currently being developed',
      testing: 'Your suggestion is being tested before final implementation',
      completed: 'Your suggestion has been successfully implemented',
      rejected: 'Your suggestion was not approved for implementation'
    }
    return descriptions[status] || 'Status unknown'
  }

  const getProgressPercentage = (status) => {
    const progressMap = {
      submitted: 20,
      under_review: 40,
      approved: 60,
      in_development: 80,
      testing: 90,
      completed: 100,
      rejected: 100
    }
    return progressMap[status] || 0
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Center>
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text>Loading suggestions...</Text>
          </VStack>
        </Center>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="xl" color="gray.800">
            Progress Tracker
          </Heading>
          <Alert status="error">
            <AlertIcon />
            <Box>
              <AlertTitle>Error loading suggestions!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Alert>
        </VStack>
      </Container>
    )
  }

  if (suggestions.length === 0) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="xl" color="gray.800">
            Progress Tracker
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Track your suggestion's progress
          </Text>
          <Alert status="info">
            <AlertIcon />
            <Box>
              <AlertTitle>No suggestions found!</AlertTitle>
              <AlertDescription>
                You haven't submitted any suggestions yet. Head over to the{' '}
                <a href="/suggest" style={{ color: '#E53E3E', textDecoration: 'underline' }}>
                  Suggest page
                </a>{' '}
                to submit your first suggestion.
              </AlertDescription>
            </Box>
          </Alert>
        </VStack>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" color="gray.800">
          Progress Tracker
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Track your suggestion's progress
        </Text>
        
        <VStack spacing={6} align="stretch">
          {suggestions.map((suggestion) => {
            const status = getSuggestionStatus(suggestion.id)
            const StatusIcon = getStatusIcon(status)
            const progressPercentage = getProgressPercentage(status)
            
            return (
              <Card key={suggestion.id} shadow="md" border="1px" borderColor="gray.200">
                <CardHeader>
                  <Flex align="center">
                    <Box flex="1">
                      <Heading size="md" color="gray.800">
                        {suggestion.title}
                      </Heading>
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Submitted on {formatDate(suggestion.created_at)}
                      </Text>
                    </Box>
                    <Badge 
                      colorScheme={getStatusColor(status)} 
                      variant="solid" 
                      px={3} 
                      py={1} 
                      borderRadius="full"
                      fontSize="sm"
                    >
                      <HStack spacing={1}>
                        <Icon as={StatusIcon} />
                        <Text>{status.replace('_', ' ').toUpperCase()}</Text>
                      </HStack>
                    </Badge>
                  </Flex>
                </CardHeader>
                
                <CardBody pt={0}>
                  <VStack spacing={4} align="stretch">
                    <Text color="gray.700" fontSize="md">
                      {suggestion.content}
                    </Text>
                    
                    <Divider />
                    
                    {/* Progress Bar */}
                    <Box>
                      <Flex justify="space-between" mb={2}>
                        <Text fontSize="sm" color="gray.600">Progress</Text>
                        <Text fontSize="sm" color="gray.600">{progressPercentage}%</Text>
                      </Flex>
                      <Box 
                        bg="gray.200" 
                        h="8px" 
                        borderRadius="full" 
                        overflow="hidden"
                      >
                        <Box 
                          bg={getStatusColor(status)} 
                          h="100%" 
                          w={`${progressPercentage}%`}
                          transition="width 0.5s ease-in-out"
                          borderRadius="full"
                        />
                      </Box>
                    </Box>
                    
                    {/* Status Description */}
                    <Box 
                      bg={`${getStatusColor(status)}.50`} 
                      p={3} 
                      borderRadius="md"
                      borderLeft="4px solid"
                      borderLeftColor={`${getStatusColor(status)}.500`}
                    >
                      <HStack spacing={2}>
                        <Icon as={StatusIcon} color={`${getStatusColor(status)}.500`} />
                        <Text fontSize="sm" color="gray.700">
                          {getStatusDescription(status)}
                        </Text>
                      </HStack>
                    </Box>
                    
                    {/* Timeline */}
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={3}>
                        Timeline
                      </Text>
                      <VStack spacing={2} align="stretch">
                        {(() => {
                          const timelineDates = getTimelineDates(suggestion.id, suggestion.created_at)
                          
                          return (
                            <>
                              <HStack spacing={3}>
                                <Icon as={CheckCircleIcon} color="green.500" boxSize={4} />
                                <Text fontSize="sm" color="gray.600">Suggestion submitted</Text>
                                <Spacer />
                                <Text fontSize="xs" color="gray.500">
                                  {formatDate(timelineDates.submitted)}
                                </Text>
                              </HStack>
                              
                              {status !== 'submitted' && (
                                <HStack spacing={3}>
                                  <Icon as={TimeIcon} color="yellow.500" boxSize={4} />
                                  <Text fontSize="sm" color="gray.600">Under review</Text>
                                  <Spacer />
                                  <Text fontSize="xs" color="gray.500">
                                    {formatDate(timelineDates.under_review)}
                                  </Text>
                                </HStack>
                              )}
                              
                              {['approved', 'in_development', 'testing', 'completed'].includes(status) && (
                                <HStack spacing={3}>
                                  <Icon as={CheckIcon} color="green.500" boxSize={4} />
                                  <Text fontSize="sm" color="gray.600">Approved for development</Text>
                                  <Spacer />
                                  <Text fontSize="xs" color="gray.500">
                                    {formatDate(timelineDates.approved)}
                                  </Text>
                                </HStack>
                              )}
                              
                              {['in_development', 'testing', 'completed'].includes(status) && (
                                <HStack spacing={3}>
                                  <Icon as={SettingsIcon} color="purple.500" boxSize={4} />
                                  <Text fontSize="sm" color="gray.600">In development</Text>
                                  <Spacer />
                                  <Text fontSize="xs" color="gray.500">
                                    {formatDate(timelineDates.in_development)}
                                  </Text>
                                </HStack>
                              )}
                              
                              {['testing', 'completed'].includes(status) && (
                                <HStack spacing={3}>
                                  <Icon as={WarningIcon} color="orange.500" boxSize={4} />
                                  <Text fontSize="sm" color="gray.600">Testing phase</Text>
                                  <Spacer />
                                  <Text fontSize="xs" color="gray.500">
                                    {formatDate(timelineDates.testing)}
                                  </Text>
                                </HStack>
                              )}
                              
                              {status === 'completed' && (
                                <HStack spacing={3}>
                                  <Icon as={StarIcon} color="green.500" boxSize={4} />
                                  <Text fontSize="sm" color="gray.600">Successfully completed</Text>
                                  <Spacer />
                                  <Text fontSize="xs" color="gray.500">
                                    {formatDate(timelineDates.completed)}
                                  </Text>
                                </HStack>
                              )}
                              
                              {status === 'rejected' && (
                                <HStack spacing={3}>
                                  <Icon as={WarningIcon} color="red.500" boxSize={4} />
                                  <Text fontSize="sm" color="gray.600">Suggestion rejected</Text>
                                  <Spacer />
                                  <Text fontSize="xs" color="gray.500">
                                    {formatDate(timelineDates.rejected)}
                                  </Text>
                                </HStack>
                              )}
                            </>
                          )
                        })()}
                      </VStack>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            )
          })}
        </VStack>
      </VStack>
    </Container>
  )
}

export default ProgressTracker 