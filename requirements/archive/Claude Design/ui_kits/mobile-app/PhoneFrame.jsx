/* global React */
// GigKraft Mobile — device shell: notch, brand header, scroll area, tab bar.

function PhoneFrame({ brand, brandTail, right, children, tabs, activeTab, onTab }) {
  return (
    <div className="gk-phone">
      <div className="gk-phone__notch" />
      <div className="gk-phone__header">
        <span className="gk-phone__logo">
          {brand}<span>{brandTail}</span>
        </span>
        <span className="gk-phone__right">{right}</span>
      </div>
      <div className="gk-phone__scroll">{children}</div>
      {tabs && (
        <div className="gk-phone__tabbar">
          {tabs.map((t) => (
            <div
              key={t.id}
              className={`gk-tab ${activeTab === t.id ? "gk-tab--active" : ""}`}
              onClick={() => onTab && onTab(t.id)}
            >
              <span className="gk-tab__icon">{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { PhoneFrame });
