import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import { useTranslation } from 'react-i18next';

import useReactTableWithTheWorks, { QueryDataContext } from '../../Tables/useReactTableWithTheWorks';
import { RunSignupChangesQuery } from './queries';
import UserConProfileWithGravatarCell from '../../Tables/UserConProfileWithGravatarCell';
import FreeTextFilter from '../../Tables/FreeTextFilter';
import { buildFieldFilterCodecs, FilterCodecs } from '../../Tables/FilterUtils';
import TimestampCell from '../../Tables/TimestampCell';
import SignupChangeActionFilter from '../../Tables/SignupChangeActionFilter';
import SignupChangeCell from '../../Tables/SignupChangeCell';
import BucketChangeCell from '../../Tables/BucketChangeCell';
import TableHeader from '../../Tables/TableHeader';
import usePageTitle from '../../usePageTitle';
import useValueUnless from '../../useValueUnless';
import SignupChangesTableExportButton from '../../Tables/SignupChangesTableExportButton';

const FILTER_CODECS = buildFieldFilterCodecs({
  action: FilterCodecs.stringArray,
});

const getPossibleColumns = (t) => [
  {
    Header: t('events.signupAdmin.history.nameHeader', 'Name'),
    id: 'name',
    accessor: (signupChange) => signupChange.user_con_profile,
    sortable: false,
    filterable: true,
    Cell: UserConProfileWithGravatarCell,
    Filter: FreeTextFilter,
  },
  {
    Header: t('events.signupAdmin.history.changeHeader', 'Change'),
    id: 'action',
    accessor: (signupChange) => signupChange,
    sortable: false,
    filterable: true,
    Cell: SignupChangeCell,
    Filter: SignupChangeActionFilter,
  },
  {
    Header: t('events.signupAdmin.history.bucketHeader', 'Bucket'),
    id: 'bucket_change',
    accessor: (signupChange) => signupChange,
    sortable: false,
    filterable: false,
    Cell: BucketChangeCell,
  },
  {
    Header: t('events.signupAdmin.history.timestampHeader', 'Timestamp'),
    id: 'created_at',
    accessor: 'created_at',
    sortable: false,
    filterable: false,
    width: 130,
    // eslint-disable-next-line react/prop-types
    Cell: ({ value }) => <TimestampCell value={value} />,
  },
];

function RunSignupChangesTable({ runId }) {
  const { t } = useTranslation();
  const getPossibleColumnsFunc = useMemo(
    () => () => getPossibleColumns(t),
    [t],
  );
  const [reactTableProps, {
    queryData, tableHeaderProps, columnSelectionProps,
  }] = useReactTableWithTheWorks({
    decodeFilterValue: FILTER_CODECS.decodeFilterValue,
    defaultVisibleColumns: [
      'name', 'action', 'bucket_change', 'created_at',
    ],
    encodeFilterValue: FILTER_CODECS.encodeFilterValue,
    getData: ({ data }) => data.run.signup_changes_paginated.entries,
    getPages: ({ data }) => data.run.signup_changes_paginated.total_pages,
    getPossibleColumns: getPossibleColumnsFunc,
    query: RunSignupChangesQuery,
    storageKeyPrefix: 'signupSpy',
    variables: { runId },
  });

  usePageTitle(useValueUnless(
    () => t(
      'events.signupAdmin.historyPageTitle', 'Signup change history - {{ eventTitle }}',
      { eventTitle: queryData.run.event.title },
    ),
    !queryData,
  ));

  return (
    <QueryDataContext.Provider value={queryData}>
      <ReactTable
        {...reactTableProps}
        className="-striped -highlight"
        getTheadFilterThProps={() => ({ className: 'text-left', style: { overflow: 'visible' } })}
      >
        {(state, makeTable) => (
          <div className="mb-4">
            <TableHeader
              {...tableHeaderProps}
              exportButton={(
                <SignupChangesTableExportButton
                  exportUrl={`/csv_exports/run_signup_changes?run_id=${runId}`}
                  filtered={tableHeaderProps.filtered}
                  sorted={tableHeaderProps.sorted}
                  visibleColumnIds={columnSelectionProps.visibleColumnIds}
                />
              )}
            />
            {makeTable()}
          </div>
        )}
      </ReactTable>
    </QueryDataContext.Provider>
  );
}

RunSignupChangesTable.propTypes = {
  runId: PropTypes.number.isRequired,
};

export default RunSignupChangesTable;
