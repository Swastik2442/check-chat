import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { SettingsIcon, UserCircle2Icon } from "lucide-react";

async function UserInfo() {
  const user = await currentUser();
  return (
    <>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <UserButton fallback={<UserCircle2Icon className="size-7" />} />
            <span>{user && user.fullName}</span>
          </div>
          <SettingsIcon className="size-5"/>
        </div>
      </SignedIn>
    </>
  );
}

export default UserInfo;
