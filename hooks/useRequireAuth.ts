import { useEffect } from "react";
import { useRouter } from "next/router";
import { useCurrentUser } from "@/hooks/useAuth";
import type { Role } from "@/generated/prisma/client";

export function useRequireAuth(allowedRoles?: Role[]) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (isLoading) return;
    if (isError || !user) {
      router.replace(`/auth/login?next=${encodeURIComponent(router.asPath)}`);
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace("/auth/login");
    }
  }, [isLoading, isError, user, allowedRoles, router]);

  const isAuthorized = !!user && (!allowedRoles || allowedRoles.includes(user.role));

  return { user, isLoading, isAuthorized };
}
