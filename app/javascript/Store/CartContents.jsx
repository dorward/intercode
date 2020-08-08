import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client';

import { CartQuery } from './queries';
import ErrorDisplay from '../ErrorDisplay';
import LoadingIndicator from '../LoadingIndicator';
import InPlaceEditor from '../BuiltInFormControls/InPlaceEditor';
import formatMoney from '../formatMoney';
import describeCoupon from './describeCoupon';
import { useConfirm } from '../ModalDialogs/Confirm';
import ApplyCouponControl from './ApplyCouponControl';

function CartContents({
  removeFromCart,
  createCouponApplication,
  deleteCouponApplication,
  changeQuantity,
  checkOutButton,
}) {
  const confirm = useConfirm();
  const { data, loading, error } = useQuery(CartQuery);

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (loading) {
    return <LoadingIndicator />;
  }

  if (!data.currentPendingOrder || data.currentPendingOrder.order_entries.length === 0) {
    return <>Your cart is empty.</>;
  }

  const rows = data.currentPendingOrder.order_entries.map((entry) => (
    <tr key={entry.id}>
      <td>
        {entry.product.name}
        {entry.product_variant ? ` (${entry.product_variant.name})` : null}
      </td>
      <td>
        {changeQuantity && !entry.product.provides_ticket_type ? (
          <InPlaceEditor
            value={entry.quantity.toString()}
            onChange={(newValue) => {
              changeQuantity(entry, newValue);
            }}
          />
        ) : (
          entry.quantity
        )}
      </td>
      <td>{formatMoney(entry.price)}</td>
      <td>
        {removeFromCart && (
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={() => {
              removeFromCart(entry);
            }}
          >
            <i className="fa fa-trash-o" />
            <span className="sr-only">Remove from cart</span>
          </button>
        )}
      </td>
    </tr>
  ));

  return (
    <div className="mb-2">
      <table className="table mb-0">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
            <th />
          </tr>
        </thead>
        <tbody>{rows}</tbody>
        <tfoot>
          {data.currentPendingOrder.coupon_applications.length > 0 && (
            <>
              <tr className="bg-light">
                <td colSpan="2">
                  <em>Total before coupons</em>
                </td>
                <td colSpan="2">
                  <em>{formatMoney(data.currentPendingOrder.total_price_before_discounts)}</em>
                </td>
              </tr>
              {data.currentPendingOrder.coupon_applications.map((app) => (
                <tr key={app.id} className="bg-light">
                  <td colSpan="2">
                    Coupon code: <code>{app.coupon.code}</code>
                    <br />
                    <small>{describeCoupon(app.coupon)}</small>
                  </td>
                  <td className="text-danger">-{formatMoney(app.discount)}</td>
                  <td>
                    {deleteCouponApplication && (
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() =>
                          confirm({
                            prompt: 'Are you sure you want to remove this coupon?',
                            action: () => deleteCouponApplication(app),
                            renderError: (err) => <ErrorDisplay graphQLError={err} />,
                          })
                        }
                      >
                        <i className="fa fa-trash-o" />
                        <span className="sr-only">Remove from cart</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </>
          )}
          {createCouponApplication && (
            <tr className="bg-light">
              <td colSpan={4}>
                <ApplyCouponControl createCouponApplication={createCouponApplication} />
              </td>
            </tr>
          )}
          <tr className="bg-warning-light">
            <td colSpan="2">
              <strong>
                {data.currentPendingOrder.coupon_applications.length > 0 ? 'Grand total' : 'Total'}
              </strong>
            </td>
            <td colSpan="2">
              <strong>{formatMoney(data.currentPendingOrder.total_price)}</strong>
            </td>
          </tr>
        </tfoot>
      </table>
      {checkOutButton && <div className="text-right">{checkOutButton}</div>}
    </div>
  );
}

CartContents.propTypes = {
  removeFromCart: PropTypes.func,
  createCouponApplication: PropTypes.func,
  deleteCouponApplication: PropTypes.func,
  changeQuantity: PropTypes.func,
  checkOutButton: PropTypes.node,
};

CartContents.defaultProps = {
  removeFromCart: null,
  createCouponApplication: null,
  deleteCouponApplication: null,
  changeQuantity: null,
  checkOutButton: null,
};

export default CartContents;
