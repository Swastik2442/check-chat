import { createStore } from "zustand/vanilla";
import { Doc } from "~/dataModel";

export type ChatState = {
  isNew: boolean;
  currentMessage: string;
} & Partial<Doc<"chats">>;
export type ChatActions = {
  startNewChat: () => void;
  setChat: (chat: Doc<"chats">) => void;
  setCurrentMessage: (message: string) => void;
};
export type ChatStore = ChatState & ChatActions;

export const defaultInitState: ChatState = {
  isNew: true,
  currentMessage: ''
}

export const initChatStore = (): ChatState => {
  return { ...defaultInitState };
}

export const createChatStore = (
  initState: ChatState = defaultInitState,
) => {
  return createStore<ChatStore>()((set) => ({
    ...initState,
    startNewChat: () => set({ isNew: true }),
    setChat: (chat) => set({ isNew: false, ...chat }),
    setCurrentMessage: (currentMessage) => set({ currentMessage })
  }));
}
