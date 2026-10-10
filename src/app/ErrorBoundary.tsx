import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Captura exceções não tratadas em qualquer componente da árvore,
 * evitando que o app quebre em tela branca sem explicação.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Exceção não tratada capturada:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-6">
          <div className="max-w-sm w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center gap-4">
            <AlertTriangle size={36} className="text-amber-400" />
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Algo deu errado</h2>
              <p className="text-sm text-white/60 leading-relaxed">
                Encontramos um problema inesperado. Tente recarregar o aplicativo.
              </p>
            </div>
            <button
              onClick={this.handleReload}
              aria-label="Recarregar aplicativo"
              className="flex items-center gap-2 px-5 py-3 bg-teal-500 text-black rounded-2xl text-sm font-bold uppercase tracking-wide hover:bg-teal-400 transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              <RefreshCw size={16} />
              Recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
