import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
	/* config options here */
	// Explicitly set the monorepo root to avoid Turbopack scanning parent directories
	// and warn about additional lockfiles outside the workspace.
	turbopack: {
		root: path.resolve(__dirname, "../../"),
	},
};

export default nextConfig;
