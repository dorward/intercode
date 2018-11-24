import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import arrayToSentence from 'array-to-sentence';
import { capitalize } from 'inflected';

import EventCategory from '../../EventAdmin/EventCategory';
import getSortedRuns from './getSortedRuns';
import pluralizeWithCount from '../../pluralizeWithCount';

function renderFirstRunTime(event, timezoneName) {
  if (event.runs.length > 0) {
    const sortedRuns = getSortedRuns(event);
    if (sortedRuns.length > 4) {
      const firstRunStart = moment.tz(sortedRuns[0].starts_at, timezoneName);
      return `${sortedRuns.length} runs starting ${firstRunStart.format('dddd h:mma')}`;
    }

    let previousDayName = null;

    return arrayToSentence([
      ...sortedRuns.map((run) => {
        const runStart = moment.tz(run.starts_at, timezoneName);
        const dayName = runStart.format('dddd');
        if (previousDayName === dayName) {
          return runStart.format('h:mma');
        }

        previousDayName = dayName;
        return `${dayName} ${runStart.format('h:mma')}`;
      }),
    ]);
  }

  return 'Unscheduled';
}

function teamMemberSortKey(teamMember) {
  return `${teamMember.user_con_profile.last_name}-${teamMember.user_con_profile.name_without_nickname}`;
}

function sortTeamMembers(event) {
  return [...event.team_members]
    .sort((a, b) => teamMemberSortKey(a).localeCompare(teamMemberSortKey(b), { sensitivity: 'base' }));
}

function teamIsAllAuthors(author, teamMembers) {
  if (!author || !teamMembers) {
    return false;
  }

  const teamMemberNames = teamMembers
    .map(teamMember => teamMember.user_con_profile.name_without_nickname);

  if (!teamMemberNames.every(teamMemberName => author.includes(teamMemberName))) {
    return false;
  }

  if (author.length > teamMemberNames.join(' and ').length) {
    return false;
  }

  return true;
}

const EventCard = ({ event, timezoneName, sorted }) => {
  const formResponse = JSON.parse(event.form_response_attrs_json);
  const metadataItems = [];

  const teamMemberNames = sortTeamMembers(event)
    .map(teamMember => teamMember.user_con_profile.name_without_nickname).join(', ');

  if (teamMemberNames) {
    const teamMemberDescription = pluralizeWithCount(
      capitalize(event.team_member_name),
      event.team_members.length,
      true,
    );

    metadataItems.push({
      key: 'team_members',
      content: (
        <React.Fragment>
          <strong>
            {teamMemberDescription}
            {':'}
          </strong>
          {' '}
          {teamMemberNames}
        </React.Fragment>
      ),
    });
  }

  if (formResponse.author && !teamIsAllAuthors(formResponse.author, event.team_members)) {
    const authorDescription = pluralizeWithCount('Author', formResponse.author.split(/(,|;| and )/).length, true);
    metadataItems.push({
      key: 'author',
      content: (
        <React.Fragment>
          <strong>
            {authorDescription}
            {':'}
          </strong>
          {' '}
          {formResponse.author}
        </React.Fragment>
      ),
    });
  }

  if (formResponse.organization) {
    metadataItems.push({
      key: 'organization',
      content: (
        <React.Fragment>
          <strong>Organization:</strong>
          {' '}
          {formResponse.organization}
        </React.Fragment>
      ),
    });
  }

  return (
    <div className="card mb-4" key={event.id}>
      <div className="card-header">
        <div className="d-flex flex-wrap mb-3">
          <div className="d-flex flex-grow-1">
            <h4 className="m-0">
              <a href={`/events/${event.id}`}>{event.title}</a>
            </h4>
            {
              event.category !== 'filler'
                ? (
                  <div className="lead ml-2 text-muted">
                    {EventCategory.get(event.category).name}
                  </div>
                )
                : null
            }
          </div>
          <div className="lead">
            {renderFirstRunTime(event, timezoneName)}
          </div>
        </div>
        <ul className="list-inline my-1">
          {metadataItems.map(metadataItem => (
            <li className="list-inline-item mr-4" key={metadataItem.key}>
              {metadataItem.content}
            </li>
          ))}
        </ul>
        <p className="m-0">
          {
            sorted.some(sort => sort.id === 'created_at')
              ? (
                <strong>
                  Added
                  {' '}
                  {moment.tz(event.created_at, timezoneName).format('dddd, MMMM D, YYYY [at] h:mma')}
                </strong>
              )
              : null
          }
        </p>
      </div>

      <div
        className="card-body"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: event.short_blurb_html }}
      />
    </div>
  );
};

EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    category: PropTypes.string.isRequired,
    title: PropTypes.string,
    form_response_attrs_json: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
  }).isRequired,
  timezoneName: PropTypes.string.isRequired,
  sorted: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    desc: PropTypes.bool.isRequired,
  })),
};

EventCard.defaultProps = {
  sorted: null,
};

export default EventCard;
