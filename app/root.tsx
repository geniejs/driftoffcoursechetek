import type { MetaFunction } from "@remix-run/cloudflare";
import type { LinksFunction } from "@remix-run/cloudflare";
import firebaseStyles from "firebaseui/dist/firebaseui.css";
import { getFirebaseClient } from "./lib/firebase/firebase";

import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useCatch,
	useLocation,
	useTransition,
} from '@remix-run/react';

import innerMoonToggle from '@theme-toggles/react/css/InnerMoon.css';
import React, { useEffect, useState } from 'react';
import SiteLayout from './components/SiteLayout';
import { RootContext } from './lib/react/context';
import { isClient } from './utils';
import classNames from 'classnames';
import tailwindcss from './tailwind.css';
import LoadingSpinner from './components/LoadingSpinner';
if (!tailwindcss) {
	throw new Error(
		process.env.NODE_ENV === 'production'
			? 'CSS file not found.'
			: `Tailwind "CSS file not found." Please run "npm run build:tailwind"`
	);
}

export let links: LinksFunction = () => {
	return [
		{
			rel: 'preconnect',
			href: '//fonts.gstatic.com',
			crossOrigin: 'anonymous',
		},
		{ rel: 'stylesheet', href: tailwindcss },
		{
			rel: 'stylesheet',
			href: '//fonts.googleapis.com/css?family=Work+Sans:300,400,600,700&amp;lang=en',
		},
		{
			rel: 'stylesheet',
			href: innerMoonToggle,
		},
		{
			rel: 'icon',
			type: 'image/x-icon',
			href: '/favicon.png',
		},
		{ rel: 'stylesheet', href: firebaseStyles },
	];
};

export let meta: MetaFunction = () => {
	return {
		title: 'Drift Off Course',
		description: 'Chetek, WI Boat Rental',
	};
};
export default function App() {
	getFirebaseClient();
	return (
		<Document>
			<Layout>
				<SiteLayout>
					<Outlet />
				</SiteLayout>
			</Layout>
		</Document>
	);
}

function Document({
	children,
	title,
}: {
	children: React.ReactNode;
	title?: string;
}) {
	const prefersDark =
		isClient && window.matchMedia('(prefers-color-scheme: dark)').matches;
	const [darkTheme, setDarkTheme] = useState(false);
	const [theme, setTheme] = useState<string>();
	const transition = useTransition();

	useEffect(() => {
		let storageTheme = localStorage.getItem('theme');
		if (!storageTheme) {
			storageTheme = prefersDark ? 'dark' : 'light';
			localStorage.setItem('theme', storageTheme);
		}

		setDarkTheme(storageTheme === 'dark');
	}, [darkTheme, prefersDark]);

	useEffect(() => {
		setTheme(darkTheme ? 'dark' : 'cupcake');
	}, [darkTheme]);

	const toggleDarkMode = () => {
		localStorage.setItem(
			'theme',
			localStorage.getItem('theme') === 'light' ? 'dark' : 'light'
		);
		setDarkTheme(localStorage.getItem('theme') === 'dark');
	};
	// useEffect(() => {
	// 	function debugAccess(
	// 		obj: Record<string, any>,
	// 		prop: string,
	// 		debugGet = false
	// 	) {
	// 		var origValue = obj[prop];
	// 		Object.defineProperty(obj, prop, {
	// 			get: function () {
	// 				if (debugGet) console.log('get origValue :>> ', origValue);
	// 				return origValue;
	// 			},
	// 			set: function (val) {
	// 				console.log('set origValue, val :>> ', origValue, val);
	// 				return (origValue = val);
	// 			},
	// 		});
	// 	}
	// 	debugAccess(document, 'cookie', true);
	// }, []);

	// const matches = useMatches();
	// const useWhenSomethingIsTrue = matches.some(match => match.handle && match.handle?.something)
	return (
		<RootContext.Provider value={{ darkmode: darkTheme, toggleDarkMode }}>
			<html
				className={classNames({
					visible: theme,
					invisible: !theme,
					dark: darkTheme,
				})}
				data-theme={theme}
				lang="en"
				suppressHydrationWarning={true}
			>
				<head>
					<meta charSet="utf-8" />
					<meta name="viewport" content="width=device-width,initial-scale=1" />
					{title ? <title>{title}</title> : null}
					<Meta />
					<Links />
				</head>
				<body
					className={classNames('min-h-screen  bg-[length:100%] bg-no-repeat', {
						'bg-layered-waves-dark': darkTheme,
						'bg-layered-waves-light': !darkTheme,
					})}
				>
					{transition?.state !== 'idle' && <LoadingSpinner />}
					{children}
					<RouteChangeAnnouncement />
					<ScrollRestoration />
					<Scripts />
					{process.env.NODE_ENV === 'development' && <LiveReload />}
				</body>
			</html>
		</RootContext.Provider>
	);
}

function Layout({ children }: React.PropsWithChildren<{}>) {
  return <div className="remix-root remix-app">{children}</div>;
}

export function CatchBoundary() {
  let caught = useCatch();

  let message;
  switch (caught.status) {
    case 401:
      message = (
        <p>
          Oops! Looks like you tried to visit a page that you do not have access
          to.
        </p>
      );
      break;
    case 404:
      message = (
        <p>Oops! Looks like you tried to visit a page that does not exist.</p>
      );
      break;

    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <Layout>
        <h1>
          {caught.status}: {caught.statusText}
        </h1>
        {message}
      </Layout>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  getFirebaseClient();
  console.error(error);
  return (
    <Document title="Error!">
      <Layout>
        <SiteLayout>
          <div>
            <h1>There was an error</h1>
            <p>
              {error.message &&
              error.message.includes("Can't reach database server")
                ? "Can't reach database server"
                : ""}
            </p>
            <hr />
          </div>
        </SiteLayout>
      </Layout>
    </Document>
  );
}

/**
 * Provides an alert for screen reader users when the route changes.
 */
const RouteChangeAnnouncement = React.memo(() => {
  let [hydrated, setHydrated] = React.useState(false);
  let [innerHtml, setInnerHtml] = React.useState("");
  let location = useLocation();

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  let firstRenderRef = React.useRef(true);
  React.useEffect(() => {
    // Skip the first render because we don't want an announcement on the
    // initial page load.
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    let pageTitle = location.pathname === "/" ? "Home page" : document.title;
    setInnerHtml(`Navigated to ${pageTitle}`);
  }, [location.pathname]);

  // Render nothing on the server. The live region provides no value unless
  // scripts are loaded and the browser takes over normal routing.
  if (!hydrated) {
    return null;
  }

  return (
    <div
      aria-live="assertive"
      aria-atomic
      id="route-change-region"
      style={{
        border: "0",
        clipPath: "inset(100%)",
        clip: "rect(0 0 0 0)",
        height: "1px",
        margin: "-1px",
        overflow: "hidden",
        padding: "0",
        position: "absolute",
        width: "1px",
        whiteSpace: "nowrap",
        wordWrap: "normal",
      }}
    >
      {innerHtml}
    </div>
  );
});
