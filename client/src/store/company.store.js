import { create } from 'zustand'

export const useCompanyStore = create((set) => ({
  activeCompany: null,
  setActiveCompany: (company) => set({ activeCompany: company }),
}))