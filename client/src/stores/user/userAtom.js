import { atom, selector } from "recoil";

export const emailAtomState = atom({
  key: "emailAtom",
  default: "",
});

export const currentUserAtomState = atom({
  key: "currentUserAtom",
  default: {},
});

export const selectedUserAtomState = atom({
  key: "selectedUserAtom",
  default: {},
});

export const allUserAtomState = atom({
  key: "allUserAtom",
  default: [],
});

export const onlineUsersAtomState = atom({
  key: "onlineUserAtom",
  default: [],
});

export const selectedUserOnlineAtomState = selector({
  key: "selectedUserOnlineSelector",
  get: ({ get }) => {
    const allOnlineUsers = get(onlineUsersAtomState);
    const selectedUser = get(selectedUserAtomState);

    if (!allOnlineUsers || !selectedUser) {
      return false;
    }

    // Check if the selected user's username is in the list of online users
    return allOnlineUsers.some((user) => {
      // console.log(user, selectedUser.userName);
      return user === selectedUser.userName;
    });
  },
});
