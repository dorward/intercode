class OrdersMailer < ApplicationMailer
  def purchased(order)
    @order = order

    use_convention_timezone(order.user_con_profile.convention) do
      mail(
        from: from_address_for_convention(order.user_con_profile.convention),
        to: order.user_con_profile.email,
        subject: "#{subject_prefix(order)} Order Receipt"
      )
    end
  end

  def cancelled(order, refund_id = nil)
    @order = order
    @refund_id = refund_id

    use_convention_timezone(order.user_con_profile.convention) do
      mail(
        from: from_address_for_convention(order.user_con_profile.convention),
        to: order.user_con_profile.email,
        subject: "#{subject_prefix(order)} Order Cancellation"
      )
    end
  end

  private

  def subject_prefix(order)
    "[#{order.user_con_profile.convention.name}]"
  end
end