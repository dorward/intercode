function presence(string) {
  if (string && string.match(/\S/)) {
    return string;
  }

  return null;
}

export default function buildUserActivityAlertInput(userActivityAlert) {
  return {
    user_id: userActivityAlert.user ? userActivityAlert.user.id : null,
    partial_name: presence(userActivityAlert.partial_name),
    email: presence(userActivityAlert.email),
    trigger_on_ticket_create: userActivityAlert.trigger_on_ticket_create,
    trigger_on_user_con_profile_create: userActivityAlert.trigger_on_user_con_profile_create,
  };
}
