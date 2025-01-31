import { render } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Router } from 'react-router-dom'

import { Range } from '@sourcegraph/extension-api-classes'
import { TextDocumentDecoration } from '@sourcegraph/extension-api-types'

import { DiffHunkLineType, FileDiffHunkFields } from '../../graphql-operations'

import { DiffHunk } from './DiffHunk'

describe('DiffHunk', () => {
    const history = createMemoryHistory()
    const hunk: FileDiffHunkFields = {
        oldRange: { startLine: 159, lines: 7 },
        oldNoNewlineAt: false,
        newRange: { startLine: 159, lines: 7 },
        section: 'export async function register({',
        highlight: {
            aborted: false,
            lines: [
                {
                    kind: DiffHunkLineType.UNCHANGED,
                    html: '        const subscriptions = new Subscription()',
                },
                {
                    kind: DiffHunkLineType.UNCHANGED,
                    html: '        const decorationType = sourcegraph.app.createDecorationType()',
                },
                {
                    kind: DiffHunkLineType.UNCHANGED,
                    html: '        const connection = await createConnection()',
                },
                {
                    kind: DiffHunkLineType.DELETED,
                    html: '        logger.log(`WebSocket connection to TypeScript backend opened`)',
                },
                {
                    kind: DiffHunkLineType.ADDED,
                    html: '        logger.log(`WebSocket connection to language server opened`)',
                },
                {
                    kind: DiffHunkLineType.UNCHANGED,
                    html: '        subscriptions.add(',
                },
                {
                    kind: DiffHunkLineType.UNCHANGED,
                    html:
                        '                connection.observeNotification(LogMessageNotification.type).subscribe(({ type, message }) =\u003E {',
                },
                {
                    kind: DiffHunkLineType.UNCHANGED,
                    html: '                    const method = LSP_TO_LOG_LEVEL[type]',
                },
            ],
        },
    }

    it('renders a unified diff view for the given diff hunk', () => {
        expect(
            render(
                <Router history={history}>
                    <table>
                        <tbody>
                            <DiffHunk
                                hunk={hunk}
                                decorations={{ head: new Map(), base: new Map() }}
                                lineNumbers={true}
                                isLightTheme={true}
                                fileDiffAnchor="anchor_"
                            />
                        </tbody>
                    </table>
                </Router>
            ).asFragment()
        ).toMatchSnapshot()
    })

    const decorations = {
        head: new Map<number, TextDocumentDecoration[]>([
            [
                159,
                [
                    {
                        range: new Range(158, 0, 158, 0),
                        isWholeLine: true,
                        backgroundColor: 'red',
                        dark: { border: '1px blue solid' },
                        after: {
                            contentText: 'head content',
                            hoverMessage: 'base hover msg',
                            backgroundColor: 'black',
                        },
                    },
                ],
            ],
        ]),
        base: new Map<number, TextDocumentDecoration[]>([
            [
                162,
                [
                    {
                        range: new Range(161, 0, 161, 0),
                        isWholeLine: true,
                        backgroundColor: 'blue',
                        dark: { border: '1px blue solid' },
                        after: {
                            contentText: 'base content',
                            hoverMessage: 'base hover msg',
                            backgroundColor: 'black',
                        },
                    },
                ],
            ],
        ]),
    }

    it('renders decorations if given', () => {
        expect(
            render(
                <Router history={history}>
                    <table>
                        <tbody>
                            <DiffHunk
                                hunk={hunk}
                                decorations={decorations}
                                lineNumbers={true}
                                isLightTheme={true}
                                fileDiffAnchor="anchor_"
                            />
                        </tbody>
                    </table>
                </Router>
            ).asFragment()
        ).toMatchSnapshot()
    })

    it('renders dark theme decorations if dark theme is active', () => {
        expect(
            render(
                <Router history={history}>
                    <table>
                        <tbody>
                            <DiffHunk
                                hunk={hunk}
                                decorations={decorations}
                                lineNumbers={true}
                                isLightTheme={false}
                                fileDiffAnchor="anchor_"
                            />
                        </tbody>
                    </table>
                </Router>
            ).asFragment()
        ).toMatchSnapshot()
    })
})
