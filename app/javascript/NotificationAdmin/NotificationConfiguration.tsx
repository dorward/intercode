import { useState, useEffect, useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import NotificationsConfig from '../../../config/notifications.json';
import ErrorDisplay from '../ErrorDisplay';
import LiquidInput from '../BuiltInFormControls/LiquidInput';
import { useNotificationAdminQueryQuery } from './queries.generated';
import { useUpdateNotificationTemplateMutation } from './mutations.generated';
import { usePropertySetters } from '../usePropertySetters';
import { LoadQueryWrapper } from '../GraphqlLoadingWrappers';
import FourOhFourPage from '../FourOhFourPage';

export default LoadQueryWrapper(useNotificationAdminQueryQuery, function NotificationConfiguration({
  data,
}) {
  const params = useParams<{ category: string; event: string }>();
  const history = useHistory();
  const category = useMemo(
    () => NotificationsConfig.categories.find((c) => c.key === params.category)!,
    [params.category],
  );
  const event = useMemo(() => category.events.find((e) => e.key === params.event)!, [
    category,
    params.event,
  ]);

  const [
    updateNotificationTemplate,
    { loading: updateInProgress, error: updateError },
  ] = useUpdateNotificationTemplateMutation();

  const eventKey = `${category.key}/${event.key}`;

  const initialNotificationTemplate = data.convention.notification_templates.find(
    (t) => t.event_key === eventKey,
  )!;
  const [notificationTemplate, setNotificationTemplate] = useState(initialNotificationTemplate);

  const [setSubject, setBodyHtml, setBodyText, setBodySms] = usePropertySetters(
    setNotificationTemplate,
    'subject',
    'body_html',
    'body_text',
    'body_sms',
  );

  // if the page changes and we're still mounted
  useEffect(() => setNotificationTemplate(initialNotificationTemplate), [
    initialNotificationTemplate,
  ]);

  const saveClicked = async () => {
    if (!notificationTemplate) {
      return;
    }

    await updateNotificationTemplate({
      variables: {
        eventKey,
        notificationTemplate: {
          subject: notificationTemplate.subject,
          body_html: notificationTemplate.body_html,
          body_text: notificationTemplate.body_text,
          body_sms: notificationTemplate.body_sms,
        },
      },
    });

    history.push('/admin_notifications');
  };

  if (!notificationTemplate) {
    return <FourOhFourPage />;
  }

  return (
    <>
      <header className="mb-4">
        <h1>
          {category.name} &mdash; {event.name}
        </h1>
        <h4>Destination: {event.destination_description}</h4>
      </header>

      <div className="form-group">
        <legend className="col-form-label">Subject line</legend>
        <LiquidInput
          value={notificationTemplate.subject ?? ''}
          onChange={setSubject}
          notifierEventKey={eventKey}
          renderPreview={(previewContent) => <>{previewContent}</>}
          lines={1}
          disabled={updateInProgress}
        />
      </div>

      <div className="form-group">
        <legend className="col-form-label">Notification body (HTML)</legend>
        <LiquidInput
          value={notificationTemplate.body_html ?? ''}
          onChange={setBodyHtml}
          notifierEventKey={eventKey}
          disabled={updateInProgress}
        />
      </div>

      <div className="form-group">
        <legend className="col-form-label">Notification body (plain text)</legend>
        <LiquidInput
          value={notificationTemplate.body_text ?? ''}
          onChange={setBodyText}
          notifierEventKey={eventKey}
          renderPreview={(previewContent) => (
            <pre style={{ whiteSpace: 'pre-wrap' }}>{previewContent}</pre>
          )}
          disabled={updateInProgress}
        />
      </div>

      {event.sends_sms ? (
        <div className="form-group">
          <legend className="col-form-label">Notification body (SMS text message)</legend>
          <LiquidInput
            value={notificationTemplate.body_sms ?? ''}
            onChange={setBodySms}
            notifierEventKey={eventKey}
            renderPreview={(previewContent) => (
              <pre style={{ whiteSpace: 'pre-wrap' }}>{previewContent}</pre>
            )}
            disabled={updateInProgress}
          />
        </div>
      ) : (
        <p>
          <em>This event does not send SMS text messages.</em>
        </p>
      )}

      <ErrorDisplay graphQLError={updateError} />

      <button
        type="button"
        className="btn btn-primary"
        onClick={saveClicked}
        disabled={updateInProgress}
      >
        Save changes
      </button>
    </>
  );
});
