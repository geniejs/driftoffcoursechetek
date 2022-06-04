
import type { CarouselImage } from '~/components/Carousel';
import { getDB } from '~/lib/db.server';

export const getImages = async (): Promise<CarouselImage[]> => {
	const response = (await getDB().reservableImage.findMany()) as CarouselImage[];
	return response;
};
export const getImage = async (id?: string): Promise<CarouselImage> => {
	const response = (await getDB().reservableImage.findUnique({
		where: {
			id: id,
		},
	})) as CarouselImage;

	return response;
};
