import { PropsWithChildren, ReactElement, useCallback, useEffect } from 'react';
import { useState } from "react";
import type { Post } from '@prisma/client';
import { DocumentRenderer } from '@keystone-6/document-renderer';
import classNames from 'classnames';
import type { CarouselImage } from './Carousel';
import { getImageUrl } from '~/utils';

type Props = {
	post: Post;
	image?: CarouselImage;
};

export default function PostComp({
	post,
	image,
	children,
}: PropsWithChildren<Props>): ReactElement {
	const [imgLoaded, setImgLoaded] = useState(false);
	const img = image?.image_sizesMeta;
	const maxWidth = Math.min(img?.full?.width || 0, img?.lg?.width || 0);
	const onLoad = useCallback(() => {
		setImgLoaded(true);
	}, []);
	useEffect(() => {
		setTimeout(() => {
			setImgLoaded(true);
		}, 300);
	}, []);

	return (
    <div>
      {post.status === "published" ? (
        <div
          className={classNames({
            "card bg-accent text-accent-content shadow-xl": true,
            "lg:card-side": image,
          })}
        >
          {image && img ? (
            <figure>
              <picture
                className={classNames({
                  visible: imgLoaded,
                  invisible: !imgLoaded,
                })}
              >
                <source
                  media={`(min-width:${img.md.width}px)`}
                  srcSet={getImageUrl("", img.lg, maxWidth)}
                />
                <source
                  media={`(min-width:${img.sm.width}px)`}
                  srcSet={getImageUrl("", img.md, maxWidth)}
                />
                <img
                  onLoad={onLoad}
                  loading="lazy"
                  src={getImageUrl("", img.sm, maxWidth)}
                  alt={image.alt || image.name}
                  width={img.full.width}
                  height={img.full.height}
                />
              </picture>
              {img.base64 && img.base64.base64Data && (
                <img
                  className={classNames({
                    hidden: imgLoaded,
                  })}
                  src={img.base64.base64Data}
                  alt={image.alt || image.name}
                  width={img.full.width}
                  height={img.full.height}
                />
              )}
            </figure>
          ) : (
            ""
          )}
          <div className="card-body">
            <h2 className="card-title">{post.title}</h2>
            {post.content ? (
              <DocumentRenderer document={post.content as any} />
            ) : (
              ""
            )}
            {children}
            {/* <div className="card-actions justify-end">
							<button className="btn btn-primary">Listen</button>
						</div> */}
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
