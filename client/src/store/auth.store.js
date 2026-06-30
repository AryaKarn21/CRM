import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      activeCompany: null,
      companies: [],

      setAuth: ({ user, token, companies }) => {
        set({
          user,
          token,
          companies,
          activeCompany: companies?.[0]?.id || null,
        })
      },
      refreshCompanies: (companies) => {
        set((state) => ({
          companies,
          activeCompany:
            companies.find(c => c.id === state.activeCompany)?.id ||
            companies[0]?.id ||
            null,
        }))
      },
      setActiveCompany: (companyId) => set({ activeCompany: companyId }),

      logout: () => set({ user: null, token: null, activeCompany: null, companies: [] }),

      isAuthenticated: () => !!get().token,

      hasRole: (roles) => {
        const user = get().user
        if (!user) return false
        return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles
      },
    }),
    {
      name: 'crm-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        activeCompany: state.activeCompany,
        companies: state.companies,
      }),
    }
  )
)