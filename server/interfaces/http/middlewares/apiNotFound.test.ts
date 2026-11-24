import express from 'express';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { apiNotFound } from './apiNotFound';

describe('apiNotFound (B80)', () => {
  let base = '';
  let close: () => void = () => undefined;

  beforeAll(async () => {
    const app = express();
    app.get('/api/existe', (_req, res) => {
      res.json({ ok: true });
    });
    app.use('/api', apiNotFound);
    app.get('*all', (_req, res) => {
      res.type('html').send('<!doctype html>');
    });
    const server = app.listen(0);
    await new Promise<void>((resolve) => server.once('listening', () => resolve()));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    close = () => server.close();
  });
  afterAll(() => close());

  it('GET em /api que não existe responde 404 no formato da API, não a página', async () => {
    const res = await fetch(`${base}/api/rota-que-nao-existe`);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: { code: 'NOT_FOUND', message: expect.any(String) } });
  });

  it('qualquer método também', async () => {
    const res = await fetch(`${base}/api/x/y`, { method: 'POST' });
    expect(res.status).toBe(404);
  });

  it('rota que existe e página do site continuam como antes', async () => {
    expect((await fetch(`${base}/api/existe`)).status).toBe(200);
    const page = await fetch(`${base}/eventos`);
    expect(page.status).toBe(200);
    expect(page.headers.get('content-type')).toContain('text/html');
  });
});
