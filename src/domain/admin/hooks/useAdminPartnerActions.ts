import { useUI } from '../../../shared/stores/useUIStore';
import { deletePartnerProfileUseCase, updatePartnerStatusUseCase } from '../../partners';
import type { AdminPartnerSummary } from '../types/admin';

interface UseAdminPartnerActionsParams {
  patchPartner: (id: string, patch: Partial<AdminPartnerSummary>) => void;
  removePartner: (id: string) => void;
}

export function useAdminPartnerActions({
  patchPartner,
  removePartner,
}: UseAdminPartnerActionsParams) {
  const { showToast, confirmAction } = useUI();

  const handleToggleStatus = async (partner: AdminPartnerSummary) => {
    const newStatus = partner.status === 'active' ? 'suspended' : 'active';
    const message =
      newStatus === 'suspended'
        ? `Suspender ${partner.businessName}? O parceiro perde o acesso ao painel e não pode alterar itens, eventos, ofertas nem vender até ser reativado.`
        : `Ativar ${partner.businessName}? O parceiro volta a ter acesso ao painel.`;
    if (!(await confirmAction(message))) return;
    try {
      await updatePartnerStatusUseCase(partner.id, newStatus);
      patchPartner(partner.id, { status: newStatus });
      showToast(newStatus === 'suspended' ? 'Parceiro suspenso.' : 'Parceiro ativado.', 'success');
    } catch {
      showToast('Erro ao atualizar status', 'error');
    }
  };

  const handleDeletePartner = async (partner: AdminPartnerSummary) => {
    if (
      !(await confirmAction(
        `Excluir o parceiro ${partner.businessName}? O cadastro de parceiro é apagado e não pode ser recuperado.`
      ))
    ) {
      return;
    }
    try {
      await deletePartnerProfileUseCase(partner.id);
      removePartner(partner.id);
      showToast('Parceiro excluído.', 'success');
    } catch (error) {
      console.error('[AdminPanel.handleDeletePartner]', error);
      showToast('Não foi possível excluir o parceiro.', 'error');
    }
  };

  return { handleToggleStatus, handleDeletePartner };
}
