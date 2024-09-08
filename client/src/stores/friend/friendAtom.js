import { atom } from "recoil";

export const friendsAtomState = atom({
    key: "friendsAtom",
    default:[]
})

export const requestsAtomState = atom({
    key: "requestsAtom",
    default:[]
})

export const selectedFieldAtomState = atom({
    key: "selectedField",
    default: "friends"
})

export const findUserAtomState = atom({
    key: "findUserAtom",
    default: []
})

export const requestedByMeAtomState = atom({
    key: "requestedByMeAtom",
    default: []
})
