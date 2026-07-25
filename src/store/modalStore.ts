import { create } from 'zustand'

type GlobalModalState = {
    isOpen: boolean
    title: string
    message: string
    openModal: (title: string, message: string) => void
    closeModal: () => void
}

export const useGlobalErrorModal = create<GlobalModalState>((set) => ({
    isOpen: false,
    title: '',
    message: '',
    openModal: (title, message) => set({ isOpen: true, title, message }),
    closeModal: () => set({ isOpen: false, title: '', message: '' }),
}))