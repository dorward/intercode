import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';
import gql from 'graphql-tag';
import { enableUniqueIds } from 'react-html-id';
import ErrorDisplay from '../ErrorDisplay';
import GraphQLQueryResultWrapper from '../GraphQLQueryResultWrapper';
import GraphQLResultPropType from '../GraphQLResultPropType';
import LoadingIndicator from '../LoadingIndicator';
import formatMoney from '../formatMoney';
import { parseIntOrNull } from '../ComposableFormUtils';
import sortProductVariants from './sortProductVariants';

const productQuery = gql`
query OrderFormProductQuery($productId: Int!) {
  product(id: $productId) {
    price {
      fractional
    }

    product_variants {
      id
      name
      position
      override_price {
        fractional
      }
    }
  }
}
`;

const addOrderEntryToCurrentPendingOrderMutation = gql`
mutation AddOrderEntryToCurrentPendingOrder($input: AddOrderEntryToCurrentPendingOrderInput!) {
  addOrderEntryToCurrentPendingOrder(input: $input) {
    order_entry {
      id
    }
  }
}
`;

@flowRight([
  graphql(productQuery),
  graphql(addOrderEntryToCurrentPendingOrderMutation, {
    props: ({ mutate }) => ({
      addOrderEntryToCurrentPendingOrder: (productId, productVariantId, quantity) => mutate({
        variables: {
          input: {
            order_entry: {
              product_id: productId,
              product_variant_id: productVariantId,
              quantity,
            },
          },
        },
      }),
    }),
  }),
])
@GraphQLQueryResultWrapper
class ProductOrderForm extends React.Component {
  static propTypes = {
    productId: PropTypes.number.isRequired,
    cartUrl: PropTypes.string.isRequired,
    data: GraphQLResultPropType(productQuery).isRequired,
    addOrderEntryToCurrentPendingOrder: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    enableUniqueIds(this);

    this.state = {
      productVariantId: null,
      quantity: 1,
      error: null,
      submitting: false,
    };
  }

  isDataComplete = () => (
    (
      this.props.data.product.product_variants.length < 1
      || this.state.productVariantId != null
    )
    && this.state.quantity > 0
  )

  productVariantSelectorChanged = (event) => {
    this.setState({ productVariantId: parseIntOrNull(event.target.value) });
  }

  quantityChanged = (event) => {
    this.setState({ quantity: parseIntOrNull(event.target.value) });
  }

  addToCartClicked = async () => {
    try {
      this.setState({ error: null, submitting: true });
      await this.props.addOrderEntryToCurrentPendingOrder(
        this.props.productId,
        this.state.productVariantId,
        this.state.quantity,
      );

      window.location.href = this.props.cartUrl;
    } catch (error) {
      this.setState({ error, submitting: false });
    }
  }

  renderVariantSelect = () => {
    if (this.props.data.product.product_variants.length < 1) {
      return null;
    }

    const variants = sortProductVariants(this.props.data.product.product_variants);
    const options = variants.map((variant) => {
      const { id, name, override_price: overridePrice } = variant;

      let overridePriceDescription = '';
      if (overridePrice && overridePrice.fractional !== this.props.data.product.price.fractional) {
        const diff = overridePrice.fractional - this.props.data.product.price.fractional;
        const sign = Math.sign(diff) < 0 ? '-' : '+';
        overridePriceDescription = ` (${sign}${formatMoney(diff)})`;
      }

      return (
        <option key={id} value={id}>
          {name}
          {overridePriceDescription}
        </option>
      );
    });

    return (
      <select
        className="form-control mb-3"
        value={this.state.productVariantId || ''}
        onChange={this.productVariantSelectorChanged}
      >
        <option disabled value="">Select...</option>
        {options}
      </select>
    );
  }

  renderQuantity = () => {
    const inputId = this.nextUniqueId();

    return (
      <div className="d-flex mb-4 align-items-baseline">
        <label className="mr-2" htmlFor={inputId}>Quantity:</label>
        <input
          id={inputId}
          type="number"
          min="1"
          className="form-control"
          value={this.state.quantity == null ? '' : this.state.quantity}
          onChange={this.quantityChanged}
        />
      </div>
    );
  }

  renderTotalAmount = () => {
    if (!this.isDataComplete()) {
      return null;
    }

    let pricePerItem = this.props.data.product.price.fractional;
    if (this.state.productVariantId) {
      const productVariant = this.props.data.product.product_variants
        .find(variant => variant.id === this.state.productVariantId);

      if (productVariant.override_price != null) {
        pricePerItem = productVariant.override_price.fractional;
      }
    }

    const totalPrice = {
      fractional: pricePerItem * this.state.quantity,
      currency_code: this.props.data.product.price.currency_code,
    };

    return (
      <strong>
Total:
        {formatMoney(totalPrice)}
      </strong>
    );
  }

  render = () => (
    <div className="card bg-light">
      <div className="card-body">
        {this.renderVariantSelect()}
        {this.renderQuantity()}
        <div className="row align-items-baseline">
          <div className="col-6">
            {this.renderTotalAmount()}
          </div>
          <div className="col-6 mb-2">
            <button
              className="w-100 btn btn-primary"
              disabled={!this.isDataComplete() || this.state.submitting}
              onClick={this.addToCartClicked}
            >
              {
                this.state.submitting
                  ? (<LoadingIndicator />)
                  : (<i className="fa fa-shopping-cart" />)
              }
              {' '}
              Add to cart
            </button>
          </div>
        </div>
        <ErrorDisplay graphQLError={this.state.error} />
      </div>
    </div>
  )
}

export default ProductOrderForm;
