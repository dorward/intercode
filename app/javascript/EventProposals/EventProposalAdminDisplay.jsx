import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Mutation } from 'react-apollo';

import AdminNotes from '../BuiltInFormControls/AdminNotes';
import EventProposalDisplay from './EventProposalDisplay';
import EventProposalStatusUpdater from './EventProposalStatusUpdater';
import { eventProposalQueryWithOwner, eventProposalAdminNotesQuery } from './queries';
import QueryWithStateDisplay from '../QueryWithStateDisplay';
import { updateEventProposalAdminNotesMutation } from './mutations';

class EventProposalAdminDisplay extends React.PureComponent {
  static propTypes = {
    eventProposalId: PropTypes.number.isRequired,
  }

  render = () => (
    <QueryWithStateDisplay
      query={eventProposalQueryWithOwner}
      variables={{ eventProposalId: this.props.eventProposalId }}
    >
      {({ data }) => (
        <React.Fragment>
          <div className="d-flex justify-space-between align-items-baseline">
            <div className="col">
              <h1>{data.eventProposal.title}</h1>
            </div>

            {
              data.myProfile.ability.can_update_event_proposal
                ? (
                  <EventProposalStatusUpdater
                    eventProposalId={this.props.eventProposalId}
                    initialStatus={data.eventProposal.status}
                  />
                )
                : (
                  <div>
                    <strong>Status: </strong>
                    {data.eventProposal.status}
                  </div>
                )
            }
          </div>

          <div className="my-4 d-flex align-items-end">
            {
              data.eventProposal.event
                ? (
                  <a href={`/events/${data.eventProposal.event.id}`} className="btn btn-outline-primary">
                    Go to event
                  </a>
                )
                : (
                  <Link
                    to={`/${this.props.eventProposalId}/edit`}
                    className="btn btn-outline-primary"
                  >
                    Edit proposal
                  </Link>
                )
            }
            <div className="flex-grow-1 d-flex justify-content-end">
              {
                data.myProfile.ability.can_read_admin_notes_on_event_proposal
                  ? (
                    <QueryWithStateDisplay
                      query={eventProposalAdminNotesQuery}
                      variables={{ eventProposalId: this.props.eventProposalId }}
                    >
                      {({ data: adminNotesData }) => (
                        <Mutation mutation={updateEventProposalAdminNotesMutation}>
                          {mutate => (
                            <AdminNotes
                              value={adminNotesData.eventProposal.admin_notes}
                              mutate={adminNotes => mutate({
                                variables: {
                                  eventProposalId: this.props.eventProposalId,
                                  adminNotes,
                                },
                                update: (cache) => {
                                  const { eventProposal } = cache.readQuery({
                                    query: eventProposalAdminNotesQuery,
                                    variables: { eventProposalId: this.props.eventProposalId },
                                  });
                                  cache.writeQuery({
                                    query: eventProposalAdminNotesQuery,
                                    variables: { eventProposalId: this.props.eventProposalId },
                                    data: {
                                      eventProposal: {
                                        ...eventProposal,
                                        admin_notes: adminNotes,
                                      },
                                    },
                                  });
                                },
                              })}
                            />
                          )}
                        </Mutation>
                      )}
                    </QueryWithStateDisplay>
                  )
                  : null
              }
            </div>
          </div>

          <EventProposalDisplay eventProposalId={this.props.eventProposalId} />
        </React.Fragment>
      )}
    </QueryWithStateDisplay>
  )
}

export default EventProposalAdminDisplay;
