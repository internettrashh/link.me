import { create } from 'zustand'

interface StoreState {
  userName: string
  setUserName: (name: string) => void
}

export const useStore = create<StoreState>((set) => ({
  userName: '',
  setUserName: (name) => set({ userName: name }),
}))