import { useSelector, useDispatch } from 'react-redux'
import { useCallback } from 'react'
import {
  createUser,
  getAllUsers,
  getUserById,
  getUserByClerkId,
  updateUser,
  deleteUser,
  handleClerkWebhook,
  clearError,
  clearUser,
  setUserFromClerk,
  setLoading,
  setAuthenticated,
  setToken,
  selectAuth,
  selectUser,
  selectUsers,
  selectIsAuthenticated,
  selectIsLoading,
  selectError,
  selectToken
} from '../app/features/authSlice'

// Custom hook for authentication
export const useAuth = () => {
  const dispatch = useDispatch()
  
  // Selectors
  const auth = useSelector(selectAuth)
  const user = useSelector(selectUser)
  const users = useSelector(selectUsers)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isLoading = useSelector(selectIsLoading)
  const error = useSelector(selectError)
  const token = useSelector(selectToken)

  // Action creators wrapped with useCallback for performance
  const handleCreateUser = useCallback((userData) => {
    return dispatch(createUser(userData))
  }, [dispatch])

  const handleGetAllUsers = useCallback(() => {
    return dispatch(getAllUsers())
  }, [dispatch])

  const handleGetUserById = useCallback((userId) => {
    return dispatch(getUserById(userId))
  }, [dispatch])

  const handleGetUserByClerkId = useCallback((clerkId) => {
    return dispatch(getUserByClerkId(clerkId))
  }, [dispatch])

  const handleUpdateUser = useCallback((clerkId, userData) => {
    return dispatch(updateUser({ clerkId, userData }))
  }, [dispatch])

  const handleDeleteUser = useCallback((clerkId) => {
    return dispatch(deleteUser(clerkId))
  }, [dispatch])

  const handleClerkWebhookAction = useCallback((eventData) => {
    return dispatch(handleClerkWebhook(eventData))
  }, [dispatch])

  const handleClearError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  const handleClearUser = useCallback(() => {
    dispatch(clearUser())
  }, [dispatch])

  const handleSetUserFromClerk = useCallback((userData) => {
    dispatch(setUserFromClerk(userData))
  }, [dispatch])

  const handleSetLoading = useCallback((loading) => {
    dispatch(setLoading(loading))
  }, [dispatch])

  const handleSetAuthenticated = useCallback((authenticated) => {
    dispatch(setAuthenticated(authenticated))
  }, [dispatch])

  const handleSetToken = useCallback((token) => {
    dispatch(setToken(token))
  }, [dispatch])

  return {
    // State
    auth,
    user,
    users,
    isAuthenticated,
    isLoading,
    error,
    token,
    
    // Actions
    createUser: handleCreateUser,
    getAllUsers: handleGetAllUsers,
    getUserById: handleGetUserById,
    getUserByClerkId: handleGetUserByClerkId,
    updateUser: handleUpdateUser,
    deleteUser: handleDeleteUser,
    handleClerkWebhook: handleClerkWebhookAction,
    clearError: handleClearError,
    clearUser: handleClearUser,
    setUserFromClerk: handleSetUserFromClerk,
    setLoading: handleSetLoading,
    setAuthenticated: handleSetAuthenticated,
    setToken: handleSetToken,
  }
}

export default useAuth
