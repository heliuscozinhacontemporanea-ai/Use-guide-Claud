import { guideService } from '../factory';

export async function getGuideStatsUseCase() {
  const items = await guideService.getAllItems();

  const itemsByCategory = items.reduce((acc: Record<string, number>, item) => {
    if (item.category) {
      acc[item.category] = (acc[item.category] || 0) + 1;
    }
    return acc;
  }, {});

  const itemsByLocation = items.reduce((acc: Record<string, number>, item) => {
    let loc = item.location || 'Jericoacoara';
    if (loc === 'jeri') loc = 'Jericoacoara';
    else if (loc === 'prea') loc = 'Praia do Preá';
    else if (loc === 'barrinha') loc = 'Barrinha de Baixo';

    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});

  return {
    totalItems: items.length,
    itemsByCategory,
    itemsByLocation,
  };
}
