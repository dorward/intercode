import { useState } from 'react';

import ErrorDisplay from '../ErrorDisplay';
import TabbedMailingList from './TabbedMailingList';
import Timespan, { FiniteTimespan } from '../Timespan';
import WhosFreeForm from './WhosFreeForm';
import LoadingIndicator from '../LoadingIndicator';
import usePageTitle from '../usePageTitle';
import { useWhosFreeQueryQuery } from './queries.generated';

function WhosFreeResults({ timespan }: { timespan: FiniteTimespan }) {
  const { data, loading, error } = useWhosFreeQueryQuery({
    variables: { start: timespan.start.toISO(), finish: timespan.finish.toISO() },
  });

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error || !data) {
    return <ErrorDisplay graphQLError={error} />;
  }

  return (
    <TabbedMailingList
      emails={data.convention.mailing_lists.whos_free.emails}
      metadataFields={data.convention.mailing_lists.whos_free.metadata_fields}
      csvFilename={`Who's free - ${data.convention.name}.csv`}
    />
  );
}

function WhosFree() {
  const [timespan, setTimespan] = useState<FiniteTimespan>();

  usePageTitle('Who‘s free');

  return (
    <>
      <h1 className="mb-4">Who&rsquo;s free?</h1>
      <WhosFreeForm
        onSubmit={({ start, finish }) => setTimespan(Timespan.finiteFromDateTimes(start, finish))}
      />
      {timespan && <WhosFreeResults timespan={timespan} />}
    </>
  );
}

export default WhosFree;
