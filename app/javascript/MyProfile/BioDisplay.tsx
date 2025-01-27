import { Link } from 'react-router-dom';

import Gravatar from '../Gravatar';
import { UserConProfile } from '../graphqlTypes.generated';

export type BioDisplayProps = {
  userConProfile: Pick<
    UserConProfile,
    'gravatar_enabled' | 'gravatar_url' | 'bio_name' | 'bio_html' | 'bio'
  >;
};

function BioDisplay({ userConProfile }: BioDisplayProps) {
  return (
    <section className="mt-4">
      <h2 className="mb-4">My Bio</h2>

      <div className="media">
        <div className="mr-3">
          <Gravatar
            url={userConProfile.gravatar_url}
            enabled={userConProfile.gravatar_enabled}
            pixelSize={64}
          />
        </div>
        <div className="media-body">
          <h5 className="mt-0">{userConProfile.bio_name}</h5>
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: userConProfile.bio_html ?? '' }} />
        </div>
      </div>

      <div className="mb-4 mt-3">
        {userConProfile.bio && userConProfile.bio.trim() !== '' ? (
          <Link to="/my_profile/edit_bio" className="btn btn-secondary">
            Edit bio/avatar settings
          </Link>
        ) : (
          <Link to="/my_profile/edit_bio" className="btn btn-primary">
            Add bio/avatar
          </Link>
        )}
      </div>
    </section>
  );
}

export default BioDisplay;
