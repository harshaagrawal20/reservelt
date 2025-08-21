import { useUser } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { useAuth } from '../hooks/useRedux'
import { createUser, updateUser, getUserByClerkId } from '../app/features/authSlice'

// This component handles automatic user synchronization with your backend
const ClerkUserSync = () => {
  const { user, isLoaded } = useUser()
  const { dispatch, user: reduxUser } = useAuth()

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user) return

      try {
        // First, try to get the user by Clerk ID
        const result = await dispatch(getUserByClerkId(user.id)).unwrap()
        
        // If user exists, update Redux state
        if (result) {
          return
        }
      } catch (error) {
        // User doesn't exist, try to create
        try {
          const userData = {
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            username: user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            photo: user.imageUrl || '',
          }

          await dispatch(createUser(userData)).unwrap()
        } catch (createError) {
          // If user already exists, try to update
          if (createError.includes('already exists') || createError.includes('duplicate')) {
            try {
              await dispatch(updateUser({
                userId: user.id,
                userData: {
                  firstName: user.firstName || '',
                  lastName: user.lastName || '',
                  username: user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || '',
                  photo: user.imageUrl || '',
                }
              })).unwrap()
            } catch (updateError) {
              console.error('Failed to update user:', updateError)
            }
          } else {
            console.error('Failed to create user:', createError)
          }
        }
      }
    }

    syncUser()
  }, [user, isLoaded, dispatch])

  return null // This component doesn't render anything
}

export default ClerkUserSync
