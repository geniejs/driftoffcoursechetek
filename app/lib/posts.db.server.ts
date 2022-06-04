import type { Post } from "@prisma/client";
import { getDB } from "./db.server";

// const posts: Post[] = [{ "id": "cl3bqi2uq0265eaenjq1mitaw", "title": "Welcome!", "status": "published", "publishDate": null, "authorId": null, "content": [{ "type": "paragraph", "children": [{ "text": "Online booking is coming very soon!" }] }, { "type": "paragraph", "children": [{ "text": "For now please contact us at 715-379-5268 or driftoffcoursechetek@gmail.com." }] }, { "type": "paragraph", "children": [{ "text": "We look forward to seeing you!" }] }], "page": "home" }];
export const getPosts = async (): Promise<Post[]> => {
	const response = await getDB().post.findMany({});
	return response;
};

export const getPost = async (id?: string): Promise<Post> => {
	const response = await getDB().post.findUnique({
		where: {
			id,
		},
	});

	return response!;
};

