import React, { useCallback } from 'react'

import classNames from 'classnames'
import * as H from 'history'
import { noop } from 'lodash'
import AlphaSBoxIcon from 'mdi-react/AlphaSBoxIcon'
import FileDocumentIcon from 'mdi-react/FileDocumentIcon'
import FileIcon from 'mdi-react/FileIcon'
import NotebookIcon from 'mdi-react/NotebookIcon'
import SourceCommitIcon from 'mdi-react/SourceCommitIcon'
import SourceRepositoryIcon from 'mdi-react/SourceRepositoryIcon'
import { NEVER, Observable } from 'rxjs'

import { HoverMerged } from '@sourcegraph/client-api'
import { Hoverifier } from '@sourcegraph/codeintellify'
import { SearchContextProps } from '@sourcegraph/search'
import { SearchResult } from '@sourcegraph/search-ui'
import { ActionItemAction } from '@sourcegraph/shared/src/actions/ActionItem'
import { AuthenticatedUser } from '@sourcegraph/shared/src/auth'
import { FetchFileParameters } from '@sourcegraph/shared/src/components/CodeExcerpt'
import { FileMatch } from '@sourcegraph/shared/src/components/FileMatch'
import { displayRepoName } from '@sourcegraph/shared/src/components/RepoFileLink'
import { ResultContainer } from '@sourcegraph/shared/src/components/ResultContainer'
import { VirtualList } from '@sourcegraph/shared/src/components/VirtualList'
import { Controller as ExtensionsController } from '@sourcegraph/shared/src/extensions/controller'
import { HoverContext } from '@sourcegraph/shared/src/hover/HoverOverlay.types'
import { PlatformContextProps } from '@sourcegraph/shared/src/platform/context'
import {
    AggregateStreamingSearchResults,
    ContentMatch,
    SymbolMatch,
    PathMatch,
    SearchMatch,
    getMatchUrl,
} from '@sourcegraph/shared/src/search/stream'
import { SettingsCascadeProps } from '@sourcegraph/shared/src/settings/settings'
import { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import { ThemeProps } from '@sourcegraph/shared/src/theme'
import { NotebookComponent } from '@sourcegraph/web/src/notebooks/notebook/NotebookComponent'
import { Link } from '@sourcegraph/wildcard'

import { NoResultsPage } from './NoResultsPage'
import { StreamingSearchResultFooter } from './StreamingSearchResultsFooter'
import { useItemsToShow } from './use-items-to-show'

import styles from './StreamingSearchResultsList.module.scss'

export interface StreamingSearchResultsListProps
    extends ThemeProps,
        SettingsCascadeProps,
        TelemetryProps,
        Pick<SearchContextProps, 'searchContextsEnabled'>,
        PlatformContextProps<'requestGraphQL' | 'sourcegraphURL' | 'urlToFile' | 'settings' | 'forceUpdateTooltip'> {
    isSourcegraphDotCom: boolean
    results?: AggregateStreamingSearchResults
    location: H.Location
    allExpanded: boolean
    fetchHighlightedFileLineRanges: (parameters: FetchFileParameters, force?: boolean) => Observable<string[][]>
    authenticatedUser: AuthenticatedUser | null
    showSearchContext: boolean
    /** Clicking on a match opens the link in a new tab. */
    openMatchesInNewTab?: boolean
    /** Available to web app through JS Context */
    assetsRoot?: string
    /** Render prop for `<SearchUserNeedsCodeHost>`  */
    renderSearchUserNeedsCodeHost?: (user: AuthenticatedUser) => JSX.Element

    extensionsController: Pick<ExtensionsController, 'extHostAPI' | 'executeCommand'>
    hoverifier?: Hoverifier<HoverContext, HoverMerged, ActionItemAction>
}

export const StreamingSearchResultsList: React.FunctionComponent<StreamingSearchResultsListProps> = ({
    results,
    location,
    allExpanded,
    fetchHighlightedFileLineRanges,
    settingsCascade,
    telemetryService,
    isLightTheme,
    isSourcegraphDotCom,
    searchContextsEnabled,
    authenticatedUser,
    showSearchContext,
    assetsRoot,
    renderSearchUserNeedsCodeHost,
    platformContext,
    extensionsController,
    hoverifier,
    openMatchesInNewTab,
}) => {
    const resultsNumber = results?.results.length || 0
    const { itemsToShow, handleBottomHit } = useItemsToShow(location.search, resultsNumber)

    const logSearchResultClicked = useCallback(
        (index: number, type: string) => {
            telemetryService.log('SearchResultClicked')

            // This data ends up in Prometheus and is not part of the ping payload.
            telemetryService.log('search.ranking.result-clicked', { index, type })
        },
        [telemetryService]
    )

    const renderResult = useCallback(
        (result: SearchMatch, index: number): JSX.Element => {
            switch (result.type) {
                case 'content':
                case 'path':
                case 'symbol':
                    return (
                        <FileMatch
                            location={location}
                            telemetryService={telemetryService}
                            icon={getFileMatchIcon(result)}
                            result={result}
                            onSelect={() => logSearchResultClicked(index, 'fileMatch')}
                            expanded={false}
                            showAllMatches={false}
                            allExpanded={allExpanded}
                            fetchHighlightedFileLineRanges={fetchHighlightedFileLineRanges}
                            repoDisplayName={displayRepoName(result.repository)}
                            settingsCascade={settingsCascade}
                            extensionsController={extensionsController}
                            hoverifier={hoverifier}
                            openInNewTab={openMatchesInNewTab}
                        />
                    )
                case 'commit':
                    return (
                        <SearchResult
                            icon={SourceCommitIcon}
                            result={result}
                            repoName={result.repository}
                            platformContext={platformContext}
                            onSelect={() => logSearchResultClicked(index, 'commit')}
                            openInNewTab={openMatchesInNewTab}
                        />
                    )
                case 'repo':
                    return (
                        <SearchResult
                            icon={SourceRepositoryIcon}
                            result={result}
                            repoName={result.repository}
                            platformContext={platformContext}
                            onSelect={() => logSearchResultClicked(index, 'repo')}
                        />
                    )
                case 'notebook':
                    return (
                        <SearchResult
                            icon={NotebookIcon}
                            result={result}
                            repoName={`${result.namespace} / ${result.title}`}
                            platformContext={platformContext}
                            onSelect={() => logSearchResultClicked(index, 'notebook')}
                        />
                    )
                case 'notebook.block':
                    return (
                        <ResultContainer
                            icon={NotebookIcon}
                            title={
                                <Link to={result.notebook.url}>
                                    {result.notebook.namespace} / {result.notebook.title}
                                </Link>
                            }
                            collapsible={false}
                            defaultExpanded={true}
                            resultType={result.type}
                            onResultClicked={noop}
                            expandedChildren={
                                <div className={styles.notebookBlockResult}>
                                    <NotebookComponent
                                        key={`${result.notebook.id}-blocks`}
                                        isEmbedded={true}
                                        noRunButton={true}
                                        // TODO HACK: DB, component, and GraphQL block types
                                        // don't align so we need to massage it into a type
                                        // this component finds acceptable
                                        blocks={result.blocks.map(b => {
                                            if (b.queryInput) {
                                                return { ...b, input: { query: b.queryInput.text } }
                                            }
                                            return {
                                                ...b,
                                                input:
                                                    b.markdownInput || b.fileInput || b.symbolInput || b.computeInput,
                                            }
                                        })}
                                        authenticatedUser={null}
                                        globbing={false}
                                        isReadOnly={true}
                                        extensionsController={extensionsController}
                                        hoverifier={hoverifier}
                                        platformContext={platformContext}
                                        exportedFileName={result.notebook.title}
                                        onSerializeBlocks={noop}
                                        onCopyNotebook={() => NEVER}
                                        streamSearch={() => NEVER} // TODO make this jump to new search page instead
                                        isLightTheme={isLightTheme}
                                        telemetryService={telemetryService}
                                        fetchHighlightedFileLineRanges={fetchHighlightedFileLineRanges}
                                        searchContextsEnabled={searchContextsEnabled}
                                        settingsCascade={settingsCascade}
                                        isSourcegraphDotCom={isSourcegraphDotCom}
                                        showSearchContext={showSearchContext}
                                    />
                                </div>
                            }
                        />
                    )
            }
        },
        [
            location,
            telemetryService,
            logSearchResultClicked,
            allExpanded,
            fetchHighlightedFileLineRanges,
            settingsCascade,
            platformContext,
            extensionsController,
            hoverifier,
            openMatchesInNewTab,
            isLightTheme,
            searchContextsEnabled,
            isSourcegraphDotCom,
            showSearchContext,
        ]
    )

    return (
        <>
            <div className={classNames(styles.contentCentered, 'd-flex flex-column align-items-center')}>
                <div className="align-self-stretch">
                    {renderSearchUserNeedsCodeHost &&
                        isSourcegraphDotCom &&
                        searchContextsEnabled &&
                        authenticatedUser &&
                        results?.state === 'complete' &&
                        results?.results.length === 0 &&
                        renderSearchUserNeedsCodeHost(authenticatedUser)}
                </div>
            </div>
            <VirtualList<SearchMatch>
                className="mt-2"
                itemsToShow={itemsToShow}
                onShowMoreItems={handleBottomHit}
                items={results?.results || []}
                itemProps={undefined}
                itemKey={itemKey}
                renderItem={renderResult}
            />

            {itemsToShow >= resultsNumber && (
                <StreamingSearchResultFooter results={results}>
                    <>
                        {results?.state === 'complete' && resultsNumber === 0 && (
                            <NoResultsPage
                                searchContextsEnabled={searchContextsEnabled}
                                isSourcegraphDotCom={isSourcegraphDotCom}
                                isLightTheme={isLightTheme}
                                telemetryService={telemetryService}
                                showSearchContext={showSearchContext}
                                assetsRoot={assetsRoot}
                            />
                        )}
                    </>
                </StreamingSearchResultFooter>
            )}
        </>
    )
}

function itemKey(item: SearchMatch): string {
    if (item.type === 'content' || item.type === 'symbol') {
        return `file:${getMatchUrl(item)}`
    }
    return getMatchUrl(item)
}

function getFileMatchIcon(result: ContentMatch | SymbolMatch | PathMatch): React.ComponentType<{ className?: string }> {
    switch (result.type) {
        case 'content':
            return FileDocumentIcon
        case 'symbol':
            return AlphaSBoxIcon
        case 'path':
            return FileIcon
    }
}
