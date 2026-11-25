import interLicense from '../../../assets/fonts/Inter-OFL.txt?raw';
import outfitLicense from '../../../assets/fonts/Outfit-OFL.txt?raw';
import type { ThirdPartyCredit } from '../types/content';

/** Autoria de trabalhos de terceiros usados no app, como pede a licença de cada um. */
export const CREDITS: ThirdPartyCredit[] = [
  {
    id: 'hamster',
    workKey: 'appAbout.hamsterWork',
    author: 'Nawsome',
    source: 'Uiverse.io',
    url: 'https://uiverse.io',
    license: 'MIT',
    text: `MIT License

Copyright (c) Nawsome (Uiverse.io)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
  },
  // Fontes servidas pelo app (src/assets/fonts): a OFL pede a licença junto de cada cópia distribuída.
  {
    id: 'inter',
    workKey: 'appAbout.interFontWork',
    author: 'The Inter Project Authors',
    source: 'GitHub',
    url: 'https://github.com/rsms/inter',
    license: 'OFL-1.1',
    text: interLicense.trim(),
  },
  {
    id: 'outfit',
    workKey: 'appAbout.outfitFontWork',
    author: 'The Outfit Project Authors',
    source: 'GitHub',
    url: 'https://github.com/Outfitio/Outfit-Fonts',
    license: 'OFL-1.1',
    text: outfitLicense.trim(),
  },
];
