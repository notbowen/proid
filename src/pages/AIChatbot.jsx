import React, { useState, useRef, useEffect } from 'react'
import {
    Box,
    VStack,
    HStack,
    Input,
    Button,
    Text,
    Flex,
    Container,
    Heading,
    Avatar,
    Divider,
    useToast,
    Spinner,
} from '@chakra-ui/react'
import { ChatIcon, ArrowForwardIcon } from '@chakra-ui/icons'

const AIChatbot = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm your URA AI assistant. I can help you with questions about urban planning, development guidelines, and the Draft Master Plan 2025. How can I assist you today?",
            sender: 'ai',
            timestamp: new Date()
        }
    ])
    const [inputMessage, setInputMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef(null)
    const toast = useToast()

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Mock AI responses based on common URA-related queries
    const getMockAIResponse = (userMessage) => {
        const lowerMessage = userMessage.toLowerCase()
        
        if (lowerMessage.includes('master plan') || lowerMessage.includes('draft master plan')) {
            return "The Draft Master Plan 2025 is Singapore's strategic land use plan that guides our development over the next 10-15 years. It focuses on creating a more liveable, sustainable, and inclusive Singapore. Key themes include: 1) Creating more green spaces and recreational areas, 2) Enhancing connectivity and accessibility, 3) Supporting economic growth while maintaining quality of life, and 4) Building resilient and sustainable communities."
        }
        
        if (lowerMessage.includes('zoning') || lowerMessage.includes('land use')) {
            return "URA's zoning system categorizes land into different uses like residential, commercial, industrial, and mixed-use areas. Each zone has specific development parameters including plot ratio, building height limits, and permissible uses. You can check the zoning of any area using our ePlanner tool on the URA website."
        }
        
        if (lowerMessage.includes('development') || lowerMessage.includes('building')) {
            return "Development guidelines in Singapore are designed to ensure orderly and sustainable urban development. These include building height controls, setback requirements, and design guidelines. For specific projects, you'll need to refer to the Development Control parameters and consult with qualified professionals."
        }
        
        if (lowerMessage.includes('suggestion') || lowerMessage.includes('feedback')) {
            return "We welcome your suggestions and feedback! You can submit your ideas through our 'Suggest' feature on this platform, or attend our public exhibitions and engagement sessions. All feedback is carefully reviewed and considered in our planning process."
        }
        
        if (lowerMessage.includes('green') || lowerMessage.includes('sustainability')) {
            return "Sustainability is a key focus of URA's planning. We're working towards creating a 'City in Nature' with extensive green networks, promoting green building standards, and integrating sustainable transport options. The Draft Master Plan 2025 includes ambitious targets for green spaces and sustainable development."
        }
        
        if (lowerMessage.includes('transport') || lowerMessage.includes('mrt') || lowerMessage.includes('bus')) {
            return "Transport planning is coordinated with land use planning to create a car-lite society. We're expanding the MRT network, improving bus connectivity, and creating more pedestrian and cycling-friendly environments. The goal is to make public transport the preferred choice for daily commutes."
        }
        
        if (lowerMessage.includes('housing') || lowerMessage.includes('hdb') || lowerMessage.includes('residential')) {
            return "Housing development is planned to meet diverse needs while maintaining community cohesion. We're creating more housing options in different locations, including mixed-use developments and integrated communities. The planning ensures good connectivity to amenities and transport."
        }
        
        if (lowerMessage.includes('commercial') || lowerMessage.includes('business') || lowerMessage.includes('office')) {
            return "Commercial development is planned to support Singapore's economic growth while creating vibrant urban environments. We're developing new business districts and mixed-use areas that combine work, live, and play elements. This includes the development of regional centers and innovation districts."
        }
        
        // Default response for other queries
        return "Thank you for your question about URA and urban planning in Singapore. While I can provide general information, for specific technical queries or detailed planning matters, I recommend consulting our official guidelines or contacting URA directly. You can also explore our interactive map to see planned developments in different areas."
    }

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return

        const userMessage = {
            id: messages.length + 1,
            text: inputMessage,
            sender: 'user',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputMessage('')
        setIsLoading(true)

        // Simulate AI processing time
        setTimeout(() => {
            const aiResponse = {
                id: messages.length + 2,
                text: getMockAIResponse(inputMessage),
                sender: 'ai',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, aiResponse])
            setIsLoading(false)
        }, 1000 + Math.random() * 2000) // Random delay between 1-3 seconds
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    return (
        <Container maxW="container.lg" py={8}>
            <VStack spacing={6} align="stretch">
                <Box textAlign="center">
                    <Heading size="lg" color="red.600" mb={2}>
                        URA AI Assistant
                    </Heading>
                    <Text color="gray.600">
                        Chat with our AI about urban planning, development guidelines, and the Draft Master Plan 2025
                    </Text>
                </Box>

                <Box
                    border="1px"
                    borderColor="gray.200"
                    borderRadius="lg"
                    bg="white"
                    h="600px"
                    display="flex"
                    flexDirection="column"
                >
                    {/* Messages Area */}
                    <Box
                        flex="1"
                        overflowY="auto"
                        p={4}
                        css={{
                            '&::-webkit-scrollbar': {
                                width: '4px',
                            },
                            '&::-webkit-scrollbar-track': {
                                width: '6px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: 'gray.300',
                                borderRadius: '24px',
                            },
                        }}
                    >
                        <VStack spacing={4} align="stretch">
                            {messages.map((message) => (
                                <Box
                                    key={message.id}
                                    alignSelf={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                                    maxW="70%"
                                >
                                    <HStack
                                        spacing={3}
                                        bg={message.sender === 'user' ? 'red.500' : 'gray.100'}
                                        color={message.sender === 'user' ? 'white' : 'black'}
                                        p={3}
                                        borderRadius="lg"
                                        boxShadow="sm"
                                    >
                                        {message.sender === 'ai' && (
                                            <Avatar
                                                size="sm"
                                                bg="red.500"
                                                icon={<ChatIcon />}
                                            />
                                        )}
                                        <Box>
                                            <Text fontSize="sm">
                                                {message.text}
                                            </Text>
                                            <Text
                                                fontSize="xs"
                                                color={message.sender === 'user' ? 'red.100' : 'gray.500'}
                                                mt={1}
                                            >
                                                {message.timestamp.toLocaleTimeString([], { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </Text>
                                        </Box>
                                        {message.sender === 'user' && (
                                            <Avatar
                                                size="sm"
                                                bg="white"
                                                color="red.500"
                                                name="You"
                                            />
                                        )}
                                    </HStack>
                                </Box>
                            ))}
                            
                            {isLoading && (
                                <Box alignSelf="flex-start" maxW="70%">
                                    <HStack spacing={3} bg="gray.100" p={3} borderRadius="lg">
                                        <Avatar size="sm" bg="red.500" icon={<ChatIcon />} />
                                        <Spinner size="sm" color="red.500" />
                                        <Text fontSize="sm" color="gray.600">
                                            AI is typing...
                                        </Text>
                                    </HStack>
                                </Box>
                            )}
                            
                            <div ref={messagesEndRef} />
                        </VStack>
                    </Box>

                    <Divider />

                    {/* Input Area */}
                    <Box p={4}>
                        <HStack spacing={3}>
                            <Input
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me about URA, urban planning, or the Draft Master Plan 2025..."
                                size="md"
                                disabled={isLoading}
                            />
                            <Button
                                colorScheme="red"
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                leftIcon={<ArrowForwardIcon />}
                            >
                                Send
                            </Button>
                        </HStack>
                    </Box>
                </Box>

                <Box textAlign="center">
                    <Text fontSize="sm" color="gray.500">
                        This is a demonstration AI chatbot. For official URA information, please visit the <a href="https://www.ura.gov.sg" target="_blank" rel="noopener noreferrer" style={{ color: "#E53E3E", textDecoration: "underline", fontWeight: "bold" }}>URA website</a> or contact them directly.
                    </Text>
                </Box>
            </VStack>
        </Container>
    )
}

export default AIChatbot 