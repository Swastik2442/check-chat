import ChatHistory from "./chatHistory";
import UserInfo from "./userInfo";

function SidePanel() {
  return (
    <div className="flex flex-col w-[17.5vw] border-r">
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        <ChatHistory />
      </div>
      <div className="shrink-0 p-4 border-t">
        <UserInfo />
      </div>
    </div>
  );
}

export default SidePanel;
