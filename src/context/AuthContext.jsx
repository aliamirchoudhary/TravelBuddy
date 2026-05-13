import { createContext, useContext } from 'react'
import useAuthStore from '../store/authStore'

const AuthContext = createContext(null)

/**
 * AuthProvider wraps the app and syncs Zustand auth state
 * into React context for components that need it.
 */
export function AuthProvider({ children }) {
  const user = useAuthStore(s => s.user)
  const accessToken = useAuthStore(s => s.accessToken)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const isLoading = useAuthStore(s => s.isLoading)
  const login = useAuthStore(s => s.login)
  const logout = useAuthStore(s => s.logout)

  const value = {
    user,
    token: accessToken,
    accessToken,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)