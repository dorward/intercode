import { useState, useCallback, useContext } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useTranslation } from 'react-i18next';

import SiteSearch from './SiteSearch';
import NavigationBarContext from './NavigationBarContext';

function SearchNavigationItem() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const { setHideBrand, setHideNavItems } = useContext(NavigationBarContext);

  const setVisibleWithHiding = useCallback(
    (newVisible: boolean) => {
      setVisible(newVisible);
      if (newVisible) {
        setHideBrand(true);
        setHideNavItems(true);
      }
    },
    [setHideBrand, setHideNavItems],
  );

  const visibilityChangeComplete = useCallback(
    (newVisible: boolean) => {
      if (!newVisible) {
        setHideBrand(false);
        setHideNavItems(false);
      }
    },
    [setHideBrand, setHideNavItems],
  );

  return (
    <div
      className="navbar-nav flex-grow-1 justify-content-end mr-2"
      style={{ position: 'relative' }}
    >
      <SiteSearch
        setVisible={setVisibleWithHiding}
        visible={visible}
        visibilityChangeComplete={visibilityChangeComplete}
      />
      <CSSTransition timeout={400} in={!visible} classNames="site-search-navigation-button">
        <button
          className="btn btn-link nav-link text-right site-search-navigation-button"
          type="button"
          onClick={() => setVisibleWithHiding(true)}
        >
          <i className="fa fa-search" />
          <span className="sr-only">{t('navigation.search.buttonText', 'Search')}</span>
        </button>
      </CSSTransition>
    </div>
  );
}

export default SearchNavigationItem;
