import { create } from 'zustand'

interface StoreState {
  userName: string
  formattedLink: string
  formattedName: string
  shareLink: string
  undername: string | null
  setUserName: (name: string) => void
  setFormattedLink: (link: string) => void
  setFormattedName: (name: string) => void
  setShareLink: (link: string) => void
}

export const useStore = create<StoreState>((set) => ({
  userName: '',
  formattedLink: '',
  formattedName: '',
  shareLink: '',
  undername: null,
  setUserName: (name) => set({ userName: name }),
  setFormattedLink: (link) => set({ formattedLink: link }),
  setFormattedName: (name) => set({ formattedName: name }),
  setShareLink: (link) => set({ shareLink: link })
}))