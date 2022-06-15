// https://remix.run/guides/routing#index-routes
export default function LoadingSpinner() {
	// const [style, setStyle] = useState({
	// 	'--value': 0,
	// });
	// useEffect(() => {
	// 	const interval = setInterval(() => {
	// 		setStyle({
	// 			...style,
	// 			'--value': (style['--value'] + 5) % 100,
	// 		});
	// 	}, 30);
	// 	return () => clearInterval(interval);
	// }, [style]);
	return (
		<div className="fixed top-0 left-0 right-0 bottom-0 z-50 flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-gray-700 opacity-75">
			<progress className="progress progress-accent w-56"></progress>
		</div>
	);
}
