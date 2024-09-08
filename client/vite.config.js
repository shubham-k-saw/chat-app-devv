// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// // import global from 'global';

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   // define: {
//   //   global: global,
//   // },
// server: {
//   host: "0.0.0.0",
//   port: 5173, // You can change this if needed
// },
// });

// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import { Buffer } from 'buffer';
// import process from 'process';

// export default defineConfig({
//   plugins: [react()],
//   define: {
//     global: 'globalThis',
//     process: process,
//     Buffer: Buffer,
//   },

// });

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { Buffer } from "buffer";
import process from "process";

export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
    process: {
      env: {},
      ...process,
    },
    Buffer: Buffer,
  },
  server: {
    host: "0.0.0.0",
    port: 5173, // You can change this if needed
  },
  resolve: {
    alias: {
      // Resolve polyfills if needed
      process: "process/browser",
      stream: "stream-browserify",
      zlib: "browserify-zlib",
      util: "util",
    },
  },
  optimizeDeps: {
    include: ["buffer", "process"],
  },
});
