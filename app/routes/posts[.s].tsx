import { Outlet } from "@remix-run/react";

export default function Posts() {
	return (
		<main>
			<h1>Posts Parent</h1>
			<Outlet />
		</main>
	);
}
