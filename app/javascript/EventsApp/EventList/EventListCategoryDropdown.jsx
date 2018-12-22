import React from 'react';
import PropTypes from 'prop-types';
import { pluralize } from 'inflected';

import ChoiceSet from '../../BuiltInFormControls/ChoiceSet';
import PopperDropdown from '../../UIComponents/PopperDropdown';
import { Transforms } from '../../ComposableFormUtils';

const EventListCategoryDropdown = ({ eventCategories, value, onChange }) => {
  const currentCategories = eventCategories
    .filter(category => (value || []).includes(category.id));

  let categoryDescription = 'All events';
  if (currentCategories.length === 1) {
    categoryDescription = pluralize(currentCategories[0].name);
  } else if (currentCategories.length > 1) {
    categoryDescription = `${currentCategories.length} event types`;
  }

  const sortedCategories = [...eventCategories].sort((a, b) => a.name.localeCompare(b.name, { sensitivity: 'base' }));

  return (
    <PopperDropdown
      renderReference={({ ref, toggle }) => (
        <button
          type="button"
          className="btn btn-link dropdown-toggle"
          ref={ref}
          onClick={toggle}
          style={{ whiteSpace: 'normal' }}
        >
          {categoryDescription}
        </button>
      )}
      placement="bottom-end"
    >
      <div className="p-2">
        <ChoiceSet
          choices={sortedCategories
            .map(category => ({
              label: category.name,
              value: category.id.toString(),
            }))
          }
          value={(value || []).map(integer => integer.toString())}
          onChange={(integerArray) => { onChange(integerArray.map(Transforms.integer)); }}
          multiple
        />
      </div>
    </PopperDropdown>
  );
};

EventListCategoryDropdown.propTypes = {
  eventCategories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

EventListCategoryDropdown.defaultProps = {
  value: null,
};

export default EventListCategoryDropdown;
