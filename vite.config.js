import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Two build shapes:
//
//   npm run build          normal site for a web host (separate hashed assets)
//   npm run build:offline  one self-contained index.html you can double-click
//
// The offline build exists because a browser refuses to load `<script type=
// "module" src=...>` from a file:// page — the origin is `null` and module
// fetches go through CORS, which only permits http/https. Inlining the bundle
// sidesteps that entirely: an inline module never gets fetched.
//
// `base: './'` applies to both. Relative URLs work at a domain root, in a
// subdirectory, and from the filesystem, so nothing is lost on the hosted path.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [
    react(),
    ...(mode === 'offline' ? [viteSingleFile()] : []),
  ],
  build: {
    outDir: mode === 'offline' ? 'dist-offline' : 'dist',
    // The media files stay external in both builds. Base64-inlining a ~2 MB
    // video would add a third again in size and make the HTML unusable.
    assetsInlineLimit: mode === 'offline' ? 100000 : 4096,
  },
}))
