import classNames from "classnames";
import { PropsWithChildren, ReactElement, useState } from "react";
import { useMountEffect } from "~/lib/react/hooks";
import Menu from "./Menu/Menu";
function SiteLayout({ children }: PropsWithChildren<{}>): ReactElement {
	const [scroll, setScroll] = useState(false);
	
	useMountEffect(() => {
		setScroll(window.scrollY > 15);
		window.addEventListener("scroll", () => {
			setScroll(window.scrollY > 15);
		});
	});

	const className = classNames(
		'remix-app__header mx-auto sticky top-0 z-30 flex h-16 w-full justify-center bg-opacity-90 backdrop-blur transition-all duration-200 text-primary-content',
		{
			'bg-primary': scroll,
			'shadow-sm': scroll,
		}
	);
    return (
			<div className="remix-app">
				<header className={className}>
					<Menu></Menu>
				</header>
				<main className="remix-app__main mx-4 mt-4">
					<div className="remix-app__main-content container mx-auto max-w-5xl">
						{children}
					</div>
				</main>
				<footer className="remix-app__footer">
					{/* Footer content goes here..FooterContent? */}
				</footer>
			</div>
		);
}

export default SiteLayout;
