import { atom } from "recoil";

export const messageAtomState = atom({
    key: "messageAtom",
    default: ""
})

export const messagesAtomState = atom({
    key: "messagesAtom",
    default: []
})

export const isSelectedUserTypingAtomState = atom({
    key: "selectedUserTypingAtom",
    default: false
})

