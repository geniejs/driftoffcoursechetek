import type { LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { getPosts } from "~/lib/posts.db.server";
import type { Post, PrismaClient } from "@prisma/client";
import PostComp from "~/components/Post";
import { getImage } from "~/lib/images.db.server";
import type { CarouselImage } from "~/components/Carousel";
import { getDB } from "~/lib/db.server";

export let loader: LoaderFunction = async ({ context, request }) => {
  const url = new URL(request.url);
  let db: PrismaClient | undefined = undefined;
  if (url.searchParams.has("dynamic") && Date.now() > 1654324250000) {
    db = getDB();
  }
  const posts = await getPosts(db);
  const homePosts = posts.filter((post) => post.page === "home");
  const image = await getImage(db, "cl3sxxyqr2505sfengsnbaa7e");
  return json({ posts, homePosts, logo: image });
};

// https://remix.run/guides/routing#index-routes
export default function Welcome() {
  const data = useLoaderData<{ posts: Post[]; logo: CarouselImage }>() || [];
  return (
    <div className="flex min-h-screen flex-col gap-4">
      {data.posts.map((post, i) => (
        <PostComp
          key={i}
          image={i === 0 ? data.logo : undefined}
          post={post}
        ></PostComp>
      ))}
    </div>
  );
}
