import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import AssignDoc from './AssignDoc';
import AssignDocLink from './AssignDocLink';
import DocData from '../../../liquid_doc.json';
import findLiquidTagName from './findLiquidTagName';
import FilterDoc from './FilterDoc';
import FilterDocLink from './FilterDocLink';
import { LiquidAssignsQuery } from './queries.gql';
import LiquidTagDoc from './LiquidTagDoc';
import LiquidTagDocLink from './LiquidTagDocLink';
import QueryWithStateDisplay from '../QueryWithStateDisplay';

function sortByName(items) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, { sensitivity: 'base' }));
}

function LiquidDocs() {
  return (
    <QueryWithStateDisplay query={LiquidAssignsQuery}>
      {({ data: { liquidAssigns } }) => {
        const sortedAssigns = sortByName(liquidAssigns);
        const sortedFilters = sortByName(DocData.filter_methods);
        const sortedTags = sortByName(
          DocData.classes.filter(
            klass => klass.tags.some(tag => tag.tag_name === 'liquid_tag_name'),
          ),
        );

        return (
          <>
            <Switch>
              {sortedAssigns.map(assign => (
                <Route
                  path={`/liquid_docs/assigns/${assign.name}(\\..*)?`}
                  render={() => (
                    <AssignDoc assign={assign} />
                  )}
                  key={`route-${assign.name}`}
                />
              ))}
              {sortedFilters.map(filter => (
                <Route
                  path={`/liquid_docs/filters/${filter.name}(\\..*)?`}
                  render={() => (
                    <FilterDoc filter={filter} />
                  )}
                  key={`route-${filter.name}`}
                />
              ))}
              {sortedTags.map(liquidTag => (
                <Route
                  path={`/liquid_docs/tags/${findLiquidTagName(liquidTag)}(\\..*)?`}
                  render={() => (
                    <LiquidTagDoc liquidTag={liquidTag} />
                  )}
                  key={`route-${liquidTag.name}`}
                />
              ))}

              <Route path="/liquid_docs" exact>
                <>
                  <nav aria-label="breadcrumb mb-4">
                    <ol className="breadcrumb">
                      <li className="breadcrumb-item active" aria-current="page">Documentation home</li>
                    </ol>
                  </nav>

                  <section className="mb-4">
                    <h2 className="mb-2">Assigns</h2>

                    {
                      sortedAssigns.map(assign => (
                        <AssignDocLink compact assign={assign} key={assign.name} />
                      ))
                    }
                  </section>

                  <section className="mb-4">
                    <h2 className="mb-2">Filters</h2>
                    <ul className="list-group">
                      {
                        sortedFilters.map(filter => (
                          <FilterDocLink compact filter={filter} key={filter.name} />
                        ))
                      }
                    </ul>
                  </section>

                  <section>
                    <h2 className="mb-2">Tags</h2>

                    {
                      sortedTags.map(liquidTag => (
                        <LiquidTagDocLink compact liquidTag={liquidTag} key={liquidTag.name} />
                      ))
                    }
                  </section>
                </>
              </Route>

              <Redirect to="/liquid_docs" />
            </Switch>
          </>
        );
      }}
    </QueryWithStateDisplay>
  );
}

export default LiquidDocs;