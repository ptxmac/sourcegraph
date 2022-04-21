import { existsSync } from 'fs'
import path from 'path'

import * as esbuild from 'esbuild'
import { rm } from 'shelljs'

import {
    buildMonaco,
    monacoPlugin,
    MONACO_LANGUAGES_AND_FEATURES,
    packageResolutionPlugin,
    stylePlugin,
    workerPlugin,
    RXJS_RESOLUTIONS,
    buildTimerPlugin,
} from '@sourcegraph/build-config'

const watch = !!process.env.WATCH
const minify = process.env.NODE_ENV === 'production'
const outdir = path.join(__dirname, '../dist')

const TARGET_TYPE = process.env.TARGET_TYPE

const SHARED_CONFIG = {
    outdir,
    watch,
    minify,
}

export async function build(): Promise<void> {
    if (existsSync(outdir)) {
        rm('-rf', outdir)
    }

    const buildPromises = []

    // TODO: extract core ext builds to fn w differences parameterized.
    if (TARGET_TYPE === 'node' || !TARGET_TYPE) {
        buildPromises.push(
            esbuild.build({
                entryPoints: { extension: path.join(__dirname, '/../src/extension.ts') },
                bundle: true,
                format: 'cjs',
                platform: 'node',
                external: ['vscode'],
                // TODO alias
                // define plugin IS_TEST,
                define: {
                    'process.env.IS_TEST': 'true', // TODO check build type
                },
                ...SHARED_CONFIG,
                outdir: path.join(SHARED_CONFIG.outdir, 'node'),
            })
        )
    }
    if (TARGET_TYPE === 'webworker' || !TARGET_TYPE) {
        // TODO look inside webpack webworker target!!
        buildPromises.push(
            esbuild.build({
                entryPoints: { extension: path.join(__dirname, '/../src/extension.ts') },
                bundle: true,
                format: 'cjs',
                // just changed this.. figure out what i did needlessly.
                platform: 'browser',
                // OHHHHHH replace node git_helpers with browser here!
                // 'browseractionsweb'
                // platform: 'node',
                external: ['vscode'],
                define: {
                    // do we need to write provideplugin?
                    // or just write file that's only imported in web that assigns to global?
                    // seems like we need provideplugin. go check how webpack does it.

                    'process.env.IS_TEST': 'true', // TODO check build type
                    global: 'globalThis',
                },
                footer: {
                    // this trick won't work for process, though :(
                    js: 'globalThis.buffer = require_buffer().Buffer',
                },
                plugins: [
                    packageResolutionPlugin({
                        process: require.resolve('process/browser'),
                        path: require.resolve('path-browserify'),
                        http: require.resolve('stream-http'),
                        https: require.resolve('https-browserify'),
                        stream: require.resolve('stream-browserify'),
                        util: require.resolve('util'),
                        events: require.resolve('events'),
                        buffer: require.resolve('buffer/'),
                        './browserActionsNode': path.resolve(__dirname, '../src', 'link-commands', 'browserActionsWeb'),
                    }),
                    // {
                    //     name: 'test-provide',
                    //     setup(build) {
                    //         build.onResolve({ filter: /buffer/ }, args => {
                    //             console.log(args)
                    //         })
                    //     },
                    // },
                ],
                // define plugin IS_TEST
                ...SHARED_CONFIG,
                outdir: path.join(SHARED_CONFIG.outdir, 'webworker'),
            })
        )
    }

    buildPromises.push(
        esbuild.build({
            entryPoints: {
                helpSidebar: path.join(__dirname, '../src/webview/sidebars/help'),
                searchSidebar: path.join(__dirname, '../src/webview/sidebars/search'),
                searchPanel: path.join(__dirname, '../src/webview/search-panel'),
                style: path.join(__dirname, '../src/webview/index.scss'),
            },
            bundle: true,
            format: 'esm',
            platform: 'browser',
            splitting: true,
            plugins: [
                stylePlugin,
                workerPlugin,
                packageResolutionPlugin({
                    path: require.resolve('path-browserify'),
                    ...RXJS_RESOLUTIONS,
                    './Link': require.resolve('../src/webview/search-panel/alias/Link'),
                    '../Link': require.resolve('../src/webview/search-panel/alias/Link'),
                    './SearchResult': require.resolve('../src/webview/search-panel/alias/SearchResult'),
                    './FileMatchChildren': require.resolve('../src/webview/search-panel/alias/FileMatchChildren'),
                    './RepoFileLink': require.resolve('../src/webview/search-panel/alias/RepoFileLink'),
                    '../documentation/ModalVideo': require.resolve('../src/webview/search-panel/alias/ModalVideo'),
                }),
                // Note: leads to "file has no exports" warnings
                monacoPlugin(MONACO_LANGUAGES_AND_FEATURES),
                buildTimerPlugin,
                {
                    name: 'codiconsDeduplicator',
                    setup(build): void {
                        build.onLoad({ filter: /\.ttf$/ }, args => {
                            // Both `@vscode/codicons` and `monaco-editor`
                            // node modules include a `codicons.ttf` file,
                            // so null one out.
                            if (!args.path.includes('@vscode/codicons')) {
                                return {
                                    contents: '',
                                    loader: 'text',
                                }
                            }
                            return null
                        })
                    },
                },
            ],
            loader: {
                '.ttf': 'file',
            },
            assetNames: '[name]',
            ignoreAnnotations: true,
            treeShaking: false,
            ...SHARED_CONFIG,
            outdir: path.join(SHARED_CONFIG.outdir, 'webview'),
        })
    )

    buildPromises.push(buildMonaco(outdir))

    await Promise.all(buildPromises)
}
