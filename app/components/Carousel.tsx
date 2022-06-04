import { Link } from "@remix-run/react";
import type { MouseEvent, PropsWithoutRef, ReactElement } from 'react';
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
	const onCarouselNav = useCallback(
		(e?: MouseEvent<HTMLAnchorElement>, scroll = true) => {
			if (e) {
				e.preventDefault();
				history.replaceState({}, '', e.currentTarget.href);
			}
			let curr = active;
			try {
				curr = window.location.hash
					? parseInt(window.location.hash.replace('#', '').replace(imgId, ''))
					: 0;
			} catch {}
			curr = curr || 0;
			if (curr !== active) {
				if (scroll) {
					document
						.getElementById(window.location.hash?.replace('#', ''))
						?.scrollIntoView({
							behavior: 'smooth',
							block: 'nearest',
							inline: 'nearest',
						});
				}

				setActive(curr);
				const newNext = curr === images.length - 1 ? 0 : curr + 1;
				const newPrev = curr === 0 ? images.length - 1 : curr - 1;
				setNext(newNext);
				setPrev(newPrev);
			}
		},
		[images.length, imgId, active]
	);
	let timeout: NodeJS.Timeout;
	const onScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
		if (timeout !== undefined) {
			clearTimeout(timeout);
		}
		const target = e.currentTarget;

		const keepHashUpdated = () => {
			if (target) {
				const scrollLeft = target.scrollLeft;
				const width = target.offsetWidth;
				const curr = Math.round(scrollLeft / width);
				if (curr != active) {
					window.location.hash = `#${imgId}${curr}`;
					onCarouselNav(undefined, false);
				}
			}
		};
		timeout = setTimeout(keepHashUpdated, 10);
	};
	useEffect(() => {
		onCarouselNav();
	});

	//https://assets.geniecloud.xyz/rental/cl1zfpd270000w4en5bla3at6_full.webp
	return (
		<section className="genie-carousel flex w-full flex-col">
			<div className="flex w-full items-center justify-between">
				{images.length > 1 && (
					<Link
						onClick={onCarouselNav}
						to={`#${imgId}${prev}`}
						className="btn btn-ghost btn-circle btn-sm text-lg lg:text-2xl"
					>
						<IoCaretBack />
					</Link>
				)}
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
						>
							{images.map(({ name, alt, image_sizesMeta: img }, i) => {
								const maxWidth = Math.min(img.full.width, img.lg.width);
								return (
									<div
										id={`${imgId}${i}`}
										className="carousel-item relative mx-1 flex w-full flex-col items-center justify-center"
										key={`${imgId}${i}`}
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
											<div className="badge outline badge-accent  absolute left-2 bottom-2 outline-1 outline-accent-content lg:badge-lg">
												<IoCameraOutline size={18} />
												&nbsp; {i + 1} / {images.length}
											</div>
										</div>
										{name}
									</div>
								);
							})}
						</div>
					</label>
				</button>
				{images.length > 1 && (
					<Link
						onClick={onCarouselNav}
						to={`#${imgId}${next}`}
						className="btn btn-ghost btn-circle btn-sm text-lg  lg:text-2xl"
					>
						<IoCaretForward />
					</Link>
				)}
			</div>
			;
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
