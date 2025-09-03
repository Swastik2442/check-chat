import { SidebarOpenIcon } from "lucide-react";
import ChatHistory from "./chatHistory";
import UserInfo from "./userInfo";

function SidePanel() {
  return (
    <div className="group/outer flex">
      <div className="w-0 flex flex-col transition-[width] group-hover/outer:w-[17.5vw] group-focus-within/outer:w-[17.5vw] group-focus-visible/outer:w-[17.5vw] group-hover/outer:border-r group-focus-within/outer:border-r group-focus-visible/outer:border-r">
        <div className="flex-1 min-h-0 overflow-y-auto p-4 hidden group-hover/outer:block group-focus-within/outer:block  group-focus-visible/outer:block">
          <ChatHistory />
        </div>
        <div className="shrink-0 p-4 border-t hidden group-hover/outer:block group-focus-within/outer:block  group-focus-visible/outer:block">
          <UserInfo />
        </div>
      </div>
      <div className="h-full w-12 p-4 flex justify-center border-r group-hover/outer:border-none group-focus-within/outer:border-none group-focus-visible/outer:border-none">
        <SidebarOpenIcon className="group-hover/outer:hidden group-focus-within/outer:hidden group-focus-visible/outer:hidden" />
      </div>
    </div>
  );
}

export default SidePanel;
