import React from 'react'

import { gql } from '@sourcegraph/http-client'

import { ComponentOwnerLinkFields } from '../../../../graphql-operations'
import { PersonLink, personLinkFieldsFragment } from '../../../../person/PersonLink'
import { GroupLink, GROUP_LINK_FRAGMENT } from '../group-link/GroupLink'

export const COMPONENT_OWNER_LINK_FRAGMENT = gql`
    fragment ComponentOwnerLinkFields on Component {
        owner {
            __typename
            ... on Person {
                ...PersonLinkFields
                avatarURL
            }
            ... on Group {
                ...GroupLinkFields
                members {
                    ...PersonLinkFields
                    avatarURL
                }
                ancestorGroups {
                    ...GroupLinkFields
                }
            }
        }
    }
    ${personLinkFieldsFragment}
    ${GROUP_LINK_FRAGMENT}
`

interface Props {
    owner: ComponentOwnerLinkFields['owner']
    blankIfNone?: boolean
    className?: string
}

/**
 * A link to a component's owner (a person, group, or no owner).
 */
export const ComponentOwnerLink: React.FunctionComponent<Props> = ({ owner, blankIfNone, className }) =>
    owner ? (
        owner.__typename === 'Person' ? (
            <PersonLink person={owner} className={className} />
        ) : owner.__typename === 'Group' ? (
            <GroupLink group={owner} className={className} />
        ) : (
            <span className={className}>Unknown</span>
        )
    ) : (
        <span className={className}>{blankIfNone ? '' : 'None'}</span>
    )