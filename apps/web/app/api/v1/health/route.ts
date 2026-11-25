// Santé de l'API : répond tant que le serveur tourne (ne touche pas la base).
export const dynamic = 'force-dynamic';

export function GET(): Response {
  return Response.json({ status: 'ok' });
}
