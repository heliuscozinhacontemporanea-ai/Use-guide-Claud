import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../../shared/i18n';
import { LanguagesField } from '../steps/additional/LanguagesField';
import {
  EMPTY_JOIN_DRAFT,
  type PartnerJoinDraft,
  parsePartnerJoinDraft,
  partnerJoinErrors,
} from '../../utils/partnerJoinDraft';
import { PartnerBusinessPage } from './PartnerBusinessPage';

function Harness({ onSubmit }: { onSubmit: () => void }) {
  const [draft, setDraft] = useState<PartnerJoinDraft>(EMPTY_JOIN_DRAFT);
  return (
    <PartnerBusinessPage
      draft={draft}
      onChange={setDraft}
      onSubmit={onSubmit}
      onOpenTerms={vi.fn()}
      submitting={false}
      error={null}
    />
  );
}

describe('partnerJoinDraft', () => {
  it('pede categoria, nome, cidade, telefone válido e o aceite dos Termos', () => {
    expect(partnerJoinErrors(EMPTY_JOIN_DRAFT)).toEqual([
      'category',
      'name',
      'city',
      'phone',
      'terms',
    ]);
    expect(
      partnerJoinErrors({
        category: 'tour',
        name: 'Buggy Vento Leste',
        state: 'CE',
        city: 'Cruz',
        phone: '+5588999990000',
        terms: true,
      })
    ).toEqual([]);
  });

  it('o admin pode deixar o telefone do lugar em branco, mas não inválido (F4)', () => {
    const place = { category: 'hotel', name: 'Pousada', state: 'CE', city: 'Cruz', terms: false };
    const options = { requireTerms: false, requirePhone: false };
    expect(partnerJoinErrors({ ...place, phone: '' }, options)).toEqual([]);
    expect(partnerJoinErrors({ ...place, phone: '123' }, options)).toEqual(['phone']);
  });

  it('o parceiro não usa "Use Guide" no nome do negócio; o admin, sim (D35, item 10)', () => {
    const place = { ...EMPTY_JOIN_DRAFT, category: 'restaurant', city: 'Jijoca', terms: true };
    const phone = '+5588999999999';
    expect(partnerJoinErrors({ ...place, phone, name: 'Bar Us3 Guide' })).toEqual(['nameReserved']);
    expect(partnerJoinErrors({ ...place, phone, name: 'Bar do Guia' })).toEqual([]);
    expect(
      partnerJoinErrors({ ...place, phone, name: 'Dicas Use Guide' }, { allowUseGuideName: true })
    ).toEqual([]);
  });

  it('descarta campos com formato errado no que veio do aparelho', () => {
    expect(parsePartnerJoinDraft({ name: 'X', terms: 'sim', phone: 5 })).toEqual({
      ...EMPTY_JOIN_DRAFT,
      name: 'X',
    });
    expect(parsePartnerJoinDraft(null)).toBeNull();
  });
});

describe('PartnerBusinessPage', () => {
  beforeEach(() => void i18n.changeLanguage('pt-BR'));

  it('mostra o que falta ao tocar em "Criar meu painel" e só envia completo', () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Criar meu painel' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Escreva o nome.')).toBeInTheDocument();
    expect(screen.getByText('Para continuar, aceite os Termos do parceiro.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Eventos' }));
    expect(screen.getByLabelText('Nome do produtor')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Nome do produtor'), {
      target: { value: 'Luau Produções' },
    });
    fireEvent.change(screen.getByLabelText('Cidade'), { target: { value: 'Cruz' } });
    fireEvent.change(document.querySelector('input[type="tel"]') as HTMLInputElement, {
      target: { value: '88999990000' },
    });
    fireEvent.click(screen.getByLabelText('Li e aceito os'));
    fireEvent.click(screen.getByRole('button', { name: 'Criar meu painel' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

describe('LanguagesField', () => {
  beforeEach(() => void i18n.changeLanguage('pt-BR'));

  it('"Outro" busca em todos os idiomas e grava o nome em português', () => {
    const onToggle = vi.fn();
    render(<LanguagesField selected={[]} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button', { name: 'Outro' }));
    fireEvent.change(screen.getByLabelText('Buscar idioma'), { target: { value: 'hebr' } });
    fireEvent.click(screen.getByRole('button', { name: 'Hebraico' }));
    expect(onToggle).toHaveBeenCalledWith('Hebraico');
  });

  it('idioma extra escolhido aparece marcado e sai com um toque', () => {
    const onToggle = vi.fn();
    render(<LanguagesField selected={['Hebraico']} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button', { name: 'Tirar Hebraico' }));
    expect(onToggle).toHaveBeenCalledWith('Hebraico');
  });
});
