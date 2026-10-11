import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getRouteSeoMetadata, type SEOMetadata, updateDocumentSEO } from '../utils/seo';

export function useSEO(customMetadata?: SEOMetadata) {
  const location = useLocation();
  const { i18n } = useTranslation();
  const title = customMetadata?.title;
  const description = customMetadata?.description;
  const image = customMetadata?.image;
  const canonicalUrl = customMetadata?.canonicalUrl;
  const author = customMetadata?.author;
  const type = customMetadata?.type;

  useEffect(() => {
    const routeConfig = getRouteSeoMetadata(location.pathname);
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
    // i18n.language: os textos da rota mudam quando o idioma muda.
  }, [location.pathname, i18n.language, title, description, image, canonicalUrl, author, type]);
}
