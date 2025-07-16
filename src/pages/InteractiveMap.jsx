import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Box, Heading, Text, Container, VStack, HStack, Button, useToast, Spinner, Alert, AlertIcon, Badge, IconButton, useDisclosure } from '@chakra-ui/react'
import { AddIcon, SearchIcon, RepeatIcon } from '@chakra-ui/icons'
import 'leaflet/dist/leaflet.css'
import { useAuth } from '../contexts/AuthContext.jsx'
import { mapService } from '../services/mapService.js'
import AddMarkerForm from '../components/AddMarkerForm.jsx'
import ErrorBoundary from '../components/ErrorBoundary.jsx'
import L from 'leaflet'

// Fix for default markers in leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Singapore bounds
const SINGAPORE_BOUNDS = [
  [1.2, 103.6], // Southwest
  [1.5, 104.1]  // Northeast
]

const InteractiveMap = () => {
  const { user, loading: authLoading, refreshSession } = useAuth()
  const toast = useToast()
  
  // Debug logging
  useEffect(() => {
    console.log('InteractiveMap - User state:', { user, authLoading })
  }, [user, authLoading])
  
  const mapRef = useRef(null)
  const mapContainerRef = useRef(null)
  const handleDeleteMarkerRef = useRef(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Function to ensure map dragging is enabled
  const ensureMapDragging = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.dragging.enable()
      mapRef.current.touchZoom.enable()
      mapRef.current.scrollWheelZoom.enable()
      mapRef.current.doubleClickZoom.enable()
      mapRef.current.boxZoom.enable()
      mapRef.current.keyboard.enable()
    }
  }, [])
  
  const [markers, setMarkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPosition, setSelectedPosition] = useState(null)
  const [userLocation, setUserLocation] = useState(null)

  // Initialize map - simplified and more robust
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return
    }

    console.log('Initializing map...')
    
    try {
      const newMap = L.map(mapContainerRef.current, {
        center: [1.3521, 103.8198], // Singapore center
        zoom: 11,
        maxBounds: SINGAPORE_BOUNDS,
        maxBoundsViscosity: 1.0,
        zoomControl: true,
        attributionControl: true,
        dragging: true,
        touchZoom: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(newMap)

      // Add click handler with proper event handling
      newMap.on('click', (e) => {
        console.log('Map clicked at:', e.latlng)
        handleMapClick(e.latlng)
      })

      mapRef.current = newMap
      
      // Load markers after map is ready
      setTimeout(() => {
        loadMarkers()
      }, 100)

    } catch (error) {
      console.error('Error initializing map:', error)
      setError('Failed to initialize map. Please refresh the page.')
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, []) // Empty dependency array to run only once

  const handleMapClick = useCallback(async (latlng) => {
    console.log('Map clicked - User state:', { user, authLoading })
    console.log('Click coordinates:', latlng)
    
    if (user && user.id) {
      setSelectedPosition(latlng)
      onOpen()
    } else {
      // Try to refresh the session first
      try {
        const { session, error } = await refreshSession()
        if (session?.user) {
          setSelectedPosition(latlng)
          onOpen()
        } else {
          toast({
            title: 'Login Required',
            description: 'Please log in to add contributions to the map',
            status: 'warning',
            duration: 3000,
            isClosable: true
          })
        }
      } catch (error) {
        console.error('Session refresh error:', error)
        toast({
          title: 'Login Required',
          description: 'Please log in to add contributions to the map',
          status: 'warning',
          duration: 3000,
          isClosable: true
        })
      }
    }
  }, [user, authLoading, refreshSession, onOpen, toast])

  // Load markers
  const loadMarkers = useCallback(async () => {
    if (!mapRef.current) return
    
    try {
      setLoading(true)
      const data = await mapService.getMarkers()
      setMarkers(data)
      renderMarkers(data)
      setError(null)
      
      // Ensure map dragging is still enabled after loading markers
      ensureMapDragging()
    } catch (err) {
      console.error('Error loading markers:', err)
      setError('Failed to load map contributions. Please refresh the page.')
      toast({
        title: 'Error',
        description: 'Failed to load map contributions',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    } finally {
      setLoading(false)
    }
  }, [toast, ensureMapDragging])

  // Render markers with proper cleanup
  const renderMarkers = useCallback((markersData) => {
    if (!mapRef.current) return

    // Store existing markers to avoid removing them unnecessarily
    const existingMarkers = new Map()
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer.markerId) {
        existingMarkers.set(layer.markerId, layer)
      }
    })

    // Add new markers or update existing ones
    markersData.forEach(markerData => {
      try {
        const existingMarker = existingMarkers.get(markerData.id)
        
        if (existingMarker) {
          // Update existing marker position if needed
          const newLatLng = L.latLng(markerData.latitude, markerData.longitude)
          if (!existingMarker.getLatLng().equals(newLatLng)) {
            existingMarker.setLatLng(newLatLng)
          }
          
          // Update popup content
          const popupContent = createPopupContent(markerData)
          existingMarker.bindPopup(popupContent)
          
          // Remove from existing markers map to avoid deletion
          existingMarkers.delete(markerData.id)
        } else {
          // Create new marker
          const marker = L.marker([markerData.latitude, markerData.longitude])
          marker.markerId = markerData.id // Store marker ID for future reference
          
          const popupContent = createPopupContent(markerData)
          marker.bindPopup(popupContent)
          
          marker.addTo(mapRef.current)
        }
      } catch (error) {
        console.error('Error rendering marker:', error, markerData)
      }
    })

    // Remove markers that no longer exist
    existingMarkers.forEach((marker) => {
      mapRef.current.removeLayer(marker)
    })
    
    // Ensure map dragging is still enabled after marker operations
    ensureMapDragging()
  }, [ensureMapDragging])

  const createPopupContent = useCallback((markerData) => {
    const div = document.createElement('div')
    div.innerHTML = `
      <div style="padding: 8px; max-width: 300px;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #2d3748;">${markerData.title}</h3>
        <p style="margin: 0 0 8px 0; color: #4a5568; font-size: 14px;">${markerData.description || ''}</p>
        <div style="font-size: 12px; color: #718096;">
          <span>by Anonymous</span>
          <span style="margin-left: 8px; background: #3182ce; color: white; padding: 2px 6px; border-radius: 4px;">
            ${new Date(markerData.created_at).toLocaleDateString('en-SG')}
          </span>
        </div>
        ${markerData.media_urls && markerData.media_urls.length > 0 ? `
          <div style="margin-top: 8px;">
            <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 500;">Media (${markerData.media_urls.length})</p>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
              ${markerData.media_urls.map((url, index) => {
                const mediaType = markerData.media_types?.[index] || 'image'
                if (mediaType === 'image') {
                  return `<img src="${url}" alt="Media ${index + 1}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #e2e8f0;">`
                } else {
                  return `<div style="width: 60px; height: 60px; background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #4a5568;">
                    ${mediaType === 'video' ? '🎥' : '🎵'}
                  </div>`
                }
              }).join('')}
            </div>
          </div>
        ` : ''}
        ${user && user.id === markerData.user_id ? `
          <div style="margin-top: 8px; text-align: right;">
            <button id="delete-btn-${markerData.id}" style="background: #e53e3e; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer;">
              Delete
            </button>
          </div>
        ` : ''}
      </div>
    `
    
    // Add delete functionality using event listeners instead of global functions
    if (user && user.id === markerData.user_id) {
      // Use setTimeout to ensure the DOM element is created
      setTimeout(() => {
        const deleteBtn = div.querySelector(`#delete-btn-${markerData.id}`)
        if (deleteBtn) {
          deleteBtn.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            // Use a ref to access the current handleDeleteMarker function
            if (handleDeleteMarkerRef.current) {
              handleDeleteMarkerRef.current(markerData.id)
            }
            // Ensure map dragging is still enabled after delete operation
            ensureMapDragging()
          })
        }
      }, 0)
    }
    
    return div
  }, [user, ensureMapDragging])

  // Setup realtime subscription
  useEffect(() => {
    if (!mapRef.current) return

    const subscription = mapService.subscribeToMarkers((payload) => {
      if (payload.eventType === 'INSERT') {
        // Add new marker
        setMarkers(prev => {
          const newMarkers = [payload.new, ...prev]
          renderMarkers(newMarkers)
          return newMarkers
        })
        toast({
          title: 'New Contribution',
          description: `${payload.new.title} has been added to the map!`,
          status: 'info',
          duration: 3000,
          isClosable: true
        })
      } else if (payload.eventType === 'UPDATE') {
        // Update existing marker
        setMarkers(prev => {
          const updatedMarkers = prev.map(marker => 
            marker.id === payload.new.id ? payload.new : marker
          )
          renderMarkers(updatedMarkers)
          return updatedMarkers
        })
      } else if (payload.eventType === 'DELETE') {
        // Remove deleted marker
        setMarkers(prev => {
          const filteredMarkers = prev.filter(marker => marker.id !== payload.old.id)
          renderMarkers(filteredMarkers)
          return filteredMarkers
        })
      }
    })

    return () => {
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe()
      }
    }
  }, [renderMarkers, toast])

  const handleMarkerAdded = useCallback(() => {
    // Hacky fix: refresh the page after adding a marker to ensure everything works properly
    toast({
      title: 'Contribution Added!',
      description: 'Refreshing page to update the map...',
      status: 'success',
      duration: 2000,
      isClosable: true
    })
    
    // Small delay to show the toast, then refresh
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  }, [toast])

  const handleDeleteMarker = useCallback(async (markerId) => {
    try {
      await mapService.deleteMarker(markerId)
      setMarkers(prev => {
        const filteredMarkers = prev.filter(marker => marker.id !== markerId)
        renderMarkers(filteredMarkers)
        return filteredMarkers
      })
      
      // Ensure map dragging is still enabled after delete operation
      ensureMapDragging()
      
      toast({
        title: 'Success',
        description: 'Contribution deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
    } catch (error) {
      console.error('Error deleting marker:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete contribution',
        status: 'error',
        duration: 3000,
        isClosable: true
      })
    }
  }, [renderMarkers, toast, ensureMapDragging])

  // Store the function in a ref so it can be accessed by createPopupContent
  useEffect(() => {
    handleDeleteMarkerRef.current = handleDeleteMarker
  }, [handleDeleteMarker])

  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation([latitude, longitude])
          
          // Fly to user location
          if (mapRef.current) {
            mapRef.current.flyTo([latitude, longitude], 15)
          }
          
          toast({
            title: 'Location Found',
            description: 'Your location has been set on the map',
            status: 'success',
            duration: 3000,
            isClosable: true
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          toast({
            title: 'Location Error',
            description: 'Unable to get your location. Please check your browser settings.',
            status: 'error',
            duration: 3000,
            isClosable: true
          })
        }
      )
    } else {
      toast({
        title: 'Not Supported',
        description: 'Geolocation is not supported by your browser',
        status: 'warning',
        duration: 3000,
        isClosable: true
      })
    }
  }, [toast])

  const flyToSingapore = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.fitBounds(SINGAPORE_BOUNDS)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading as="h1" size="xl" color="gray.800" mb={2}>
            Interactive Map of Singapore
          </Heading>
          <Text fontSize="lg" color="gray.600" mb={4}>
            Collaboratively build your dream Singapore. Click anywhere on the map to add your contribution!
          </Text>
          
          <HStack spacing={4} mb={4}>
            <Badge colorScheme="blue" fontSize="md" p={2}>
              {markers.length} Contributions
            </Badge>
            {user && user.id && (
              <Badge colorScheme="green" fontSize="md" p={2}>
                Logged in as {user.email}
              </Badge>
            )}
          </HStack>

          <HStack spacing={3}>
            <Button
              leftIcon={<SearchIcon />}
              onClick={getUserLocation}
              colorScheme="blue"
              variant="outline"
              size="sm"
            >
              My Location
            </Button>
            <Button
              leftIcon={<RepeatIcon />}
              onClick={flyToSingapore}
              colorScheme="gray"
              variant="outline"
              size="sm"
            >
              View All Singapore
            </Button>
            <Button
              leftIcon={<RepeatIcon />}
              onClick={loadMarkers}
              colorScheme="gray"
              variant="outline"
              size="sm"
              isLoading={loading}
            >
              Refresh
            </Button>
          </HStack>
        </Box>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Box
          position="relative"
          height="600px"
          borderRadius="lg"
          overflow="hidden"
          border="1px solid"
          borderColor="gray.200"
          boxShadow="lg"
        >
          {loading && (
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              zIndex={1000}
              bg="white"
              p={4}
              borderRadius="md"
              boxShadow="md"
            >
              <VStack spacing={2}>
                <Spinner size="lg" color="blue.500" />
                <Text>Loading map contributions...</Text>
              </VStack>
            </Box>
          )}

          <ErrorBoundary>
            <div
              ref={mapContainerRef}
              style={{ height: '100%', width: '100%' }}
            />
          </ErrorBoundary>

          {/* Floating action button for adding markers */}
          {user && user.id && (
            <Box
              position="absolute"
              bottom={4}
              right={4}
              zIndex={1000}
            >
              <IconButton
                icon={<AddIcon />}
                colorScheme="blue"
                size="lg"
                isRound
                onClick={() => {
                  setSelectedPosition(null)
                  onOpen()
                }}
                boxShadow="lg"
                _hover={{ transform: 'scale(1.1)' }}
                transition="all 0.2s"
              />
            </Box>
          )}
        </Box>

        {/* Instructions */}
        <Box bg="blue.50" p={4} borderRadius="md">
          <Text fontSize="sm" color="blue.800">
            <strong>How to use:</strong> Click anywhere on the map to add your contribution. 
            You can include text descriptions and upload images, videos, or audio files. 
            All contributions are shared in real-time with other participants.
          </Text>
        </Box>
      </VStack>

      {/* Add Marker Form Modal */}
      <AddMarkerForm
        isOpen={isOpen}
        onClose={onClose}
        position={selectedPosition}
        onMarkerAdded={handleMarkerAdded}
      />
    </Container>
  )
}

export default InteractiveMap 