export interface HtmlTemplatePort {
  /** HTML base do app (index.html gerado pelo build). */
  getTemplate(): Promise<string>;
}
