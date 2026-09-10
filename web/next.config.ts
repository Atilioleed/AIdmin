import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Confina explicitamente la raiz a web/ (el repo tiene dos lockfiles - uno en la
  // raiz de AIdmin/ para los agentes, otro aqui - y Next detecta eso como ambiguo).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
