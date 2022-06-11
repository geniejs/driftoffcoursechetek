import type { LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from '@remix-run/react';
import { getPosts } from "~/lib/posts.db.server";
import type { Post } from "@prisma/client";
import PostComp from "~/components/Post";
import { getImage } from "~/lib/images.db.server";
import type { CarouselImage } from "~/components/Carousel";

export let loader: LoaderFunction = async ({ context, request }) => {
  const posts = await getPosts();
  const homePosts = posts.filter((post) => post.page === "home");
  const image = await getImage("cl3sxxyqr2505sfengsnbaa7e");
  return json({ posts, homePosts, logo: image });
};

// https://remix.run/guides/routing#index-routes
export default function Welcome() {
  const data = useLoaderData<{ posts: Post[]; logo: CarouselImage }>() || [];
  return (
		<div className="flex min-h-screen flex-col gap-4">
			{data.posts.map((post, i) => (
				<PostComp key={i} image={i === 0 ? data.logo : undefined} post={post}>
					<Link className="btn btn-primary btn-block" to="/availability">
						Book a rental
					</Link>
				</PostComp>
			))}
		</div>
	);
}
