import { Trans, useTranslation } from 'react-i18next';
import { useAdminListingView } from '../../../domain/admin';
import {
  AdminListingSealControl,
  ListingEditorPage,
  updatePartnerContentItemUseCase,
} from '../../../domain/partners';
import { useUI } from '../../../shared/stores/useUIStore';
import { INFO_NOTE_STRONG, InfoNote } from '../../../ui/components/InfoNote';
import { ListCard, ListRowAction, ListRowStatic } from '../../../ui/components/ListRows';
import { ListError, ListLoading } from '../../../ui/components/ListState';
import { BUTTON_PARTNER_WIDE } from '../../../ui/styles/controls';
import {
  bumpAdminListingVersion,
  useAdminGuideItems,
  useAdminListingVersion,
} from './adminGuideStore';
import { toListingRecord } from './adminListingRecord';
import { adminPages } from './adminStack';

/**
 * "Editar anúncio" pelo admin (escolhas da F4): os blocos do parceiro, com o dono no topo e, embaixo,
 * publicar e o que só o admin faz. O anúncio do Use Guide não tem selo.
 */
export function AdminListingEditorPage({ itemId }: { itemId: string }) {
  const { t } = useTranslation();
  const { showToast } = useUI();
  const items = useAdminGuideItems();
  const version = useAdminListingVersion();
  const { view, failed } = useAdminListingView(itemId, version);
  const item = items.find((entry) => entry.id === itemId);

  if (failed) {
    return (
      <ListError message={t('adminPanel.guide.listingError')} onRetry={bumpAdminListingVersion} />
    );
  }
  if (!item || !view) return <ListLoading label={t('adminPanel.guide.loading')} />;

  const useGuide = view.owner.kind === 'useguide';
  const ownerName = view.owner.kind === 'partner' ? view.owner.name : '';
  const paused = item.isActive === false;

  const togglePause = async () => {
    try {
      await updatePartnerContentItemUseCase(item.id, { isActive: paused });
      showToast(t(paused ? 'adminPanel.guide.resumed' : 'adminPanel.guide.paused'), 'success');
    } catch {
      showToast(t('adminPanel.guide.pauseFailed'), 'error');
    }
  };

  return (
    <ListingEditorPage
      item={toListingRecord(item)}
      steps={view.setupSteps}
      publication={view.publication}
      phoneTitle={useGuide ? t('adminPanel.guide.phoneTitle') : undefined}
      onOpenBlock={(block, title) =>
        adminPages.push({ view: 'listing-block', itemId: item.id, block, title })
      }
      onDeleted={() => adminPages.back()}
      header={
        <InfoNote>
          <Trans
            i18nKey={useGuide ? 'adminPanel.guide.ownerUseGuide' : 'adminPanel.guide.ownerPartner'}
            values={{ name: ownerName || t('adminPanel.guide.unknownName') }}
            components={{ b: INFO_NOTE_STRONG }}
          />
        </InfoNote>
      }
      footer={
        <>
          {view.publication === 'draft' ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => adminPages.push({ view: 'listing-publish', itemId: item.id })}
                className={BUTTON_PARTNER_WIDE}
              >
                {t('adminPanel.guide.publish')}
              </button>
              {useGuide ? (
                <p className="text-center text-[13px] text-ink/70">
                  {t('adminPanel.guide.publishHint')}
                </p>
              ) : null}
            </div>
          ) : null}
          {useGuide && view.publication === 'draft' ? null : (
            <>
              <h3 className="px-1 pt-2 text-[12px] font-semibold uppercase tracking-[0.07em] text-ink/60">
                {t('adminPanel.guide.adminOnly')}
              </h3>
              <ListCard>
                {useGuide ? null : (
                  <ListRowStatic
                    title={t('adminPanel.guide.seal')}
                    aside={<AdminListingSealControl itemId={item.id} name={item.name} />}
                  />
                )}
                {view.publication === 'published' ? (
                  <ListRowAction
                    label={t(paused ? 'adminPanel.guide.resume' : 'adminPanel.guide.pause')}
                    onClick={() => void togglePause()}
                  />
                ) : null}
              </ListCard>
            </>
          )}
        </>
      }
    />
  );
}
