import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/main.ts', // Główny plik wejściowy biblioteki
            name: 'x-js',    // Nazwa biblioteki (globalna zmienna dla UMD/IIFE)
            fileName: (format) => `index.${format}.js` // Nazwa pliku wyjściowego
        },
        rollupOptions: {
            // Wykluczenie zewnętrznych zależności (jeśli używasz)
            external: [],
            output: {
                globals: {
                    // Przykład: podaj globalną nazwę dla zewnętrznych zależności
                    // 'vue': 'Vue',
                },
            },
        },
        outDir: 'dist', // Katalog wyjściowy
        sourcemap: true, // Opcjonalne generowanie map źródłowych
    },
});
