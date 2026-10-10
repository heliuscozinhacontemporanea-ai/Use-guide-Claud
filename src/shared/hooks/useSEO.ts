import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTE_SEO_CONFIG, SEOMetadata, updateDocumentSEO } from '../utils/seo';

export function useSEO(customMetadata?: SEOMetadata) {
  const location = useLocation();
  const title = customMetadata?.title;
  const description = customMetadata?.description;
  const image = customMetadata?.image;
  const canonicalUrl = customMetadata?.canonicalUrl;
  const author = customMetadata?.author;
  const type = customMetadata?.type;

  useEffect(() => {
    const routeConfig = ROUTE_SEO_CONFIG[location.pathname] || {};
    const finalMetadata: SEOMetadata = {
      ...routeConfig,
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(image !== undefined ? { image } : {}),
      ...(canonicalUrl !== undefined ? { canonicalUrl } : {}),
      ...(author !== undefined ? { author } : {}),
      ...(type !== undefined ? { type } : {}),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    updateDocumentSEO(finalMetadata);
  }, [location.pathname, title, description, image, canonicalUrl, author, type]);
}
