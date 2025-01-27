import { useParams } from 'react-router-dom';

import CmsGraphqlQueryForm from './CmsGraphqlQueryForm';
import usePageTitle from '../../usePageTitle';
import PageLoadingIndicator from '../../PageLoadingIndicator';
import ErrorDisplay from '../../ErrorDisplay';

import 'graphiql/graphiql.css';
import { useCmsGraphqlQueriesQueryQuery } from './queries.generated';
import FourOhFourPage from '../../FourOhFourPage';

function ViewCmsGraphqlQuerySource() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useCmsGraphqlQueriesQueryQuery();
  const query =
    loading || error ? null : data?.cmsGraphqlQueries.find((q) => q.id.toString() === id);

  usePageTitle(`View “${(query || {}).identifier}” Source`);

  if (loading) {
    return <PageLoadingIndicator visible />;
  }

  if (error) {
    return <ErrorDisplay graphQLError={error} />;
  }

  if (!query) {
    return <FourOhFourPage />;
  }

  return (
    <>
      <h2 className="mb-4">View GraphQL query source</h2>

      <div className="mb-4">
        <CmsGraphqlQueryForm value={query} readOnly />
      </div>
    </>
  );
}

export default ViewCmsGraphqlQuerySource;
