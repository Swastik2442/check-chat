import { createStore } from "zustand/vanilla";
import { StreamId } from "@convex-dev/persistent-text-streaming";
import { Doc } from "~/dataModel";

export type ChatState = {
  isNew: boolean;
  currentMessage: string;
  drivenStreamIds: Set<StreamId>;
} & Partial<Doc<"chats">>;
export type ChatActions = {
  startNewChat: () => void;
  setChat: (chat: Doc<"chats">) => void;
  setCurrentMessage: (message: string) => void;
  addDrivenStreamId: (id: StreamId) => void;
};
export type ChatStore = ChatState & ChatActions;

export const defaultInitState: ChatState = {
  isNew: true,
  currentMessage: '',
  drivenStreamIds: new Set()
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
    setCurrentMessage: (currentMessage) => set({ currentMessage }),
    addDrivenStreamId: (id) => set((s) => ({ drivenStreamIds: new Set(...s.drivenStreamIds, id) as Set<StreamId> }))
  }));
}
