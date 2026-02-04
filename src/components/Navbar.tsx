"use client";

import { auth} from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, _] = useAuthState(auth);
  let router = useRouter();
  return (
    <nav className="fixed top-0 w-full z-10 border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="mx-auto px-4 h-16 flex items-center justify-between">
        <div className="text-xl font-bold tracking-tighter text-white">
          <Link href="/">Pagecord</Link>
        </div>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <Button
                variant="ghost"
                className="text-white hover:text-gray-300"
                onClick={() => {
                  signOut(auth);
                  router.push("/");
                }}
              >
                Logout
              </Button>
              <Button
                variant="default"
                className="bg-white text-black hover:bg-gray-200"
              >
                <Link href="/me">friends</Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="text-white hover:text-gray-300"
              >
                <Link href="/login">Login</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
