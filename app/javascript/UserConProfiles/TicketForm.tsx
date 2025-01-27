import { useState, useMemo, useCallback } from 'react';
// @ts-expect-error
import { capitalize } from 'inflected';
import { ApolloError } from '@apollo/client';

import BootstrapFormSelect from '../BuiltInFormControls/BootstrapFormSelect';
import ErrorDisplay from '../ErrorDisplay';
import EventSelect from '../BuiltInFormControls/EventSelect';
import sortTicketTypes from '../TicketTypeAdmin/sortTicketTypes';
import useAsyncFunction from '../useAsyncFunction';
import FormGroupWithLabel from '../BuiltInFormControls/FormGroupWithLabel';
import useModal from '../ModalDialogs/useModal';
import formatMoney from '../formatMoney';
import EditOrderModal from '../Store/EditOrderModal';
import AddOrderToTicketButton, { AddOrderToTicketButtonProps } from './AddOrderToTicketButton';
import { UserConProfileAdminQueryQuery } from './queries.generated';
import { TicketInput, UserConProfile } from '../graphqlTypes.generated';
import { parseIntOrNull } from '../ValueUtils';

type TicketFromQuery = NonNullable<UserConProfileAdminQueryQuery['userConProfile']['ticket']>;
type EditingTicket = Omit<
  TicketFromQuery,
  'id' | 'ticket_type' | 'created_at' | 'updated_at' | '__typename'
> &
  Partial<Pick<TicketFromQuery, 'ticket_type' | 'id'>>;

export type TicketFormProps = {
  initialTicket: EditingTicket;
  convention: UserConProfileAdminQueryQuery['convention'];
  onSubmit: (ticketInput: TicketInput) => Promise<void>;
  submitCaption: string;
  userConProfile: Pick<UserConProfile, 'id' | 'name_without_nickname'>;
};

function TicketForm({
  userConProfile,
  initialTicket,
  convention,
  onSubmit,
  submitCaption,
}: TicketFormProps) {
  const editOrderModal = useModal();
  const [ticketTypeId, setTicketTypeId] = useState(initialTicket.ticket_type?.id);
  const [providedByEvent, setProvidedByEvent] = useState(initialTicket.provided_by_event);

  const sortedTicketTypes = useMemo(() => sortTicketTypes(convention.ticket_types), [
    convention.ticket_types,
  ]);

  const [submit, submitError, submitInProgress] = useAsyncFunction(onSubmit);

  const submitForm = useCallback(
    async (event) => {
      if (!ticketTypeId) {
        return;
      }
      const ticketInput = {
        ticket_type_id: ticketTypeId,
        provided_by_event_id: providedByEvent?.id,
      };
      event.preventDefault();
      await submit(ticketInput);
    },
    [submit, providedByEvent?.id, ticketTypeId],
  );

  const orderEntry = initialTicket.order_entry;
  const order = orderEntry?.order;

  return (
    <form onSubmit={submitForm}>
      <BootstrapFormSelect
        label={`${capitalize(convention.ticket_name)} type`}
        value={ticketTypeId ?? ''}
        onValueChange={(newValue) => setTicketTypeId(parseIntOrNull(newValue) ?? undefined)}
      >
        <option aria-label="Blank placeholder option" />
        {sortedTicketTypes.map(({ id, description }) => (
          <option value={id} key={id}>
            {description}
          </option>
        ))}
      </BootstrapFormSelect>

      <FormGroupWithLabel label="Provided by event (if applicable)">
        {(id) => <EventSelect inputId={id} value={providedByEvent} onChange={setProvidedByEvent} />}
      </FormGroupWithLabel>

      <div className="card mb-4">
        <div className="card-header">Order information</div>

        <div className="card-body">
          {orderEntry ? (
            <>
              <dl className="row">
                <dt className="col-md-3">Order ID</dt>
                <dd className="col-md-9">{orderEntry.order.id}</dd>

                <dt className="col-md-3">{capitalize(convention.ticket_name)} price</dt>
                <dd className="col-md-9">{formatMoney(orderEntry.price_per_item)}</dd>
              </dl>

              <button
                className="btn btn-outline-primary"
                onClick={() => editOrderModal.open({ order: orderEntry.order })}
                type="button"
              >
                Edit order
              </button>
            </>
          ) : (
            initialTicket.id &&
            initialTicket.ticket_type?.id && (
              <AddOrderToTicketButton
                ticket={initialTicket as AddOrderToTicketButtonProps['ticket']}
                userConProfile={userConProfile}
                convention={convention}
                className="btn btn-outline-success"
              />
            )
          )}
        </div>
      </div>

      <EditOrderModal
        order={editOrderModal.visible ? order : undefined}
        closeModal={editOrderModal.close}
      />

      <ErrorDisplay graphQLError={submitError as ApolloError} />

      <input
        type="submit"
        aria-label={submitCaption}
        value={submitCaption}
        className="btn btn-primary"
        disabled={submitInProgress}
      />
    </form>
  );
}

export default TicketForm;
