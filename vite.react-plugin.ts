import react from '@vitejs/plugin-react';

type CreateReactPluginOptions = {
    /**
     * Run babel-plugin-react-compiler. Pass false for dev servers: the compiler
     * runs a validation pass over every module, which costs ~10s of startup and
     * only affects production memoization.
     */
    reactCompiler?: boolean;
};

export function createReactPlugin({ reactCompiler = true }: CreateReactPluginOptions = {}) {
    if (!reactCompiler) {
        return react();
    }

    return react({
        babel: {
            plugins: ['babel-plugin-react-compiler'],
        },
    });
}
