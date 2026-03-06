// Hook para carga lazy de contenido
import { useState, useCallback, useEffect } from 'react';
import { Lesson, LevelStructure, ContentManifest } from '../../types';

interface ContentCache {
  [moduleId: string]: Lesson[];
}

interface UseContentLoaderReturn {
  loadModule: (moduleFile: string) => Promise<Lesson[]>;
  preloadAdjacent: (currentModuleId: string, structure: LevelStructure) => void;
  loading: boolean;
  cache: ContentCache;
  clearCache: () => void;
}

// Cache en memoria (se pierde al cerrar app)
const memoryCache: ContentCache = {};

export function useContentLoader(): UseContentLoaderReturn {
  const [cache, setCache] = useState<ContentCache>(memoryCache);
  const [loading, setLoading] = useState(false);

  const loadModule = useCallback(async (moduleFile: string): Promise<Lesson[]> => {
    // Retornar de cache si existe
    if (cache[moduleFile]) {
      return cache[moduleFile];
    }

    setLoading(true);
    try {
      // Import dinámico
      const module = await import(`../../../content/${moduleFile}`);
      const lessons: Lesson[] = module.default.lessons || module.lessons;
      
      // Actualizar cache
      const newCache = { ...cache, [moduleFile]: lessons };
      setCache(newCache);
      Object.assign(memoryCache, newCache);
      
      return lessons;
    } catch (error) {
      console.error(`Error loading module ${moduleFile}:`, error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [cache]);

  const preloadAdjacent = useCallback((currentModuleId: string, structure: LevelStructure) => {
    const currentIndex = structure.modules.findIndex(m => m.id === currentModuleId);
    if (currentIndex === -1) return;

    const modulesToPreload = [
      structure.modules[currentIndex - 1]?.file,
      structure.modules[currentIndex + 1]?.file,
    ].filter(Boolean) as string[];

    modulesToPreload.forEach(file => {
      if (!cache[file]) {
        import(`../../../content/${file}`).then(module => {
          const lessons: Lesson[] = module.default.lessons || module.lessons;
          const newCache = { ...cache, [file]: lessons };
          setCache(newCache);
          Object.assign(memoryCache, newCache);
        }).catch(console.error);
      }
    });
  }, [cache]);

  const clearCache = useCallback(() => {
    setCache({});
    Object.keys(memoryCache).forEach(key => delete memoryCache[key]);
  }, []);

  return { loadModule, preloadAdjacent, loading, cache, clearCache };
}

// Hook para estructura del contenido
export function useContentStructure() {
  const [structure, setStructure] = useState<ContentManifest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('../../../content/structure.json')
      .then(data => {
        setStructure(data.default || data);
      })
      .catch(() => {
        // Fallback structure
        setStructure({
          version: '1.0.0',
          updatedAt: new Date().toISOString(),
          levels: [
            {
              id: 'level_1',
              level: 1,
              title: 'Fundamentos',
              description: 'Aprende los conceptos básicos del trading',
              modules: [
                { id: 'mod_1_1', title: 'Conceptos Básicos', lessons: [], file: 'level1/module1.json' },
              ],
              minXP: 0,
              color: '#00CEC9',
            },
          ],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return { structure, loading };
}

// Hook para búsqueda de contenido
export function useContentSearch() {
  const [index, setIndex] = useState<Record<string, string[]>>({});

  useEffect(() => {
    import('../../../content/searchIndex.json')
      .then(data => {
        setIndex(data.default?.index || data.index || {});
      })
      .catch(() => setIndex({}));
  }, []);

  const search = useCallback((query: string): string[] => {
    const normalizedQuery = query.toLowerCase().trim();
    const results = new Set<string>();
    
    Object.entries(index).forEach(([key, lessonIds]) => {
      if (key.includes(normalizedQuery)) {
        lessonIds.forEach(id => results.add(id));
      }
    });
    
    return Array.from(results);
  }, [index]);

  return { search, index };
}
