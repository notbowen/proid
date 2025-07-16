import React, { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  Text,
  IconButton,
  useToast,
  Progress,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { AddIcon, CloseIcon } from '@chakra-ui/icons'
import { Attachment } from '@opengovsg/design-system-react'
import { mapService } from '../services/mapService.js'
import { useAuth } from '../contexts/AuthContext.jsx'

const AddMarkerForm = ({ isOpen, onClose, position, onMarkerAdded }) => {
  const { user, loading, refreshSession } = useAuth()
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [customToasts, setCustomToasts] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    latitude: position?.lat || 1.3521, // Singapore center
    longitude: position?.lng || 103.8198
  })

  // Custom toast function
  const showCustomToast = useCallback((title, description, status = 'info') => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = {
      id,
      title,
      description,
      status,
      timestamp: Date.now()
    }
    setCustomToasts(prev => [...prev, newToast])
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setCustomToasts(prev => prev.filter(toast => toast.id !== id))
    }, 3000)
  }, [])

  // Remove toast function
  const removeToast = useCallback((id) => {
    setCustomToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Update form data when position changes
  useEffect(() => {
    if (position) {
      setFormData(prev => ({
        ...prev,
        latitude: position.lat,
        longitude: position.lng
      }))
    }
  }, [position])
  const [portalContainer, setPortalContainer] = useState(null)

  // Debug logging
  useEffect(() => {
    console.log('AddMarkerForm - User state:', { user, loading, isOpen })
  }, [user, loading, isOpen])

  // Create portal container
  useEffect(() => {
    if (isOpen && !portalContainer) {
      const container = document.createElement('div')
      container.style.position = 'fixed'
      container.style.top = '0'
      container.style.left = '0'
      container.style.width = '100%'
      container.style.height = '100%'
      container.style.zIndex = '9999'
      document.body.appendChild(container)
      setPortalContainer(container)
    }

    return () => {
      if (portalContainer && !isOpen) {
        document.body.removeChild(portalContainer)
        setPortalContainer(null)
      }
    }
  }, [isOpen, portalContainer])

  const handleFileChange = useCallback((acceptedFiles) => {
    if (!acceptedFiles) {
      setSelectedFiles([])
      return
    }
    if (Array.isArray(acceptedFiles)) {
      setSelectedFiles(acceptedFiles)
    } else if (typeof acceptedFiles === 'object' && acceptedFiles.length !== undefined) {
      setSelectedFiles(Array.from(acceptedFiles))
    } else if (acceptedFiles instanceof File) {
      // Handle single File object
      setSelectedFiles([acceptedFiles])
    } else {
      console.warn('Unexpected file format:', acceptedFiles)
      setSelectedFiles([])
    }
  }, [])

  const handleFileRejection = useCallback((rejections) => {
    console.log('File rejections:', rejections)
    
    rejections.forEach(rejection => {
      const { file, errors } = rejection
      const errorMessages = errors.map(error => error.message).join(', ')
      
      showCustomToast('File Rejected', `${file.name}: ${errorMessages}`, 'error')
    })
  }, [showCustomToast])

  // The Attachment component handles file removal internally

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Check if user is authenticated
    if (!user || !user.id) {
      // Try to refresh the session first
      const { session, error } = await refreshSession()
      if (!session?.user || error) {
        showCustomToast('Authentication Error', 'You must be logged in to add contributions. Please log in and try again.', 'error')
        return
      }
    }
    
    if (!formData.title.trim()) {
      showCustomToast('Error', 'Please enter a title for your contribution', 'error')
      return
    }

    setIsSubmitting(true)

    try {
      // Create marker first
      const markerData = {
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        media_urls: [],
        media_types: []
      }

      const newMarker = await mapService.addMarker(markerData)

      // Upload media files if any
      if (selectedFiles.length > 0) {
        const totalFiles = selectedFiles.length
        let uploadedCount = 0

        for (const file of selectedFiles) {
          try {
            // Validate file object before uploading
            if (!file || !file.name) {
              console.error('Invalid file object:', file)
              showCustomToast('Warning', 'Invalid file object detected', 'warning')
              continue
            }
            
            const mediaData = await mapService.uploadMedia(file, newMarker.id)
            
            // Update marker with media URLs
            await mapService.updateMarker(newMarker.id, {
              media_urls: [...newMarker.media_urls, mediaData.url],
              media_types: [...newMarker.media_types, mediaData.type]
            })

            uploadedCount++
            setUploadProgress((uploadedCount / totalFiles) * 100)
          } catch (error) {
            console.error('Error uploading media:', error)
            showCustomToast('Warning', `Failed to upload ${file?.name || 'unknown file'}`, 'warning')
          }
        }
      }

      showCustomToast('Success', 'Your contribution has been added to the map!', 'success')

      // Reset form
      setFormData({
        title: '',
        description: '',
        latitude: position?.lat || 1.3521,
        longitude: position?.lng || 103.8198
      })
      setSelectedFiles([])
      onMarkerAdded()
      onClose()
    } catch (error) {
      console.error('Error adding marker:', error)
      showCustomToast('Error', 'Failed to add your contribution. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    // Clear selected files when closing
    setSelectedFiles([])
    onClose()
  }

  // Don't render if not open, no portal container, or user not authenticated
  if (!isOpen || !portalContainer || !user || !user.id) {
    return null
  }

  return createPortal(
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100%"
      height="100%"
      zIndex="9999"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* Backdrop */}
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        bg="blackAlpha.600"
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <Box
        bg="white"
        borderRadius="lg"
        boxShadow="2xl"
        maxW="600px"
        w="90%"
        maxH="90vh"
        overflow="auto"
        position="relative"
        zIndex="10000"
      >
        <Box p={6} borderBottom="1px solid" borderColor="gray.200">
          <HStack justify="space-between" align="center">
            <Text fontSize="xl" fontWeight="bold">Add Your Contribution</Text>
            <IconButton
              icon={<CloseIcon />}
              onClick={handleClose}
              variant="ghost"
              size="sm"
            />
          </HStack>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box p={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Give your contribution a title..."
                  maxLength={100}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your contribution..."
                  rows={3}
                  maxLength={500}
                />
              </FormControl>

              <HStack spacing={4} width="100%">
                <FormControl>
                  <FormLabel>Latitude</FormLabel>
                  <Input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                    placeholder="Latitude"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Longitude</FormLabel>
                  <Input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                    placeholder="Longitude"
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Media Files (Optional)</FormLabel>
                <Attachment
                  name="media-files"
                  maxSize={10 * 1024 * 1024} // 10MB
                  onChange={handleFileChange}
                  onRejection={handleFileRejection}
                  accept="image/*,video/*,audio/*"
                  showFileSize={true}
                  imagePreview="small"
                />
              </FormControl>

              {isSubmitting && uploadProgress > 0 && (
                <Box width="100%">
                  <Text fontSize="sm" mb={2}>Uploading media...</Text>
                  <Progress value={uploadProgress} colorScheme="blue" size="sm" />
                </Box>
              )}
            </VStack>
          </Box>

          <Box p={6} borderTop="1px solid" borderColor="gray.200">
            <HStack justify="flex-end" spacing={3}>
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                type="submit"
                isLoading={isSubmitting}
                loadingText="Adding..."
              >
                Add Contribution
              </Button>
            </HStack>
          </Box>
        </form>

        {/* Custom Toasts */}
        <Box position="absolute" top="20px" right="20px" zIndex="10000">
          {customToasts.map(toast => (
            <Alert
              key={toast.id}
              status={toast.status}
              variant="solid"
              borderRadius="md"
              mb={2}
              boxShadow="lg"
              maxW="300px"
            >
              <AlertIcon />
              <Box flex="1">
                <Text fontSize="sm" fontWeight="bold">{toast.title}</Text>
                <Text fontSize="xs">{toast.description}</Text>
              </Box>
              <IconButton
                icon={<CloseIcon />}
                size="xs"
                onClick={() => removeToast(toast.id)}
                variant="ghost"
                color="current"
                _hover={{ bg: 'whiteAlpha.300' }}
              />
            </Alert>
          ))}
        </Box>
      </Box>
    </Box>,
    portalContainer
  )
}

export default AddMarkerForm 