"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, ShieldCheck } from "lucide-react";
import OwnerSidebar from "@/components/owner/OwnerSidebar";
import { ownerGetMe } from "@/lib/api";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/owner/login";

  // For protected pages: null = verifying, true = has token, false = no token
  const [hasAuthToken, setHasAuthToken] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (isLoginPage) {
      // If already logged in, seamlessly forward to dashboard
      const token = typeof window !== "undefined" ? localStorage.getItem("owner_token") : null;
      if (token) {
        ownerGetMe().then((user) => {
          if (isMounted && user) {
            router.replace("/owner/dashboard");
          }
        });
      }
      return;
    }

    // Protected owner route
    const token = typeof window !== "undefined" ? localStorage.getItem("owner_token") : null;
    if (!token) {
      if (isMounted) {
        setHasAuthToken(false);
        router.replace("/owner/login");
      }
      return;
    }

    // Token exists in storage
    if (isMounted) {
      setHasAuthToken(true);
    }

    // Verify token validity in background
    ownerGetMe().then((user) => {
      if (!isMounted) return;
      if (!user) {
        localStorage.removeItem("owner_token");
        localStorage.removeItem("owner_user");
        setHasAuthToken(false);
        router.replace("/owner/login?reason=expired");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [pathname, isLoginPage, router]);

  // If on login page, render form immediately
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
        {children}
      </div>
    );
  }

  // If on a protected route and still verifying or unauthenticated
  if (hasAuthToken !== true) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-[#DCE3EB] flex flex-col items-center gap-4 max-w-sm w-full text-center">
          <div className="bg-[#102742] p-4 rounded-xl">
            <Image
              src="/logo.png"
              alt="The Print Planet"
              width={180}
              height={50}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#17365D]">
            <Loader2 className="w-4 h-4 animate-spin text-[#E87832]" />
            <span>Securing owner management portal...</span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#217A4B]" />
            Restricted to authorized personnel
          </p>
        </div>
      </div>
    );
  }

  // Authenticated owner layout
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col lg:flex-row">
      <OwnerSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
