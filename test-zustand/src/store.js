import {create} from 'zustand'

const useTest = create((set) => ({
    valore: 0,
    flag: true,
    incrementa: () => set((state) => ({valore: state.valore+1}))
}))

export default useTest