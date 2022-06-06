import { IoLogInSharp, IoPersonSharp } from "react-icons/io5";
import { Link } from "@remix-run/react";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth } from "@firebase/auth";
import { RootContext } from "~/lib/react/context";

// export let loader: LoaderFunction = async ({ request }) => {
// 	const { user } = await getUserByRequestToken(request);
// 	return { user };
// };

export default function Menu() {
  let [user] = useAuthState(getAuth());
  const darkModeToggle = (
    <RootContext.Consumer>
      {({ darkmode, toggleDarkMode }) => (
        <button
          className={`theme-toggle ${darkmode && "theme-toggle--toggled"}`}
          type="button"
          title="Toggle theme"
          aria-label="Toggle theme"
          onClick={toggleDarkMode}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            width="1em"
            height="1em"
            fill="currentColor"
            className="theme-toggle__inner-moon"
            viewBox="0 0 32 32"
          >
            <path d="M27.5 11.5v-7h-7L16 0l-4.5 4.5h-7v7L0 16l4.5 4.5v7h7L16 32l4.5-4.5h7v-7L32 16l-4.5-4.5zM16 25.4a9.39 9.39 0 1 1 0-18.8 9.39 9.39 0 1 1 0 18.8z" />
            <circle cx="16" cy="16" r="8.1" />
          </svg>
        </button>
      )}
    </RootContext.Consumer>
  );
  return (
    <nav className="navbar  max-w-7xl">
      <div className="navbar-start">
        <Link className="btn btn-ghost text-xl normal-case" to="/">
          Home
        </Link>
      </div>
      <div className="btn-group navbar-end flex gap-4">
        {user ? (
          <Link
            className="group  btn rounded-lg bg-gradient-to-br from-primary to-primary-focus px-5 py-2.5 text-center text-sm font-medium text-primary-content outline outline-1 outline-primary-content hover:bg-gradient-to-r focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
            to="/profile"
          >
            <IoPersonSharp /> &nbsp; {user.isAnonymous ? "Login" : "Profile"}
          </Link>
        ) : (
          <Link
            className="group  btn rounded-lg bg-gradient-to-br from-primary to-primary-focus px-5 py-2.5 text-center text-sm font-medium text-primary-content outline outline-1 outline-primary-content hover:bg-gradient-to-r focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
            to="/login"
          >
            <IoLogInSharp /> &nbsp; Login
          </Link>
        )}
        <div className="align-center flex place-items-center text-4xl">
          {darkModeToggle}
        </div>
      </div>
    </nav>
  );
}
