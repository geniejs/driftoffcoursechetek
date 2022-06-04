
import type { CarouselImage } from '~/components/Carousel';
import { getDB } from '~/lib/db.server';
import type { PrismaClient } from "@prisma/client";


export const getImages = async (): Promise<CarouselImage[]> => {
	const response = (await getDB().reservableImage.findMany()) as CarouselImage[];
	return response;
};
export const getImage = async (db?: PrismaClient, id?: string): Promise<CarouselImage> => {
	const response = db ? await db.reservableImage.findUnique({
		where: {
			id: id,
		},
	}) as CarouselImage : homeImage;
	return response;
};

const homeImage =  {
  id: 'cl3sxxyqr2505sfengsnbaa7e',
  name: 'Business Card',
  alt: '',
  image_filesize: 452355,
  image_extension: 'png',
  image_width: 1050,
  image_height: 600,
  image_id: 'cl3sxxw890000sfen0uoof9jw',
  image_sizesMeta: {
    lg: {
      id: 'cl3sxxw890000sfen0uoof9jw',
      size: 'lg',
      width: 1280,
      height: 731,
      filesize: 801069,
      extension: 'png'
    },
    md: {
      id: 'cl3sxxw890000sfen0uoof9jw',
      size: 'md',
      width: 720,
      height: 411,
      filesize: 280078,
      extension: 'png'
    },
    sm: {
      id: 'cl3sxxw890000sfen0uoof9jw',
      size: 'sm',
      width: 360,
      height: 206,
      filesize: 78722,
      extension: 'png'
    },
    full: {
      id: 'cl3sxxw890000sfen0uoof9jw',
      size: 'full',
      width: 1050,
      height: 600,
      filesize: 452355,
      extension: 'png'
    },
    base64: {
      id: 'cl3sxxw890000sfen0uoof9jw',
      size: 'base64',
      width: 10,
      height: 6,
      filesize: 316,
      extension: 'png',
      base64Data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAGCAYAAAD68A/GAAAACXBIWXMAAC4jAAAuIwF4pT92AAAA7klEQVQImR3Du0rDUACA4fMSbm4uLiK4OAiCDyA4O/QJHESnqpOzdFAHQRREBMFB4iAWq8UMOqmTtCnYWxJpeuLJxYYm5vILfvCJ9FchZZckksSJD0VAniqU6hP49v84dhFJosjGA67fdBYqp6wea4wil6f6LZp2ycvzA54yEfDDTVVjZXmS9bUZdk+OcL4NyENsyyAeSyBE2HaLcnmO/e0Jzg6nqZ/Pk3xVGUUe7686Q6dNkQeIx06PpY0Se1tTHFRmWdzZ5KJ2xUCaWGYDOeyQZz7CChzujB61j0/0Rov7Zhe9aWC7JhBBEZKlHn/Qusm3B/ETTgAAAABJRU5ErkJggg=='
    }
  }
}