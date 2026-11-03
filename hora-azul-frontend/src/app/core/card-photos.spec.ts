import { photoSrcset, thumbnailUrl } from './card-photos';

describe('card-photos', () => {
  it('las fotos del catálogo tienen miniatura de 400 px y srcset', () => {
    expect(thumbnailUrl('/cards/11-0.webp')).toBe('/cards/11-0-400.webp');
    expect(photoSrcset('/cards/11-0.webp')).toBe('/cards/11-0-400.webp 400w, /cards/11-0.webp 800w');
  });

  it('otras URLs se dejan igual y sin srcset', () => {
    expect(thumbnailUrl('https://cdn.example.com/a.webp')).toBe('https://cdn.example.com/a.webp');
    expect(photoSrcset('https://cdn.example.com/a.webp')).toBeNull();
    expect(thumbnailUrl('/cards/11-0-400.webp')).toBe('/cards/11-0-400.webp');
  });
});
