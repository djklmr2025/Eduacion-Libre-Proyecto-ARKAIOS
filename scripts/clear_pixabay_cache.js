// scripts/clear_pixabay_cache.js
// Local script to clear the in-memory cache used by lib/pixabayCache.js
import { clearCache, _debug_getMemoryKeys } from '../lib/pixabayCache.js';

(async () => {
  console.log('Memory keys before clear:', _debug_getMemoryKeys().length);
  const r = await clearCache();
  console.log('Clear result:', r);
  console.log('Memory keys after clear:', _debug_getMemoryKeys().length);
})();
