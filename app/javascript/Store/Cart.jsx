import React, { useCallback } from 'react';
import intersection from 'lodash/intersection';
import { useHistory } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';

import { CartQuery } from './queries';
import {
  DeleteOrderEntry,
  UpdateOrderEntry,
  CreateCouponApplication,
  DeleteCouponApplication,
} from './mutations';
import ErrorDisplay from '../ErrorDisplay';
import OrderPaymentModal from './OrderPaymentModal';
import useModal from '../ModalDialogs/useModal';
import useAsyncFunction from '../useAsyncFunction';
import { useConfirm } from '../ModalDialogs/Confirm';
import usePageTitle from '../usePageTitle';
import PageLoadingIndicator from '../PageLoadingIndicator';
import CartContents from './CartContents';

function Cart() {
  const history = useHistory();
  const { data, loading, error } = useQuery(CartQuery);
  const [updateMutate] = useMutation(UpdateOrderEntry);
  const [deleteMutate] = useMutation(DeleteOrderEntry);
  const [createCouponApplicationMutate] = useMutation(CreateCouponApplication);
  const [deleteCouponApplicationMutate] = useMutation(DeleteCouponApplication);
  const checkOutModal = useModal();
  const confirm = useConfirm();

  usePageTitle('Cart');

  const updateOrderEntry = useCallback(
    (id, quantity) =>
      updateMutate({
        variables: { input: { id, order_entry: { quantity } } },
      }),
    [updateMutate],
  );

  const deleteOrderEntry = useCallback(
    (id) =>
      deleteMutate({
        variables: { input: { id } },
        update: (proxy) => {
          const storeData = proxy.readQuery({ query: CartQuery });

          proxy.writeQuery({
            query: CartQuery,
            data: {
              ...storeData,
              currentPendingOrder: {
                ...storeData.currentPendingOrder,
                order_entries: storeData.currentPendingOrder.order_entries.filter(
                  (entry) => entry.id !== id,
                ),
              },
            },
          });
        },
      }),
    [deleteMutate],
  );

  const [changeQuantity, changeQuantityError] = useAsyncFunction(
    useCallback(
      async (orderEntryId, newQuantityString) => {
        const newQuantity = Number.parseInt(newQuantityString, 10);
        if (Number.isNaN(newQuantity)) {
          return;
        }

        if (newQuantity === 0) {
          await deleteOrderEntry(orderEntryId);
        } else {
          await updateOrderEntry(orderEntryId, newQuantity);
        }
      },
      [deleteOrderEntry, updateOrderEntry],
    ),
  );

  const createCouponApplication = useCallback(
    (couponCode) =>
      createCouponApplicationMutate({
        variables: {
          orderId: data.currentPendingOrder?.id,
          couponCode,
        },
      }),
    [createCouponApplicationMutate, data],
  );

  const deleteCouponApplication = useCallback(
    (couponApplication) =>
      deleteCouponApplicationMutate({
        variables: { id: couponApplication.id },
      }),
    [deleteCouponApplicationMutate],
  );

  const checkOutComplete = () => {
    history.push('/order_history');
  };

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (loading) {
    return <PageLoadingIndicator visible />;
  }

  return (
    <div>
      <h1 className="mb-4">Shopping cart</h1>

      <ErrorDisplay graphQLError={changeQuantityError} />

      <CartContents
        removeFromCart={(entry) => {
          let { name } = entry.product;
          if (entry.product_variant) {
            name += ` (${entry.product_variant.name})`;
          }

          confirm({
            prompt: `Are you sure you want to remove ${name} from your cart?`,
            action: () => deleteOrderEntry(entry.id),
            renderError: (e) => <ErrorDisplay graphQLError={e} />,
          });
        }}
        changeQuantity={(entry, quantity) => changeQuantity(entry.id, quantity)}
        checkOutButton={
          <button type="button" className="btn btn-primary mt-2" onClick={checkOutModal.open}>
            <i className="fa fa-shopping-cart" /> Check out
          </button>
        }
        createCouponApplication={createCouponApplication}
        deleteCouponApplication={deleteCouponApplication}
      />

      <OrderPaymentModal
        visible={checkOutModal.visible}
        onCancel={checkOutModal.close}
        initialName={data.myProfile.name_without_nickname}
        orderId={(data.currentPendingOrder || {}).id}
        onComplete={checkOutComplete}
        paymentOptions={intersection(
          ...((data.currentPendingOrder || {}).order_entries || []).map(
            (entry) => entry.product.payment_options,
          ),
        )}
        totalPrice={data.currentPendingOrder?.total_price ?? { fractional: 0 }}
      />
    </div>
  );
}

export default Cart;
