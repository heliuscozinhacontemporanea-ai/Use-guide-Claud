import { useTranslation } from 'react-i18next';

/** Erro do acesso vindo do Firebase, pela chave de tradução (`getAuthErrorMessage`). */
export function AuthErrorMessage({ message, id }: { message: string | null; id?: string }) {
  const { t } = useTranslation();
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="p-3 rounded-control bg-danger-soft border border-danger-line text-meta text-danger text-center"
    >
      {t(message)}
    </p>
  );
}
