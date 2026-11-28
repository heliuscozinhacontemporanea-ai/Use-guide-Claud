/** Título grande do topo principal (D37): fica na página, abaixo dos ícones, e rola com ela. */
export function ScreenTitle({ children }: { children: string }) {
  return (
    <h1 className="px-4 pt-1 pb-3 text-display font-display font-bold tracking-tight text-ink">
      {children}
    </h1>
  );
}
