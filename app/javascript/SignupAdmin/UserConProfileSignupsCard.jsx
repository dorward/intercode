import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import moment from 'moment-timezone';
import { Mutation } from 'react-apollo';

import Confirm from '../ModalDialogs/Confirm';
import { formatSignupStatus } from './SignupUtils';
import QueryWithStateDisplay from '../QueryWithStateDisplay';
import { timespanFromRun } from '../TimespanUtils';

const userConProfileSignupsFragment = gql`
fragment UserConProfileSignupsFragment on UserConProfile {
  signups {
    id
    state
    counted
    bucket_key
    requested_bucket_key

    user_con_profile {
      id
    }

    run {
      id
      starts_at

      event {
        id
        title
        length_seconds
        team_member_name

        registration_policy {
          buckets {
            key
            name
          }
        }

        team_members {
          id

          user_con_profile {
            id
          }
        }
      }

      rooms {
        id
        name
      }
    }
  }
}
`;

const userConProfileSignupsQuery = gql`
query($id: Int!) {
  convention {
    name
    timezone_name
  }

  myProfile {
    id

    ability {
      can_update_signups
    }
  }

  userConProfile(id: $id) {
    id
    name_without_nickname

    team_members {
      id

      event {
        id
        title
      }
    }

    ...UserConProfileSignupsFragment
  }
}

${userConProfileSignupsFragment}
`;

const withdrawFromAllMutation = gql`
mutation($userConProfileId: Int!) {
  withdrawAllUserConProfileSignups(input: { user_con_profile_id: $userConProfileId }) {
    user_con_profile {
      id

      ...UserConProfileSignupsFragment
    }
  }
}

${userConProfileSignupsFragment}
`;

function filterAndSortSignups(signups) {
  const filteredSignups = signups.filter(({ state }) => state !== 'withdrawn');

  return filteredSignups
    .sort((a, b) => moment(a.run.starts_at).valueOf() - moment(b.run.starts_at).valueOf());
}

class UserConProfileSignupsCard extends React.Component {
  static propTypes = {
    userConProfileId: PropTypes.number.isRequired,
  }

  renderEventLink = event => (
    <a href={`/events/${event.id}`}>
      {event.title}
    </a>
  )

  renderSignup = (signup, convention) => (
    <li className="list-group-item" key={signup.id}>
      <ul className="list-unstyled">
        <li><strong>{this.renderEventLink(signup.run.event)}</strong></li>
        <li>{formatSignupStatus(signup, signup.run.event)}</li>
        <li>
          <small>
            {timespanFromRun(convention, signup.run.event, signup.run)
              .humanizeInTimezone(convention.timezone_name)
            }
          </small>
        </li>
        <li>
          <small>
            {
              signup.run.rooms.map(room => room.name)
                .sort((a, b) => a.localeCompare(b, { sensitivity: 'base' })).join(', ')
            }
          </small>
        </li>
      </ul>
    </li>
  )

  renderUnSignedUpTeamMemberEvents = (userConProfile, myProfile) => {
    const unSignedUpEvents = userConProfile.team_members
      .filter(teamMember => !userConProfile.signups
        .some(signup => signup.run.event.id === teamMember.event.id && signup.state === 'confirmed'))
      .map(teamMember => teamMember.event);

    if (unSignedUpEvents.length === 0) {
      return null;
    }

    return (
      <li className="list-group-item list-group-item-warning">
        {(
          userConProfile.id === myProfile.id
            ? 'You are a team member for the following events, but are not signed up for them:'
            : `${userConProfile.name_without_nickname} is a team member for the following events, but is not signed up for them:`
        )}
        {' '}
        {unSignedUpEvents.map(event => this.renderEventLink(event)).reduce((prev, curr) => [prev, ', ', curr])}
      </li>
    );
  }

  render = () => (
    <QueryWithStateDisplay
      query={userConProfileSignupsQuery}
      variables={{ id: this.props.userConProfileId }}
    >
      {({ data }) => {
        const signups = filterAndSortSignups(data.userConProfile.signups);

        return (
          <div className="card">
            <div className="card-header">Signups</div>
            <ul className="list-group list-group-flush">
              {
                signups.length === 0
                  ? <li className="list-group-item"><em>No signups</em></li>
                  : null
              }
              {signups.map(signup => this.renderSignup(signup, data.convention))}
              {this.renderUnSignedUpTeamMemberEvents(data.userConProfile, data.myProfile)}
            </ul>
            {
              data.myProfile.ability.can_update_signups && signups.length > 0
                ? (
                  <div className="card-footer border-top-0">
                    <Mutation mutation={withdrawFromAllMutation}>
                      {mutate => (
                        <Confirm.Trigger>
                          {confirm => (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => confirm({
                                prompt: `Are you sure you want to withdraw ${data.userConProfile.name_without_nickname} from all their events at ${data.convention.name}?`,
                                action: () => mutate({
                                  variables: { userConProfileId: this.props.userConProfileId },
                                }),
                              })}
                            >
                            Withdraw from all
                            </button>
                          )}
                        </Confirm.Trigger>
                      )}
                    </Mutation>
                  </div>
                ) : null
            }
          </div>
        );
      }}
    </QueryWithStateDisplay>
  );
}

export default UserConProfileSignupsCard;
