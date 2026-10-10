import { useMemo } from 'react';
import { useGuideCatalog, GuideItem } from '../../guide';

export function useDynamicSuggestions(activeCategory: string | null) {
  const { events: dbEvents, items: dbItems } = useGuideCatalog();

  const searchSuggestions = useMemo(() => {
    const fallbackSuggestions: Record<string, string[]> = {
      event: ['Show', 'Festa', 'Luau', 'Pôr do Sol'],
      tour: ['Buggy', 'Kitesurf', 'Quadriciclo', 'Lagoa'],
      hotel: ['Hotel', 'Pousada', 'Pé na areia', 'Vista mar'],
      restaurant: ['Peixe', 'Pizza', 'Lagosta', 'Massa'],
      sight: ['Pedra Furada', 'Árvore da Preguiça', 'Farol', 'Sunset'],
      tips: ['Maré', 'Transporte', 'Dicas', 'Guia'],
    };
    const defaultFallback = ['Pedra Furada', 'Lagoa do Paraíso', 'Kitesurf', 'Onde comer', 'Dicas'];

    const currentItems = activeCategory
      ? activeCategory === 'event'
        ? dbEvents
        : dbItems.filter((item) => item.category === activeCategory)
      : [...dbItems, ...dbEvents];

    const termFrequency: Record<string, number> = {};

    currentItems.forEach((item) => {
      const anyItem = item as any;
      const opInfo = (item.operationalInfo || {}) as any;

      const collectTags = (tags?: string[]) => {
        if (Array.isArray(tags)) {
          tags.forEach((tag) => {
            if (tag && typeof tag === 'string') {
              const cleanTag = tag.trim();
              if (cleanTag.length > 1) {
                const lower = cleanTag.toLowerCase();
                termFrequency[lower] = (termFrequency[lower] || 0) + 5;
              }
            }
          });
        }
      };
      collectTags(item.tags);
      collectTags(opInfo.tags);

      const cuisine = anyItem.cuisineType || opInfo.cuisineType;
      if (cuisine && typeof cuisine === 'string') {
        const clean = cuisine.trim();
        if (clean.length > 1) {
          const lower = clean.toLowerCase();
          termFrequency[lower] = (termFrequency[lower] || 0) + 4;
        }
      }

      const sub = anyItem.subcategory || opInfo.subcategory;
      if (sub && typeof sub === 'string') {
        const clean = sub.trim();
        if (clean.length > 1) {
          const lower = clean.toLowerCase();
          termFrequency[lower] = (termFrequency[lower] || 0) + 4;
        }
      }

      const collectArrayOrString = (field?: string[] | string, weight = 2) => {
        if (!field) return;
        if (Array.isArray(field)) {
          field.forEach((val) => {
            if (val && typeof val === 'string') {
              const cleanVal = val.trim();
              if (cleanVal.length > 2) {
                const lower = cleanVal.toLowerCase();
                termFrequency[lower] = (termFrequency[lower] || 0) + weight;
              }
            }
          });
        } else if (typeof field === 'string' && field.length > 0) {
          field.split(',').forEach((val) => {
            const cleanVal = val.trim();
            if (cleanVal.length > 2) {
              const lower = cleanVal.toLowerCase();
              termFrequency[lower] = (termFrequency[lower] || 0) + weight;
            }
          });
        }
      };

      collectArrayOrString(anyItem.amenities, 3);
      collectArrayOrString(opInfo.amenities, 3);
      collectArrayOrString(anyItem.amenitiesRestaurant, 3);
      collectArrayOrString(opInfo.amenitiesRestaurant, 3);
      collectArrayOrString(anyItem.additionalServices, 2);
      collectArrayOrString(opInfo.additionalServices, 2);
      collectArrayOrString(anyItem.mealTypes, 2);
      collectArrayOrString(opInfo.mealTypes, 2);
      collectArrayOrString(anyItem.activities, 2);
      collectArrayOrString(opInfo.activities, 2);
      collectArrayOrString(anyItem.services, 2);
      collectArrayOrString(opInfo.services, 2);
      collectArrayOrString(opInfo.languages, 1);
      if (opInfo.breakfast && Array.isArray(opInfo.breakfast.types)) {
        collectArrayOrString(opInfo.breakfast.types, 2);
      }
    });

    const beautyCasing: Record<string, string> = {};
    currentItems.forEach((item) => {
      const anyItem = item as any;
      const opInfo = (item.operationalInfo || {}) as any;

      const checkAndAdd = (term: string) => {
        if (term && typeof term === 'string') {
          const trimmed = term.trim();
          const lower = trimmed.toLowerCase();
          if (trimmed && !beautyCasing[lower]) {
            if (trimmed === lower) {
              beautyCasing[lower] = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
            } else {
              beautyCasing[lower] = trimmed;
            }
          }
        }
      };

      if (Array.isArray(item.tags)) item.tags.forEach(checkAndAdd);
      if (Array.isArray(opInfo.tags)) opInfo.tags.forEach(checkAndAdd);

      const cuisine = anyItem.cuisineType || opInfo.cuisineType;
      if (cuisine) checkAndAdd(cuisine);

      const sub = anyItem.subcategory || opInfo.subcategory;
      if (sub) checkAndAdd(sub);

      const processArrayOrStringField = (field?: string[] | string) => {
        if (!field) return;
        if (Array.isArray(field)) {
          field.forEach((val) => {
            checkAndAdd(val);
          });
        } else if (typeof field === 'string') {
          field.split(',').forEach((val) => {
            checkAndAdd(val);
          });
        }
      };

      processArrayOrStringField(anyItem.amenities);
      processArrayOrStringField(opInfo.amenities);
      processArrayOrStringField(anyItem.amenitiesRestaurant);
      processArrayOrStringField(opInfo.amenitiesRestaurant);
      processArrayOrStringField(anyItem.additionalServices);
      processArrayOrStringField(opInfo.additionalServices);
      processArrayOrStringField(anyItem.mealTypes);
      processArrayOrStringField(opInfo.mealTypes);
      processArrayOrStringField(anyItem.activities);
      processArrayOrStringField(opInfo.activities);
      processArrayOrStringField(anyItem.services);
      processArrayOrStringField(opInfo.services);
      processArrayOrStringField(opInfo.languages);
      if (opInfo.breakfast && Array.isArray(opInfo.breakfast.types)) {
        opInfo.breakfast.types.forEach(checkAndAdd);
      }
    });

    const sortedDynamicTerms = Object.keys(termFrequency)
      .filter((term) => term.trim().length > 1)
      .sort((a, b) => (termFrequency[b] ?? 0) - (termFrequency[a] ?? 0))
      .map((term) => beautyCasing[term] || term);

    const categoryFallback =
      activeCategory && fallbackSuggestions[activeCategory]
        ? fallbackSuggestions[activeCategory]
        : defaultFallback;

    const seen = new Set<string>();
    const finalSuggestions: string[] = [];

    sortedDynamicTerms.forEach((term) => {
      const norm = term.toLowerCase();
      if (!seen.has(norm) && finalSuggestions.length < 5) {
        seen.add(norm);
        finalSuggestions.push(term);
      }
    });

    categoryFallback.forEach((term) => {
      const norm = term.toLowerCase();
      if (!seen.has(norm) && finalSuggestions.length < 6) {
        seen.add(norm);
        finalSuggestions.push(term);
      }
    });

    return finalSuggestions.slice(0, 6);
  }, [activeCategory, dbItems, dbEvents]);

  return searchSuggestions;
}
