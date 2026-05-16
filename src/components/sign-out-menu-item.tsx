"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/server/actions/auth";

export function SignOutMenuItem() {
  return (
    <form action={signOutAction}>
      <DropdownMenuItem asChild onSelect={(event) => event.preventDefault()}>
        <button type="submit" className="w-full text-left">
          Sign out
        </button>
      </DropdownMenuItem>
    </form>
  );
}
