import { getDB } from '~/lib/db.server';

export const getPosts = async () => {
	const response = await getDB().post.findMany({});
	return response;
};

export const getPost = async (id: string) => {
	const response = await getDB().post.findUnique({
		where: {
			id,
		},
	});
	return response;
};
