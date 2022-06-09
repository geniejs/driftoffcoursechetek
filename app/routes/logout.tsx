/** @jsxRuntime classic */
/** @jsx jsx */
import { signOut, getAuth } from "firebase/auth";
import type { ActionFunction } from "@remix-run/cloudflare";
import {
  useFetcher,
  useNavigate,
  useSearchParams,
  useTransition,
} from "@remix-run/react";
import { useEffect } from "react";
import { logout } from "~/utils";
import { cookieName } from "~/config";
import LoadingSpinner from '~/components/LoadingSpinner';
export let action: ActionFunction = async ({ request }) => {
  return new Response("...", {
    headers: {
      "Set-Cookie": `${cookieName}='';Max-Age=0; path=/;`,
    },
  });
};
export default function Logout() {
  const auth = getAuth();
  const transition = useTransition();
  const fetcher = useFetcher();
  const [searchParams] = useSearchParams();

  let navigate = useNavigate();
  useEffect(() => {
    const sendTo = searchParams.get("sendto") || "/";

    if (fetcher.type === "init") {
      logout(fetcher);
    }
    if (fetcher.data && transition.state === "idle") {
      signOut(auth).finally(() => {
        navigate(sendTo);
      });
    }
  }, [auth, fetcher, navigate, searchParams, transition.state]);
	return (
		<div className="logout">
			{fetcher.state !== 'idle' && <LoadingSpinner />}
		</div>
	);
}
