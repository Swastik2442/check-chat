"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

export default function useConvexAuthToken() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["clerk-convex-token"],
    queryFn: () => getToken({ template: "convex" }),
  });
}
