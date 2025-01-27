import * as React from 'react';
import { CardElement } from '@stripe/react-stripe-js';

import BootstrapFormInput from '../BuiltInFormControls/BootstrapFormInput';

export type PaymentDetails = {
  name: string;
};

export type OrderPaymentFormProps = {
  paymentDetails: PaymentDetails;
  onChange: React.Dispatch<PaymentDetails>;
  disabled: boolean;
};

function OrderPaymentForm({ disabled, onChange, paymentDetails }: OrderPaymentFormProps) {
  return (
    <div>
      <BootstrapFormInput
        name="name"
        label="Name"
        value={paymentDetails.name}
        disabled={disabled}
        onTextChange={(name) => onChange({ ...paymentDetails, name })}
      />

      <CardElement
        className="form-control mb-4"
        options={{
          disabled,
          style: {
            base: {
              lineHeight: '1.5',
              fontSize: '16px',
            },
          },
        }}
      />
    </div>
  );
}

export default OrderPaymentForm;
