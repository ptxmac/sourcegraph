import React from 'react'

import classNames from 'classnames'

import { InputTooltip } from '../../../../components/InputTooltip'
import { HiddenExternalChangesetFields } from '../../../../graphql-operations'

import { ChangesetStatusCell } from './ChangesetStatusCell'
import { HiddenExternalChangesetInfoCell } from './HiddenExternalChangesetInfoCell'

import styles from './HiddenExternalChangesetNode.module.scss'

export interface HiddenExternalChangesetNodeProps {
    node: Pick<HiddenExternalChangesetFields, 'id' | 'nextSyncAt' | 'updatedAt' | 'state' | '__typename'>
}

export const HiddenExternalChangesetNode: React.FunctionComponent<HiddenExternalChangesetNodeProps> = ({ node }) => (
    <>
        <span className="d-none d-sm-block" />
        <div>
            <InputTooltip
                id={`select-changeset-${node.id}`}
                checked={false}
                disabled={true}
                className="p-2"
                tooltip="You do not have permission to perform a bulk operation on this changeset"
            />
        </div>
        <ChangesetStatusCell
            id={node.id}
            state={node.state}
            className={classNames(styles.hiddenExternalChangesetNodeStatus, 'p-2 text-muted d-block d-sm-flex')}
        />
        <HiddenExternalChangesetInfoCell
            node={node}
            className={classNames(styles.hiddenExternalChangesetNodeInformation, 'p-2')}
        />
        <span className="d-none d-sm-block" />
        <span className="d-none d-sm-block" />
        <span className="d-none d-sm-block" />
    </>
)
