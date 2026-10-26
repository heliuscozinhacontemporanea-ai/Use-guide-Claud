import type React from 'react';
import { useState } from 'react';
import { businessDateTimeToIso } from '../../../shared/utils/businessDateTime';
import { createTicketTypeUseCase } from '../application/usecases/createTicketTypeUseCase';
import { deleteOrArchiveTicketTypeUseCase } from '../application/usecases/deleteOrArchiveTicketTypeUseCase';
import { updateTicketTypeUseCase } from '../application/usecases/updateTicketTypeUseCase';
import type { ManagerFeedback } from '../components/manager/managerFeedback';

/** Formulário e ações dos lotes de uma sessão (painel de ingressos do parceiro). */
export function useTicketLotForm({
  selectedOccurrenceId,
  reloadLots,
  setFeedback,
}: {
  selectedOccurrenceId: string;
  reloadLots: () => Promise<void> | void;
  setFeedback: (feedback: ManagerFeedback | null) => void;
}) {
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newKind, setNewKind] = useState<'paid' | 'free'>('paid');
  const [newPriceReais, setNewPriceReais] = useState('50');
  const [newQuantity, setNewQuantity] = useState('100');
  const [newMinPerOrder, setNewMinPerOrder] = useState('1');
  const [newMaxPerOrder, setNewMaxPerOrder] = useState('5');
  const [newSalesStartsAt, setNewSalesStartsAt] = useState('');
  const [newSalesEndsAt, setNewSalesEndsAt] = useState('');
  const [newVisibility, setNewVisibility] = useState<'public' | 'hidden' | 'restricted'>('public');
  const [newRequiresEligibility, setNewRequiresEligibility] = useState(false);
  const [newSortOrder, setNewSortOrder] = useState('0');
  const [creatingLot, setCreatingLot] = useState(false);

  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOccurrenceId || !newName.trim()) return;
    setCreatingLot(true);
    setFeedback(null);

    try {
      const priceMinor =
        newKind === 'free' ? 0 : Math.round(Number(newPriceReais.replace(',', '.')) * 100);
      const quantity = Math.max(1, Number.parseInt(newQuantity, 10) || 1);
      const minPerOrder = Math.max(1, Number.parseInt(newMinPerOrder, 10) || 1);
      const maxPerOrder = Math.max(minPerOrder, Number.parseInt(newMaxPerOrder, 10) || 5);
      const sortOrder = Number.parseInt(newSortOrder, 10) || 0;

      await createTicketTypeUseCase({
        occurrenceId: selectedOccurrenceId,
        name: newName.trim(),
        ...(newDescription.trim() ? { description: newDescription.trim() } : {}),
        kind: newKind,
        priceMinor,
        quantity,
        minPerOrder,
        maxPerOrder,
        ...(newSalesStartsAt ? { salesStartsAt: businessDateTimeToIso(newSalesStartsAt) } : {}),
        ...(newSalesEndsAt ? { salesEndsAt: businessDateTimeToIso(newSalesEndsAt) } : {}),
        visibility: newVisibility,
        requiresEligibilityProof: newRequiresEligibility,
        sortOrder,
      });

      setNewName('');
      setNewDescription('');
      await reloadLots();
      setFeedback({ type: 'success', message: 'Lote de ingresso criado com sucesso!' });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erro ao criar lote.',
      });
    } finally {
      setCreatingLot(false);
    }
  };

  const handleDeleteLot = async (ticketTypeId: string) => {
    try {
      const res = await deleteOrArchiveTicketTypeUseCase(ticketTypeId);
      await reloadLots();
      setFeedback({
        type: 'success',
        message:
          res.mode === 'archived'
            ? 'Lote arquivado (possui vendas registradas).'
            : 'Lote removido.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Não foi possível remover o lote.',
      });
    }
  };

  const handleToggleLotPause = async (lotId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'paused' ? 'on_sale' : 'paused';
      await updateTicketTypeUseCase(lotId, { status: nextStatus });
      await reloadLots();
      setFeedback({
        type: 'success',
        message:
          nextStatus === 'paused' ? 'Vendas do lote pausadas.' : 'Lote reativado para venda.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Não foi possível atualizar o lote.',
      });
    }
  };

  return {
    newName,
    setNewName,
    newDescription,
    setNewDescription,
    newKind,
    setNewKind,
    newPriceReais,
    setNewPriceReais,
    newQuantity,
    setNewQuantity,
    newMinPerOrder,
    setNewMinPerOrder,
    newMaxPerOrder,
    setNewMaxPerOrder,
    newSalesStartsAt,
    setNewSalesStartsAt,
    newSalesEndsAt,
    setNewSalesEndsAt,
    newVisibility,
    setNewVisibility,
    newRequiresEligibility,
    setNewRequiresEligibility,
    newSortOrder,
    setNewSortOrder,
    creatingLot,
    handleCreateLot,
    handleDeleteLot,
    handleToggleLotPause,
  };
}

export type TicketLotForm = ReturnType<typeof useTicketLotForm>;
