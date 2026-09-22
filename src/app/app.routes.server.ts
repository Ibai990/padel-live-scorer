import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'partido', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Client },
];