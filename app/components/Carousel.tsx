import { Link } from '@remix-run/react';
import type { MouseEvent, PropsWithoutRef, ReactElement } from 'react';
import { useMemo, useRef } from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { ReservableImage } from '@prisma/client';
import classNames from 'classnames';
import { IoCameraOutline, IoCaretBack, IoCaretForward } from 'react-icons/io5';
import Modal from './Modal';
import { getImageUrl } from '~/utils';

export type ImageSizeMeta = {
	extension: string;
	filesize: number;
	height: number;
	id: string;
	size: string;
	width: number;
};
export type CarouselImage = ReservableImage & {
	image_sizesMeta: {
		base64?: ImageSizeMeta & { base64Data: string };
		sm: ImageSizeMeta;
		md: ImageSizeMeta;
		lg: ImageSizeMeta;
		full: ImageSizeMeta;
	};
};
type CarouselProps = {
	id: string;
	images: CarouselImage[];
	thumbnails?: boolean;
};

export default function Carousel({
	id,
	images,
	thumbnails = false,
}: PropsWithoutRef<CarouselProps>): ReactElement {
	const imgId = `carousel-${id}-image-`;
	const url = 'https://assets.geniecloud.xyz/rental/';
	const [loadedImages, setloadedImages] = useState(images.map(() => false));
	const [next, setNext] = useState(1);
	const [prev, setPrev] = useState(images.length - 1);
	const [active, setActive] = useState(0);
	const [scrollingFromClick, setScrolling] = useState(false);
	const carouselRef = useRef<HTMLDivElement>(null);
	const carouselItems: Record<string, HTMLDivElement> = useMemo(() => {
		return {};
	}, []);
	const setItemRef = (ref: HTMLDivElement) => {
		if (ref && ref.id) {
			carouselItems[ref.id] = ref;
		}
	};
	const [statusClasses, setStatusClasses] = useState('');

	const onLoad = useCallback(
		(i: number) => {
			if (!loadedImages[i]) {
				loadedImages[i] = true;
				setloadedImages(loadedImages);
			}
			return undefined;
		},
		[loadedImages]
	);
	// works without JS due to using anchor, but js can make it nicer
	const onCarouselNav = useCallback(
		(e?: MouseEvent<HTMLAnchorElement>, scroll = true) => {
			let element: HTMLElement | null = null;
			if (e) {
				e.preventDefault();
				element = document.getElementById(
					e.currentTarget.hash.replace('#', '') || ''
				) as HTMLDivElement;
			}
			let curr = active;
			try {
				curr = element?.dataset?.index ? parseInt(element?.dataset?.index) : 0;
				// eslint-disable-next-line no-empty
			} catch {}
			curr = curr || 0;
			if (curr !== active) {
				if (scroll) {
					setScrolling(true);
					element?.scrollIntoView({
						behavior: 'smooth',
						block: 'nearest',
						inline: 'center',
					});
				}

				setActive(curr);
				const newNext = curr === images.length - 1 ? 0 : curr + 1;
				const newPrev = curr === 0 ? images.length - 1 : curr - 1;
				setNext(newNext);
				setPrev(newPrev);
			}
		},
		[images.length, active]
	);
	useEffect(() => {
		let location = '';
		if (active === 0) {
			location = 'ReactCarousel-at-start';
		} else if (active === images.length - 1) {
			location = 'ReactCarousel-at-end';
		} else {
			location = 'ReactCarousel-at-middle';
		}
		setStatusClasses(`active-${active} ${location}`);
	}, [active, images.length]);
	useEffect(() => {
		// keep active up to date when it is scrolling
		let carouselObserver: IntersectionObserver;
		if (carouselRef.current && Object.values(carouselItems).length) {
			carouselObserver = new IntersectionObserver(
				(entries) => {
					if (!scrollingFromClick) {
						const intersections: number[] = [];
						entries.forEach((entry) => {
							if (entry.isIntersecting) {
								const element = entry.target as HTMLDivElement;
								try {
									const curr = element?.dataset?.index
										? parseInt(element?.dataset?.index)
										: -1;
									if (!isNaN(curr) && curr > -1) {
										intersections.push(curr);
									}
									// eslint-disable-next-line no-empty
								} catch {}
							}
						});
						if (!intersections.includes(active) && intersections.length) {
							setActive(intersections[0]);
						}
					}
				},
				{
					root: carouselRef.current,
					rootMargin: '0px',
					threshold: 0.9,
				}
			);
			Object.values(carouselItems).forEach((item) => {
				carouselObserver.observe(item);
			});
		}
		return () => {
			if (carouselObserver) {
				carouselObserver.disconnect();
			}
		};
	}, [carouselRef, carouselItems, active, scrollingFromClick, imgId]);
	let timeout: NodeJS.Timeout;
	const onScroll: React.UIEventHandler<HTMLDivElement> = () => {
		if (timeout !== undefined) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => setScrolling(false), 10);
	};

	//https://assets.geniecloud.xyz/rental/cl1zfpd270000w4en5bla3at6_full.webp
	return (
		<section className={`genie-carousel flex w-full flex-col ${statusClasses}`}>
			<div className="flex w-full items-center justify-between">
				<button
					onClick={() => {
						document
							.getElementById(`${window.location.hash?.replace('#', '')}-modal`)
							?.scrollIntoView();
					}}
				>
					<label htmlFor={`${imgId}modal`} className="modal-button block">
						<div
							id={`carousel-${id}`}
							onScroll={onScroll}
							className="carousel cursor-pointer"
							ref={carouselRef}
						>
							{images.map(({ name, alt, image_sizesMeta: img }, i) => {
								const maxWidth = Math.min(img.full.width, img.lg.width);
								return (
									<div
										id={`${imgId}${i}`}
										data-index={i}
										className="carousel-item relative mx-1 flex w-full flex-col items-center justify-center"
										key={`${imgId}${i}`}
										role="group"
										aria-roledescription="slide"
										aria-label={`${i + 1} of ${images.length}`}
										ref={setItemRef}
									>
										<div className="relative flex h-full flex-col items-center justify-center">
											<picture
												className={classNames({
													visible: loadedImages[i],
													hidden: !loadedImages[i],
												})}
											>
												<source
													media={`(min-width:${img.md.width}px)`}
													srcSet={getImageUrl(url, img.lg, maxWidth)}
												/>
												<source
													media={`(min-width:${img.sm.width}px)`}
													srcSet={getImageUrl(url, img.md, maxWidth)}
												/>
												<img
													onLoad={onLoad(i)}
													src={getImageUrl(url, img.sm, maxWidth)}
													alt={alt || name}
													width={img.full.width}
													height={img.full.height}
												/>
											</picture>
											{img.base64 && img.base64.base64Data && (
												<img
													className={classNames({
														hidden: loadedImages[i],
													})}
													loading="lazy"
													src={img.base64.base64Data}
													alt={alt || name}
													width={img.full.width}
													height={img.full.height}
												/>
											)}
											{images.length > 1 && (
												<div className="badge outline badge-accent  absolute left-2 bottom-6 outline-1 outline-accent-content lg:badge-lg">
													<Link
														onClick={onCarouselNav}
														to={`#${imgId}${prev}`}
														className=" btn btn-circle btn-ghost btn-sm text-lg hover:text-white lg:text-2xl"
													>
														<IoCaretBack />
													</Link>
													<IoCameraOutline size={18} />
													&nbsp; {i + 1} / {images.length}
													<Link
														onClick={onCarouselNav}
														to={`#${imgId}${next}`}
														className="btn btn-ghost btn-circle btn-sm text-lg  hover:text-white lg:text-2xl"
													>
														<IoCaretForward />
													</Link>
												</div>
											)}
										</div>
										{name}
									</div>
								);
							})}
						</div>
					</label>
				</button>
			</div>
			{thumbnails && (
				<div className="mt-4 flex w-full flex-wrap items-center justify-center gap-4">
					{images.map(({ name, alt, image_sizesMeta: img }, i) => {
						return (
							<Link
								key={i}
								onClick={onCarouselNav}
								to={`#${imgId}${i}`}
								className="w-1/3 max-w-[200px]"
							>
								<img
									loading="lazy"
									src={getImageUrl(url, img.sm, img.sm.width)}
									alt={alt || name}
								/>
							</Link>
						);
					})}
				</div>
			)}
			{images.length > 1 && (
				<Modal id={`${imgId}modal`}>
					<div className="flex flex-col items-center gap-4">
						{images.map(({ name, alt, image_sizesMeta: img }, i) => {
							return (
								<div
									id={`${imgId}${i}-modal`}
									className="flex flex-col items-center justify-center"
									key={i}
								>
									<img
										loading="lazy"
										src={getImageUrl(
											url,
											img.full.width > img.lg.width ? img.lg : img.full,
											img.full.width > img.lg.width
												? img.lg.width
												: img.full.width
										)}
										alt={alt || name}
									/>
									{name}
								</div>
							);
						})}
					</div>
				</Modal>
			)}
		</section>
	);
}
