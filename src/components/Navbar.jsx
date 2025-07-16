'use client'

import {
    Box,
    Flex,
    Text,
    IconButton,
    Button,
    Stack,
    Collapse,
    Icon,
    Popover,
    PopoverTrigger,
    PopoverContent,
    useColorModeValue,
    useBreakpointValue,
    useDisclosure,
    Image,
    Avatar,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    useToast,
} from '@chakra-ui/react'
import {
    HamburgerIcon,
    CloseIcon,
    ChevronDownIcon,
    ChevronRightIcon,
} from '@chakra-ui/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

const Navbar = () => {
    const { isOpen, onToggle } = useDisclosure()
    const { user, signOut, loading } = useAuth()
    const navigate = useNavigate()
    const toast = useToast()

    const handleSignOut = async () => {
        try {
            const { error } = await signOut()
            if (error) {
                toast({
                    title: 'Error signing out',
                    description: error.message,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                })
            } else {
                toast({
                    title: 'Signed out successfully',
                    status: 'success',
                    duration: 2000,
                    isClosable: true,
                })
                navigate('/')
            }
        } catch (error) {
            toast({
                title: 'Error signing out',
                description: 'Please try again.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        }
    }

    return (
        <Box>
            <Flex
                bg={useColorModeValue('white', 'gray.800')}
                color={useColorModeValue('gray.600', 'white')}
                minH={'60px'}
                py={{ base: 4 }}
                px={{ base: 10, md: 12, lg: 16 }}
                borderBottom={1}
                borderStyle={'solid'}
                borderColor={useColorModeValue('gray.200', 'gray.900')}
                align={'center'}>
                <Flex
                    flex={{ base: 1, md: 'auto' }}
                    ml={{ base: -2 }}
                    display={{ base: 'flex', md: 'none' }}>
                    <IconButton
                        onClick={onToggle}
                        icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
                        variant={'ghost'}
                        aria-label={'Toggle Navigation'}
                    />
                </Flex>
                <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }} align="center">
                    <Link to="/">
                        <Image
                            src="https://isomer-user-content.by.gov.sg/87/1d6b5e88-2920-44fd-8fd0-91c4531352f8/dmp-sg60-03.webp"
                            alt="URA Draft Master Plan 2025"
                            maxH="48px"
                            maxW="128px"
                            objectFit="contain"
                            objectPosition="center"
                            mr={{ lg: 3 }}
                        />
                    </Link>
                    <Flex display={{ base: 'none', md: 'flex' }} ml={10} align="center">
                        <DesktopNav />
                    </Flex>
                </Flex>

                <Stack
                    flex={{ base: 1, md: 0 }}
                    justify={'flex-end'}
                    direction={'row'}
                    align={'center'}
                    spacing={6}>
                    {!loading && (
                        user ? (
                            <Menu>
                                <MenuButton
                                    as={Button}
                                    rounded={'full'}
                                    variant={'link'}
                                    cursor={'pointer'}
                                    minW={0}>
                                    <Avatar
                                        size={'sm'}
                                        name={user.email}
                                        src={user.user_metadata?.avatar_url}
                                    />
                                </MenuButton>
                                <MenuList>
                                    <MenuItem onClick={() => navigate('/profile')}>
                                        Profile
                                    </MenuItem>
                                    <MenuItem onClick={() => navigate('/progress-tracker')}>
                                        My Suggestions
                                    </MenuItem>
                                    <MenuDivider />
                                    <MenuItem onClick={handleSignOut}>
                                        Sign Out
                                    </MenuItem>
                                </MenuList>
                            </Menu>
                        ) : (
                            <>
                                <Button 
                                    as={Link} 
                                    to="/login"
                                    fontSize={'sm'} 
                                    fontWeight={500} 
                                    color={'gray.600'} 
                                    variant={'link'}
                                >
                                    Sign In
                                </Button>
                                <Button
                                    as={Link}
                                    to="/signup"
                                    display={{ base: 'none', md: 'inline-flex' }}
                                    fontSize={'sm'}
                                    fontWeight={600}
                                    color={'white'}
                                    bg={'red.400'}
                                    border={'none'}
                                    _hover={{
                                        bg: 'red.300',
                                    }}>
                                    Sign Up
                                </Button>
                            </>
                        )
                    )}
                </Stack>
            </Flex>

            <Collapse in={isOpen} animateOpacity>
                <MobileNav />
            </Collapse>
        </Box>
    )
}

const DesktopNav = () => {
    const linkColor = useColorModeValue('gray.600', 'gray.200')
    const linkHoverColor = useColorModeValue('gray.800', 'white')
    const popoverContentBgColor = useColorModeValue('white', 'gray.800')

    return (
        <Stack direction={'row'} spacing={4}>
            {NAV_ITEMS.map((navItem) => (
                <Box key={navItem.label}>
                    <Popover trigger={'hover'} placement={'bottom-start'}>
                        <PopoverTrigger>
                            <Box
                                as="a"
                                p={2}
                                href={navItem.href ?? '#'}
                                fontSize={'sm'}
                                fontWeight={500}
                                color={linkColor}
                                _hover={{
                                    textDecoration: 'none',
                                    color: linkHoverColor,
                                }}
                                display="flex"
                                alignItems="center"
                                gap={1}>
                                {navItem.label}
                                {navItem.children && (
                                    <Icon as={ChevronDownIcon} w={3} h={3} />
                                )}
                            </Box>
                        </PopoverTrigger>

                        {navItem.children && (
                            <PopoverContent
                                border={0}
                                boxShadow={'xl'}
                                bg={popoverContentBgColor}
                                p={4}
                                rounded={'xl'}
                                minW={'sm'}>
                                <Stack>
                                    {navItem.children.map((child) => (
                                        <DesktopSubNav key={child.label} {...child} />
                                    ))}
                                </Stack>
                            </PopoverContent>
                        )}
                    </Popover>
                </Box>
            ))}
        </Stack>
    )
}

const DesktopSubNav = ({ label, href, subLabel }) => {
    return (
        <Box
            as={Link}
            to={href}
            role={'group'}
            display={'block'}
            p={2}
            rounded={'md'}
            _hover={{ bg: useColorModeValue('red.50', 'gray.900') }}>
            <Stack direction={'row'} align={'center'}>
                <Box>
                    <Text
                        transition={'all .3s ease'}
                        _groupHover={{ color: 'red.400' }}
                        fontWeight={500}>
                        {label}
                    </Text>
                    <Text fontSize={'sm'}>{subLabel}</Text>
                </Box>
                <Flex
                    transition={'all .3s ease'}
                    transform={'translateX(-10px)'}
                    opacity={0}
                    _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
                    justify={'flex-end'}
                    align={'center'}
                    flex={1}>
                    <Icon color={'red.400'} w={5} h={5} as={ChevronRightIcon} />
                </Flex>
            </Stack>
        </Box>
    )
}

const MobileNav = () => {
    return (
        <Stack bg={useColorModeValue('white', 'gray.800')} p={4} display={{ md: 'none' }}>
            {NAV_ITEMS.map((navItem) => (
                <MobileNavItem key={navItem.label} {...navItem} />
            ))}
        </Stack>
    )
}

const MobileNavItem = ({ label, children, href }) => {
    const { isOpen, onToggle } = useDisclosure()

    return (
        <Stack spacing={4} onClick={children && onToggle}>
            <Box
                py={2}
                as={href ? Link : 'div'}
                to={href}
                justifyContent="space-between"
                alignItems="center"
                _hover={{
                    textDecoration: 'none',
                }}>
                <Text fontWeight={600} color={useColorModeValue('gray.600', 'gray.200')}>
                    {label}
                </Text>
                {children && (
                    <Icon
                        as={ChevronDownIcon}
                        transition={'all .25s ease-in-out'}
                        transform={isOpen ? 'rotate(180deg)' : ''}
                        w={6}
                        h={6}
                    />
                )}
            </Box>

            <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
                <Stack
                    mt={2}
                    pl={4}
                    borderLeft={1}
                    borderStyle={'solid'}
                    borderColor={useColorModeValue('gray.200', 'gray.700')}
                    align={'start'}>
                    {children &&
                        children.map((child) => (
                            <Box as={Link} key={child.label} py={2} to={child.href}>
                                {child.label}
                            </Box>
                        ))}
                </Stack>
            </Collapse>
        </Stack>
    )
}

const NAV_ITEMS = [
    {
        label: 'About Us',
        href: '#',
    },
    {
        label: 'Exhibitions',
        href: '#',
    },
    {
        label: 'Feedback',
        href: '#',
    },
    {
        label: 'Outreach',
        children: [
            {
                label: 'Interactive Map',
                subLabel: 'Collaboratively build your dream Singapore',
                href: '/interactive-map',
            },
            {
                label: 'Suggest',
                subLabel: 'Send in your suggestion to URA!',
                href: '/suggest',
            },
            {
                label: 'Progress Tracker',
                subLabel: 'Track your suggestion\'s progress',
                href: '/progress-tracker',
            },
            {
                label: 'AI Chatbot',
                subLabel: 'Chat with our AI about URA and urban planning',
                href: '/ai-chatbot',
            },
        ],
    },
]

export default Navbar