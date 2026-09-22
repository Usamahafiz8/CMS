import { useEffect } from "react";
import { useRouter } from "next/router";
import { useCurrentUser } from "@/hooks/useAuth";

export function useRequireAuth(allowedRoles?: string[]) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (isLoading) return;
    if (isError || !user) {
      router.replace(`/auth/login?next=${encodeURIComponent(router.asPath)}`);
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role.key)) {
      router.replace("/auth/login");
    }
  }, [isLoading, isError, user, allowedRoles, router]);

  const isAuthorized = !!user && (!allowedRoles || allowedRoles.includes(user.role.key));

  return { user, isLoading, isAuthorized };
}
