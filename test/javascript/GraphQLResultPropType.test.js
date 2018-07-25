import gql from 'graphql-tag';
import GraphQLResultPropType from '../../app/javascript/GraphQLResultPropType';

const query = gql`
query {
  something {
    subField
  }
}
`;

describe('GraphQLResultPropType', () => {
  const fieldProp = GraphQLResultPropType(query);
  const checkFieldProp = data => fieldProp({ data }, 'data', 'MyComponent', 'prop');

  test('it passes if the result is not back yet', () => {
    expect(checkFieldProp({ loading: true })).toBeNull();
  });

  test('it fails if the required field is missing', () => {
    expect(checkFieldProp({ loading: false }).message)
      .toMatch(/^something missing on /);
  });

  test('it fails if the field is missing data', () => {
    expect(checkFieldProp({ loading: false, something: {} }).message)
      .toMatch(/^subField missing on /);
  });

  test('it passes if the data is there', () => {
    expect(checkFieldProp({ loading: false, something: { subField: 1 } })).toBeNull();
  });

  describe('isRequired', () => {
    const requiredFieldProp = fieldProp.isRequired;
    const checkRequiredFieldProp = data => requiredFieldProp({ data }, 'data', 'MyComponent', 'prop');

    test('it passes if the result is not back yet', () => {
      expect(checkRequiredFieldProp({ loading: true })).toBeNull();
    });

    test('it fails if the required field is missing', () => {
      expect(checkRequiredFieldProp({ loading: false }).message)
        .toMatch(/^something missing on /);
    });

    test('it fails if the field is missing data', () => {
      expect(checkRequiredFieldProp({ loading: false, something: {} }).message)
        .toMatch(/^subField missing on /);
    });

    test('it passes if the data is there', () => {
      expect(checkRequiredFieldProp({ loading: false, something: { subField: 1 } })).toBeNull();
    });
  });
});
