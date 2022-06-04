import { useEffect, useState } from "react";
import type { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import {
  Outlet,
  useFetcher,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { isAuthenticated, getUserByRequestToken } from "~/lib/auth.server";
import type { User } from "@prisma/client";
import { UserContext } from "~/lib/react/context";

import { login } from "~/utils";

export let action: ActionFunction = async ({ request, context }) => {
  if (!(await isAuthenticated(request))) return redirect("/login");
  const { user, created, error } = await getUserByRequestToken(request, true);
  if (error) {
    return json({ error });
  }
  return json({ ...user, created });
};

export let loader: LoaderFunction = async ({ request, context }) => {
  const { user } = await getUserByRequestToken(request);
  return { user };
};

export default function Account() {
  let navigate = useNavigate();
  const { user } = useLoaderData<{ user?: User }>();
  const authLoading = false;
  const fbUser = null;
  const fetcher = useFetcher();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const allowAnonPathnames = ["/account/checkout"];
    const allowAnon = allowAnonPathnames.includes(window.location.pathname);
    const setupAccount = async () => {
      if (!user && fbUser && fetcher.type === "init") {
        login(fbUser, fetcher);
      } else if ((user || fetcher.data) && searchParams.get("sendto")) {
        navigate(searchParams.get("sendto") || "/", { replace: true });
      } else if (!fbUser && !authLoading && !allowAnon) {
        navigate(
          `/login?sendto=${
            searchParams.get("sendto") ||
            window.location.pathname + window.location.search
          }`,
          {
            replace: true,
          }
        );
      }
    };
    setupAccount();
  }, [fetcher, user, fbUser, navigate, searchParams, authLoading]);

  return (
    <UserContext.Provider value={{ user: user }}>
      <div className="accountAuthRefresh">
        {authLoading && "Loading..."}
        <Outlet />
      </div>
    </UserContext.Provider>
  );
}
