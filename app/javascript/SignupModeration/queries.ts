import { gql } from '@apollo/client';
import { RunCardRegistrationPolicyFields } from '../EventsApp/EventPage/queries';

export const SignupModerationRunFields = gql`
  fragment SignupModerationRunFields on Run {
    id
    title_suffix
    starts_at

    event {
      id
      title
      length_seconds
    }
  }
`;

export const SignupModerationSignupRequestFields = gql`
  fragment SignupModerationSignupRequestFields on SignupRequest {
    id
    state
    requested_bucket_key
    created_at

    user_con_profile {
      id
      name
    }

    replace_signup {
      id

      run {
        id
        ...SignupModerationRunFields
      }
    }

    target_run {
      id
      signup_count_by_state_and_bucket_key_and_counted
      ...SignupModerationRunFields

      event {
        id
        registration_policy {
          buckets {
            key
            name
            total_slots
            slots_limited
            anything
          }
        }
      }
    }

    result_signup {
      id
      state
      waitlist_position
    }
  }

  ${SignupModerationRunFields}
`;

export const CreateSignupEventsQuery = gql`
  query CreateSignupEventsQuery($title: String) {
    convention {
      id
      events_paginated(filters: { title: $title }, per_page: 50) {
        entries {
          id
          title
          length_seconds
          private_signup_list

          runs {
            id
            starts_at
            title_suffix

            rooms {
              id
              name
            }
          }
        }
      }
    }
  }
`;

export const CreateSignupRunCardQuery = gql`
  query CreateSignupRunCardQuery($userConProfileId: Int!, $eventId: Int!) {
    currentAbility {
      can_read_event_signups(event_id: $eventId)
    }

    event(id: $eventId) {
      id
      title
      length_seconds
      private_signup_list

      registration_policy {
        ...RunCardRegistrationPolicyFields
      }

      team_members {
        id
        user_con_profile {
          id
        }
      }

      event_category {
        id
        team_member_name
      }

      runs {
        id
        starts_at
        title_suffix
        signup_count_by_state_and_bucket_key_and_counted

        rooms {
          id
          name
        }
      }
    }

    userConProfile(id: $userConProfileId) {
      id
      name_without_nickname

      signups {
        id
        state
        waitlist_position

        run {
          id
        }
      }

      signup_requests {
        id
        state

        target_run {
          id
        }
      }
    }
  }

  ${RunCardRegistrationPolicyFields}
`;

export const SignupModerationQueueQuery = gql`
  query SignupModerationQueueQuery($page: Int) {
    convention {
      id

      signup_requests_paginated(
        sort: [{ field: "state", desc: false }, { field: "created_at", desc: false }]
        page: $page
        per_page: 10
      ) {
        total_pages

        entries {
          id
          ...SignupModerationSignupRequestFields
        }
      }
    }
  }

  ${SignupModerationSignupRequestFields}
`;
