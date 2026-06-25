import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "./_app";

export default function Index() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    router.replace(user ? "/today" : "/login");
  }, [user]);
  return null;
}
