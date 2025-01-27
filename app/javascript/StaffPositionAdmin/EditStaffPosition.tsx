import { useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { ApolloError } from '@apollo/client';

import ErrorDisplay from '../ErrorDisplay';
import StaffPositionForm from './StaffPositionForm';
import useAsyncFunction from '../useAsyncFunction';
import usePageTitle from '../usePageTitle';
import buildStaffPositionInput from './buildStaffPositionInput';
import { LoadSingleValueFromCollectionWrapper } from '../GraphqlLoadingWrappers';
import { useStaffPositionsQueryQuery } from './queries.generated';
import { useUpdateStaffPositionMutation } from './mutations.generated';

export default LoadSingleValueFromCollectionWrapper(
  useStaffPositionsQueryQuery,
  (data, id) => data.convention.staff_positions.find((sp) => sp.id.toString(10) === id),
  function EditStaffPosition({ value: initialStaffPosition }) {
    const history = useHistory();
    const [staffPosition, setStaffPosition] = useState(initialStaffPosition);
    const [updateMutate] = useUpdateStaffPositionMutation();
    const [mutate, updateError, requestInProgress] = useAsyncFunction(updateMutate);

    usePageTitle(`Editing “${initialStaffPosition.name}”`);

    const saveClicked = useCallback(async () => {
      await mutate({
        variables: {
          input: {
            id: staffPosition.id,
            staff_position: buildStaffPositionInput(staffPosition),
          },
        },
      });
      history.push('/staff_positions');
    }, [mutate, staffPosition, history]);

    return (
      <div>
        <h1 className="mb-4">Editing {initialStaffPosition.name}</h1>
        <StaffPositionForm staffPosition={staffPosition} onChange={setStaffPosition} />
        <ErrorDisplay graphQLError={updateError as ApolloError} />
        <button
          type="button"
          className="btn btn-primary"
          onClick={saveClicked}
          disabled={requestInProgress}
        >
          Save changes
        </button>
      </div>
    );
  },
);
