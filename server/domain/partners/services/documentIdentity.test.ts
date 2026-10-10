import { describe, it, expect } from 'vitest';
import { normalizeDocument, isValidCPF, isValidCNPJ, isValidCpfCnpj } from './documentIdentity';

describe('documentIdentity', () => {
  describe('normalizeDocument', () => {
    it('normaliza removendo pontuação, espaços e convertendo para uppercase', () => {
      expect(normalizeDocument(' 12.abc.345/01de-35 ')).toBe('12ABC34501DE35');
      expect(normalizeDocument('123.456.789-09')).toBe('12345678909');
      expect(normalizeDocument('00.000.000/0001-91')).toBe('00000000000191');
    });

    it('mantém apenas caracteres alfanuméricos em maiúsculas', () => {
      expect(normalizeDocument('abc-def/123')).toBe('ABCDEF123');
    });
  });

  describe('isValidCPF', () => {
    it('valida CPF válido sem máscara', () => {
      expect(isValidCPF('12345678909')).toBe(true);
      expect(isValidCPF('52998224725')).toBe(true);
    });

    it('valida CPF válido com caracteres de máscara', () => {
      expect(isValidCPF('123.456.789-09')).toBe(true);
      expect(isValidCPF('529.982.247-25')).toBe(true);
    });

    it('rejeita CPF inválido com dígito verificador incorreto', () => {
      expect(isValidCPF('12345678900')).toBe(false);
      expect(isValidCPF('123.456.789-99')).toBe(false);
    });

    it('rejeita CPF com tamanho incorreto', () => {
      expect(isValidCPF('12345')).toBe(false);
      expect(isValidCPF('123456789012')).toBe(false);
      expect(isValidCPF('')).toBe(false);
    });

    it('rejeita sequência de CPF com dígitos repetidos', () => {
      expect(isValidCPF('00000000000')).toBe(false);
      expect(isValidCPF('11111111111')).toBe(false);
      expect(isValidCPF('222.222.222-22')).toBe(false);
      expect(isValidCPF('999.999.999-99')).toBe(false);
    });
  });

  describe('isValidCNPJ', () => {
    it('valida CNPJ numérico válido tradicional com máscara', () => {
      expect(isValidCNPJ('00.000.000/0001-91')).toBe(true);
      expect(isValidCNPJ('00000000000191')).toBe(true);
    });

    it('valida CNPJ alfanumérico válido com letras maiúsculas e máscara', () => {
      expect(isValidCNPJ('12.ABC.345/01DE-35')).toBe(true);
      expect(isValidCNPJ('12ABC34501DE35')).toBe(true);
    });

    it('valida CNPJ alfanumérico com letras minúsculas após normalização', () => {
      expect(isValidCNPJ('12.abc.345/01de-35')).toBe(true);
      expect(isValidCNPJ('12abc34501de35')).toBe(true);
    });

    it('rejeita CNPJ numérico inválido com dígito verificador incorreto', () => {
      expect(isValidCNPJ('00.000.000/0001-00')).toBe(false);
      expect(isValidCNPJ('00000000000199')).toBe(false);
    });

    it('rejeita CNPJ alfanumérico inválido com dígito verificador incorreto', () => {
      expect(isValidCNPJ('12ABC34501DE00')).toBe(false);
      expect(isValidCNPJ('12.ABC.345/01DE-99')).toBe(false);
    });

    it('rejeita CNPJ com tamanho ou formato de DV incorreto', () => {
      expect(isValidCNPJ('12345')).toBe(false);
      expect(isValidCNPJ('12ABC34501DE3A')).toBe(false);
      expect(isValidCNPJ('')).toBe(false);
    });
  });

  describe('isValidCpfCnpj', () => {
    it('valida documento CPF de 11 dígitos', () => {
      expect(isValidCpfCnpj('123.456.789-09')).toBe(true);
      expect(isValidCpfCnpj('12345678909')).toBe(true);
      expect(isValidCpfCnpj('111.111.111-11')).toBe(false);
    });

    it('valida documento CNPJ numérico de 14 dígitos', () => {
      expect(isValidCpfCnpj('00.000.000/0001-91')).toBe(true);
      expect(isValidCpfCnpj('00.000.000/0001-00')).toBe(false);
    });

    it('valida documento CNPJ alfanumérico de 14 dígitos', () => {
      expect(isValidCpfCnpj('12.ABC.345/01DE-35')).toBe(true);
      expect(isValidCpfCnpj('12.abc.345/01de-35')).toBe(true);
      expect(isValidCpfCnpj('12.ABC.345/01DE-00')).toBe(false);
    });

    it('rejeita documentos com tamanho diferente de 11 e 14 dígitos', () => {
      expect(isValidCpfCnpj('1234567890')).toBe(false);
      expect(isValidCpfCnpj('123456789012')).toBe(false);
      expect(isValidCpfCnpj('')).toBe(false);
    });
  });
});
