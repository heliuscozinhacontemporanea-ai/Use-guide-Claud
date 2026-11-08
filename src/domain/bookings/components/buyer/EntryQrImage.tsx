import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

/** Único lugar do domínio que usa a biblioteca `qrcode` (AGENTS.md §3.2). */
export function EntryQrImage({ value, alt }: { value: string; alt: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    // Correção média (M): o QR assinado é longo e precisa continuar legível com o brilho baixo.
    void QRCode.toDataURL(value, { errorCorrectionLevel: 'M', margin: 1, width: 480 })
      .then((url) => active && setSrc(url))
      .catch(() => active && setSrc(null));
    return () => {
      active = false;
    };
  }, [value]);

  return (
    <div className="mx-auto w-full max-w-[240px] aspect-square rounded-2xl bg-white p-3">
      {src && <img src={src} alt={alt} width={240} height={240} className="w-full h-full" />}
    </div>
  );
}
