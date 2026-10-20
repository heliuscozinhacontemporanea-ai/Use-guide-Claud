/** Documento de verificação: privado, sem URL. O backend devolve só o identificador do arquivo. */
export interface VerificationFilePort {
  uploadVerificationFile(file: File): Promise<{ fileId: string }>;
}
