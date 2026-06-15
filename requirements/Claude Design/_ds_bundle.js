/* @ds-bundle: {"format":3,"namespace":"GigKraftDesignSystem_4f8b93","components":[],"sourceHashes":{"design_handoff_cursor/design_reference/screens/_shared/kit-admin.jsx":"e25078850cc9","design_handoff_cursor/design_reference/screens/_shared/kit.jsx":"0ec2e1655647","design_handoff_cursor/design_reference/screens/admin/app.jsx":"fbf941f97c38","design_handoff_cursor/design_reference/screens/admin/views.jsx":"ce7f6220d2bd","design_handoff_cursor/design_reference/screens/consumer/app.jsx":"6565cde1e7c5","design_handoff_cursor/design_reference/screens/consumer/screens.jsx":"7a6ba40498e1","design_handoff_cursor/design_reference/screens/handyman/app.jsx":"91d6dff2040a","design_handoff_cursor/design_reference/screens/handyman/business.jsx":"ce799dcfde97","design_handoff_cursor/design_reference/screens/handyman/leads.jsx":"df06eaf9648c","design_handoff_cursor/design_reference/screens/handyman/onboarding.jsx":"c75458c6d5a8","design_handoff_cursor/design_reference/screens/handyman/portfolio.jsx":"4b8d9f1e5003","screens/_shared/kit-admin.jsx":"e25078850cc9","screens/_shared/kit.jsx":"0ec2e1655647","screens/admin/app.jsx":"fbf941f97c38","screens/admin/views.jsx":"ce7f6220d2bd","screens/consumer/app.jsx":"6565cde1e7c5","screens/consumer/screens.jsx":"7a6ba40498e1","screens/handyman/app.jsx":"91d6dff2040a","screens/handyman/business.jsx":"ce799dcfde97","screens/handyman/leads.jsx":"df06eaf9648c","screens/handyman/onboarding.jsx":"c75458c6d5a8","screens/handyman/portfolio.jsx":"4b8d9f1e5003","ui_kits/mobile-app/PhoneFrame.jsx":"61479112b6ce","ui_kits/mobile-app/Primitives.jsx":"0c31f5cf9db5","ui_kits/mobile-app/Screens.jsx":"73aace761bea","ui_kits/web-admin/AdminComponents.jsx":"7bfb10708c83","ui_kits/web-admin/AdminViews.jsx":"8a41730f2de4"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.GigKraftDesignSystem_4f8b93 = window.GigKraftDesignSystem_4f8b93 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// design_handoff_cursor/design_reference/screens/_shared/kit-admin.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React, Icon, Badge, Avatar, Divider */
// GigKraft Admin — desktop UI kit (Community Node Manager console).
// Reuses Icon/Badge/Avatar from the shared kit. Adds browser chrome, sidebar,
// metric tiles, data tables, toolbars — a clean fintech admin shell.
const {
  useState: useAd
} = React;
function BrowserChrome({
  url,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      height: "100%",
      background: "var(--surface)",
      borderRadius: 14,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      border: "1px solid var(--border)",
      boxShadow: "var(--shadow-device)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "0 0 auto",
      height: 46,
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "0 16px",
      background: "var(--bg-2)",
      borderBottom: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, ["#ff5f57", "#febc2e", "#28c840"].map(c => /*#__PURE__*/React.createElement("span", {
    key: c,
    style: {
      width: 12,
      height: 12,
      borderRadius: "50%",
      background: c
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      maxWidth: 520,
      display: "flex",
      alignItems: "center",
      gap: 8,
      height: 28,
      padding: "0 12px",
      background: "var(--surface)",
      border: "1px solid var(--border-2)",
      borderRadius: 8,
      color: "var(--text-3)",
      fontSize: 12.5
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "lock",
    size: 13
  }), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, url)), /*#__PURE__*/React.createElement(Icon, {
    name: "dots",
    size: 18,
    style: {
      color: "var(--text-3)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      overflow: "hidden"
    }
  }, children));
}
function AdSidebar({
  nav,
  active,
  onNav
}) {
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 244,
      flex: "0 0 auto",
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "18px 18px 16px",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: 8,
      background: "var(--primary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "tools",
    size: 19,
    style: {
      color: "#fff"
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 15.5,
      lineHeight: 1
    }
  }, "GigKraft"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: "var(--text-3)",
      fontWeight: 600,
      marginTop: 2
    }
  }, "NODE CONSOLE"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 8px 6px",
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: ".5px",
      color: "var(--text-3)",
      paddingLeft: 18
    }
  }, "SOUTHWEST US-04"), /*#__PURE__*/React.createElement("nav", {
    style: {
      flex: 1,
      padding: "4px 10px",
      display: "flex",
      flexDirection: "column",
      gap: 2,
      overflowY: "auto"
    },
    className: "gk-scroll"
  }, nav.map(n => {
    const on = active === n.id;
    return /*#__PURE__*/React.createElement("button", {
      key: n.id,
      onClick: () => onNav(n.id),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "9px 11px",
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        background: on ? "var(--tint)" : "transparent",
        color: on ? "var(--tint-text)" : "var(--text-2)",
        fontWeight: on ? 700 : 500,
        fontSize: 13.5
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: n.icon,
      size: 18,
      style: {
        color: on ? "var(--primary)" : "var(--text-3)"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, n.label), n.badge && /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 18,
        height: 18,
        padding: "0 5px",
        borderRadius: 999,
        background: on ? "var(--primary)" : "var(--red-6)",
        color: "#fff",
        fontSize: 10.5,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, n.badge));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px",
      borderTop: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Dana Cruz",
    size: 34
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13
    }
  }, "Dana Cruz"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-3)"
    }
  }, "Node manager")), /*#__PURE__*/React.createElement("a", {
    href: "../../GigKraft App.html",
    title: "All roles",
    style: {
      color: "var(--text-3)",
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "grid-dots",
    size: 18
  }))));
}
function AdTopBar({
  title,
  subtitle,
  theme,
  onTheme,
  actions
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "0 0 auto",
      height: 64,
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "0 24px",
      borderBottom: "1px solid var(--border)",
      background: "var(--surface)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 800,
      letterSpacing: "-.3px"
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--text-3)",
      marginTop: 1
    }
  }, subtitle)), actions, /*#__PURE__*/React.createElement("button", {
    onClick: onTheme,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 38,
      height: 38,
      borderRadius: 9,
      border: "1px solid var(--border-2)",
      background: "var(--surface)",
      color: "var(--text-2)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: theme === "light" ? "moon" : "sun",
    size: 18
  })));
}
function AdMetric({
  label,
  value,
  delta,
  deltaTone = "green",
  icon,
  accent
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      padding: 18,
      borderRadius: 14,
      border: "1px solid var(--border)",
      background: accent ? "linear-gradient(135deg, var(--blue-7), var(--blue-9))" : "var(--surface)",
      color: accent ? "#fff" : "var(--text)",
      boxShadow: "var(--shadow-xs)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 700,
      letterSpacing: ".4px",
      textTransform: "uppercase",
      color: accent ? "rgba(255,255,255,.8)" : "var(--text-3)"
    }
  }, label), /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 18,
    style: {
      color: accent ? "rgba(255,255,255,.85)" : "var(--text-3)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 28,
      fontWeight: 800,
      letterSpacing: "-.6px",
      marginTop: 10,
      lineHeight: 1
    }
  }, value), delta && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      marginTop: 9,
      fontSize: 12,
      fontWeight: 700,
      color: accent ? "rgba(255,255,255,.9)" : deltaTone === "red" ? "var(--red-fg)" : "var(--green-fg)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: deltaTone === "red" ? "trending-down" : "trending-up",
    size: 14
  }), delta));
}
function Panel({
  title,
  action,
  children,
  pad = true,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 14,
      border: "1px solid var(--border)",
      background: "var(--surface)",
      boxShadow: "var(--shadow-xs)",
      overflow: "hidden",
      ...style
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 18px",
      borderBottom: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 14.5
    }
  }, title), action), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: pad ? 18 : 0
    }
  }, children));
}
function Pill({
  tone,
  dot,
  children
}) {
  const map = {
    green: ["var(--green-bg)", "var(--green-fg)"],
    red: ["var(--red-bg)", "var(--red-fg)"],
    yellow: ["var(--yellow-bg)", "var(--yellow-fg)"],
    blue: ["var(--tint)", "var(--tint-text)"],
    gray: ["var(--bg-2)", "var(--text-2)"]
  };
  const [bg, fg] = map[tone] || map.gray;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontSize: 11.5,
      fontWeight: 700,
      padding: "4px 10px",
      borderRadius: 999,
      background: bg,
      color: fg,
      whiteSpace: "nowrap"
    }
  }, dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: fg
    }
  }), children);
}
function AdBtn({
  tone = "default",
  icon,
  children,
  ...rest
}) {
  const styles = {
    default: {
      background: "var(--surface)",
      color: "var(--text)",
      border: "1px solid var(--border-2)"
    },
    primary: {
      background: "var(--primary)",
      color: "#fff",
      border: "1px solid transparent"
    },
    whatsapp: {
      background: "var(--whatsapp)",
      color: "#fff",
      border: "1px solid transparent"
    },
    sms: {
      background: "var(--tint)",
      color: "var(--tint-text)",
      border: "1px solid transparent"
    },
    green: {
      background: "var(--green-bg)",
      color: "var(--green-fg)",
      border: "1px solid var(--green-bd)"
    },
    red: {
      background: "var(--red-bg)",
      color: "var(--red-fg)",
      border: "1px solid var(--red-bd)"
    },
    ghost: {
      background: "transparent",
      color: "var(--text-2)",
      border: "1px solid transparent"
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({}, rest, {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 12.5,
      fontWeight: 600,
      padding: "7px 13px",
      borderRadius: 8,
      cursor: "pointer",
      whiteSpace: "nowrap",
      ...styles[tone]
    }
  }), icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 15
  }), children);
}

// Data table — columns: [{key,label,w,align}], rows arbitrary, render(row,col).
function Table({
  cols,
  rows,
  render
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: "auto"
    },
    className: "gk-scroll"
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, cols.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    style: {
      textAlign: c.align || "left",
      padding: "10px 14px",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: ".4px",
      textTransform: "uppercase",
      color: "var(--text-3)",
      borderBottom: "1px solid var(--border)",
      width: c.w,
      whiteSpace: "nowrap"
    }
  }, c.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: r.id || i,
    style: {
      borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none"
    }
  }, cols.map(c => /*#__PURE__*/React.createElement("td", {
    key: c.key,
    style: {
      textAlign: c.align || "left",
      padding: "13px 14px",
      verticalAlign: "middle"
    }
  }, render(r, c.key))))))));
}
function SearchBox({
  placeholder = "Search…",
  w = 260
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      height: 36,
      padding: "0 12px",
      width: w,
      background: "var(--surface)",
      border: "1px solid var(--border-2)",
      borderRadius: 9,
      color: "var(--text-3)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 16
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: placeholder,
    style: {
      border: "none",
      outline: "none",
      background: "transparent",
      flex: 1,
      fontSize: 13.5,
      color: "var(--text)",
      fontFamily: "var(--font)"
    }
  }));
}

// Donut + horizontal mini bar utilities
function Donut({
  pct,
  size = 84,
  label,
  sub
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      borderRadius: "50%",
      background: `conic-gradient(var(--primary) 0 ${pct}%, var(--bg-2) ${pct}% 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "0 0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: size - 22,
      height: size - 22,
      borderRadius: "50%",
      background: "var(--surface)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 800,
      fontSize: 15
    }
  }, pct, "%")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--text-3)",
      marginTop: 2
    }
  }, sub)));
}
function Bars({
  data,
  h = 150
}) {
  const max = Math.max(...data.map(d => d.v));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: 14,
      height: h
    }
  }, data.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      height: "100%",
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: "var(--text-2)"
    }
  }, d.t), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 46,
      height: `${d.v / max * 100}%`,
      minHeight: 4,
      background: d.hl ? "var(--primary)" : "var(--tint-strong)",
      borderRadius: "6px 6px 3px 3px"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, d.l))));
}
Object.assign(window, {
  BrowserChrome,
  AdSidebar,
  AdTopBar,
  AdMetric,
  Panel,
  Pill,
  AdBtn,
  Table,
  SearchBox,
  Donut,
  Bars
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_cursor/design_reference/screens/_shared/kit-admin.jsx", error: String((e && e.message) || e) }); }

// design_handoff_cursor/design_reference/screens/_shared/kit.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React */
// GigKraft Mobile — UI kit (Mantine-flavored primitives + device shell).
// Tabler icons via webfont: <i class="ti ti-NAME" />.
const {
  useState
} = React;

/* ----------------------------- atoms ----------------------------- */
function Icon({
  name,
  size,
  style,
  className = ""
}) {
  return /*#__PURE__*/React.createElement("i", {
    className: `ti ti-${name} ${className}`,
    style: {
      fontSize: size,
      ...style
    }
  });
}
function Btn({
  variant = "filled",
  size,
  leftIcon,
  rightIcon,
  auto,
  children,
  ...rest
}) {
  const cls = ["gk-btn", `gk-btn--${variant}`];
  if (size) cls.push(`gk-btn--${size}`);
  if (auto) cls.push("gk-btn--auto");
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls.join(" ")
  }, rest), leftIcon && /*#__PURE__*/React.createElement(Icon, {
    name: leftIcon
  }), children, rightIcon && /*#__PURE__*/React.createElement(Icon, {
    name: rightIcon
  }));
}
function IconBtn({
  icon,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    className: "gk-iconbtn"
  }, rest), /*#__PURE__*/React.createElement(Icon, {
    name: icon
  }));
}
function Card({
  press,
  selected,
  flat,
  padLg,
  className = "",
  children,
  ...rest
}) {
  const cls = ["gk-card"];
  if (press) cls.push("gk-card--press");
  if (selected) cls.push("gk-card--selected");
  if (flat) cls.push("gk-card--flat");
  if (padLg) cls.push("gk-card--pad-lg");
  if (className) cls.push(className);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls.join(" ")
  }, rest), children);
}
function Eyebrow({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "gk-eyebrow",
    style: style
  }, children);
}
function Divider({
  style
}) {
  return /*#__PURE__*/React.createElement("hr", {
    className: "gk-divider",
    style: style
  });
}
function Badge({
  tone,
  icon,
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: `gk-badge${tone ? " gk-badge--" + tone : ""}`
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon
  }), children);
}
function Avatar({
  src,
  name = "",
  size = 40,
  style
}) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("");
  const hue = (name.charCodeAt(0) || 0) * 37 % 360;
  return /*#__PURE__*/React.createElement("span", {
    className: "gk-avatar",
    style: {
      width: size,
      height: size,
      fontSize: size * 0.38,
      background: src ? "transparent" : `oklch(0.62 0.13 ${hue})`,
      ...style
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : initials);
}

/* ----------------------------- inputs ----------------------------- */
function Field({
  label,
  required,
  hint,
  children
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: "gk-field"
  }, label && /*#__PURE__*/React.createElement("span", {
    className: "gk-field__label"
  }, label, required && /*#__PURE__*/React.createElement("span", {
    className: "gk-field__req"
  }, "*")), children, hint && /*#__PURE__*/React.createElement("span", {
    className: "gk-field__hint"
  }, hint));
}
function TextInput({
  label,
  required,
  hint,
  icon,
  ...rest
}) {
  return /*#__PURE__*/React.createElement(Field, {
    label: label,
    required: required,
    hint: hint
  }, icon ? /*#__PURE__*/React.createElement("span", {
    className: "gk-input-wrap"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    className: "gk-input-wrap__icon"
  }), /*#__PURE__*/React.createElement("input", _extends({
    className: "gk-input"
  }, rest))) : /*#__PURE__*/React.createElement("input", _extends({
    className: "gk-input"
  }, rest)));
}
function Textarea({
  label,
  required,
  hint,
  rows = 3,
  ...rest
}) {
  return /*#__PURE__*/React.createElement(Field, {
    label: label,
    required: required,
    hint: hint
  }, /*#__PURE__*/React.createElement("textarea", _extends({
    className: "gk-input",
    rows: rows
  }, rest)));
}
function Select({
  label,
  required,
  hint,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement(Field, {
    label: label,
    required: required,
    hint: hint
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    className: "gk-input"
  }, rest), children), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-down",
    style: {
      position: "absolute",
      right: 12,
      top: "50%",
      transform: "translateY(-50%)",
      color: "var(--text-3)",
      pointerEvents: "none",
      fontSize: 18
    }
  })));
}
function Switch({
  on,
  onChange
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: `gk-switch${on ? " gk-switch--on" : ""}`,
    onClick: () => onChange(!on)
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-switch__dot"
  }));
}
function SwitchRow({
  label,
  desc,
  on,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "4px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fz-md)",
      fontWeight: 600
    }
  }, label), desc && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fz-sm)",
      color: "var(--text-3)",
      marginTop: 2
    }
  }, desc)), /*#__PURE__*/React.createElement(Switch, {
    on: on,
    onChange: onChange
  }));
}
function Segmented({
  options,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "gk-seg"
  }, options.map(o => {
    const v = o.value ?? o;
    const lbl = o.label ?? o;
    return /*#__PURE__*/React.createElement("button", {
      key: v,
      className: `gk-seg__item${value === v ? " gk-seg__item--on" : ""}`,
      onClick: () => onChange(v)
    }, lbl);
  }));
}
function Slider({
  min = 0,
  max = 100,
  value,
  onChange,
  unit = ""
}) {
  const pct = (value - min) / (max - min) * 100;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fz-sm)",
      color: "var(--text-3)"
    }
  }, min, unit), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: "var(--fz-md)",
      fontWeight: 600,
      color: "var(--primary)"
    }
  }, value, unit), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fz-sm)",
      color: "var(--text-3)"
    }
  }, max, unit)), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: min,
    max: max,
    value: value,
    onChange: e => onChange(+e.target.value),
    style: {
      width: "100%",
      accentColor: "var(--primary)",
      "--pct": pct + "%"
    }
  }));
}
function Chip({
  on,
  icon,
  children,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: `gk-chip${on ? " gk-chip--on" : ""}`,
    onClick: onClick
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon
  }), children, on && /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    style: {
      fontSize: 14
    }
  }));
}
function Stars({
  value,
  onChange,
  size = 28
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4
    }
  }, [1, 2, 3, 4, 5].map(n => /*#__PURE__*/React.createElement(Icon, _extends({
    key: n,
    name: n <= value ? "star-filled" : "star",
    size: size,
    style: {
      color: n <= value ? "var(--yellow-6)" : "var(--border-2)",
      cursor: onChange ? "pointer" : "default"
    }
  }, onChange ? {
    onClick: () => onChange(n)
  } : {}))));
}

/* --------------------------- media slots --------------------------- */
// Striped placeholder the user/dev fills with a real photo.
function Photo({
  label,
  h = 120,
  filled,
  tone = "neutral",
  icon = "photo",
  onClick,
  dashed,
  accent
}) {
  const tones = {
    neutral: "var(--bg-2)",
    before: "var(--bg-2)",
    after: "var(--green-bg)"
  };
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      height: h,
      borderRadius: "var(--r-md)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      cursor: onClick ? "pointer" : "default",
      color: filled ? tone === "after" ? "var(--green-fg)" : "var(--text-2)" : "var(--text-3)",
      background: filled ? tones[tone] : "transparent",
      border: `${dashed ? "1.5px dashed" : "1px solid"} ${accent ? "var(--primary)" : "var(--border-2)"}`,
      backgroundImage: filled ? `repeating-linear-gradient(135deg, transparent 0 11px, rgba(0,0,0,.025) 11px 12px)` : "none",
      position: "relative",
      overflow: "hidden",
      textAlign: "center",
      padding: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: filled ? "check" : icon,
    size: filled ? 24 : 22
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fz-xs)",
      fontWeight: 600,
      lineHeight: 1.3
    }
  }, label));
}
function BeforeAfter({
  before = "Before",
  after = "After",
  h = 130
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 4,
      borderRadius: "var(--r-md)",
      overflow: "hidden"
    }
  }, [["before", before, "#868e96"], ["after", after, "var(--green-6)"]].map(([k, lbl, c]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      height: h,
      position: "relative",
      display: "flex",
      alignItems: "flex-end",
      padding: 8,
      background: k === "after" ? "var(--green-bg)" : "var(--bg-2)",
      backgroundImage: `repeating-linear-gradient(135deg, transparent 0 13px, rgba(0,0,0,.03) 13px 14px)`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 8,
      left: 8,
      fontSize: 9,
      fontWeight: 800,
      letterSpacing: ".6px",
      textTransform: "uppercase",
      color: c,
      background: "var(--surface)",
      padding: "3px 7px",
      borderRadius: 5
    }
  }, k === "after" ? "✦ After" : "Before"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fz-xs)",
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, lbl))));
}

/* ----------------------------- device shell ----------------------------- */
function StatusBar() {
  return /*#__PURE__*/React.createElement("div", {
    className: "gk-statusbar",
    style: {
      height: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 28px",
      position: "relative",
      flex: "0 0 auto",
      color: "var(--text)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 14,
      fontWeight: 600,
      letterSpacing: ".5px"
    }
  }, "9:41"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "50%",
      top: 9,
      transform: "translateX(-50%)",
      width: 104,
      height: 30,
      background: "#000",
      borderRadius: 999
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "antenna-bars-5",
    size: 17
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "wifi",
    size: 17
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "battery-3",
    size: 20,
    style: {
      transform: "rotate(0deg)"
    }
  })));
}
function PhoneFrame({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "gk-phone",
    style: {
      width: 398,
      height: 836,
      background: "var(--surface)",
      borderRadius: 52,
      padding: 10,
      boxShadow: "var(--shadow-device)",
      flex: "0 0 auto",
      border: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      height: "100%",
      background: "var(--bg)",
      borderRadius: 44,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(StatusBar, null), children));
}
function AppBar({
  title,
  subtitle,
  onBack,
  left,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "0 0 auto",
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "6px 12px 10px",
      borderBottom: "1px solid var(--border)",
      background: "var(--surface)"
    }
  }, onBack && /*#__PURE__*/React.createElement(IconBtn, {
    icon: "arrow-left",
    onClick: onBack
  }), left, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      lineHeight: 1.2,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fz-xs)",
      color: "var(--text-3)",
      fontWeight: 500
    }
  }, subtitle)), right);
}
function BottomTab({
  tabs,
  active,
  onTab
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "0 0 auto",
      display: "flex",
      borderTop: "1px solid var(--border)",
      background: "var(--surface)",
      padding: "8px 6px 22px"
    }
  }, tabs.map(t => {
    const on = t.id === active;
    const primary = t.primary;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      onClick: () => onTab(t.id),
      style: {
        flex: 1,
        background: "none",
        border: "none",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        padding: "2px 0",
        color: on ? "var(--primary)" : "var(--text-3)"
      }
    }, primary ? /*#__PURE__*/React.createElement("span", {
      style: {
        width: 46,
        height: 32,
        marginTop: -2,
        borderRadius: 10,
        background: "var(--primary)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: t.icon,
      size: 22
    })) : /*#__PURE__*/React.createElement(Icon, {
      name: on ? t.iconOn || t.icon : t.icon,
      size: 23
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10.5,
        fontWeight: on ? 700 : 500
      }
    }, t.label));
  }));
}

// Layout: sticky app bar + scroll body + optional sticky footer + optional tab bar.
function Screen({
  appBar,
  children,
  footer,
  tabBar,
  scrollRef
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, appBar, /*#__PURE__*/React.createElement("div", {
    className: "gk-scroll",
    ref: scrollRef,
    style: {
      flex: 1,
      overflowY: "auto",
      overflowX: "hidden"
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "0 0 auto",
      padding: "12px 16px",
      borderTop: "1px solid var(--border)",
      background: "var(--surface)"
    }
  }, footer), tabBar);
}

// Onboarding progress dots.
function Steps({
  total,
  current
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 5,
      padding: "0 16px 4px"
    }
  }, Array.from({
    length: total
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      height: 4,
      borderRadius: 99,
      background: i <= current ? "var(--primary)" : "var(--border-2)"
    }
  })));
}

// Generic body padding wrapper.
function Body({
  children,
  gap = 14,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap,
      ...style
    }
  }, children);
}
function Stat({
  k,
  v,
  delta,
  deltaTone = "green",
  icon
}) {
  return /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-eyebrow"
  }, k), icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 17,
    style: {
      color: "var(--text-3)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 26,
      fontWeight: 800,
      letterSpacing: "-.5px",
      lineHeight: 1
    }
  }, v), delta && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 3,
      marginTop: 7,
      fontSize: 12,
      fontWeight: 700,
      color: deltaTone === "green" ? "var(--green-fg)" : deltaTone === "red" ? "var(--red-fg)" : "var(--text-3)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: deltaTone === "red" ? "trending-down" : "trending-up",
    size: 14
  }), delta));
}

// Bar chart (simple, themed).
function BarChart({
  data,
  h = 120,
  color = "var(--primary)"
}) {
  const max = Math.max(...data.map(d => d.v));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: 8,
      height: h
    }
  }, data.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      height: "100%",
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 30,
      height: `${d.v / max * 100}%`,
      minHeight: 4,
      background: d.hl ? color : "var(--tint-strong)",
      borderRadius: "5px 5px 3px 3px",
      transition: "height .3s"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, d.l))));
}
Object.assign(window, {
  Icon,
  Btn,
  IconBtn,
  Card,
  Eyebrow,
  Divider,
  Badge,
  Avatar,
  Field,
  TextInput,
  Textarea,
  Select,
  Switch,
  SwitchRow,
  Segmented,
  Slider,
  Chip,
  Stars,
  Photo,
  BeforeAfter,
  PhoneFrame,
  AppBar,
  BottomTab,
  Screen,
  Steps,
  Body,
  Stat,
  BarChart
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_cursor/design_reference/screens/_shared/kit.jsx", error: String((e && e.message) || e) }); }

// design_handoff_cursor/design_reference/screens/admin/app.jsx
try { (() => {
/* global React, ReactDOM, BrowserChrome, AdSidebar, AdTopBar,
   V3_1_Ops, V3_2_Triage, V3_3_Safety, V3_4_Ledger, V3_5_Krafts, V3_6_Settings, AdBtn, Pill */
const {
  useState,
  useEffect,
  useLayoutEffect,
  useRef
} = React;
const NAV = [{
  id: "v1",
  icon: "layout-dashboard",
  label: "Regional Ops"
}, {
  id: "v2",
  icon: "broadcast",
  label: "Triage Desk",
  badge: "3"
}, {
  id: "v3",
  icon: "shield-half",
  label: "Safety & Hygiene",
  badge: "3"
}, {
  id: "v4",
  icon: "users-group",
  label: "Pro Ledger"
}, {
  id: "v5",
  icon: "photo-check",
  label: "Kraft Verification",
  badge: "2"
}, {
  id: "v6",
  icon: "settings",
  label: "Node Settings"
}];
const VIEWS = {
  v1: V3_1_Ops,
  v2: V3_2_Triage,
  v3: V3_3_Safety,
  v4: V3_4_Ledger,
  v5: V3_5_Krafts,
  v6: V3_6_Settings
};
const META = {
  v1: ["3.1 · Regional Core Ops", "Live command center for node southwest-us-04"],
  v2: ["3.2 · Cross-Channel Triage Desk", "Dispatch unrouted emergencies over SMS + WhatsApp"],
  v3: ["3.3 · Safety & Hygiene", "Verification compliance and dispute moderation"],
  v4: ["3.4 · Pro Ledger", "142 active tradespeople in this node"],
  v5: ["3.5 · Kraft Verification", "Enforce the mandatory After photo + invoice rule"],
  v6: ["3.6 · Node Settings & Billing", "Configuration and the node revenue ledger"]
};
function useScale(w0, h0) {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const calc = () => {
      const w = ref.current;
      if (!w) return;
      setScale(Math.min(1, (w.clientWidth - 40) / w0, (w.clientHeight - 40) / h0));
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (ref.current) ro.observe(ref.current);
    window.addEventListener("resize", calc);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", calc);
    };
  }, []);
  return [ref, scale];
}
function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("gk_theme") || "light");
  const [view, setView] = useState(() => localStorage.getItem("gk_a_view") || "v1");
  const [toastMsg, setToastMsg] = useState(null);
  const [wrapRef, scale] = useScale(1440, 900);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("gk_theme", theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("gk_a_view", view);
  }, [view]);
  const toast = m => {
    if (!m) return;
    setToastMsg(m);
    clearTimeout(window.__t);
    window.__t = setTimeout(() => setToastMsg(null), 2200);
  };
  const Active = VIEWS[view];
  const [title, sub] = META[view];
  return /*#__PURE__*/React.createElement("div", {
    ref: wrapRef,
    style: {
      height: "100vh",
      width: "100vw",
      overflow: "hidden",
      background: "var(--bg-2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1440,
      height: 900,
      transform: `scale(${scale})`,
      transformOrigin: "center center",
      flex: "0 0 auto"
    }
  }, /*#__PURE__*/React.createElement(BrowserChrome, {
    url: "admin.gigkraft.com/node/southwest-us-04/control-panel"
  }, /*#__PURE__*/React.createElement(AdSidebar, {
    nav: NAV,
    active: view,
    onNav: setView
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      background: "var(--bg)"
    }
  }, /*#__PURE__*/React.createElement(AdTopBar, {
    title: title,
    subtitle: sub,
    theme: theme,
    onTheme: () => setTheme(theme === "light" ? "dark" : "light"),
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Pill, {
      tone: "green",
      dot: true
    }, "Node live"), /*#__PURE__*/React.createElement(AdBtn, {
      tone: "default",
      icon: "bell"
    }, "Alerts"))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(Active, {
    toast: toast
  }))))), toastMsg && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 28,
      left: "50%",
      transform: "translateX(-50%)",
      background: "var(--gray-9)",
      color: "#fff",
      padding: "12px 20px",
      borderRadius: 12,
      fontSize: 14,
      fontWeight: 600,
      boxShadow: "var(--shadow-lg)",
      display: "flex",
      alignItems: "center",
      gap: 8,
      zIndex: 50
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--blue-3)",
      display: "flex"
    }
  }, "\u2713"), toastMsg));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_cursor/design_reference/screens/admin/app.jsx", error: String((e && e.message) || e) }); }

// design_handoff_cursor/design_reference/screens/admin/views.jsx
try { (() => {
/* global React, Icon, Avatar, Panel, AdMetric, Pill, AdBtn, Table, SearchBox, Donut, Bars, BeforeAfter, Photo, Badge */
// GigKraft Admin — views 3.1–3.6 (Community Node Manager console).
const {
  useState: useV
} = React;
const wrap = children => /*#__PURE__*/React.createElement("div", {
  style: {
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 18,
    height: "100%",
    overflowY: "auto"
  },
  className: "gk-scroll"
}, children);

/* 3.1 — Regional Core Ops (dashboard) */
function V3_1_Ops() {
  const acts = [["Marcus Bell", "published a Kraft · Copper riser re-pipe · $1,840", "2m", "green"], ["Emergency broadcast", "Kitchen pipe burst · Downtown · budget $150", "8m", "red"], ["R. Alvarez", "claimed lead · Breaker panel trip · Eastside", "14m", "blue"], ["Tasha Quinn", "earned 5★ recommendation from Priya Shah", "31m", "green"], ["New pro", "Leo Park activated Pro Vault · $199/yr", "1h", "blue"]];
  return wrap(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(AdMetric, {
    label: "Pending triage",
    value: "3 tasks",
    delta: "2 urgent",
    deltaTone: "red",
    icon: "urgent"
  }), /*#__PURE__*/React.createElement(AdMetric, {
    label: "Active pros",
    value: "142",
    delta: "+6 this week",
    icon: "users"
  }), /*#__PURE__*/React.createElement(AdMetric, {
    label: "Avg response",
    value: "1h 52m",
    delta: "inside 4h SLA",
    icon: "clock-check"
  }), /*#__PURE__*/React.createElement(AdMetric, {
    label: "Monthly run rate",
    value: "$2,838",
    delta: "+22%",
    icon: "cash",
    accent: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.6fr 1fr",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Node throughput \xB7 last 6 weeks",
    action: /*#__PURE__*/React.createElement(Pill, {
      tone: "green",
      dot: true
    }, "Healthy")
  }, /*#__PURE__*/React.createElement(Bars, {
    data: [{
      t: "82",
      l: "Apr 28",
      v: 82
    }, {
      t: "96",
      l: "May 5",
      v: 96
    }, {
      t: "88",
      l: "May 12",
      v: 88
    }, {
      t: "104",
      l: "May 19",
      v: 104
    }, {
      t: "121",
      l: "May 26",
      v: 121
    }, {
      t: "138",
      l: "Jun 2",
      v: 138,
      hl: true
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 24,
      marginTop: 16,
      paddingTop: 16,
      borderTop: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, "Jobs closed"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800
    }
  }, "629")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, "Win rate"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800
    }
  }, "41%")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, "Repeat clients"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800
    }
  }, "33%")))), /*#__PURE__*/React.createElement(Panel, {
    title: "SLA compliance"
  }, /*#__PURE__*/React.createElement(Donut, {
    pct: 92,
    label: "Within 4h promise",
    sub: "131 of 142 pros on target"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, [["Plumbing", 96, "green"], ["Electrical", 91, "green"], ["HVAC", 78, "yellow"]].map(([t, v, tone]) => /*#__PURE__*/React.createElement("div", {
    key: t
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 12.5,
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, t), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      color: "var(--text-3)"
    }
  }, v, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 7,
      borderRadius: 99,
      background: "var(--bg-2)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${v}%`,
      height: "100%",
      borderRadius: 99,
      background: tone === "yellow" ? "var(--yellow-6)" : "var(--green-6)"
    }
  }))))))), /*#__PURE__*/React.createElement(Panel, {
    title: "Recent node activity",
    action: /*#__PURE__*/React.createElement(AdBtn, {
      tone: "ghost",
      icon: "refresh"
    }, "Refresh")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, acts.map(([who, ctx, t, tone], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 4px",
      borderBottom: i < acts.length - 1 ? "1px solid var(--border)" : "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      flex: "0 0 auto",
      background: tone === "red" ? "var(--red-6)" : tone === "blue" ? "var(--blue-6)" : "var(--green-6)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement("strong", null, who), " ", ctx), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      fontSize: 12,
      color: "var(--text-3)"
    },
    className: "mono"
  }, t, " ago")))))));
}

/* 3.2 — Cross-Channel Triage Desk */
function V3_2_Triage({
  toast
}) {
  const [done, setDone] = useV([]);
  const rows = [{
    id: "TSK-8902",
    ctx: "Kitchen pipe main-line burst",
    sub: "Water pooling · Downtown node",
    budget: "$150",
    age: "4m",
    urgent: true
  }, {
    id: "TSK-8911",
    ctx: "Breaker panel total trip",
    sub: "No power to property · Eastside node",
    budget: "$240",
    age: "12m",
    urgent: true
  }, {
    id: "TSK-8920",
    ctx: "Water heater leaking",
    sub: "Garage flooding slowly · North node",
    budget: "$400",
    age: "26m",
    urgent: false
  }];
  const live = rows.filter(r => !done.includes(r.id));
  return wrap(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(AdMetric, {
    label: "Unrouted",
    value: live.length,
    delta: "dispatch now",
    deltaTone: "red",
    icon: "broadcast"
  }), /*#__PURE__*/React.createElement(AdMetric, {
    label: "Claimed today",
    value: "11",
    delta: "+4",
    icon: "check"
  }), /*#__PURE__*/React.createElement(AdMetric, {
    label: "Avg claim time",
    value: "3m 40s",
    icon: "clock"
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "Outreach triage desk",
    pad: false,
    action: /*#__PURE__*/React.createElement(Pill, {
      tone: "red",
      dot: true
    }, live.length, " awaiting dispatch")
  }, live.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 48,
      textAlign: "center",
      color: "var(--text-3)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-check",
    size: 40,
    style: {
      color: "var(--green-fg)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      fontWeight: 600
    }
  }, "Queue clear \u2014 all emergencies dispatched.")) : /*#__PURE__*/React.createElement(Table, {
    cols: [{
      key: "id",
      label: "Task",
      w: 120
    }, {
      key: "ctx",
      label: "Context"
    }, {
      key: "budget",
      label: "Budget",
      align: "right",
      w: 100
    }, {
      key: "act",
      label: "Dispatch",
      align: "right",
      w: 250
    }],
    rows: live,
    render: (r, k) => {
      if (k === "id") return /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", {
        className: "mono",
        style: {
          fontSize: 12.5
        }
      }, "#", r.id), r.urgent && /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 4
        }
      }, /*#__PURE__*/React.createElement(Pill, {
        tone: "red"
      }, r.age, " old")));
      if (k === "ctx") return /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, r.ctx), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 12.5,
          color: "var(--text-3)"
        }
      }, r.sub));
      if (k === "budget") return /*#__PURE__*/React.createElement("span", {
        className: "mono",
        style: {
          fontWeight: 800,
          color: "var(--green-fg)"
        }
      }, r.budget);
      return /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 8,
          justifyContent: "flex-end"
        }
      }, /*#__PURE__*/React.createElement(AdBtn, {
        tone: "whatsapp",
        icon: "brand-whatsapp",
        onClick: () => toast("WhatsApp blast dispatched to node.")
      }, "Blast"), /*#__PURE__*/React.createElement(AdBtn, {
        tone: "sms",
        icon: "message-2",
        onClick: () => {
          setDone([...done, r.id]);
          toast("SMS pin broadcast — task routed.");
        }
      }, "SMS pin"));
    }
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "",
    pad: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      color: "var(--text-2)",
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "info-circle",
    size: 18,
    style: {
      color: "var(--text-3)"
    }
  }), "Payloads beam instantly to proven local pros over native SMS + WhatsApp automation. Alerts escalate if a task sits unassigned beyond 15 minutes."))));
}

/* 3.3 — Safety & Hygiene moderation */
function V3_3_Safety({
  toast
}) {
  const [resolved, setResolved] = useV([]);
  const rows = [{
    id: "DISP-302",
    who: "John Doe",
    trade: "Carpenter",
    ctx: "Off-platform pricing variance vs published portfolio.",
    sev: "yellow"
  }, {
    id: "DISP-318",
    who: "M. Reyes",
    trade: "Roofer",
    ctx: "Missing mandatory After image on 2 published Krafts.",
    sev: "red"
  }, {
    id: "DISP-325",
    who: "K. Obi",
    trade: "Painter",
    ctx: "Client reported no-show after lead claim.",
    sev: "yellow"
  }];
  const open = rows.filter(r => !resolved.includes(r.id));
  return wrap(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(AdMetric, {
    label: "Open disputes",
    value: open.length,
    icon: "flag",
    deltaTone: "red",
    delta: open.length ? "needs review" : "clear"
  }), /*#__PURE__*/React.createElement(AdMetric, {
    label: "Suspended pros",
    value: "2",
    icon: "user-off"
  }), /*#__PURE__*/React.createElement(AdMetric, {
    label: "Hygiene score",
    value: "A\u2212",
    delta: "directory healthy",
    icon: "shield-check"
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "Verification compliance & safety queue",
    pad: false
  }, open.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 48,
      textAlign: "center",
      color: "var(--text-3)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-check",
    size: 40,
    style: {
      color: "var(--green-fg)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      fontWeight: 600
    }
  }, "Queue clear \u2014 marketplace hygiene maintained.")) : /*#__PURE__*/React.createElement(Table, {
    cols: [{
      key: "id",
      label: "Log",
      w: 120
    }, {
      key: "who",
      label: "Profile",
      w: 200
    }, {
      key: "ctx",
      label: "Infraction"
    }, {
      key: "act",
      label: "Override",
      align: "right",
      w: 220
    }],
    rows: open,
    render: (r, k) => {
      if (k === "id") return /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", {
        className: "mono",
        style: {
          fontSize: 12.5
        }
      }, "#", r.id), /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 4
        }
      }, /*#__PURE__*/React.createElement(Pill, {
        tone: r.sev
      }, r.sev === "red" ? "High" : "Medium")));
      if (k === "who") return /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: r.who,
        size: 32
      }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 600,
          fontSize: 13.5
        }
      }, r.who), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12,
          color: "var(--text-3)"
        }
      }, r.trade)));
      if (k === "ctx") return /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 13,
          color: "var(--text-2)"
        }
      }, r.ctx);
      return /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 8,
          justifyContent: "flex-end"
        }
      }, /*#__PURE__*/React.createElement(AdBtn, {
        tone: "green",
        icon: "check",
        onClick: () => {
          setResolved([...resolved, r.id]);
          toast("Dispute dismissed & archived.");
        }
      }, "Dismiss"), /*#__PURE__*/React.createElement(AdBtn, {
        tone: "red",
        icon: "ban",
        onClick: () => {
          setResolved([...resolved, r.id]);
          toast("Profile suspended — hidden from directory.");
        }
      }, "Suspend"));
    }
  }))));
}

/* 3.4 — Pro Ledger */
function V3_4_Ledger() {
  const rows = [{
    id: 1,
    name: "Marcus Bell",
    trade: "Plumbing",
    krafts: 12,
    recs: 42,
    sla: "1h 52m",
    plan: "Annual",
    status: "Active"
  }, {
    id: 2,
    name: "Tasha Quinn",
    trade: "Drywall & Paint",
    krafts: 9,
    recs: 31,
    sla: "2h 10m",
    plan: "Monthly",
    status: "Active"
  }, {
    id: 3,
    name: "Leo Park",
    trade: "Electrical",
    krafts: 7,
    recs: 27,
    sla: "3h 04m",
    plan: "Annual",
    status: "Active"
  }, {
    id: 4,
    name: "Ramon Alvarez",
    trade: "HVAC",
    krafts: 15,
    recs: 38,
    sla: "5h 20m",
    plan: "Monthly",
    status: "At risk"
  }, {
    id: 5,
    name: "Bea Foster",
    trade: "Tile & Flooring",
    krafts: 6,
    recs: 19,
    sla: "2h 41m",
    plan: "Annual",
    status: "Active"
  }, {
    id: 6,
    name: "M. Reyes",
    trade: "Roofing",
    krafts: 2,
    recs: 4,
    sla: "—",
    plan: "Monthly",
    status: "Suspended"
  }];
  return wrap(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Panel, {
    title: "Pro ledger \xB7 142 active",
    pad: false,
    action: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(SearchBox, {
      placeholder: "Search pros\u2026",
      w: 220
    }), /*#__PURE__*/React.createElement(AdBtn, {
      tone: "primary",
      icon: "user-plus"
    }, "Invite pro"))
  }, /*#__PURE__*/React.createElement(Table, {
    cols: [{
      key: "name",
      label: "Pro"
    }, {
      key: "trade",
      label: "Trade",
      w: 150
    }, {
      key: "krafts",
      label: "Krafts",
      align: "center",
      w: 80
    }, {
      key: "recs",
      label: "Recs",
      align: "center",
      w: 80
    }, {
      key: "sla",
      label: "Avg SLA",
      align: "center",
      w: 100
    }, {
      key: "plan",
      label: "Plan",
      w: 100
    }, {
      key: "status",
      label: "Status",
      align: "right",
      w: 120
    }],
    rows: rows,
    render: (r, k) => {
      if (k === "name") return /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: r.name,
        size: 32
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 600
        }
      }, r.name));
      if (k === "krafts" || k === "recs") return /*#__PURE__*/React.createElement("span", {
        className: "mono",
        style: {
          fontWeight: 600
        }
      }, r[k]);
      if (k === "sla") return /*#__PURE__*/React.createElement("span", {
        className: "mono",
        style: {
          color: r.status === "At risk" ? "var(--yellow-fg)" : "var(--text-2)"
        }
      }, r.sla);
      if (k === "plan") return /*#__PURE__*/React.createElement(Pill, {
        tone: "gray"
      }, r.plan);
      if (k === "status") return /*#__PURE__*/React.createElement(Pill, {
        tone: r.status === "Active" ? "green" : r.status === "At risk" ? "yellow" : "red",
        dot: true
      }, r.status);
      return r[k];
    }
  }))));
}

/* 3.5 — Kraft Verification (enforce mandatory After) */
function V3_5_Krafts({
  toast
}) {
  const [acted, setActed] = useV([]);
  const rows = [{
    id: "KR-4471",
    pro: "Ramon Alvarez",
    title: "Condenser swap",
    cost: "$3,400",
    hasAfter: true,
    hasInvoice: true
  }, {
    id: "KR-4480",
    pro: "M. Reyes",
    title: "Ridge cap re-seal",
    cost: "$620",
    hasAfter: false,
    hasInvoice: true
  }, {
    id: "KR-4488",
    pro: "Bea Foster",
    title: "Master bath re-tile",
    cost: "$2,150",
    hasAfter: true,
    hasInvoice: false
  }];
  const open = rows.filter(r => !acted.includes(r.id));
  return wrap(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(AdMetric, {
    label: "Awaiting review",
    value: open.length,
    icon: "photo-check"
  }), /*#__PURE__*/React.createElement(AdMetric, {
    label: "Verified this week",
    value: "48",
    delta: "+12",
    icon: "discount-check"
  }), /*#__PURE__*/React.createElement(AdMetric, {
    label: "Rejected",
    value: "3",
    icon: "photo-x",
    deltaTone: "red",
    delta: "missing proof"
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "Kraft verification queue",
    action: /*#__PURE__*/React.createElement(Pill, {
      tone: "blue"
    }, "Mandatory After + invoice")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16
    }
  }, open.map(r => {
    const ok = r.hasAfter && r.hasInvoice;
    return /*#__PURE__*/React.createElement("div", {
      key: r.id,
      style: {
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement(BeforeAfter, {
      h: 130,
      before: r.title,
      after: r.hasAfter ? "after photo" : "MISSING after"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: r.pro,
      size: 30
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 13.5
      }
    }, r.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--text-3)"
      }
    }, r.pro, " \xB7 ", /*#__PURE__*/React.createElement("span", {
      className: "mono"
    }, "#", r.id)))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement(Pill, {
      tone: r.hasAfter ? "green" : "red",
      dot: true
    }, r.hasAfter ? "After photo" : "No After"), /*#__PURE__*/React.createElement(Pill, {
      tone: r.hasInvoice ? "green" : "red",
      dot: true
    }, r.hasInvoice ? `Invoice ${r.cost}` : "No invoice")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginTop: 14
      }
    }, /*#__PURE__*/React.createElement(AdBtn, {
      tone: "red",
      icon: "x",
      onClick: () => {
        setActed([...acted, r.id]);
        toast("Kraft rejected — pro notified to add proof.");
      }
    }, "Reject"), /*#__PURE__*/React.createElement(AdBtn, {
      tone: ok ? "green" : "ghost",
      icon: "check",
      onClick: () => {
        if (!ok) {
          toast("Can't verify — proof incomplete.");
          return;
        }
        setActed([...acted, r.id]);
        toast("Kraft verified & published.");
      },
      style: {
        flex: 1,
        justifyContent: "center",
        opacity: ok ? 1 : .5,
        cursor: ok ? "pointer" : "not-allowed"
      }
    }, "Verify"))));
  })), open.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 40,
      textAlign: "center",
      color: "var(--text-3)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "checks",
    size: 36,
    style: {
      color: "var(--green-fg)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      fontWeight: 600
    }
  }, "All Krafts reviewed.")))));
}

/* 3.6 — Node Settings & Billing */
function V3_6_Settings({
  toast
}) {
  const [autoblast, setAutoblast] = useV(true);
  const [escalate, setEscalate] = useV(true);
  const Row = ({
    label,
    desc,
    on,
    set
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "12px 0",
      borderBottom: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--text-3)",
      marginTop: 2
    }
  }, desc)), /*#__PURE__*/React.createElement("button", {
    onClick: () => set(!on),
    className: `gk-switch${on ? " gk-switch--on" : ""}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-switch__dot"
  })));
  return wrap(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.2fr 1fr",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Node configuration"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement(Row, {
    label: "Auto-blast emergencies",
    desc: "Dispatch unrouted tasks to pros over SMS + WhatsApp automatically",
    on: autoblast,
    set: setAutoblast
  }), /*#__PURE__*/React.createElement(Row, {
    label: "15-min escalation alerts",
    desc: "Notify me if a task sits unassigned past the threshold",
    on: escalate,
    set: setEscalate
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "gk-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-field__label"
  }, "Node ID"), /*#__PURE__*/React.createElement("input", {
    className: "gk-input mono",
    defaultValue: "southwest-us-04"
  })), /*#__PURE__*/React.createElement("label", {
    className: "gk-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-field__label"
  }, "Response SLA"), /*#__PURE__*/React.createElement("select", {
    className: "gk-input",
    defaultValue: "4"
  }, /*#__PURE__*/React.createElement("option", {
    value: "2"
  }, "2 hours"), /*#__PURE__*/React.createElement("option", {
    value: "4"
  }, "4 hours"), /*#__PURE__*/React.createElement("option", {
    value: "8"
  }, "8 hours")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(AdBtn, {
    tone: "primary",
    icon: "device-floppy",
    onClick: () => toast("Node settings saved.")
  }, "Save changes"))), /*#__PURE__*/React.createElement(Panel, {
    title: "Node billing ledger"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      borderRadius: 12,
      background: "var(--green-bg)",
      border: "1px solid var(--green-bd)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "var(--green-fg)",
      letterSpacing: ".4px"
    }
  }, "MONTHLY RUN RATE"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 30,
      fontWeight: 800,
      color: "var(--green-fg)",
      marginTop: 6
    }
  }, "$2,838.58"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--green-fg)",
      opacity: .85,
      marginTop: 4
    }
  }, "142 pros \xB7 blended $19.99/mo + annual")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "flex",
      flexDirection: "column",
      gap: 0
    }
  }, [["Subscriptions (monthly)", "$1,919.04"], ["Annual amortized", "$782.54"], ["Lead surcharges", "$137.00"]].map(([k, v], i, a) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      justifyContent: "space-between",
      padding: "11px 0",
      borderBottom: i < a.length - 1 ? "1px solid var(--border)" : "none",
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-2)"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontWeight: 700
    }
  }, v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(AdBtn, {
    tone: "default",
    icon: "download",
    onClick: () => toast("Exporting node ledger…")
  }, "Export CSV"))))));
}
Object.assign(window, {
  V3_1_Ops,
  V3_2_Triage,
  V3_3_Safety,
  V3_4_Ledger,
  V3_5_Krafts,
  V3_6_Settings
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_cursor/design_reference/screens/admin/views.jsx", error: String((e && e.message) || e) }); }

// design_handoff_cursor/design_reference/screens/consumer/app.jsx
try { (() => {
/* global React, ReactDOM, PhoneFrame, BottomTab, Icon,
   S2_1_Discover, S2_2_ProofDetail, S2_3_Emergency, S2_4_QuoteChat, S2_5_Review, S2_6_Account */
const {
  useState,
  useEffect,
  useLayoutEffect,
  useRef
} = React;
const SCREENS = {
  s2_1: S2_1_Discover,
  s2_2: S2_2_ProofDetail,
  s2_3: S2_3_Emergency,
  s2_4: S2_4_QuoteChat,
  s2_5: S2_5_Review,
  account: S2_6_Account
};
const TABS = [{
  id: "s2_1",
  icon: "search",
  label: "Discover"
}, {
  id: "s2_4",
  icon: "message-circle",
  label: "Messages"
}, {
  id: "s2_3",
  icon: "urgent",
  label: "Emergency",
  primary: true
}, {
  id: "s2_5",
  icon: "star",
  label: "Recommend"
}, {
  id: "account",
  icon: "user",
  label: "You"
}];
const TAB_IDS = TABS.map(t => t.id);
const RAIL = [["s2_1", "2.1", "Discovery feed"], ["s2_2", "2.2", "Proof detail"], ["s2_3", "2.3", "Emergency broadcast"], ["s2_4", "2.4", "Request a quote"], ["s2_5", "2.5", "Leave a recommendation"], ["account", "2.6", "Your account"]];
function useScale() {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const calc = () => {
      const w = ref.current;
      if (!w) return;
      setScale(Math.min(1, (w.clientHeight - 24) / 836, (w.clientWidth - 24) / 398));
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (ref.current) ro.observe(ref.current);
    window.addEventListener("resize", calc);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", calc);
    };
  }, []);
  return [ref, scale];
}
function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("gk_theme") || "light");
  const [screen, setScreen] = useState(() => localStorage.getItem("gk_c_screen") || "s2_1");
  const [ctx, setCtx] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [wrapRef, scale] = useScale();
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("gk_theme", theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("gk_c_screen", screen);
  }, [screen]);
  const go = (s, payload) => {
    if (SCREENS[s] || s === "account") {
      setScreen(s);
      if (payload) setCtx(payload);
    }
  };
  const toast = m => {
    if (!m) return;
    setToastMsg(m);
    clearTimeout(window.__t);
    window.__t = setTimeout(() => setToastMsg(null), 2200);
  };
  const Active = SCREENS[screen] || S2_1_Discover;
  const tabBar = TAB_IDS.includes(screen) ? /*#__PURE__*/React.createElement(BottomTab, {
    tabs: TABS,
    active: screen,
    onTab: go
  }) : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: "100vh",
      width: "100vw",
      overflow: "hidden",
      background: "var(--bg-2)"
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 268,
      flex: "0 0 auto",
      borderRight: "1px solid var(--border)",
      background: "var(--surface)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 20px 16px",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      borderRadius: 9,
      background: "var(--teal-6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "home",
    size: 20,
    style: {
      color: "#fff"
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 17,
      letterSpacing: "-.3px",
      lineHeight: 1
    }
  }, "GigKraft"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, "Homeowner \xB7 6 screens"))), /*#__PURE__*/React.createElement("div", {
    className: "gk-scroll",
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "16px 12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-eyebrow",
    style: {
      padding: "0 10px 8px"
    }
  }, "Consumer / recommender"), RAIL.map(([id, num, label]) => {
    const on = screen === id;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => go(id),
      style: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px",
        marginBottom: 2,
        borderRadius: 9,
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        background: on ? "var(--tint)" : "transparent",
        color: on ? "var(--tint-text)" : "var(--text-2)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono",
      style: {
        fontSize: 11,
        fontWeight: 600,
        width: 26,
        color: on ? "var(--primary)" : "var(--text-3)"
      }
    }, num), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        fontWeight: on ? 700 : 500
      }
    }, label));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 16px",
      borderTop: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "../../GigKraft App.html",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 12.5,
      fontWeight: 600,
      color: "var(--text-3)",
      textDecoration: "none"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 15
  }), "All roles"))), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      flex: "0 0 auto",
      height: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      borderBottom: "1px solid var(--border)",
      background: "var(--surface)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15
    }
  }, RAIL.find(([id]) => id === screen)?.[2] || "Account", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-3)",
      fontWeight: 500,
      marginLeft: 8,
      fontSize: 13
    }
  }, "iPhone \xB7 390\xD7844")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setTheme(theme === "light" ? "dark" : "light"),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      height: 38,
      padding: "0 14px",
      borderRadius: 999,
      border: "1px solid var(--border-2)",
      background: "var(--surface)",
      color: "var(--text-2)",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: theme === "light" ? "moon" : "sun",
    size: 17
  }), theme === "light" ? "Dark" : "Light")), /*#__PURE__*/React.createElement("div", {
    ref: wrapRef,
    style: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      transform: `scale(${scale})`,
      transformOrigin: "center center"
    }
  }, /*#__PURE__*/React.createElement(PhoneFrame, null, /*#__PURE__*/React.createElement(Active, {
    go: go,
    toast: toast,
    ctx: ctx,
    tabBar: tabBar
  }))), toastMsg && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 28,
      left: "50%",
      transform: "translateX(-50%)",
      background: "var(--gray-9)",
      color: "#fff",
      padding: "11px 18px",
      borderRadius: 12,
      fontSize: 13.5,
      fontWeight: 600,
      boxShadow: "var(--shadow-lg)",
      display: "flex",
      alignItems: "center",
      gap: 8,
      maxWidth: 360,
      zIndex: 50
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-check-filled",
    size: 18,
    style: {
      color: "var(--blue-3)"
    }
  }), toastMsg))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_cursor/design_reference/screens/consumer/app.jsx", error: String((e && e.message) || e) }); }

// design_handoff_cursor/design_reference/screens/consumer/screens.jsx
try { (() => {
/* global React, AppBar, Screen, Body, Card, Btn, IconBtn, TextInput, Textarea, Select, Segmented, Icon, Eyebrow, Divider, Photo, BeforeAfter, Avatar, Badge, Chip, Stars, Slider */
// GigKraft Consumer — screens 2.1–2.6 (homeowner discovery, emergency, review, account).
const {
  useState: useC,
  useRef: useCRef,
  useEffect: useCEffect
} = React;
const PROOFS = [{
  id: "p1",
  pro: "Marcus Bell",
  trade: "Plumbing",
  title: "Copper riser re-pipe",
  dist: "1.4 mi",
  invoice: "$1,840",
  stars: 5,
  recs: 42,
  verified: true,
  tag: "Re-pipe"
}, {
  id: "p2",
  pro: "Tasha Quinn",
  trade: "Drywall & Paint",
  title: "Ceiling water-stain patch",
  dist: "2.1 mi",
  invoice: "$420",
  stars: 5,
  recs: 31,
  verified: true,
  tag: "Patch"
}, {
  id: "p3",
  pro: "Leo Park",
  trade: "Electrical",
  title: "Panel + EV charger",
  dist: "3.4 mi",
  invoice: "$2,160",
  stars: 4,
  recs: 27,
  verified: true,
  tag: "EV charger"
}, {
  id: "p4",
  pro: "Ramon Alvarez",
  trade: "HVAC",
  title: "Condenser swap",
  dist: "4.0 mi",
  invoice: "$3,400",
  stars: 5,
  recs: 38,
  verified: true,
  tag: "AC"
}];
const TRADES = ["All", "Plumbing", "Electrical", "HVAC", "Drywall", "Carpentry"];

/* 2.1 — Visual Discovery Feed */
function S2_1_Discover({
  go,
  tabBar
}) {
  const [trade, setTrade] = useC("All");
  const list = trade === "All" ? PROOFS : PROOFS.filter(p => p.trade.includes(trade));
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      title: "Discover proof",
      subtitle: "Node SW-04 \xB7 before/after, not reviews",
      right: /*#__PURE__*/React.createElement(IconBtn, {
        icon: "bell"
      })
    }),
    tabBar: tabBar
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 16px 6px",
      position: "sticky",
      top: 0,
      background: "var(--bg)",
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-input-wrap"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    className: "gk-input-wrap__icon"
  }), /*#__PURE__*/React.createElement("input", {
    className: "gk-input",
    placeholder: "Search a job \u2014 \u201Cslab leak\u201D, \u201Cpanel\u201D\u2026"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      overflowX: "auto",
      marginTop: 10,
      paddingBottom: 2
    },
    className: "gk-scroll"
  }, TRADES.map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => setTrade(t),
    style: {
      flex: "0 0 auto",
      fontSize: 13,
      fontWeight: 600,
      padding: "7px 14px",
      borderRadius: 999,
      cursor: "pointer",
      border: `1px solid ${trade === t ? "var(--primary)" : "var(--border-2)"}`,
      background: trade === t ? "var(--tint)" : "var(--surface)",
      color: trade === t ? "var(--tint-text)" : "var(--text-2)"
    }
  }, t)))), /*#__PURE__*/React.createElement(Body, {
    style: {
      paddingTop: 6
    },
    gap: 12
  }, list.map(p => /*#__PURE__*/React.createElement(Card, {
    key: p.id,
    press: true,
    onClick: () => go("s2_2", p),
    style: {
      padding: 0,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(BeforeAfter, {
    h: 150,
    before: p.title,
    after: "verified result"
  }), p.verified && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 10,
      right: 10,
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontSize: 11,
      fontWeight: 700,
      padding: "5px 10px",
      borderRadius: 999,
      background: "var(--surface)",
      color: "var(--green-fg)",
      boxShadow: "var(--shadow-sm)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "discount-check-filled",
    size: 14
  }), "Verified invoice")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: p.pro,
    size: 38
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15
    }
  }, p.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--text-3)"
    }
  }, p.pro, " \xB7 ", p.trade)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 16
    }
  }, p.invoice), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-3)"
    }
  }, "actual cost"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginTop: 10,
      fontSize: 12.5,
      color: "var(--text-3)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 3
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "map-pin",
    size: 14
  }), p.dist), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 3
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "rosette-discount-check",
    size: 14
  }), p.recs, " recommendations"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      color: "var(--yellow-6)",
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "star-filled",
    size: 14
  }), p.stars, ".0")))))));
}

/* 2.2 — Pro Profile / Proof Detail */
function S2_2_ProofDetail({
  go,
  ctx
}) {
  const p = ctx || PROOFS[0];
  const more = [["Slab leak repair", "$980"], ["Water heater swap", "$1,250"], ["Faucet + disposal", "$310"]];
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      onBack: () => go("s2_1"),
      left: /*#__PURE__*/React.createElement(Avatar, {
        name: p.pro,
        size: 38
      }),
      title: p.pro,
      subtitle: `${p.trade} · ${p.dist}`,
      right: /*#__PURE__*/React.createElement(IconBtn, {
        icon: "heart"
      })
    }),
    footer: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Btn, {
      variant: "default",
      leftIcon: "message",
      auto: true,
      style: {
        flex: 1
      },
      onClick: () => go("s2_4")
    }, "Message"), /*#__PURE__*/React.createElement(Btn, {
      leftIcon: "file-dollar",
      auto: true,
      style: {
        flex: 2
      },
      onClick: () => go("s2_4")
    }, "Request a quote"))
  }, /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      gap: 14,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 800,
      color: "var(--primary)"
    }
  }, p.recs), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, "RECS")), /*#__PURE__*/React.createElement(Divider, {
    style: {
      width: 1,
      height: 40
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 800,
      color: "var(--yellow-6)"
    }
  }, p.stars, ".0"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, "RATING")), /*#__PURE__*/React.createElement(Divider, {
    style: {
      width: 1,
      height: 40
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "green",
    icon: "discount-check"
  }, "Verified"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)",
      marginTop: 6
    }
  }, "Licensed \xB7 Insured \xB7 4h response"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 8
    }
  }, "Featured Kraft \xB7 ", p.title), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 0,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(BeforeAfter, {
    h: 170,
    before: p.title,
    after: "copper, pressure-tested"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 12px",
      borderRadius: "var(--r-md)",
      background: "var(--green-bg)",
      border: "1px solid var(--green-bd)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "receipt",
    size: 18,
    style: {
      color: "var(--green-fg)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: "var(--green-fg)"
    }
  }, "Verified job invoice"), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      marginLeft: "auto",
      fontWeight: 800,
      color: "var(--green-fg)"
    }
  }, p.invoice)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: "var(--text-2)",
      lineHeight: 1.55,
      marginTop: 12
    }
  }, "Replaced corroded galvanized riser with type-L copper, pressure-tested the line and patched the drywall. Same-day invoice issued.")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 8
    }
  }, "More verified work"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, more.map(([t, c]) => /*#__PURE__*/React.createElement(Card, {
    key: t,
    press: true,
    style: {
      padding: 0,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(Photo, {
    h: 84,
    filled: true,
    tone: "after",
    label: t
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 10px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, t), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "var(--green-fg)"
    }
  }, c)))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 8
    }
  }, "What clients say"), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Priya Shah",
    size: 34
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 13.5
    }
  }, "Priya Shah"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-3)"
    }
  }, "Repeat client")), /*#__PURE__*/React.createElement(Stars, {
    value: 5,
    size: 15
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: "var(--text-2)",
      lineHeight: 1.55
    }
  }, "\"Found the slab leak two other plumbers missed. Clean copper work, invoice same day.\"")))));
}

/* 2.3 — Emergency Broadcast */
const EM_TYPES = [{
  id: "burst",
  icon: "droplet",
  label: "Burst pipe / leak"
}, {
  id: "power",
  icon: "bolt",
  label: "Power / electrical"
}, {
  id: "hvac",
  icon: "temperature",
  label: "No heat / AC"
}, {
  id: "lock",
  icon: "lock",
  label: "Lock / door"
}, {
  id: "other",
  icon: "alert-triangle",
  label: "Other"
}];
function S2_3_Emergency({
  tabBar,
  go,
  toast
}) {
  const [type, setType] = useC("burst");
  const [budget, setBudget] = useC(150);
  const [sent, setSent] = useC(false);
  if (sent) {
    return /*#__PURE__*/React.createElement(Screen, {
      appBar: /*#__PURE__*/React.createElement(AppBar, {
        title: "Broadcast live"
      }),
      tabBar: tabBar
    }, /*#__PURE__*/React.createElement(Body, {
      gap: 16,
      style: {
        paddingTop: 28
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 84,
        height: 84,
        borderRadius: "50%",
        background: "var(--red-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        border: "2px solid var(--red-fg)",
        animation: "gkpulse 1.6s ease-out infinite"
      }
    }), /*#__PURE__*/React.createElement(Icon, {
      name: "broadcast",
      size: 40,
      style: {
        color: "var(--red-fg)"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 20,
        fontWeight: 800
      }
    }, "Dispatched to 8 local pros"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--text-3)",
        fontSize: 14,
        maxWidth: 280
      }
    }, "Beamed over SMS + WhatsApp to proven pros within node SW-04. First to claim chats you directly.")), /*#__PURE__*/React.createElement(Card, {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, [["Marcus Bell", "Plumbing", "claimed · 1m"], ["Tasha Quinn", "Drywall", "notified"], ["Leo Park", "Electrical", "notified"]].map(([n, t, s]) => /*#__PURE__*/React.createElement("div", {
      key: n,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: n,
      size: 36
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 14
      }
    }, n), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--text-3)"
      }
    }, t)), /*#__PURE__*/React.createElement(Badge, {
      tone: s.includes("claimed") ? "green" : undefined
    }, s)))), /*#__PURE__*/React.createElement(Btn, {
      leftIcon: "message",
      onClick: () => go("s2_4")
    }, "Open chat with Marcus")), /*#__PURE__*/React.createElement("style", null, `@keyframes gkpulse{0%{transform:scale(1);opacity:.9}100%{transform:scale(1.5);opacity:0}}`));
  }
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      title: "Emergency broadcast",
      subtitle: "Blast nearby pros now",
      right: /*#__PURE__*/React.createElement(Badge, {
        tone: "red",
        icon: "bolt"
      }, "Live")
    }),
    tabBar: tabBar,
    footer: /*#__PURE__*/React.createElement(Btn, {
      variant: "danger",
      leftIcon: "broadcast",
      onClick: () => {
        setSent(true);
        toast("Broadcast sent to node SW-04.");
      },
      style: {
        background: "var(--red-6)",
        color: "#fff",
        border: "none"
      }
    }, "Broadcast to local pros")
  }, /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 8
    }
  }, "What's the emergency?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, EM_TYPES.map(e => /*#__PURE__*/React.createElement("button", {
    key: e.id,
    onClick: () => setType(e.id),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "13px 12px",
      borderRadius: "var(--r-md)",
      cursor: "pointer",
      background: type === e.id ? "var(--tint)" : "var(--surface)",
      border: `1px solid ${type === e.id ? "var(--primary)" : "var(--border-2)"}`,
      color: type === e.id ? "var(--tint-text)" : "var(--text-2)",
      fontWeight: 600,
      fontSize: 13.5,
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: e.icon,
    size: 20
  }), e.label)))), /*#__PURE__*/React.createElement(Textarea, {
    label: "Describe what's happening",
    rows: 3,
    defaultValue: "Kitchen pipe burst under the sink, water pooling on the floor. Shut-off valve isn't holding."
  }), /*#__PURE__*/React.createElement(TextInput, {
    label: "Address",
    icon: "map-pin",
    defaultValue: "1820 W Roosevelt St, 85007"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 10
    }
  }, "Budget ceiling"), /*#__PURE__*/React.createElement(Slider, {
    min: 50,
    max: 1000,
    value: budget,
    onChange: setBudget,
    unit: ""
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)",
      marginTop: 6
    }
  }, "Pros see this upfront \u2014 concrete budgets get faster claims.")), /*#__PURE__*/React.createElement(Card, {
    flat: true,
    style: {
      display: "flex",
      gap: 10,
      alignItems: "center",
      background: "var(--bg-2)",
      border: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "messages",
    size: 22,
    style: {
      color: "var(--text-2)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--text-2)"
    }
  }, "Sent over ", /*#__PURE__*/React.createElement("strong", null, "SMS + WhatsApp"), " to proven pros in your ZIP node."))));
}

/* 2.4 — Request a Quote / Chat with pro */
function S2_4_QuoteChat({
  go,
  toast,
  tabBar
}) {
  const [draft, setDraft] = useC("");
  const feedRef = useCRef(null);
  const [msgs, setMsgs] = useC([{
    me: true,
    t: "Hi Marcus — pipe burst under the kitchen sink. Can you come today?",
    time: "1:01 PM"
  }, {
    me: false,
    t: "On it. I can be there within the hour. Quote below — covers valve, fittings and cleanup.",
    time: "1:03 PM"
  }, {
    me: false,
    quote: true,
    time: "1:03 PM"
  }]);
  const send = () => {
    if (!draft.trim()) return;
    setMsgs([...msgs, {
      me: true,
      t: draft,
      time: "1:05 PM"
    }]);
    setDraft("");
  };
  useCEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [msgs]);
  return /*#__PURE__*/React.createElement(Screen, {
    scrollRef: feedRef,
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      onBack: () => go("s2_1"),
      left: /*#__PURE__*/React.createElement(Avatar, {
        name: "Marcus Bell",
        size: 38
      }),
      title: "Marcus Bell",
      subtitle: "Plumbing \xB7 1.4 mi \xB7 \u26A1 responds in 4h",
      right: /*#__PURE__*/React.createElement(IconBtn, {
        icon: "phone",
        onClick: () => toast("Calling Marcus…")
      })
    }),
    footer: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(IconBtn, {
      icon: "paperclip"
    }), /*#__PURE__*/React.createElement("input", {
      className: "gk-input",
      value: draft,
      onChange: e => setDraft(e.target.value),
      onKeyDown: e => e.key === "Enter" && send(),
      placeholder: "Message\u2026",
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("button", {
      className: "gk-btn gk-btn--filled gk-btn--auto",
      style: {
        width: 46,
        height: 46,
        padding: 0,
        borderRadius: 12
      },
      onClick: send
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "send"
    })))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      fontSize: 11,
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, "TODAY"), msgs.map((m, i) => m.quote ? /*#__PURE__*/React.createElement(Card, {
    key: i,
    style: {
      alignSelf: "flex-start",
      maxWidth: "88%",
      padding: 0,
      overflow: "hidden",
      border: "1px solid var(--primary)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 14px",
      background: "var(--tint)",
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "file-dollar",
    size: 18,
    style: {
      color: "var(--primary)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 13.5,
      color: "var(--tint-text)"
    }
  }, "Quote \xB7 Kitchen valve repair")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14
    }
  }, [["Emergency valve repair", "$120"], ["Fittings & solder", "$28"], ["Same-day call-out", "$0"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 13.5,
      padding: "5px 0",
      color: "var(--text-2)"
    }
  }, /*#__PURE__*/React.createElement("span", null, k), /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, v))), /*#__PURE__*/React.createElement(Divider, {
    style: {
      margin: "8px 0"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontWeight: 800,
      fontSize: 16
    }
  }, /*#__PURE__*/React.createElement("span", null, "Total"), /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "$148")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "default",
    size: "sm",
    auto: true,
    style: {
      flex: 1
    }
  }, "Counter"), /*#__PURE__*/React.createElement(Btn, {
    size: "sm",
    leftIcon: "check",
    auto: true,
    style: {
      flex: 2
    },
    onClick: () => toast("Quote accepted — Marcus is on the way.")
  }, "Accept $148")))) : /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      alignSelf: m.me ? "flex-end" : "flex-start",
      maxWidth: "82%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 14px",
      borderRadius: 16,
      borderBottomRightRadius: m.me ? 4 : 16,
      borderBottomLeftRadius: m.me ? 16 : 4,
      background: m.me ? "var(--primary)" : "var(--surface)",
      color: m.me ? "#fff" : "var(--text)",
      border: m.me ? "none" : "1px solid var(--border)",
      fontSize: 14.5,
      lineHeight: 1.5
    }
  }, m.t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: "var(--text-3)",
      textAlign: m.me ? "right" : "left",
      marginTop: 3,
      padding: "0 4px"
    }
  }, m.time)))));
}

/* 2.5 — Leave a Recommendation (magic-link review) */
function S2_5_Review({
  go,
  toast
}) {
  const [stars, setStars] = useC(5);
  const [photos, setPhotos] = useC([true, false]);
  const [text, setText] = useC("Marcus found the slab leak two other plumbers missed. Clean copper work and the invoice came same day.");
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      title: "Recommend Marcus",
      subtitle: "Secure link \xB7 no account needed",
      onBack: () => go("s2_2")
    }),
    footer: /*#__PURE__*/React.createElement(Btn, {
      leftIcon: "rosette-discount-check",
      onClick: () => {
        toast("Recommendation submitted — thank you!");
        go("s2_1");
      }
    }, "Publish recommendation")
  }, /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Marcus Bell",
    size: 44
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700
    }
  }, "Marcus Bell"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--text-3)"
    }
  }, "Copper riser re-pipe \xB7 $1,840")), /*#__PURE__*/React.createElement(Badge, {
    tone: "green",
    icon: "check"
  }, "Job done")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 12
    }
  }, "How was the work?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Stars, {
    value: stars,
    onChange: setStars,
    size: 38
  }))), /*#__PURE__*/React.createElement(Textarea, {
    label: "Tell other neighbors what happened",
    rows: 4,
    value: text,
    onChange: e => setText(e.target.value)
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 8
    }
  }, "Add your own before/after ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-3)",
      fontWeight: 500
    }
  }, "(optional)")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Photo, {
    h: 92,
    filled: photos[0],
    tone: "before",
    label: photos[0] ? "your before" : "Add before",
    dashed: !photos[0],
    onClick: () => setPhotos([true, photos[1]])
  }), /*#__PURE__*/React.createElement(Photo, {
    h: 92,
    filled: photos[1],
    tone: "after",
    accent: !photos[1],
    label: photos[1] ? "your after" : "Add after",
    dashed: !photos[1],
    onClick: () => setPhotos([photos[0], true])
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      fontSize: 12,
      color: "var(--text-3)",
      padding: "0 2px"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "lock",
    size: 15
  }), " Verified through your secure GigKraft review link.")));
}

/* 2.6 — Your account (homeowner) */
function S2_6_Account({
  tabBar,
  go,
  toast
}) {
  const [sms, setSms] = useC(true);
  const [whatsapp, setWhatsapp] = useC(true);
  const [digest, setDigest] = useC(false);
  const saved = [{
    pro: "Marcus Bell",
    trade: "Plumbing",
    dist: "1.4 mi",
    recs: 42,
    proof: PROOFS[0]
  }, {
    pro: "Leo Park",
    trade: "Electrical",
    dist: "3.4 mi",
    recs: 27,
    proof: PROOFS[2]
  }];
  const past = [{
    pro: "Marcus Bell",
    title: "Copper riser re-pipe",
    invoice: "$1,840",
    when: "Apr 2026",
    recommended: true
  }, {
    pro: "Tasha Quinn",
    title: "Ceiling water-stain patch",
    invoice: "$420",
    when: "Feb 2026",
    recommended: false
  }];
  const settings = [{
    icon: "map-pin",
    label: "Saved addresses",
    meta: "2 properties"
  }, {
    icon: "credit-card",
    label: "Payment methods",
    meta: "Visa ··4291"
  }, {
    icon: "shield-check",
    label: "Help & safety",
    meta: ""
  }];
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      title: "You",
      subtitle: "Homeowner \xB7 node SW-04",
      right: /*#__PURE__*/React.createElement(IconBtn, {
        icon: "settings",
        onClick: () => toast("Account settings")
      })
    }),
    tabBar: tabBar
  }, /*#__PURE__*/React.createElement(Body, {
    gap: 16
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Jordan Avery",
    size: 56
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 18,
      letterSpacing: "-.3px"
    }
  }, "Jordan Avery"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--text-3)",
      display: "flex",
      alignItems: "center",
      gap: 4,
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "map-pin",
    size: 13
  }), "1820 W Roosevelt St \xB7 85007")), /*#__PURE__*/React.createElement(Btn, {
    variant: "default",
    size: "sm",
    auto: true,
    onClick: () => toast("Edit profile")
  }, "Edit")), /*#__PURE__*/React.createElement(Card, {
    flat: true,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-around",
      background: "var(--bg-2)",
      border: "1px solid var(--border)"
    }
  }, [["4", "Jobs hired"], ["6", "Saved pros"], ["3", "Recs given"]].map(([v, k], i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: k
  }, i > 0 && /*#__PURE__*/React.createElement(Divider, {
    style: {
      width: 1,
      height: 34
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "2px 4px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      letterSpacing: "-.5px"
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-3)",
      fontWeight: 600,
      marginTop: 2
    }
  }, k))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Saved pros"), /*#__PURE__*/React.createElement("button", {
    onClick: () => go("s2_1"),
    style: {
      marginLeft: "auto",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: 12.5,
      fontWeight: 700,
      color: "var(--primary)"
    }
  }, "Discover more")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, saved.map(s => /*#__PURE__*/React.createElement(Card, {
    key: s.pro,
    press: true,
    onClick: () => go("s2_2", s.proof),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: s.pro,
    size: 40
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14.5
    }
  }, s.pro), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)",
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: 1,
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/React.createElement("span", null, s.trade), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "map-pin",
    size: 12
  }), s.dist), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "rosette-discount-check",
    size: 12
  }), s.recs))), /*#__PURE__*/React.createElement(IconBtn, {
    icon: "message",
    onClick: e => {
      e.stopPropagation();
      go("s2_4");
    }
  }))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 8
    }
  }, "Past jobs"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, past.map(j => /*#__PURE__*/React.createElement(Card, {
    key: j.title,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Photo, {
    h: 48,
    filled: true,
    tone: "after",
    label: "",
    icon: "check"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, j.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)",
      marginTop: 1
    }
  }, j.pro, " \xB7 ", j.when)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontWeight: 800,
      fontSize: 13.5,
      color: "var(--green-fg)"
    }
  }, j.invoice), j.recommended ? /*#__PURE__*/React.createElement(Badge, {
    tone: "green",
    icon: "check"
  }, "Recommended") : /*#__PURE__*/React.createElement("button", {
    onClick: () => go("s2_5"),
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: 12,
      fontWeight: 700,
      color: "var(--primary)",
      display: "inline-flex",
      alignItems: "center",
      gap: 3
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "star",
    size: 13
  }), "Recommend")))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 8
    }
  }, "Dispatch alerts"), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement(SwitchRow, {
    label: "SMS alerts",
    desc: "Pro claims & quote updates by text",
    on: sms,
    onChange: setSms
  }), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(SwitchRow, {
    label: "WhatsApp dispatch",
    desc: "Emergency broadcasts to nearby pros",
    on: whatsapp,
    onChange: setWhatsapp
  }), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(SwitchRow, {
    label: "Weekly node digest",
    desc: "New verified Krafts in node SW-04",
    on: digest,
    onChange: setDigest
  }))), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 0,
      overflow: "hidden"
    }
  }, settings.map((s, i) => /*#__PURE__*/React.createElement("button", {
    key: s.label,
    onClick: () => toast(s.label),
    style: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "13px 14px",
      background: "none",
      border: "none",
      borderTop: i > 0 ? "1px solid var(--border)" : "none",
      cursor: "pointer",
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: s.icon,
    size: 20,
    style: {
      color: "var(--text-2)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 14,
      fontWeight: 600,
      color: "var(--text)"
    }
  }, s.label), s.meta && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: "var(--text-3)"
    }
  }, s.meta), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 18,
    style: {
      color: "var(--text-3)"
    }
  })))), /*#__PURE__*/React.createElement(Btn, {
    variant: "default",
    leftIcon: "logout",
    onClick: () => toast("Signed out"),
    style: {
      color: "var(--red-fg)"
    }
  }, "Sign out"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      fontSize: 11,
      color: "var(--text-3)",
      paddingBottom: 4
    }
  }, "GigKraft \xB7 node southwest-us-04 \xB7 v1.0")));
}
Object.assign(window, {
  S2_1_Discover,
  S2_2_ProofDetail,
  S2_3_Emergency,
  S2_4_QuoteChat,
  S2_5_Review,
  S2_6_Account
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_cursor/design_reference/screens/consumer/screens.jsx", error: String((e && e.message) || e) }); }

// design_handoff_cursor/design_reference/screens/handyman/app.jsx
try { (() => {
/* global React, ReactDOM, PhoneFrame, BottomTab, Icon,
   S1_1_Auth, S1_2_ServiceArea, S1_3_Visual, S1_4_Credentials, S1_5_Categorization,
   S1_6_ProjectCreator, S1_7_RecRequest, S1_8_Moderation, S1_9_Leads, S1_10_Chat,
   S1_11_Analytics, S1_12_Billing, S1_13_Network, AccountHub */
const {
  useState,
  useEffect,
  useLayoutEffect,
  useRef
} = React;
const SCREENS = {
  s1_1: S1_1_Auth,
  s1_2: S1_2_ServiceArea,
  s1_3: S1_3_Visual,
  s1_4: S1_4_Credentials,
  s1_5: S1_5_Categorization,
  s1_6: S1_6_ProjectCreator,
  s1_7: S1_7_RecRequest,
  s1_8: S1_8_Moderation,
  s1_9: S1_9_Leads,
  s1_10: S1_10_Chat,
  s1_11: S1_11_Analytics,
  s1_12: S1_12_Billing,
  s1_13: S1_13_Network,
  account: AccountHub
};
const TABS = [{
  id: "s1_9",
  icon: "inbox",
  iconOn: "inbox",
  label: "Leads"
}, {
  id: "s1_11",
  icon: "chart-bar",
  label: "Stats"
}, {
  id: "s1_6",
  icon: "plus",
  label: "Add",
  primary: true
}, {
  id: "s1_13",
  icon: "users",
  label: "Network"
}, {
  id: "account",
  icon: "user",
  label: "Account"
}];
const TAB_IDS = TABS.map(t => t.id);
const RAIL = [{
  group: "Onboarding & account",
  items: [["s1_1", "1.1", "Authentication"], ["s1_2", "1.2", "Service area"], ["s1_3", "1.3", "Visual customization"], ["s1_4", "1.4", "Credentials"], ["s1_5", "1.5", "Categorization"]]
}, {
  group: "Portfolio & recommendations",
  items: [["s1_6", "1.6", "Project creator"], ["s1_7", "1.7", "Recommendation request"], ["s1_8", "1.8", "Moderation queue"]]
}, {
  group: "Leads & communication",
  items: [["s1_9", "1.9", "Leads dashboard"], ["s1_10", "1.10", "Direct chat"]]
}, {
  group: "Business operations",
  items: [["s1_11", "1.11", "Performance & analytics"], ["s1_12", "1.12", "Subscription & billing"], ["s1_13", "1.13", "B2B network"]]
}];
function useScale() {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const calc = () => {
      const wrap = ref.current;
      if (!wrap) return;
      const availH = wrap.clientHeight - 24;
      const availW = wrap.clientWidth - 24;
      setScale(Math.min(1, availH / 836, availW / 398));
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (ref.current) ro.observe(ref.current);
    window.addEventListener("resize", calc);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", calc);
    };
  }, []);
  return [ref, scale];
}
function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("gk_theme") || "light");
  const [screen, setScreen] = useState(() => localStorage.getItem("gk_screen") || "s1_9");
  const [toastMsg, setToastMsg] = useState(null);
  const [wrapRef, scale] = useScale();
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("gk_theme", theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("gk_screen", screen);
  }, [screen]);
  const go = s => {
    if (SCREENS[s]) setScreen(s);
  };
  const toast = m => {
    if (!m) return;
    setToastMsg(m);
    clearTimeout(window.__t);
    window.__t = setTimeout(() => setToastMsg(null), 2200);
  };
  const Active = SCREENS[screen];
  const tabBar = TAB_IDS.includes(screen) ? /*#__PURE__*/React.createElement(BottomTab, {
    tabs: TABS,
    active: screen,
    onTab: go
  }) : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: "100vh",
      width: "100vw",
      overflow: "hidden",
      background: "var(--bg-2)"
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 268,
      flex: "0 0 auto",
      borderRight: "1px solid var(--border)",
      background: "var(--surface)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 20px 16px",
      borderBottom: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      borderRadius: 9,
      background: "var(--primary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "tools",
    size: 20,
    style: {
      color: "#fff"
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 17,
      letterSpacing: "-.3px",
      lineHeight: 1
    }
  }, "GigKraft"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, "Handyman \xB7 13 screens")))), /*#__PURE__*/React.createElement("div", {
    className: "gk-scroll",
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "12px 12px 24px"
    }
  }, RAIL.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.group,
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-eyebrow",
    style: {
      padding: "6px 10px"
    }
  }, g.group), g.items.map(([id, num, label]) => {
    const on = screen === id;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => go(id),
      style: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 10px",
        marginBottom: 2,
        borderRadius: 9,
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        background: on ? "var(--tint)" : "transparent",
        color: on ? "var(--tint-text)" : "var(--text-2)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono",
      style: {
        fontSize: 11,
        fontWeight: 600,
        width: 26,
        color: on ? "var(--primary)" : "var(--text-3)"
      }
    }, num), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        fontWeight: on ? 700 : 500
      }
    }, label));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 16px",
      borderTop: "1px solid var(--border)",
      fontSize: 11,
      color: "var(--text-3)",
      lineHeight: 1.5
    }
  }, "Mantine + Tabler \xB7 click any screen or use the in\u2011app tab bar.")), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      flex: "0 0 auto",
      height: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      borderBottom: "1px solid var(--border)",
      background: "var(--surface)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15
    }
  }, RAIL.flatMap(g => g.items).find(([id]) => id === screen)?.[2] || (screen === "account" ? "Account" : ""), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-3)",
      fontWeight: 500,
      marginLeft: 8,
      fontSize: 13
    }
  }, "iPhone \xB7 390\xD7844")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setTheme(theme === "light" ? "dark" : "light"),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      height: 38,
      padding: "0 14px",
      borderRadius: 999,
      border: "1px solid var(--border-2)",
      background: "var(--surface)",
      color: "var(--text-2)",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: theme === "light" ? "moon" : "sun",
    size: 17
  }), theme === "light" ? "Dark" : "Light")), /*#__PURE__*/React.createElement("div", {
    ref: wrapRef,
    style: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      transform: `scale(${scale})`,
      transformOrigin: "center center"
    }
  }, /*#__PURE__*/React.createElement(PhoneFrame, null, /*#__PURE__*/React.createElement(Active, {
    go: go,
    toast: toast,
    tabBar: tabBar
  }))), toastMsg && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 28,
      left: "50%",
      transform: "translateX(-50%)",
      background: "var(--gray-9)",
      color: "#fff",
      padding: "11px 18px",
      borderRadius: 12,
      fontSize: 13.5,
      fontWeight: 600,
      boxShadow: "var(--shadow-lg)",
      display: "flex",
      alignItems: "center",
      gap: 8,
      maxWidth: 360,
      zIndex: 50
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-check-filled",
    size: 18,
    style: {
      color: "var(--blue-3)"
    }
  }), toastMsg))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_cursor/design_reference/screens/handyman/app.jsx", error: String((e && e.message) || e) }); }

// design_handoff_cursor/design_reference/screens/handyman/business.jsx
try { (() => {
/* global React, AppBar, Screen, Body, Card, Btn, IconBtn, TextInput, Icon, Eyebrow, Divider, Photo, Avatar, Badge, Segmented, Stat, BarChart */
// GigKraft Handyman — Analytics, Billing, Network + Account hub (1.11–1.13).
const {
  useState: useStateB
} = React;

/* 1.11 — Performance & Analytics */
function S1_11_Analytics({
  tabBar
}) {
  const [range, setRange] = useStateB("30");
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      title: "Performance",
      subtitle: "Your numbers in node SW\u201104",
      right: /*#__PURE__*/React.createElement(IconBtn, {
        icon: "download"
      })
    }),
    tabBar: tabBar
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 16px 6px",
      position: "sticky",
      top: 0,
      background: "var(--bg)",
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement(Segmented, {
    value: range,
    onChange: setRange,
    options: [{
      value: "7",
      label: "7 days"
    }, {
      value: "30",
      label: "30 days"
    }, {
      value: "90",
      label: "90 days"
    }]
  })), /*#__PURE__*/React.createElement(Body, {
    style: {
      paddingTop: 6
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Profile"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    k: "Profile views",
    v: "1,284",
    delta: "+18%",
    icon: "eye"
  }), /*#__PURE__*/React.createElement(Stat, {
    k: "Search appearances",
    v: "3,902",
    delta: "+9%",
    icon: "search"
  }), /*#__PURE__*/React.createElement(Stat, {
    k: "Link clicks",
    v: "221",
    delta: "+24%",
    icon: "link"
  }), /*#__PURE__*/React.createElement(Stat, {
    k: "Won jobs",
    v: "14",
    delta: "+3",
    icon: "briefcase"
  })), /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginTop: 4
    }
  }, "Leads"), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, "Conversion rate"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 28,
      fontWeight: 800,
      letterSpacing: "-.5px"
    }
  }, "38%"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)"
    }
  }, "14 won of 37 inquiries")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 76,
      height: 76,
      borderRadius: "50%",
      background: `conic-gradient(var(--primary) 0 38%, var(--bg-2) 38% 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      borderRadius: "50%",
      background: "var(--surface)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 800,
      fontSize: 14
    }
  }, "38%"))), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 10,
      background: "var(--green-bg)",
      color: "var(--green-fg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock-check",
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700
    }
  }, "Avg response 1h 52m"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)"
    }
  }, "Well inside your 4\u2011hour promise")), /*#__PURE__*/React.createElement(Badge, {
    tone: "green",
    icon: "check"
  }, "On target"))), /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginTop: 4
    }
  }, "Revenue"), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 26,
      fontWeight: 800,
      letterSpacing: "-.5px"
    }
  }, "$11,460"), /*#__PURE__*/React.createElement(Badge, {
    tone: "green",
    icon: "trending-up"
  }, "+22% vs prev")), /*#__PURE__*/React.createElement(BarChart, {
    data: [{
      l: "Jan",
      v: 1.2
    }, {
      l: "Feb",
      v: 1.6
    }, {
      l: "Mar",
      v: 1.4
    }, {
      l: "Apr",
      v: 2.1
    }, {
      l: "May",
      v: 2.4
    }, {
      l: "Jun",
      v: 2.7,
      hl: true
    }]
  })), /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginTop: 4
    }
  }, "Trust"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    k: "Approved recs",
    v: "42",
    icon: "rosette-discount-check"
  }), /*#__PURE__*/React.createElement(Stat, {
    k: "Pending requests",
    v: "3",
    icon: "hourglass",
    deltaTone: "muted"
  }))));
}

/* 1.12 — Subscription & Billing */
const INVOICES = [{
  id: "GK‑20460",
  date: "Jun 1, 2026",
  amt: "$199.00"
}, {
  id: "GK‑19884",
  date: "Jun 1, 2025",
  amt: "$199.00"
}, {
  id: "GK‑11237",
  date: "Apr 12, 2025",
  amt: "$19.99"
}];
function S1_12_Billing({
  go,
  toast
}) {
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      title: "Subscription & billing",
      onBack: () => go("account")
    })
  }, /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement(Card, {
    padLg: true,
    style: {
      background: "linear-gradient(135deg, var(--blue-7), var(--blue-9))",
      border: "none",
      color: "#fff"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: ".5px",
      opacity: .8
    }
  }, "CURRENT PLAN"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      marginTop: 4
    }
  }, "Pro Vault \xB7 Annual")), /*#__PURE__*/React.createElement(Icon, {
    name: "discount-check-filled",
    size: 30,
    style: {
      opacity: .9
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      fontSize: 13,
      opacity: .85
    }
  }, "Renews ", /*#__PURE__*/React.createElement("strong", null, "June 1, 2027"), " \xB7 $199/yr")), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(TextInput, {
    label: "Coupon code",
    icon: "ticket",
    placeholder: "Enter code",
    defaultValue: ""
  }), /*#__PURE__*/React.createElement(Btn, {
    variant: "light",
    size: "sm",
    onClick: () => toast("Coupon applied — 20% off next renewal.")
  }, "Apply coupon")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 8
    }
  }, "Payment method"), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 42,
      height: 30,
      borderRadius: 6,
      background: "var(--bg-2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "credit-card",
    size: 20,
    style: {
      color: "var(--text-2)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14
    },
    className: "mono"
  }, "\u2022\u2022\u2022\u2022 8832"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)"
    }
  }, "Visa \xB7 expires 12/28")), /*#__PURE__*/React.createElement(Btn, {
    variant: "default",
    size: "xs",
    onClick: () => toast("Opening secure card update…")
  }, "Update"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 8
    }
  }, "Billing history"), /*#__PURE__*/React.createElement(Card, {
    flat: true,
    style: {
      padding: 4
    }
  }, INVOICES.map((inv, i) => /*#__PURE__*/React.createElement("div", {
    key: inv.id
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 10px"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "file-invoice",
    size: 20,
    style: {
      color: "var(--text-3)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14
    },
    className: "mono"
  }, inv.id), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)"
    }
  }, inv.date)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 14
    }
  }, inv.amt), /*#__PURE__*/React.createElement(IconBtn, {
    icon: "download",
    onClick: () => toast("Downloading " + inv.id)
  })), i < INVOICES.length - 1 && /*#__PURE__*/React.createElement(Divider, null)))))));
}

/* 1.13 — B2B Networking Search */
const PROS = [{
  name: "Tasha Quinn",
  trade: "Drywall & Paint",
  dist: "2.1 mi",
  phone: "(602) 555‑0192",
  tags: ["Patch", "Texture"]
}, {
  name: "Leo Park",
  trade: "Electrical",
  dist: "3.4 mi",
  phone: "(602) 555‑0177",
  tags: ["Panels", "EV chargers"]
}, {
  name: "Ramon Alvarez",
  trade: "HVAC",
  dist: "4.0 mi",
  phone: "(480) 555‑0143",
  tags: ["AC", "Ducting"]
}, {
  name: "Bea Foster",
  trade: "Tile & Flooring",
  dist: "5.2 mi",
  phone: "(480) 555‑0110",
  tags: ["Bath", "LVP"]
}];
function S1_13_Network({
  tabBar,
  toast
}) {
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      title: "Pro network",
      subtitle: "Find complementary trades to refer"
    }),
    tabBar: tabBar
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 16px 6px",
      position: "sticky",
      top: 0,
      background: "var(--bg)",
      zIndex: 2,
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-input-wrap",
    style: {
      flex: 2
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "tools",
    className: "gk-input-wrap__icon"
  }), /*#__PURE__*/React.createElement("input", {
    className: "gk-input",
    placeholder: "Trade or skill",
    defaultValue: ""
  })), /*#__PURE__*/React.createElement("div", {
    className: "gk-input-wrap",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "gk-input mono",
    placeholder: "ZIP",
    defaultValue: "85004"
  }))), /*#__PURE__*/React.createElement(Body, {
    style: {
      paddingTop: 6
    },
    gap: 10
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, PROS.length, " pros near 85004"), PROS.map(p => /*#__PURE__*/React.createElement(Card, {
    key: p.name,
    style: {
      display: "flex",
      gap: 12,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: p.name,
    size: 46
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700
    }
  }, p.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--primary)",
      fontWeight: 600
    }
  }, p.trade), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginTop: 6,
      flexWrap: "wrap"
    }
  }, p.tags.map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: "var(--text-3)",
      background: "var(--bg-2)",
      padding: "2px 8px",
      borderRadius: 999
    }
  }, t)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--text-3)",
      display: "inline-flex",
      alignItems: "center",
      gap: 3
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "map-pin",
    size: 13
  }), p.dist), /*#__PURE__*/React.createElement(IconBtn, {
    icon: "phone",
    onClick: () => toast("Calling " + p.name)
  }))))));
}

/* Account hub — ties the secondary screens together (Account tab) */
function AccountHub({
  go,
  tabBar
}) {
  const groups = [{
    title: "Recommendations",
    items: [{
      icon: "send",
      label: "Request a recommendation",
      to: "s1_7"
    }, {
      icon: "checkup-list",
      label: "Review queue",
      to: "s1_8",
      badge: "3"
    }]
  }, {
    title: "Profile",
    items: [{
      icon: "map-pin",
      label: "Service area",
      to: "s1_2"
    }, {
      icon: "photo",
      label: "Profile look",
      to: "s1_3"
    }, {
      icon: "shield-check",
      label: "Credentials",
      to: "s1_4"
    }, {
      icon: "tools",
      label: "Trade & skills",
      to: "s1_5"
    }]
  }, {
    title: "Account",
    items: [{
      icon: "credit-card",
      label: "Subscription & billing",
      to: "s1_12"
    }]
  }];
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      title: "Account",
      right: /*#__PURE__*/React.createElement(IconBtn, {
        icon: "settings"
      })
    }),
    tabBar: tabBar
  }, /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Marcus Bell",
    size: 56
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 17
    }
  }, "Marcus Bell"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text-3)"
    }
  }, "Plumbing Pro \xB7 SW\u201104"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "green",
    icon: "discount-check"
  }, "Verified"), /*#__PURE__*/React.createElement(Badge, {
    tone: "blue",
    icon: "shield-check"
  }, "Insured")))), groups.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.title
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 8
    }
  }, g.title), /*#__PURE__*/React.createElement(Card, {
    flat: true,
    style: {
      padding: 4
    }
  }, g.items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    key: it.label
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => go(it.to),
    style: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "13px 10px",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "var(--text)",
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: it.icon,
    size: 20,
    style: {
      color: "var(--text-2)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontWeight: 600,
      fontSize: 14.5
    }
  }, it.label), it.badge && /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 20,
      height: 20,
      borderRadius: 999,
      background: "var(--primary)",
      color: "#fff",
      fontSize: 11,
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 6px"
    }
  }, it.badge), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 18,
    style: {
      color: "var(--text-3)"
    }
  })), i < g.items.length - 1 && /*#__PURE__*/React.createElement(Divider, null))))))));
}
Object.assign(window, {
  S1_11_Analytics,
  S1_12_Billing,
  S1_13_Network,
  AccountHub
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_cursor/design_reference/screens/handyman/business.jsx", error: String((e && e.message) || e) }); }

// design_handoff_cursor/design_reference/screens/handyman/leads.jsx
try { (() => {
/* global React, AppBar, Screen, Body, Card, Btn, IconBtn, Icon, Eyebrow, Divider, Photo, Avatar, Badge, Segmented */
// GigKraft Handyman — Leads & Communication screens 1.9–1.10.
const {
  useState: useStateL,
  useRef: useRefL,
  useEffect: useEffectL
} = React;
const LEADS = {
  active: [{
    id: "jenkins",
    name: "Tom Jenkins",
    job: "Kitchen valve leak",
    frag: "Water's isolated at the street valve but the floor is getting soggy — can you fix today?",
    when: "12m",
    unread: 2,
    left: "3h 48m",
    urgent: false
  }, {
    id: "shah",
    name: "Priya Shah",
    job: "Water heater swap",
    frag: "Can you quote a 50‑gal water heater replacement for next week?",
    when: "1h",
    unread: 1,
    left: "2h 10m",
    urgent: false
  }, {
    id: "castellano",
    name: "R. Castellano",
    job: "Garbage disposal",
    frag: "Disposal just hums and won't spin. Smells a bit electrical.",
    when: "3h",
    unread: 0,
    left: "38m",
    urgent: true
  }],
  progress: [{
    id: "whitfield",
    name: "Dana Whitfield",
    job: "Water heater install",
    frag: "Great — see you at 2pm. I'll leave the side gate open.",
    when: "Today",
    unread: 0,
    tag: "Scheduled"
  }, {
    id: "okafor",
    name: "M. Okafor",
    job: "Slab leak repair",
    frag: "Invoice received, thank you! Booking the drywall patch.",
    when: "Today",
    unread: 0,
    tag: "Quoted"
  }],
  archived: [{
    id: "ortega",
    name: "Carl & Mei Ortega",
    job: "Re‑pipe",
    frag: "Job closed · $1,840 · 5★ recommendation",
    when: "May 28",
    unread: 0,
    tag: "Won"
  }, {
    id: "tran",
    name: "L. Tran",
    job: "Faucet replace",
    frag: "Job closed · $180",
    when: "May 24",
    unread: 0,
    tag: "Won"
  }]
};

/* 1.9 — Leads Dashboard */
function S1_9_Leads({
  go,
  tabBar
}) {
  const [tab, setTab] = useStateL("active");
  const list = LEADS[tab];
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      title: "Leads",
      subtitle: "Node SW\u201104 \xB7 4\u2011hour response promise",
      right: /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex"
        }
      }, /*#__PURE__*/React.createElement(IconBtn, {
        icon: "search"
      }), /*#__PURE__*/React.createElement(IconBtn, {
        icon: "bell"
      }))
    }),
    tabBar: tabBar
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 16px 8px",
      position: "sticky",
      top: 0,
      background: "var(--bg)",
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement(Segmented, {
    value: tab,
    onChange: setTab,
    options: [{
      value: "active",
      label: "Active"
    }, {
      value: "progress",
      label: "In‑progress"
    }, {
      value: "archived",
      label: "Archived"
    }]
  })), /*#__PURE__*/React.createElement(Body, {
    style: {
      paddingTop: 4
    },
    gap: 10
  }, list.map(l => /*#__PURE__*/React.createElement(Card, {
    key: l.id,
    press: true,
    onClick: () => go("s1_10"),
    style: {
      display: "flex",
      gap: 12,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: l.name,
    size: 44
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 15
    }
  }, l.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--text-3)",
      marginLeft: "auto"
    }
  }, l.when)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--primary)",
      fontWeight: 600,
      margin: "1px 0 4px"
    }
  }, l.job), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text-3)",
      lineHeight: 1.4,
      overflow: "hidden",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical"
    }
  }, l.frag), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: 8
    }
  }, tab === "active" ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontSize: 11,
      fontWeight: 700,
      padding: "3px 8px",
      borderRadius: 999,
      background: l.urgent ? "var(--red-bg)" : "var(--green-bg)",
      color: l.urgent ? "var(--red-fg)" : "var(--green-fg)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 13
  }), l.left, " left") : /*#__PURE__*/React.createElement(Badge, {
    tone: l.tag === "Won" ? "green" : "blue"
  }, l.tag), l.unread > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      minWidth: 20,
      height: 20,
      borderRadius: 999,
      background: "var(--primary)",
      color: "#fff",
      fontSize: 11,
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 6px"
    }
  }, l.unread))))), tab === "archived" && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--text-3)",
      fontSize: 13,
      padding: 8
    }
  }, "2 jobs won \xB7 $2,020 lifetime in this view")));
}

/* 1.10 — Direct Chat Interface */
const QUICK = [{
  label: "Send quote",
  icon: "file-dollar"
}, {
  label: "Send invoice",
  icon: "receipt"
}, {
  label: "Mark complete",
  icon: "circle-check"
}, {
  label: "Request review",
  icon: "star"
}];
function S1_10_Chat({
  go,
  toast
}) {
  const [draft, setDraft] = useStateL("Heading over now — torch and fittings are in the rig.");
  const feedRef = useRefL(null);
  const [msgs, setMsgs] = useStateL([{
    me: false,
    t: "Water's isolated at the street valve but the kitchen floor is getting soggy. Can you fix today?",
    time: "1:02 PM"
  }, {
    me: true,
    t: "Yes — I can be there within the hour. Holding to the $120 valve‑repair baseline.",
    time: "1:04 PM"
  }, {
    me: false,
    t: "Perfect. Here's the access photo.",
    time: "1:05 PM",
    photo: true
  }]);
  const send = () => {
    if (!draft.trim()) return;
    setMsgs([...msgs, {
      me: true,
      t: draft,
      time: "1:06 PM"
    }]);
    setDraft("");
  };
  useEffectL(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [msgs]);
  return /*#__PURE__*/React.createElement(Screen, {
    scrollRef: feedRef,
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      onBack: () => go("s1_9"),
      left: /*#__PURE__*/React.createElement(Avatar, {
        name: "Tom Jenkins",
        size: 38
      }),
      title: "Tom Jenkins",
      subtitle: "Kitchen valve leak \xB7 1.4 mi",
      right: /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex"
        }
      }, /*#__PURE__*/React.createElement(IconBtn, {
        icon: "phone",
        onClick: () => toast("Calling…")
      }), /*#__PURE__*/React.createElement(IconBtn, {
        icon: "dots-vertical"
      }))
    }),
    footer: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        overflowX: "auto",
        margin: "0 -16px",
        padding: "0 16px"
      },
      className: "gk-scroll"
    }, QUICK.map(q => /*#__PURE__*/React.createElement("button", {
      key: q.label,
      onClick: () => toast(q.label + " sent."),
      style: {
        flex: "0 0 auto",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12.5,
        fontWeight: 600,
        padding: "7px 12px",
        borderRadius: 999,
        border: "1px solid var(--border-2)",
        background: "var(--surface)",
        color: "var(--text-2)",
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: q.icon,
      size: 15
    }), q.label))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(IconBtn, {
      icon: "paperclip",
      onClick: () => toast("Attach a photo, quote or invoice")
    }), /*#__PURE__*/React.createElement("input", {
      className: "gk-input",
      value: draft,
      onChange: e => setDraft(e.target.value),
      onKeyDown: e => e.key === "Enter" && send(),
      placeholder: "Message\u2026",
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("button", {
      className: "gk-btn gk-btn--filled gk-btn--auto",
      style: {
        width: 46,
        height: 46,
        padding: 0,
        borderRadius: 12
      },
      onClick: send
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "send"
    }))))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      fontSize: 11,
      color: "var(--text-3)",
      fontWeight: 600,
      margin: "2px 0 6px"
    }
  }, "TODAY"), msgs.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      alignSelf: m.me ? "flex-end" : "flex-start",
      maxWidth: "82%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: m.photo ? 6 : "10px 14px",
      borderRadius: 16,
      borderBottomRightRadius: m.me ? 4 : 16,
      borderBottomLeftRadius: m.me ? 16 : 4,
      background: m.me ? "var(--primary)" : "var(--surface)",
      color: m.me ? "#fff" : "var(--text)",
      border: m.me ? "none" : "1px solid var(--border)",
      fontSize: 14.5,
      lineHeight: 1.5
    }
  }, m.photo ? /*#__PURE__*/React.createElement(Photo, {
    h: 120,
    filled: true,
    label: "under\u2011sink access"
  }) : m.t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: "var(--text-3)",
      textAlign: m.me ? "right" : "left",
      marginTop: 3,
      padding: "0 4px"
    }
  }, m.time)))));
}
Object.assign(window, {
  S1_9_Leads,
  S1_10_Chat
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_cursor/design_reference/screens/handyman/leads.jsx", error: String((e && e.message) || e) }); }

// design_handoff_cursor/design_reference/screens/handyman/onboarding.jsx
try { (() => {
/* global React, AppBar, Screen, Steps, Body, Card, Btn, TextInput, Textarea, Select, Segmented, Switch, SwitchRow, Slider, Chip, Icon, Eyebrow, Divider, Photo, Avatar, Badge */
// GigKraft Handyman — Onboarding screens 1.1–1.5.
const {
  useState: useStateOnb
} = React;
function OnbHead({
  title,
  step,
  onBack
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "0 0 auto",
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      paddingBottom: 10
    }
  }, /*#__PURE__*/React.createElement(AppBar, {
    title: title,
    subtitle: `Step ${step + 1} of 5 · Pro onboarding`,
    onBack: onBack,
    right: /*#__PURE__*/React.createElement("button", {
      className: "gk-btn gk-btn--subtle gk-btn--xs",
      style: {
        color: "var(--text-3)"
      }
    }, "Skip")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 10
    }
  }, /*#__PURE__*/React.createElement(Steps, {
    total: 5,
    current: step
  })));
}

/* 1.1 — Authentication (Signup / Login) */
function S1_1_Auth({
  go
}) {
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(OnbHead, {
      title: "Create your account",
      step: 0
    }),
    footer: /*#__PURE__*/React.createElement(Btn, {
      rightIcon: "arrow-right",
      onClick: () => go("s1_2")
    }, "Continue")
  }, /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 800,
      letterSpacing: "-.5px"
    }
  }, "Join the proof network."), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--text-3)",
      marginTop: 4,
      fontSize: "var(--fz-md)"
    }
  }, "Publish before/after Krafts and claim local leads in node SW\u201104.")), /*#__PURE__*/React.createElement(Btn, {
    variant: "default",
    leftIcon: "brand-google"
  }, "Continue with Google"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      color: "var(--text-3)"
    }
  }, /*#__PURE__*/React.createElement(Divider, {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600
    }
  }, "or"), /*#__PURE__*/React.createElement(Divider, {
    style: {
      flex: 1
    }
  })), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(TextInput, {
    label: "Email",
    required: true,
    icon: "mail",
    type: "email",
    defaultValue: "marcus.bell@gmail.com"
  }), /*#__PURE__*/React.createElement(TextInput, {
    label: "Mobile number",
    required: true,
    icon: "phone",
    defaultValue: "+1 (602) 555\u20110148",
    hint: "We send a 4\u2011digit SMS token to verify your number."
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)",
      textAlign: "center",
      lineHeight: 1.5
    }
  }, "By continuing you agree to GigKraft's Terms & Privacy Policy.")));
}

/* 1.2 — Base Service Area */
function S1_2_ServiceArea({
  go
}) {
  const [mode, setMode] = useStateOnb("explicit");
  const [zips, setZips] = useStateOnb(["85004", "85016", "85254"]);
  const [miles, setMiles] = useStateOnb(15);
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(OnbHead, {
      title: "Service area",
      step: 1,
      onBack: () => go("s1_1")
    }),
    footer: /*#__PURE__*/React.createElement(Btn, {
      rightIcon: "arrow-right",
      onClick: () => go("s1_3")
    }, "Continue")
  }, /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement(TextInput, {
    label: "Home ZIP code",
    required: true,
    icon: "map-pin",
    defaultValue: "85004",
    inputMode: "numeric",
    hint: "Your base \u2014 used to rank you by proximity in local search."
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 8
    }
  }, "How do you cover your area?"), /*#__PURE__*/React.createElement(Segmented, {
    value: mode,
    onChange: setMode,
    options: [{
      value: "explicit",
      label: "Specific ZIPs"
    }, {
      value: "radial",
      label: "Center + radius"
    }]
  })), mode === "explicit" ? /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-field__label"
  }, "Served ZIP codes"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--text-3)"
    }
  }, zips.length, " of 3")), zips.map((z, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "gk-input-wrap"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "map-pin",
    className: "gk-input-wrap__icon"
  }), /*#__PURE__*/React.createElement("input", {
    className: "gk-input mono",
    defaultValue: z,
    inputMode: "numeric"
  }), /*#__PURE__*/React.createElement("button", {
    className: "gk-iconbtn",
    style: {
      position: "absolute",
      right: 4
    },
    onClick: () => setZips(zips.filter((_, j) => j !== i))
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 18
  })))), zips.length < 3 && /*#__PURE__*/React.createElement(Btn, {
    variant: "light",
    size: "sm",
    leftIcon: "plus",
    onClick: () => setZips([...zips, ""])
  }, "Add ZIP code")) : /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(TextInput, {
    label: "Center ZIP code",
    icon: "map-pin",
    defaultValue: "85004",
    inputMode: "numeric"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 10
    }
  }, "Coverage radius"), /*#__PURE__*/React.createElement(Slider, {
    min: 1,
    max: 100,
    value: miles,
    onChange: setMiles,
    unit: " mi"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 150,
      borderRadius: "var(--r-md)",
      border: "1px solid var(--border-2)",
      position: "relative",
      overflow: "hidden",
      background: "var(--bg-2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
      backgroundSize: "26px 26px",
      opacity: .6
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40 + miles * 1.0,
      height: 40 + miles * 1.0,
      maxWidth: 150,
      maxHeight: 130,
      borderRadius: "50%",
      background: "var(--tint)",
      border: "2px solid var(--primary)"
    }
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "map-pin-filled",
    size: 20,
    style: {
      position: "absolute",
      color: "var(--primary)"
    }
  })))));
}

/* 1.3 — Visual Customization */
const WALLPAPERS = [{
  id: 0,
  c: "linear-gradient(135deg,#228be6,#1864ab)"
}, {
  id: 1,
  c: "linear-gradient(135deg,#0ca678,#087f5b)"
}, {
  id: 2,
  c: "linear-gradient(135deg,#343a40,#101113)"
}, {
  id: 3,
  c: "linear-gradient(135deg,#f76707,#d9480f)"
}, {
  id: 4,
  c: "linear-gradient(135deg,#7048e8,#5f3dc4)"
}];
function S1_3_Visual({
  go
}) {
  const [wp, setWp] = useStateOnb(0);
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(OnbHead, {
      title: "Profile look",
      step: 2,
      onBack: () => go("s1_2")
    }),
    footer: /*#__PURE__*/React.createElement(Btn, {
      rightIcon: "arrow-right",
      onClick: () => go("s1_4")
    }, "Continue")
  }, /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement(Card, {
    flat: true,
    style: {
      padding: 0,
      overflow: "hidden",
      border: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 96,
      background: WALLPAPERS[wp].c
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 16px 16px",
      marginTop: -36
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Marcus Bell",
    size: 72,
    style: {
      border: "4px solid var(--surface)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 18,
      marginTop: 8
    }
  }, "Marcus Bell"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--text-3)",
      fontSize: 13
    }
  }, "Plumbing Pro \xB7 SW\u201104"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 8
    }
  }, "Profile photo"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "default",
    size: "sm",
    leftIcon: "brand-google",
    auto: true,
    style: {
      flex: 1
    }
  }, "Use Google photo"), /*#__PURE__*/React.createElement(Btn, {
    variant: "default",
    size: "sm",
    leftIcon: "upload",
    auto: true,
    style: {
      flex: 1
    }
  }, "Upload"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 8
    }
  }, "Header wallpaper"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 9,
      flexWrap: "wrap"
    }
  }, WALLPAPERS.map(w => /*#__PURE__*/React.createElement("button", {
    key: w.id,
    onClick: () => setWp(w.id),
    style: {
      width: 52,
      height: 52,
      borderRadius: 12,
      background: w.c,
      border: wp === w.id ? "3px solid var(--primary)" : "3px solid transparent",
      boxShadow: "var(--shadow-xs)",
      cursor: "pointer",
      outline: "1px solid var(--border)"
    }
  })), /*#__PURE__*/React.createElement("button", {
    style: {
      width: 52,
      height: 52,
      borderRadius: 12,
      border: "1.5px dashed var(--border-2)",
      background: "transparent",
      color: "var(--text-3)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus"
  }))))));
}

/* 1.4 — Professional Credentials */
function S1_4_Credentials({
  go
}) {
  const [emp, setEmp] = useStateOnb("full");
  const [lic, setLic] = useStateOnb(true);
  const [ins, setIns] = useStateOnb(true);
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(OnbHead, {
      title: "Credentials",
      step: 3,
      onBack: () => go("s1_3")
    }),
    footer: /*#__PURE__*/React.createElement(Btn, {
      rightIcon: "arrow-right",
      onClick: () => go("s1_5")
    }, "Continue")
  }, /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 8
    }
  }, "Availability"), /*#__PURE__*/React.createElement(Segmented, {
    value: emp,
    onChange: setEmp,
    options: [{
      value: "full",
      label: "Full‑time"
    }, {
      value: "part",
      label: "Part‑time"
    }]
  })), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(SwitchRow, {
    label: "Licensed",
    desc: "Show a verified license badge on your profile",
    on: lic,
    onChange: setLic
  }), lic && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      paddingLeft: 2
    }
  }, /*#__PURE__*/React.createElement(TextInput, {
    label: "License number",
    defaultValue: "AZ\u2011ROC\u2011284517"
  }), /*#__PURE__*/React.createElement(Photo, {
    label: "Upload license PDF",
    h: 64,
    icon: "file-text",
    dashed: true,
    onClick: () => {}
  }))), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(SwitchRow, {
    label: "Insured",
    desc: "Upload a Certificate of Insurance (COI)",
    on: ins,
    onChange: setIns
  }), ins && /*#__PURE__*/React.createElement(Photo, {
    label: "Upload COI PDF",
    h: 64,
    icon: "file-certificate",
    dashed: true,
    onClick: () => {}
  })), /*#__PURE__*/React.createElement(Select, {
    label: "Guaranteed response time",
    defaultValue: "4",
    hint: "Leads track you against this promise. Default is 4 hours."
  }, /*#__PURE__*/React.createElement("option", {
    value: "1"
  }, "Within 1 hour"), /*#__PURE__*/React.createElement("option", {
    value: "2"
  }, "Within 2 hours"), /*#__PURE__*/React.createElement("option", {
    value: "4"
  }, "Within 4 hours"), /*#__PURE__*/React.createElement("option", {
    value: "8"
  }, "Within 8 hours"), /*#__PURE__*/React.createElement("option", {
    value: "12"
  }, "Within 12 hours"), /*#__PURE__*/React.createElement("option", {
    value: "24"
  }, "Within 24 hours"))));
}

/* 1.5 — Core Categorization */
const SUGGESTED = ["Faucet repair", "Clogged drains", "Drywall patch", "Water heaters", "Garbage disposal", "Re‑pipe", "Leak detection"];
function S1_5_Categorization({
  go,
  toast
}) {
  const [tags, setTags] = useStateOnb(["Leak detection", "Re‑pipe", "Water heaters"]);
  const [bio, setBio] = useStateOnb("15 yrs on the tools across Phoenix. Licensed + insured. I send a real invoice and a clean before/after on every job — no vague quotes.");
  const toggle = t => setTags(tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t]);
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(OnbHead, {
      title: "Your trade",
      step: 4,
      onBack: () => go("s1_4")
    }),
    footer: /*#__PURE__*/React.createElement(Btn, {
      rightIcon: "check",
      onClick: () => {
        toast("Profile published to node SW‑04.");
        go("s1_9");
      }
    }, "Finish & go live")
  }, /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement(Select, {
    label: "Primary trade",
    required: true,
    defaultValue: "plumbing"
  }, /*#__PURE__*/React.createElement("option", {
    value: "plumbing"
  }, "Plumbing"), /*#__PURE__*/React.createElement("option", {
    value: "electrical"
  }, "Electrical"), /*#__PURE__*/React.createElement("option", {
    value: "carpentry"
  }, "Carpentry"), /*#__PURE__*/React.createElement("option", {
    value: "hvac"
  }, "HVAC"), /*#__PURE__*/React.createElement("option", {
    value: "drywall"
  }, "Drywall & Paint"), /*#__PURE__*/React.createElement("option", {
    value: "handyman"
  }, "General Handyman")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 4
    }
  }, "Skill tags"), /*#__PURE__*/React.createElement("div", {
    className: "gk-field__hint",
    style: {
      marginBottom: 10
    }
  }, "Customers search these. Tap to add or remove."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8
    }
  }, [...new Set([...tags, ...SUGGESTED])].map(t => /*#__PURE__*/React.createElement(Chip, {
    key: t,
    on: tags.includes(t),
    onClick: () => toggle(t)
  }, t)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Textarea, {
    label: "Short bio",
    rows: 4,
    maxLength: 500,
    value: bio,
    onChange: e => setBio(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right",
      fontSize: 11,
      color: "var(--text-3)",
      marginTop: 4
    },
    className: "mono"
  }, bio.length, " / 500"))));
}
Object.assign(window, {
  S1_1_Auth,
  S1_2_ServiceArea,
  S1_3_Visual,
  S1_4_Credentials,
  S1_5_Categorization
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_cursor/design_reference/screens/handyman/onboarding.jsx", error: String((e && e.message) || e) }); }

// design_handoff_cursor/design_reference/screens/handyman/portfolio.jsx
try { (() => {
/* global React, AppBar, Screen, Body, Card, Btn, IconBtn, TextInput, Textarea, Select, Segmented, Icon, Eyebrow, Divider, Photo, Avatar, Badge, Stars */
// GigKraft Handyman — Portfolio & Recommendations screens 1.6–1.8.
const {
  useState: useStateP
} = React;

/* 1.6 — Project Creator ("Add Kraft") */
function S1_6_ProjectCreator({
  toast,
  tabBar
}) {
  const [ba, setBa] = useStateP(true);
  const [pre, setPre] = useStateP([false, false]);
  const [post, setPost] = useStateP([true, false]);
  const fill = (arr, set, i) => set(arr.map((v, j) => j === i ? true : v));
  const hasAfter = post.some(Boolean);
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      title: "Add a Kraft",
      subtitle: "Publish a verified before/after",
      right: /*#__PURE__*/React.createElement(Badge, {
        tone: "blue",
        icon: "bolt"
      }, "Proof")
    }),
    tabBar: tabBar,
    footer: /*#__PURE__*/React.createElement(Btn, {
      disabled: !hasAfter,
      leftIcon: "cloud-upload",
      onClick: () => toast(hasAfter ? "Kraft published to node directory." : "")
    }, hasAfter ? "Publish Kraft" : "Add an After photo to publish")
  }, /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement(TextInput, {
    label: "Project title",
    required: true,
    defaultValue: "Copper riser re\u2011pipe",
    maxLength: 100
  }), /*#__PURE__*/React.createElement(Textarea, {
    label: "Description",
    rows: 3,
    defaultValue: "Replaced corroded galvanized riser with type\u2011L copper, pressure\u2011tested the line and patched drywall.",
    maxLength: 1000
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Final job cost",
    defaultValue: "2"
  }, /*#__PURE__*/React.createElement("option", {
    value: "0"
  }, "Under $250"), /*#__PURE__*/React.createElement("option", {
    value: "1"
  }, "$250 \u2013 $500"), /*#__PURE__*/React.createElement("option", {
    value: "2"
  }, "$500 \u2013 $1,000"), /*#__PURE__*/React.createElement("option", {
    value: "3"
  }, "$1,000+")), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600
    }
  }, "Before / after project?"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text-3)",
      marginTop: 2
    }
  }, "Shows the transformation, not just the result.")), /*#__PURE__*/React.createElement("button", {
    className: `gk-switch${ba ? " gk-switch--on" : ""}`,
    onClick: () => setBa(!ba)
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-switch__dot"
  }))), ba && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-field__label"
  }, "Before photos"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--text-3)"
    }
  }, "Optional \xB7 max 5")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, pre.map((f, i) => /*#__PURE__*/React.createElement(Photo, {
    key: i,
    h: 96,
    filled: f,
    tone: "before",
    label: f ? "before · riser" : "Add before",
    dashed: !f,
    onClick: () => fill(pre, setPre, i)
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 8,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-field__label"
  }, "After photos", /*#__PURE__*/React.createElement("span", {
    className: "gk-field__req"
  }, "*")), /*#__PURE__*/React.createElement(Badge, {
    tone: hasAfter ? "green" : "yellow",
    icon: hasAfter ? "check" : "alert-triangle"
  }, hasAfter ? "Proof set" : "Required")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, post.map((f, i) => /*#__PURE__*/React.createElement(Photo, {
    key: i,
    h: 96,
    filled: f,
    tone: "after",
    accent: !f,
    label: f ? "after · copper" : "Add after",
    dashed: !f,
    onClick: () => fill(post, setPost, i)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "gk-field__hint",
    style: {
      marginTop: 8
    }
  }, "A real After image is mandatory \u2014 it's what makes the Kraft verifiable."))));
}

/* 1.7 — Recommendation Request Engine */
const CHANNELS = [{
  id: "whatsapp",
  label: "WhatsApp",
  icon: "brand-whatsapp",
  c: "var(--whatsapp)"
}, {
  id: "sms",
  label: "SMS",
  icon: "message-2",
  c: "var(--blue-6)"
}, {
  id: "email",
  label: "Email",
  icon: "mail",
  c: "var(--grape-6)"
}];
const RECENT_REQ = [{
  name: "Priya Shah",
  via: "WhatsApp",
  when: "2h ago",
  status: "Opened"
}, {
  name: "Dana Whitfield",
  via: "SMS",
  when: "Yesterday",
  status: "Sent"
}, {
  name: "Carl & Mei Ortega",
  via: "Email",
  when: "3 days ago",
  status: "Reviewed"
}];
function S1_7_RecRequest({
  go,
  toast
}) {
  const [ch, setCh] = useStateP("whatsapp");
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      title: "Request a recommendation",
      onBack: () => go("account")
    }),
    footer: /*#__PURE__*/React.createElement(Btn, {
      leftIcon: "send",
      onClick: () => toast("Magic link sent via " + CHANNELS.find(c => c.id === ch).label + ".")
    }, "Send review link")
  }, /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(TextInput, {
    label: "Client name",
    icon: "user",
    defaultValue: "Priya Shah"
  }), /*#__PURE__*/React.createElement(TextInput, {
    label: "Phone or email",
    icon: "at",
    defaultValue: "priya.shah@gmail.com"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 8
    }
  }, "Send via"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, CHANNELS.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.id,
    onClick: () => setCh(c.id),
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      padding: "14px 6px",
      borderRadius: "var(--r-md)",
      cursor: "pointer",
      background: ch === c.id ? "var(--tint)" : "var(--surface)",
      border: `1px solid ${ch === c.id ? "var(--primary)" : "var(--border-2)"}`
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: c.icon,
    size: 24,
    style: {
      color: c.c
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: ch === c.id ? "var(--tint-text)" : "var(--text-2)"
    }
  }, c.label))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 8
    }
  }, "Secure magic link"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "12px 14px",
      borderRadius: "var(--r-md)",
      background: "var(--bg-2)",
      border: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "link",
    size: 18,
    style: {
      color: "var(--text-3)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12,
      color: "var(--text-2)",
      flex: 1,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, "gigkraft.com/review?t=8fK2\u2026aQ9"), /*#__PURE__*/React.createElement(IconBtn, {
    icon: "copy",
    onClick: () => toast("Link copied.")
  })), /*#__PURE__*/React.createElement("div", {
    className: "gk-field__hint",
    style: {
      marginTop: 8
    }
  }, "Passwordless \u2014 your client rates the job without making an account.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 8
    }
  }, "Recent requests"), /*#__PURE__*/React.createElement(Card, {
    flat: true,
    style: {
      padding: 4
    }
  }, RECENT_REQ.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: r.name
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 10px"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: r.name,
    size: 36
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14
    }
  }, r.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)"
    }
  }, r.via, " \xB7 ", r.when)), /*#__PURE__*/React.createElement(Badge, {
    tone: r.status === "Reviewed" ? "green" : r.status === "Opened" ? "blue" : undefined
  }, r.status)), i < RECENT_REQ.length - 1 && /*#__PURE__*/React.createElement(Divider, null)))))));
}

/* 1.8 — Recommendation Moderation Queue */
const PENDING = [{
  name: "Priya Shah",
  rel: "Repeat client",
  when: "2h ago",
  stars: 5,
  photos: 2,
  text: "Marcus found the slab leak two other plumbers missed. Clean copper work and he sent the invoice the same day."
}, {
  name: "Dana Whitfield",
  rel: "Neighbor",
  when: "Yesterday",
  stars: 4,
  photos: 1,
  text: "Fast and tidy. Water heater swap done in an afternoon, no mess left behind."
}];
function S1_8_Moderation({
  go,
  toast
}) {
  const [done, setDone] = useStateP([]);
  const approve = n => {
    setDone([...done, n]);
    toast("Published to your public profile.");
  };
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      title: "Review queue",
      subtitle: `${PENDING.length - done.length} pending`,
      onBack: () => go("account"),
      right: /*#__PURE__*/React.createElement(Badge, {
        tone: "yellow"
      }, PENDING.length - done.length, " new")
    })
  }, /*#__PURE__*/React.createElement(Body, null, PENDING.map(r => {
    const isDone = done.includes(r.name);
    return /*#__PURE__*/React.createElement(Card, {
      key: r.name,
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        opacity: isDone ? .55 : 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: r.name,
      size: 42
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700
      }
    }, r.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--text-3)"
      }
    }, r.rel, " \xB7 ", r.when)), /*#__PURE__*/React.createElement(Stars, {
      value: r.stars,
      size: 18
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        color: "var(--text-2)",
        lineHeight: 1.55
      }
    }, "\"", r.text, "\""), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: `repeat(${r.photos}, 1fr)`,
        gap: 8
      }
    }, Array.from({
      length: r.photos
    }).map((_, i) => /*#__PURE__*/React.createElement(Photo, {
      key: i,
      h: 80,
      filled: true,
      tone: "after",
      label: "job photo"
    }))), /*#__PURE__*/React.createElement(Divider, null), isDone ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: "var(--green-fg)",
        fontWeight: 600,
        fontSize: 14,
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "circle-check-filled",
      size: 18
    }), " Published to profile") : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Btn, {
      variant: "default",
      size: "sm",
      leftIcon: "message",
      auto: true,
      style: {
        flex: 1
      },
      onClick: () => go("s1_10")
    }, "Reply"), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      leftIcon: "check",
      auto: true,
      style: {
        flex: 2
      },
      onClick: () => approve(r.name)
    }, "Approve & publish")));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--text-3)",
      fontSize: 13,
      padding: "8px 0"
    }
  }, "Approved recommendations show on your public profile.")));
}
Object.assign(window, {
  S1_6_ProjectCreator,
  S1_7_RecRequest,
  S1_8_Moderation
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_cursor/design_reference/screens/handyman/portfolio.jsx", error: String((e && e.message) || e) }); }

// screens/_shared/kit-admin.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React, Icon, Badge, Avatar, Divider */
// GigKraft Admin — desktop UI kit (Community Node Manager console).
// Reuses Icon/Badge/Avatar from the shared kit. Adds browser chrome, sidebar,
// metric tiles, data tables, toolbars — a clean fintech admin shell.
const {
  useState: useAd
} = React;
function BrowserChrome({
  url,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      height: "100%",
      background: "var(--surface)",
      borderRadius: 14,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      border: "1px solid var(--border)",
      boxShadow: "var(--shadow-device)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "0 0 auto",
      height: 46,
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "0 16px",
      background: "var(--bg-2)",
      borderBottom: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, ["#ff5f57", "#febc2e", "#28c840"].map(c => /*#__PURE__*/React.createElement("span", {
    key: c,
    style: {
      width: 12,
      height: 12,
      borderRadius: "50%",
      background: c
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      maxWidth: 520,
      display: "flex",
      alignItems: "center",
      gap: 8,
      height: 28,
      padding: "0 12px",
      background: "var(--surface)",
      border: "1px solid var(--border-2)",
      borderRadius: 8,
      color: "var(--text-3)",
      fontSize: 12.5
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "lock",
    size: 13
  }), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, url)), /*#__PURE__*/React.createElement(Icon, {
    name: "dots",
    size: 18,
    style: {
      color: "var(--text-3)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      overflow: "hidden"
    }
  }, children));
}
function AdSidebar({
  nav,
  active,
  onNav
}) {
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 244,
      flex: "0 0 auto",
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "18px 18px 16px",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: 8,
      background: "var(--primary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "tools",
    size: 19,
    style: {
      color: "#fff"
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 15.5,
      lineHeight: 1
    }
  }, "GigKraft"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: "var(--text-3)",
      fontWeight: 600,
      marginTop: 2
    }
  }, "NODE CONSOLE"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 8px 6px",
      fontSize: 10.5,
      fontWeight: 700,
      letterSpacing: ".5px",
      color: "var(--text-3)",
      paddingLeft: 18
    }
  }, "SOUTHWEST US-04"), /*#__PURE__*/React.createElement("nav", {
    style: {
      flex: 1,
      padding: "4px 10px",
      display: "flex",
      flexDirection: "column",
      gap: 2,
      overflowY: "auto"
    },
    className: "gk-scroll"
  }, nav.map(n => {
    const on = active === n.id;
    return /*#__PURE__*/React.createElement("button", {
      key: n.id,
      onClick: () => onNav(n.id),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "9px 11px",
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        background: on ? "var(--tint)" : "transparent",
        color: on ? "var(--tint-text)" : "var(--text-2)",
        fontWeight: on ? 700 : 500,
        fontSize: 13.5
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: n.icon,
      size: 18,
      style: {
        color: on ? "var(--primary)" : "var(--text-3)"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, n.label), n.badge && /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 18,
        height: 18,
        padding: "0 5px",
        borderRadius: 999,
        background: on ? "var(--primary)" : "var(--red-6)",
        color: "#fff",
        fontSize: 10.5,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, n.badge));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px",
      borderTop: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Dana Cruz",
    size: 34
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13
    }
  }, "Dana Cruz"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-3)"
    }
  }, "Node manager")), /*#__PURE__*/React.createElement("a", {
    href: "../../GigKraft App.html",
    title: "All roles",
    style: {
      color: "var(--text-3)",
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "grid-dots",
    size: 18
  }))));
}
function AdTopBar({
  title,
  subtitle,
  theme,
  onTheme,
  actions
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "0 0 auto",
      height: 64,
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "0 24px",
      borderBottom: "1px solid var(--border)",
      background: "var(--surface)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 800,
      letterSpacing: "-.3px"
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--text-3)",
      marginTop: 1
    }
  }, subtitle)), actions, /*#__PURE__*/React.createElement("button", {
    onClick: onTheme,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 38,
      height: 38,
      borderRadius: 9,
      border: "1px solid var(--border-2)",
      background: "var(--surface)",
      color: "var(--text-2)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: theme === "light" ? "moon" : "sun",
    size: 18
  })));
}
function AdMetric({
  label,
  value,
  delta,
  deltaTone = "green",
  icon,
  accent
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      padding: 18,
      borderRadius: 14,
      border: "1px solid var(--border)",
      background: accent ? "linear-gradient(135deg, var(--blue-7), var(--blue-9))" : "var(--surface)",
      color: accent ? "#fff" : "var(--text)",
      boxShadow: "var(--shadow-xs)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 700,
      letterSpacing: ".4px",
      textTransform: "uppercase",
      color: accent ? "rgba(255,255,255,.8)" : "var(--text-3)"
    }
  }, label), /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 18,
    style: {
      color: accent ? "rgba(255,255,255,.85)" : "var(--text-3)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 28,
      fontWeight: 800,
      letterSpacing: "-.6px",
      marginTop: 10,
      lineHeight: 1
    }
  }, value), delta && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      marginTop: 9,
      fontSize: 12,
      fontWeight: 700,
      color: accent ? "rgba(255,255,255,.9)" : deltaTone === "red" ? "var(--red-fg)" : "var(--green-fg)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: deltaTone === "red" ? "trending-down" : "trending-up",
    size: 14
  }), delta));
}
function Panel({
  title,
  action,
  children,
  pad = true,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 14,
      border: "1px solid var(--border)",
      background: "var(--surface)",
      boxShadow: "var(--shadow-xs)",
      overflow: "hidden",
      ...style
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 18px",
      borderBottom: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 14.5
    }
  }, title), action), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: pad ? 18 : 0
    }
  }, children));
}
function Pill({
  tone,
  dot,
  children
}) {
  const map = {
    green: ["var(--green-bg)", "var(--green-fg)"],
    red: ["var(--red-bg)", "var(--red-fg)"],
    yellow: ["var(--yellow-bg)", "var(--yellow-fg)"],
    blue: ["var(--tint)", "var(--tint-text)"],
    gray: ["var(--bg-2)", "var(--text-2)"]
  };
  const [bg, fg] = map[tone] || map.gray;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontSize: 11.5,
      fontWeight: 700,
      padding: "4px 10px",
      borderRadius: 999,
      background: bg,
      color: fg,
      whiteSpace: "nowrap"
    }
  }, dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: fg
    }
  }), children);
}
function AdBtn({
  tone = "default",
  icon,
  children,
  ...rest
}) {
  const styles = {
    default: {
      background: "var(--surface)",
      color: "var(--text)",
      border: "1px solid var(--border-2)"
    },
    primary: {
      background: "var(--primary)",
      color: "#fff",
      border: "1px solid transparent"
    },
    whatsapp: {
      background: "var(--whatsapp)",
      color: "#fff",
      border: "1px solid transparent"
    },
    sms: {
      background: "var(--tint)",
      color: "var(--tint-text)",
      border: "1px solid transparent"
    },
    green: {
      background: "var(--green-bg)",
      color: "var(--green-fg)",
      border: "1px solid var(--green-bd)"
    },
    red: {
      background: "var(--red-bg)",
      color: "var(--red-fg)",
      border: "1px solid var(--red-bd)"
    },
    ghost: {
      background: "transparent",
      color: "var(--text-2)",
      border: "1px solid transparent"
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({}, rest, {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 12.5,
      fontWeight: 600,
      padding: "7px 13px",
      borderRadius: 8,
      cursor: "pointer",
      whiteSpace: "nowrap",
      ...styles[tone]
    }
  }), icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 15
  }), children);
}

// Data table — columns: [{key,label,w,align}], rows arbitrary, render(row,col).
function Table({
  cols,
  rows,
  render
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: "auto"
    },
    className: "gk-scroll"
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, cols.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    style: {
      textAlign: c.align || "left",
      padding: "10px 14px",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: ".4px",
      textTransform: "uppercase",
      color: "var(--text-3)",
      borderBottom: "1px solid var(--border)",
      width: c.w,
      whiteSpace: "nowrap"
    }
  }, c.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: r.id || i,
    style: {
      borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none"
    }
  }, cols.map(c => /*#__PURE__*/React.createElement("td", {
    key: c.key,
    style: {
      textAlign: c.align || "left",
      padding: "13px 14px",
      verticalAlign: "middle"
    }
  }, render(r, c.key))))))));
}
function SearchBox({
  placeholder = "Search…",
  w = 260
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      height: 36,
      padding: "0 12px",
      width: w,
      background: "var(--surface)",
      border: "1px solid var(--border-2)",
      borderRadius: 9,
      color: "var(--text-3)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    size: 16
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: placeholder,
    style: {
      border: "none",
      outline: "none",
      background: "transparent",
      flex: 1,
      fontSize: 13.5,
      color: "var(--text)",
      fontFamily: "var(--font)"
    }
  }));
}

// Donut + horizontal mini bar utilities
function Donut({
  pct,
  size = 84,
  label,
  sub
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      borderRadius: "50%",
      background: `conic-gradient(var(--primary) 0 ${pct}%, var(--bg-2) ${pct}% 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "0 0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: size - 22,
      height: size - 22,
      borderRadius: "50%",
      background: "var(--surface)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 800,
      fontSize: 15
    }
  }, pct, "%")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--text-3)",
      marginTop: 2
    }
  }, sub)));
}
function Bars({
  data,
  h = 150
}) {
  const max = Math.max(...data.map(d => d.v));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: 14,
      height: h
    }
  }, data.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      height: "100%",
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: "var(--text-2)"
    }
  }, d.t), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 46,
      height: `${d.v / max * 100}%`,
      minHeight: 4,
      background: d.hl ? "var(--primary)" : "var(--tint-strong)",
      borderRadius: "6px 6px 3px 3px"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, d.l))));
}
Object.assign(window, {
  BrowserChrome,
  AdSidebar,
  AdTopBar,
  AdMetric,
  Panel,
  Pill,
  AdBtn,
  Table,
  SearchBox,
  Donut,
  Bars
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "screens/_shared/kit-admin.jsx", error: String((e && e.message) || e) }); }

// screens/_shared/kit.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React */
// GigKraft Mobile — UI kit (Mantine-flavored primitives + device shell).
// Tabler icons via webfont: <i class="ti ti-NAME" />.
const {
  useState
} = React;

/* ----------------------------- atoms ----------------------------- */
function Icon({
  name,
  size,
  style,
  className = ""
}) {
  return /*#__PURE__*/React.createElement("i", {
    className: `ti ti-${name} ${className}`,
    style: {
      fontSize: size,
      ...style
    }
  });
}
function Btn({
  variant = "filled",
  size,
  leftIcon,
  rightIcon,
  auto,
  children,
  ...rest
}) {
  const cls = ["gk-btn", `gk-btn--${variant}`];
  if (size) cls.push(`gk-btn--${size}`);
  if (auto) cls.push("gk-btn--auto");
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls.join(" ")
  }, rest), leftIcon && /*#__PURE__*/React.createElement(Icon, {
    name: leftIcon
  }), children, rightIcon && /*#__PURE__*/React.createElement(Icon, {
    name: rightIcon
  }));
}
function IconBtn({
  icon,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    className: "gk-iconbtn"
  }, rest), /*#__PURE__*/React.createElement(Icon, {
    name: icon
  }));
}
function Card({
  press,
  selected,
  flat,
  padLg,
  className = "",
  children,
  ...rest
}) {
  const cls = ["gk-card"];
  if (press) cls.push("gk-card--press");
  if (selected) cls.push("gk-card--selected");
  if (flat) cls.push("gk-card--flat");
  if (padLg) cls.push("gk-card--pad-lg");
  if (className) cls.push(className);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls.join(" ")
  }, rest), children);
}
function Eyebrow({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "gk-eyebrow",
    style: style
  }, children);
}
function Divider({
  style
}) {
  return /*#__PURE__*/React.createElement("hr", {
    className: "gk-divider",
    style: style
  });
}
function Badge({
  tone,
  icon,
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: `gk-badge${tone ? " gk-badge--" + tone : ""}`
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon
  }), children);
}
function Avatar({
  src,
  name = "",
  size = 40,
  style
}) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("");
  const hue = (name.charCodeAt(0) || 0) * 37 % 360;
  return /*#__PURE__*/React.createElement("span", {
    className: "gk-avatar",
    style: {
      width: size,
      height: size,
      fontSize: size * 0.38,
      background: src ? "transparent" : `oklch(0.62 0.13 ${hue})`,
      ...style
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : initials);
}

/* ----------------------------- inputs ----------------------------- */
function Field({
  label,
  required,
  hint,
  children
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: "gk-field"
  }, label && /*#__PURE__*/React.createElement("span", {
    className: "gk-field__label"
  }, label, required && /*#__PURE__*/React.createElement("span", {
    className: "gk-field__req"
  }, "*")), children, hint && /*#__PURE__*/React.createElement("span", {
    className: "gk-field__hint"
  }, hint));
}
function TextInput({
  label,
  required,
  hint,
  icon,
  ...rest
}) {
  return /*#__PURE__*/React.createElement(Field, {
    label: label,
    required: required,
    hint: hint
  }, icon ? /*#__PURE__*/React.createElement("span", {
    className: "gk-input-wrap"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    className: "gk-input-wrap__icon"
  }), /*#__PURE__*/React.createElement("input", _extends({
    className: "gk-input"
  }, rest))) : /*#__PURE__*/React.createElement("input", _extends({
    className: "gk-input"
  }, rest)));
}
function Textarea({
  label,
  required,
  hint,
  rows = 3,
  ...rest
}) {
  return /*#__PURE__*/React.createElement(Field, {
    label: label,
    required: required,
    hint: hint
  }, /*#__PURE__*/React.createElement("textarea", _extends({
    className: "gk-input",
    rows: rows
  }, rest)));
}
function Select({
  label,
  required,
  hint,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement(Field, {
    label: label,
    required: required,
    hint: hint
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    className: "gk-input"
  }, rest), children), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-down",
    style: {
      position: "absolute",
      right: 12,
      top: "50%",
      transform: "translateY(-50%)",
      color: "var(--text-3)",
      pointerEvents: "none",
      fontSize: 18
    }
  })));
}
function Switch({
  on,
  onChange
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: `gk-switch${on ? " gk-switch--on" : ""}`,
    onClick: () => onChange(!on)
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-switch__dot"
  }));
}
function SwitchRow({
  label,
  desc,
  on,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "4px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fz-md)",
      fontWeight: 600
    }
  }, label), desc && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fz-sm)",
      color: "var(--text-3)",
      marginTop: 2
    }
  }, desc)), /*#__PURE__*/React.createElement(Switch, {
    on: on,
    onChange: onChange
  }));
}
function Segmented({
  options,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "gk-seg"
  }, options.map(o => {
    const v = o.value ?? o;
    const lbl = o.label ?? o;
    return /*#__PURE__*/React.createElement("button", {
      key: v,
      className: `gk-seg__item${value === v ? " gk-seg__item--on" : ""}`,
      onClick: () => onChange(v)
    }, lbl);
  }));
}
function Slider({
  min = 0,
  max = 100,
  value,
  onChange,
  unit = ""
}) {
  const pct = (value - min) / (max - min) * 100;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fz-sm)",
      color: "var(--text-3)"
    }
  }, min, unit), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: "var(--fz-md)",
      fontWeight: 600,
      color: "var(--primary)"
    }
  }, value, unit), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fz-sm)",
      color: "var(--text-3)"
    }
  }, max, unit)), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: min,
    max: max,
    value: value,
    onChange: e => onChange(+e.target.value),
    style: {
      width: "100%",
      accentColor: "var(--primary)",
      "--pct": pct + "%"
    }
  }));
}
function Chip({
  on,
  icon,
  children,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: `gk-chip${on ? " gk-chip--on" : ""}`,
    onClick: onClick
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon
  }), children, on && /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    style: {
      fontSize: 14
    }
  }));
}
function Stars({
  value,
  onChange,
  size = 28
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4
    }
  }, [1, 2, 3, 4, 5].map(n => /*#__PURE__*/React.createElement(Icon, _extends({
    key: n,
    name: n <= value ? "star-filled" : "star",
    size: size,
    style: {
      color: n <= value ? "var(--yellow-6)" : "var(--border-2)",
      cursor: onChange ? "pointer" : "default"
    }
  }, onChange ? {
    onClick: () => onChange(n)
  } : {}))));
}

/* --------------------------- media slots --------------------------- */
// Striped placeholder the user/dev fills with a real photo.
function Photo({
  label,
  h = 120,
  filled,
  tone = "neutral",
  icon = "photo",
  onClick,
  dashed,
  accent
}) {
  const tones = {
    neutral: "var(--bg-2)",
    before: "var(--bg-2)",
    after: "var(--green-bg)"
  };
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      height: h,
      borderRadius: "var(--r-md)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      cursor: onClick ? "pointer" : "default",
      color: filled ? tone === "after" ? "var(--green-fg)" : "var(--text-2)" : "var(--text-3)",
      background: filled ? tones[tone] : "transparent",
      border: `${dashed ? "1.5px dashed" : "1px solid"} ${accent ? "var(--primary)" : "var(--border-2)"}`,
      backgroundImage: filled ? `repeating-linear-gradient(135deg, transparent 0 11px, rgba(0,0,0,.025) 11px 12px)` : "none",
      position: "relative",
      overflow: "hidden",
      textAlign: "center",
      padding: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: filled ? "check" : icon,
    size: filled ? 24 : 22
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fz-xs)",
      fontWeight: 600,
      lineHeight: 1.3
    }
  }, label));
}
function BeforeAfter({
  before = "Before",
  after = "After",
  h = 130
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 4,
      borderRadius: "var(--r-md)",
      overflow: "hidden"
    }
  }, [["before", before, "#868e96"], ["after", after, "var(--green-6)"]].map(([k, lbl, c]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      height: h,
      position: "relative",
      display: "flex",
      alignItems: "flex-end",
      padding: 8,
      background: k === "after" ? "var(--green-bg)" : "var(--bg-2)",
      backgroundImage: `repeating-linear-gradient(135deg, transparent 0 13px, rgba(0,0,0,.03) 13px 14px)`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 8,
      left: 8,
      fontSize: 9,
      fontWeight: 800,
      letterSpacing: ".6px",
      textTransform: "uppercase",
      color: c,
      background: "var(--surface)",
      padding: "3px 7px",
      borderRadius: 5
    }
  }, k === "after" ? "✦ After" : "Before"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fz-xs)",
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, lbl))));
}

/* ----------------------------- device shell ----------------------------- */
function StatusBar() {
  return /*#__PURE__*/React.createElement("div", {
    className: "gk-statusbar",
    style: {
      height: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 28px",
      position: "relative",
      flex: "0 0 auto",
      color: "var(--text)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 14,
      fontWeight: 600,
      letterSpacing: ".5px"
    }
  }, "9:41"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "50%",
      top: 9,
      transform: "translateX(-50%)",
      width: 104,
      height: 30,
      background: "#000",
      borderRadius: 999
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "antenna-bars-5",
    size: 17
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "wifi",
    size: 17
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "battery-3",
    size: 20,
    style: {
      transform: "rotate(0deg)"
    }
  })));
}
function PhoneFrame({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "gk-phone",
    style: {
      width: 398,
      height: 836,
      background: "var(--surface)",
      borderRadius: 52,
      padding: 10,
      boxShadow: "var(--shadow-device)",
      flex: "0 0 auto",
      border: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      height: "100%",
      background: "var(--bg)",
      borderRadius: 44,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(StatusBar, null), children));
}
function AppBar({
  title,
  subtitle,
  onBack,
  left,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "0 0 auto",
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "6px 12px 10px",
      borderBottom: "1px solid var(--border)",
      background: "var(--surface)"
    }
  }, onBack && /*#__PURE__*/React.createElement(IconBtn, {
    icon: "arrow-left",
    onClick: onBack
  }), left, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      lineHeight: 1.2,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fz-xs)",
      color: "var(--text-3)",
      fontWeight: 500
    }
  }, subtitle)), right);
}
function BottomTab({
  tabs,
  active,
  onTab
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "0 0 auto",
      display: "flex",
      borderTop: "1px solid var(--border)",
      background: "var(--surface)",
      padding: "8px 6px 22px"
    }
  }, tabs.map(t => {
    const on = t.id === active;
    const primary = t.primary;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      onClick: () => onTab(t.id),
      style: {
        flex: 1,
        background: "none",
        border: "none",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        padding: "2px 0",
        color: on ? "var(--primary)" : "var(--text-3)"
      }
    }, primary ? /*#__PURE__*/React.createElement("span", {
      style: {
        width: 46,
        height: 32,
        marginTop: -2,
        borderRadius: 10,
        background: "var(--primary)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: t.icon,
      size: 22
    })) : /*#__PURE__*/React.createElement(Icon, {
      name: on ? t.iconOn || t.icon : t.icon,
      size: 23
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10.5,
        fontWeight: on ? 700 : 500
      }
    }, t.label));
  }));
}

// Layout: sticky app bar + scroll body + optional sticky footer + optional tab bar.
function Screen({
  appBar,
  children,
  footer,
  tabBar,
  scrollRef
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, appBar, /*#__PURE__*/React.createElement("div", {
    className: "gk-scroll",
    ref: scrollRef,
    style: {
      flex: 1,
      overflowY: "auto",
      overflowX: "hidden"
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "0 0 auto",
      padding: "12px 16px",
      borderTop: "1px solid var(--border)",
      background: "var(--surface)"
    }
  }, footer), tabBar);
}

// Onboarding progress dots.
function Steps({
  total,
  current
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 5,
      padding: "0 16px 4px"
    }
  }, Array.from({
    length: total
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      height: 4,
      borderRadius: 99,
      background: i <= current ? "var(--primary)" : "var(--border-2)"
    }
  })));
}

// Generic body padding wrapper.
function Body({
  children,
  gap = 14,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap,
      ...style
    }
  }, children);
}
function Stat({
  k,
  v,
  delta,
  deltaTone = "green",
  icon
}) {
  return /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-eyebrow"
  }, k), icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 17,
    style: {
      color: "var(--text-3)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 26,
      fontWeight: 800,
      letterSpacing: "-.5px",
      lineHeight: 1
    }
  }, v), delta && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 3,
      marginTop: 7,
      fontSize: 12,
      fontWeight: 700,
      color: deltaTone === "green" ? "var(--green-fg)" : deltaTone === "red" ? "var(--red-fg)" : "var(--text-3)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: deltaTone === "red" ? "trending-down" : "trending-up",
    size: 14
  }), delta));
}

// Bar chart (simple, themed).
function BarChart({
  data,
  h = 120,
  color = "var(--primary)"
}) {
  const max = Math.max(...data.map(d => d.v));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: 8,
      height: h
    }
  }, data.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      height: "100%",
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 30,
      height: `${d.v / max * 100}%`,
      minHeight: 4,
      background: d.hl ? color : "var(--tint-strong)",
      borderRadius: "5px 5px 3px 3px",
      transition: "height .3s"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, d.l))));
}
Object.assign(window, {
  Icon,
  Btn,
  IconBtn,
  Card,
  Eyebrow,
  Divider,
  Badge,
  Avatar,
  Field,
  TextInput,
  Textarea,
  Select,
  Switch,
  SwitchRow,
  Segmented,
  Slider,
  Chip,
  Stars,
  Photo,
  BeforeAfter,
  PhoneFrame,
  AppBar,
  BottomTab,
  Screen,
  Steps,
  Body,
  Stat,
  BarChart
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "screens/_shared/kit.jsx", error: String((e && e.message) || e) }); }

// screens/admin/app.jsx
try { (() => {
/* global React, ReactDOM, BrowserChrome, AdSidebar, AdTopBar,
   V3_1_Ops, V3_2_Triage, V3_3_Safety, V3_4_Ledger, V3_5_Krafts, V3_6_Settings, AdBtn, Pill */
const {
  useState,
  useEffect,
  useLayoutEffect,
  useRef
} = React;
const NAV = [{
  id: "v1",
  icon: "layout-dashboard",
  label: "Regional Ops"
}, {
  id: "v2",
  icon: "broadcast",
  label: "Triage Desk",
  badge: "3"
}, {
  id: "v3",
  icon: "shield-half",
  label: "Safety & Hygiene",
  badge: "3"
}, {
  id: "v4",
  icon: "users-group",
  label: "Pro Ledger"
}, {
  id: "v5",
  icon: "photo-check",
  label: "Kraft Verification",
  badge: "2"
}, {
  id: "v6",
  icon: "settings",
  label: "Node Settings"
}];
const VIEWS = {
  v1: V3_1_Ops,
  v2: V3_2_Triage,
  v3: V3_3_Safety,
  v4: V3_4_Ledger,
  v5: V3_5_Krafts,
  v6: V3_6_Settings
};
const META = {
  v1: ["3.1 · Regional Core Ops", "Live command center for node southwest-us-04"],
  v2: ["3.2 · Cross-Channel Triage Desk", "Dispatch unrouted emergencies over SMS + WhatsApp"],
  v3: ["3.3 · Safety & Hygiene", "Verification compliance and dispute moderation"],
  v4: ["3.4 · Pro Ledger", "142 active tradespeople in this node"],
  v5: ["3.5 · Kraft Verification", "Enforce the mandatory After photo + invoice rule"],
  v6: ["3.6 · Node Settings & Billing", "Configuration and the node revenue ledger"]
};
function useScale(w0, h0) {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const calc = () => {
      const w = ref.current;
      if (!w) return;
      setScale(Math.min(1, (w.clientWidth - 40) / w0, (w.clientHeight - 40) / h0));
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (ref.current) ro.observe(ref.current);
    window.addEventListener("resize", calc);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", calc);
    };
  }, []);
  return [ref, scale];
}
function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("gk_theme") || "light");
  const [view, setView] = useState(() => localStorage.getItem("gk_a_view") || "v1");
  const [toastMsg, setToastMsg] = useState(null);
  const [wrapRef, scale] = useScale(1440, 900);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("gk_theme", theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("gk_a_view", view);
  }, [view]);
  const toast = m => {
    if (!m) return;
    setToastMsg(m);
    clearTimeout(window.__t);
    window.__t = setTimeout(() => setToastMsg(null), 2200);
  };
  const Active = VIEWS[view];
  const [title, sub] = META[view];
  return /*#__PURE__*/React.createElement("div", {
    ref: wrapRef,
    style: {
      height: "100vh",
      width: "100vw",
      overflow: "hidden",
      background: "var(--bg-2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1440,
      height: 900,
      transform: `scale(${scale})`,
      transformOrigin: "center center",
      flex: "0 0 auto"
    }
  }, /*#__PURE__*/React.createElement(BrowserChrome, {
    url: "admin.gigkraft.com/node/southwest-us-04/control-panel"
  }, /*#__PURE__*/React.createElement(AdSidebar, {
    nav: NAV,
    active: view,
    onNav: setView
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      background: "var(--bg)"
    }
  }, /*#__PURE__*/React.createElement(AdTopBar, {
    title: title,
    subtitle: sub,
    theme: theme,
    onTheme: () => setTheme(theme === "light" ? "dark" : "light"),
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Pill, {
      tone: "green",
      dot: true
    }, "Node live"), /*#__PURE__*/React.createElement(AdBtn, {
      tone: "default",
      icon: "bell"
    }, "Alerts"))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(Active, {
    toast: toast
  }))))), toastMsg && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 28,
      left: "50%",
      transform: "translateX(-50%)",
      background: "var(--gray-9)",
      color: "#fff",
      padding: "12px 20px",
      borderRadius: 12,
      fontSize: 14,
      fontWeight: 600,
      boxShadow: "var(--shadow-lg)",
      display: "flex",
      alignItems: "center",
      gap: 8,
      zIndex: 50
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--blue-3)",
      display: "flex"
    }
  }, "\u2713"), toastMsg));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "screens/admin/app.jsx", error: String((e && e.message) || e) }); }

// screens/admin/views.jsx
try { (() => {
/* global React, Icon, Avatar, Panel, AdMetric, Pill, AdBtn, Table, SearchBox, Donut, Bars, BeforeAfter, Photo, Badge */
// GigKraft Admin — views 3.1–3.6 (Community Node Manager console).
const {
  useState: useV
} = React;
const wrap = children => /*#__PURE__*/React.createElement("div", {
  style: {
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 18,
    height: "100%",
    overflowY: "auto"
  },
  className: "gk-scroll"
}, children);

/* 3.1 — Regional Core Ops (dashboard) */
function V3_1_Ops() {
  const acts = [["Marcus Bell", "published a Kraft · Copper riser re-pipe · $1,840", "2m", "green"], ["Emergency broadcast", "Kitchen pipe burst · Downtown · budget $150", "8m", "red"], ["R. Alvarez", "claimed lead · Breaker panel trip · Eastside", "14m", "blue"], ["Tasha Quinn", "earned 5★ recommendation from Priya Shah", "31m", "green"], ["New pro", "Leo Park activated Pro Vault · $199/yr", "1h", "blue"]];
  return wrap(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(AdMetric, {
    label: "Pending triage",
    value: "3 tasks",
    delta: "2 urgent",
    deltaTone: "red",
    icon: "urgent"
  }), /*#__PURE__*/React.createElement(AdMetric, {
    label: "Active pros",
    value: "142",
    delta: "+6 this week",
    icon: "users"
  }), /*#__PURE__*/React.createElement(AdMetric, {
    label: "Avg response",
    value: "1h 52m",
    delta: "inside 4h SLA",
    icon: "clock-check"
  }), /*#__PURE__*/React.createElement(AdMetric, {
    label: "Monthly run rate",
    value: "$2,838",
    delta: "+22%",
    icon: "cash",
    accent: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.6fr 1fr",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Node throughput \xB7 last 6 weeks",
    action: /*#__PURE__*/React.createElement(Pill, {
      tone: "green",
      dot: true
    }, "Healthy")
  }, /*#__PURE__*/React.createElement(Bars, {
    data: [{
      t: "82",
      l: "Apr 28",
      v: 82
    }, {
      t: "96",
      l: "May 5",
      v: 96
    }, {
      t: "88",
      l: "May 12",
      v: 88
    }, {
      t: "104",
      l: "May 19",
      v: 104
    }, {
      t: "121",
      l: "May 26",
      v: 121
    }, {
      t: "138",
      l: "Jun 2",
      v: 138,
      hl: true
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 24,
      marginTop: 16,
      paddingTop: 16,
      borderTop: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, "Jobs closed"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800
    }
  }, "629")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, "Win rate"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800
    }
  }, "41%")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, "Repeat clients"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800
    }
  }, "33%")))), /*#__PURE__*/React.createElement(Panel, {
    title: "SLA compliance"
  }, /*#__PURE__*/React.createElement(Donut, {
    pct: 92,
    label: "Within 4h promise",
    sub: "131 of 142 pros on target"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, [["Plumbing", 96, "green"], ["Electrical", 91, "green"], ["HVAC", 78, "yellow"]].map(([t, v, tone]) => /*#__PURE__*/React.createElement("div", {
    key: t
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 12.5,
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, t), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      color: "var(--text-3)"
    }
  }, v, "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 7,
      borderRadius: 99,
      background: "var(--bg-2)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${v}%`,
      height: "100%",
      borderRadius: 99,
      background: tone === "yellow" ? "var(--yellow-6)" : "var(--green-6)"
    }
  }))))))), /*#__PURE__*/React.createElement(Panel, {
    title: "Recent node activity",
    action: /*#__PURE__*/React.createElement(AdBtn, {
      tone: "ghost",
      icon: "refresh"
    }, "Refresh")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, acts.map(([who, ctx, t, tone], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 4px",
      borderBottom: i < acts.length - 1 ? "1px solid var(--border)" : "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      flex: "0 0 auto",
      background: tone === "red" ? "var(--red-6)" : tone === "blue" ? "var(--blue-6)" : "var(--green-6)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement("strong", null, who), " ", ctx), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      fontSize: 12,
      color: "var(--text-3)"
    },
    className: "mono"
  }, t, " ago")))))));
}

/* 3.2 — Cross-Channel Triage Desk */
function V3_2_Triage({
  toast
}) {
  const [done, setDone] = useV([]);
  const rows = [{
    id: "TSK-8902",
    ctx: "Kitchen pipe main-line burst",
    sub: "Water pooling · Downtown node",
    budget: "$150",
    age: "4m",
    urgent: true
  }, {
    id: "TSK-8911",
    ctx: "Breaker panel total trip",
    sub: "No power to property · Eastside node",
    budget: "$240",
    age: "12m",
    urgent: true
  }, {
    id: "TSK-8920",
    ctx: "Water heater leaking",
    sub: "Garage flooding slowly · North node",
    budget: "$400",
    age: "26m",
    urgent: false
  }];
  const live = rows.filter(r => !done.includes(r.id));
  return wrap(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(AdMetric, {
    label: "Unrouted",
    value: live.length,
    delta: "dispatch now",
    deltaTone: "red",
    icon: "broadcast"
  }), /*#__PURE__*/React.createElement(AdMetric, {
    label: "Claimed today",
    value: "11",
    delta: "+4",
    icon: "check"
  }), /*#__PURE__*/React.createElement(AdMetric, {
    label: "Avg claim time",
    value: "3m 40s",
    icon: "clock"
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "Outreach triage desk",
    pad: false,
    action: /*#__PURE__*/React.createElement(Pill, {
      tone: "red",
      dot: true
    }, live.length, " awaiting dispatch")
  }, live.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 48,
      textAlign: "center",
      color: "var(--text-3)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-check",
    size: 40,
    style: {
      color: "var(--green-fg)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      fontWeight: 600
    }
  }, "Queue clear \u2014 all emergencies dispatched.")) : /*#__PURE__*/React.createElement(Table, {
    cols: [{
      key: "id",
      label: "Task",
      w: 120
    }, {
      key: "ctx",
      label: "Context"
    }, {
      key: "budget",
      label: "Budget",
      align: "right",
      w: 100
    }, {
      key: "act",
      label: "Dispatch",
      align: "right",
      w: 250
    }],
    rows: live,
    render: (r, k) => {
      if (k === "id") return /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", {
        className: "mono",
        style: {
          fontSize: 12.5
        }
      }, "#", r.id), r.urgent && /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 4
        }
      }, /*#__PURE__*/React.createElement(Pill, {
        tone: "red"
      }, r.age, " old")));
      if (k === "ctx") return /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, r.ctx), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 12.5,
          color: "var(--text-3)"
        }
      }, r.sub));
      if (k === "budget") return /*#__PURE__*/React.createElement("span", {
        className: "mono",
        style: {
          fontWeight: 800,
          color: "var(--green-fg)"
        }
      }, r.budget);
      return /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 8,
          justifyContent: "flex-end"
        }
      }, /*#__PURE__*/React.createElement(AdBtn, {
        tone: "whatsapp",
        icon: "brand-whatsapp",
        onClick: () => toast("WhatsApp blast dispatched to node.")
      }, "Blast"), /*#__PURE__*/React.createElement(AdBtn, {
        tone: "sms",
        icon: "message-2",
        onClick: () => {
          setDone([...done, r.id]);
          toast("SMS pin broadcast — task routed.");
        }
      }, "SMS pin"));
    }
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "",
    pad: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      color: "var(--text-2)",
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "info-circle",
    size: 18,
    style: {
      color: "var(--text-3)"
    }
  }), "Payloads beam instantly to proven local pros over native SMS + WhatsApp automation. Alerts escalate if a task sits unassigned beyond 15 minutes."))));
}

/* 3.3 — Safety & Hygiene moderation */
function V3_3_Safety({
  toast
}) {
  const [resolved, setResolved] = useV([]);
  const rows = [{
    id: "DISP-302",
    who: "John Doe",
    trade: "Carpenter",
    ctx: "Off-platform pricing variance vs published portfolio.",
    sev: "yellow"
  }, {
    id: "DISP-318",
    who: "M. Reyes",
    trade: "Roofer",
    ctx: "Missing mandatory After image on 2 published Krafts.",
    sev: "red"
  }, {
    id: "DISP-325",
    who: "K. Obi",
    trade: "Painter",
    ctx: "Client reported no-show after lead claim.",
    sev: "yellow"
  }];
  const open = rows.filter(r => !resolved.includes(r.id));
  return wrap(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(AdMetric, {
    label: "Open disputes",
    value: open.length,
    icon: "flag",
    deltaTone: "red",
    delta: open.length ? "needs review" : "clear"
  }), /*#__PURE__*/React.createElement(AdMetric, {
    label: "Suspended pros",
    value: "2",
    icon: "user-off"
  }), /*#__PURE__*/React.createElement(AdMetric, {
    label: "Hygiene score",
    value: "A\u2212",
    delta: "directory healthy",
    icon: "shield-check"
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "Verification compliance & safety queue",
    pad: false
  }, open.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 48,
      textAlign: "center",
      color: "var(--text-3)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-check",
    size: 40,
    style: {
      color: "var(--green-fg)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      fontWeight: 600
    }
  }, "Queue clear \u2014 marketplace hygiene maintained.")) : /*#__PURE__*/React.createElement(Table, {
    cols: [{
      key: "id",
      label: "Log",
      w: 120
    }, {
      key: "who",
      label: "Profile",
      w: 200
    }, {
      key: "ctx",
      label: "Infraction"
    }, {
      key: "act",
      label: "Override",
      align: "right",
      w: 220
    }],
    rows: open,
    render: (r, k) => {
      if (k === "id") return /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", {
        className: "mono",
        style: {
          fontSize: 12.5
        }
      }, "#", r.id), /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 4
        }
      }, /*#__PURE__*/React.createElement(Pill, {
        tone: r.sev
      }, r.sev === "red" ? "High" : "Medium")));
      if (k === "who") return /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: r.who,
        size: 32
      }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontWeight: 600,
          fontSize: 13.5
        }
      }, r.who), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 12,
          color: "var(--text-3)"
        }
      }, r.trade)));
      if (k === "ctx") return /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 13,
          color: "var(--text-2)"
        }
      }, r.ctx);
      return /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 8,
          justifyContent: "flex-end"
        }
      }, /*#__PURE__*/React.createElement(AdBtn, {
        tone: "green",
        icon: "check",
        onClick: () => {
          setResolved([...resolved, r.id]);
          toast("Dispute dismissed & archived.");
        }
      }, "Dismiss"), /*#__PURE__*/React.createElement(AdBtn, {
        tone: "red",
        icon: "ban",
        onClick: () => {
          setResolved([...resolved, r.id]);
          toast("Profile suspended — hidden from directory.");
        }
      }, "Suspend"));
    }
  }))));
}

/* 3.4 — Pro Ledger */
function V3_4_Ledger() {
  const rows = [{
    id: 1,
    name: "Marcus Bell",
    trade: "Plumbing",
    krafts: 12,
    recs: 42,
    sla: "1h 52m",
    plan: "Annual",
    status: "Active"
  }, {
    id: 2,
    name: "Tasha Quinn",
    trade: "Drywall & Paint",
    krafts: 9,
    recs: 31,
    sla: "2h 10m",
    plan: "Monthly",
    status: "Active"
  }, {
    id: 3,
    name: "Leo Park",
    trade: "Electrical",
    krafts: 7,
    recs: 27,
    sla: "3h 04m",
    plan: "Annual",
    status: "Active"
  }, {
    id: 4,
    name: "Ramon Alvarez",
    trade: "HVAC",
    krafts: 15,
    recs: 38,
    sla: "5h 20m",
    plan: "Monthly",
    status: "At risk"
  }, {
    id: 5,
    name: "Bea Foster",
    trade: "Tile & Flooring",
    krafts: 6,
    recs: 19,
    sla: "2h 41m",
    plan: "Annual",
    status: "Active"
  }, {
    id: 6,
    name: "M. Reyes",
    trade: "Roofing",
    krafts: 2,
    recs: 4,
    sla: "—",
    plan: "Monthly",
    status: "Suspended"
  }];
  return wrap(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Panel, {
    title: "Pro ledger \xB7 142 active",
    pad: false,
    action: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(SearchBox, {
      placeholder: "Search pros\u2026",
      w: 220
    }), /*#__PURE__*/React.createElement(AdBtn, {
      tone: "primary",
      icon: "user-plus"
    }, "Invite pro"))
  }, /*#__PURE__*/React.createElement(Table, {
    cols: [{
      key: "name",
      label: "Pro"
    }, {
      key: "trade",
      label: "Trade",
      w: 150
    }, {
      key: "krafts",
      label: "Krafts",
      align: "center",
      w: 80
    }, {
      key: "recs",
      label: "Recs",
      align: "center",
      w: 80
    }, {
      key: "sla",
      label: "Avg SLA",
      align: "center",
      w: 100
    }, {
      key: "plan",
      label: "Plan",
      w: 100
    }, {
      key: "status",
      label: "Status",
      align: "right",
      w: 120
    }],
    rows: rows,
    render: (r, k) => {
      if (k === "name") return /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: r.name,
        size: 32
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 600
        }
      }, r.name));
      if (k === "krafts" || k === "recs") return /*#__PURE__*/React.createElement("span", {
        className: "mono",
        style: {
          fontWeight: 600
        }
      }, r[k]);
      if (k === "sla") return /*#__PURE__*/React.createElement("span", {
        className: "mono",
        style: {
          color: r.status === "At risk" ? "var(--yellow-fg)" : "var(--text-2)"
        }
      }, r.sla);
      if (k === "plan") return /*#__PURE__*/React.createElement(Pill, {
        tone: "gray"
      }, r.plan);
      if (k === "status") return /*#__PURE__*/React.createElement(Pill, {
        tone: r.status === "Active" ? "green" : r.status === "At risk" ? "yellow" : "red",
        dot: true
      }, r.status);
      return r[k];
    }
  }))));
}

/* 3.5 — Kraft Verification (enforce mandatory After) */
function V3_5_Krafts({
  toast
}) {
  const [acted, setActed] = useV([]);
  const rows = [{
    id: "KR-4471",
    pro: "Ramon Alvarez",
    title: "Condenser swap",
    cost: "$3,400",
    hasAfter: true,
    hasInvoice: true
  }, {
    id: "KR-4480",
    pro: "M. Reyes",
    title: "Ridge cap re-seal",
    cost: "$620",
    hasAfter: false,
    hasInvoice: true
  }, {
    id: "KR-4488",
    pro: "Bea Foster",
    title: "Master bath re-tile",
    cost: "$2,150",
    hasAfter: true,
    hasInvoice: false
  }];
  const open = rows.filter(r => !acted.includes(r.id));
  return wrap(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(AdMetric, {
    label: "Awaiting review",
    value: open.length,
    icon: "photo-check"
  }), /*#__PURE__*/React.createElement(AdMetric, {
    label: "Verified this week",
    value: "48",
    delta: "+12",
    icon: "discount-check"
  }), /*#__PURE__*/React.createElement(AdMetric, {
    label: "Rejected",
    value: "3",
    icon: "photo-x",
    deltaTone: "red",
    delta: "missing proof"
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "Kraft verification queue",
    action: /*#__PURE__*/React.createElement(Pill, {
      tone: "blue"
    }, "Mandatory After + invoice")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16
    }
  }, open.map(r => {
    const ok = r.hasAfter && r.hasInvoice;
    return /*#__PURE__*/React.createElement("div", {
      key: r.id,
      style: {
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement(BeforeAfter, {
      h: 130,
      before: r.title,
      after: r.hasAfter ? "after photo" : "MISSING after"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: r.pro,
      size: 30
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700,
        fontSize: 13.5
      }
    }, r.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--text-3)"
      }
    }, r.pro, " \xB7 ", /*#__PURE__*/React.createElement("span", {
      className: "mono"
    }, "#", r.id)))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginTop: 12
      }
    }, /*#__PURE__*/React.createElement(Pill, {
      tone: r.hasAfter ? "green" : "red",
      dot: true
    }, r.hasAfter ? "After photo" : "No After"), /*#__PURE__*/React.createElement(Pill, {
      tone: r.hasInvoice ? "green" : "red",
      dot: true
    }, r.hasInvoice ? `Invoice ${r.cost}` : "No invoice")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginTop: 14
      }
    }, /*#__PURE__*/React.createElement(AdBtn, {
      tone: "red",
      icon: "x",
      onClick: () => {
        setActed([...acted, r.id]);
        toast("Kraft rejected — pro notified to add proof.");
      }
    }, "Reject"), /*#__PURE__*/React.createElement(AdBtn, {
      tone: ok ? "green" : "ghost",
      icon: "check",
      onClick: () => {
        if (!ok) {
          toast("Can't verify — proof incomplete.");
          return;
        }
        setActed([...acted, r.id]);
        toast("Kraft verified & published.");
      },
      style: {
        flex: 1,
        justifyContent: "center",
        opacity: ok ? 1 : .5,
        cursor: ok ? "pointer" : "not-allowed"
      }
    }, "Verify"))));
  })), open.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 40,
      textAlign: "center",
      color: "var(--text-3)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "checks",
    size: 36,
    style: {
      color: "var(--green-fg)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      fontWeight: 600
    }
  }, "All Krafts reviewed.")))));
}

/* 3.6 — Node Settings & Billing */
function V3_6_Settings({
  toast
}) {
  const [autoblast, setAutoblast] = useV(true);
  const [escalate, setEscalate] = useV(true);
  const Row = ({
    label,
    desc,
    on,
    set
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "12px 0",
      borderBottom: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--text-3)",
      marginTop: 2
    }
  }, desc)), /*#__PURE__*/React.createElement("button", {
    onClick: () => set(!on),
    className: `gk-switch${on ? " gk-switch--on" : ""}`
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-switch__dot"
  })));
  return wrap(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.2fr 1fr",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Node configuration"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement(Row, {
    label: "Auto-blast emergencies",
    desc: "Dispatch unrouted tasks to pros over SMS + WhatsApp automatically",
    on: autoblast,
    set: setAutoblast
  }), /*#__PURE__*/React.createElement(Row, {
    label: "15-min escalation alerts",
    desc: "Notify me if a task sits unassigned past the threshold",
    on: escalate,
    set: setEscalate
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "gk-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-field__label"
  }, "Node ID"), /*#__PURE__*/React.createElement("input", {
    className: "gk-input mono",
    defaultValue: "southwest-us-04"
  })), /*#__PURE__*/React.createElement("label", {
    className: "gk-field"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-field__label"
  }, "Response SLA"), /*#__PURE__*/React.createElement("select", {
    className: "gk-input",
    defaultValue: "4"
  }, /*#__PURE__*/React.createElement("option", {
    value: "2"
  }, "2 hours"), /*#__PURE__*/React.createElement("option", {
    value: "4"
  }, "4 hours"), /*#__PURE__*/React.createElement("option", {
    value: "8"
  }, "8 hours")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(AdBtn, {
    tone: "primary",
    icon: "device-floppy",
    onClick: () => toast("Node settings saved.")
  }, "Save changes"))), /*#__PURE__*/React.createElement(Panel, {
    title: "Node billing ledger"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      borderRadius: 12,
      background: "var(--green-bg)",
      border: "1px solid var(--green-bd)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "var(--green-fg)",
      letterSpacing: ".4px"
    }
  }, "MONTHLY RUN RATE"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 30,
      fontWeight: 800,
      color: "var(--green-fg)",
      marginTop: 6
    }
  }, "$2,838.58"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--green-fg)",
      opacity: .85,
      marginTop: 4
    }
  }, "142 pros \xB7 blended $19.99/mo + annual")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "flex",
      flexDirection: "column",
      gap: 0
    }
  }, [["Subscriptions (monthly)", "$1,919.04"], ["Annual amortized", "$782.54"], ["Lead surcharges", "$137.00"]].map(([k, v], i, a) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      justifyContent: "space-between",
      padding: "11px 0",
      borderBottom: i < a.length - 1 ? "1px solid var(--border)" : "none",
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-2)"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontWeight: 700
    }
  }, v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(AdBtn, {
    tone: "default",
    icon: "download",
    onClick: () => toast("Exporting node ledger…")
  }, "Export CSV"))))));
}
Object.assign(window, {
  V3_1_Ops,
  V3_2_Triage,
  V3_3_Safety,
  V3_4_Ledger,
  V3_5_Krafts,
  V3_6_Settings
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "screens/admin/views.jsx", error: String((e && e.message) || e) }); }

// screens/consumer/app.jsx
try { (() => {
/* global React, ReactDOM, PhoneFrame, BottomTab, Icon,
   S2_1_Discover, S2_2_ProofDetail, S2_3_Emergency, S2_4_QuoteChat, S2_5_Review, S2_6_Account */
const {
  useState,
  useEffect,
  useLayoutEffect,
  useRef
} = React;
const SCREENS = {
  s2_1: S2_1_Discover,
  s2_2: S2_2_ProofDetail,
  s2_3: S2_3_Emergency,
  s2_4: S2_4_QuoteChat,
  s2_5: S2_5_Review,
  account: S2_6_Account
};
const TABS = [{
  id: "s2_1",
  icon: "search",
  label: "Discover"
}, {
  id: "s2_4",
  icon: "message-circle",
  label: "Messages"
}, {
  id: "s2_3",
  icon: "urgent",
  label: "Emergency",
  primary: true
}, {
  id: "s2_5",
  icon: "star",
  label: "Recommend"
}, {
  id: "account",
  icon: "user",
  label: "You"
}];
const TAB_IDS = TABS.map(t => t.id);
const RAIL = [["s2_1", "2.1", "Discovery feed"], ["s2_2", "2.2", "Proof detail"], ["s2_3", "2.3", "Emergency broadcast"], ["s2_4", "2.4", "Request a quote"], ["s2_5", "2.5", "Leave a recommendation"], ["account", "2.6", "Your account"]];
function useScale() {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const calc = () => {
      const w = ref.current;
      if (!w) return;
      setScale(Math.min(1, (w.clientHeight - 24) / 836, (w.clientWidth - 24) / 398));
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (ref.current) ro.observe(ref.current);
    window.addEventListener("resize", calc);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", calc);
    };
  }, []);
  return [ref, scale];
}
function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("gk_theme") || "light");
  const [screen, setScreen] = useState(() => localStorage.getItem("gk_c_screen") || "s2_1");
  const [ctx, setCtx] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [wrapRef, scale] = useScale();
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("gk_theme", theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("gk_c_screen", screen);
  }, [screen]);
  const go = (s, payload) => {
    if (SCREENS[s] || s === "account") {
      setScreen(s);
      if (payload) setCtx(payload);
    }
  };
  const toast = m => {
    if (!m) return;
    setToastMsg(m);
    clearTimeout(window.__t);
    window.__t = setTimeout(() => setToastMsg(null), 2200);
  };
  const Active = SCREENS[screen] || S2_1_Discover;
  const tabBar = TAB_IDS.includes(screen) ? /*#__PURE__*/React.createElement(BottomTab, {
    tabs: TABS,
    active: screen,
    onTab: go
  }) : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: "100vh",
      width: "100vw",
      overflow: "hidden",
      background: "var(--bg-2)"
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 268,
      flex: "0 0 auto",
      borderRight: "1px solid var(--border)",
      background: "var(--surface)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 20px 16px",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      borderRadius: 9,
      background: "var(--teal-6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "home",
    size: 20,
    style: {
      color: "#fff"
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 17,
      letterSpacing: "-.3px",
      lineHeight: 1
    }
  }, "GigKraft"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, "Homeowner \xB7 6 screens"))), /*#__PURE__*/React.createElement("div", {
    className: "gk-scroll",
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "16px 12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-eyebrow",
    style: {
      padding: "0 10px 8px"
    }
  }, "Consumer / recommender"), RAIL.map(([id, num, label]) => {
    const on = screen === id;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => go(id),
      style: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px",
        marginBottom: 2,
        borderRadius: 9,
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        background: on ? "var(--tint)" : "transparent",
        color: on ? "var(--tint-text)" : "var(--text-2)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono",
      style: {
        fontSize: 11,
        fontWeight: 600,
        width: 26,
        color: on ? "var(--primary)" : "var(--text-3)"
      }
    }, num), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        fontWeight: on ? 700 : 500
      }
    }, label));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 16px",
      borderTop: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "../../GigKraft App.html",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 12.5,
      fontWeight: 600,
      color: "var(--text-3)",
      textDecoration: "none"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 15
  }), "All roles"))), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      flex: "0 0 auto",
      height: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      borderBottom: "1px solid var(--border)",
      background: "var(--surface)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15
    }
  }, RAIL.find(([id]) => id === screen)?.[2] || "Account", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-3)",
      fontWeight: 500,
      marginLeft: 8,
      fontSize: 13
    }
  }, "iPhone \xB7 390\xD7844")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setTheme(theme === "light" ? "dark" : "light"),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      height: 38,
      padding: "0 14px",
      borderRadius: 999,
      border: "1px solid var(--border-2)",
      background: "var(--surface)",
      color: "var(--text-2)",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: theme === "light" ? "moon" : "sun",
    size: 17
  }), theme === "light" ? "Dark" : "Light")), /*#__PURE__*/React.createElement("div", {
    ref: wrapRef,
    style: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      transform: `scale(${scale})`,
      transformOrigin: "center center"
    }
  }, /*#__PURE__*/React.createElement(PhoneFrame, null, /*#__PURE__*/React.createElement(Active, {
    go: go,
    toast: toast,
    ctx: ctx,
    tabBar: tabBar
  }))), toastMsg && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 28,
      left: "50%",
      transform: "translateX(-50%)",
      background: "var(--gray-9)",
      color: "#fff",
      padding: "11px 18px",
      borderRadius: 12,
      fontSize: 13.5,
      fontWeight: 600,
      boxShadow: "var(--shadow-lg)",
      display: "flex",
      alignItems: "center",
      gap: 8,
      maxWidth: 360,
      zIndex: 50
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-check-filled",
    size: 18,
    style: {
      color: "var(--blue-3)"
    }
  }), toastMsg))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "screens/consumer/app.jsx", error: String((e && e.message) || e) }); }

// screens/consumer/screens.jsx
try { (() => {
/* global React, AppBar, Screen, Body, Card, Btn, IconBtn, TextInput, Textarea, Select, Segmented, Icon, Eyebrow, Divider, Photo, BeforeAfter, Avatar, Badge, Chip, Stars, Slider */
// GigKraft Consumer — screens 2.1–2.6 (homeowner discovery, emergency, review, account).
const {
  useState: useC,
  useRef: useCRef,
  useEffect: useCEffect
} = React;
const PROOFS = [{
  id: "p1",
  pro: "Marcus Bell",
  trade: "Plumbing",
  title: "Copper riser re-pipe",
  dist: "1.4 mi",
  invoice: "$1,840",
  stars: 5,
  recs: 42,
  verified: true,
  tag: "Re-pipe"
}, {
  id: "p2",
  pro: "Tasha Quinn",
  trade: "Drywall & Paint",
  title: "Ceiling water-stain patch",
  dist: "2.1 mi",
  invoice: "$420",
  stars: 5,
  recs: 31,
  verified: true,
  tag: "Patch"
}, {
  id: "p3",
  pro: "Leo Park",
  trade: "Electrical",
  title: "Panel + EV charger",
  dist: "3.4 mi",
  invoice: "$2,160",
  stars: 4,
  recs: 27,
  verified: true,
  tag: "EV charger"
}, {
  id: "p4",
  pro: "Ramon Alvarez",
  trade: "HVAC",
  title: "Condenser swap",
  dist: "4.0 mi",
  invoice: "$3,400",
  stars: 5,
  recs: 38,
  verified: true,
  tag: "AC"
}];
const TRADES = ["All", "Plumbing", "Electrical", "HVAC", "Drywall", "Carpentry"];

/* 2.1 — Visual Discovery Feed */
function S2_1_Discover({
  go,
  tabBar
}) {
  const [trade, setTrade] = useC("All");
  const list = trade === "All" ? PROOFS : PROOFS.filter(p => p.trade.includes(trade));
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      title: "Discover proof",
      subtitle: "Node SW-04 \xB7 before/after, not reviews",
      right: /*#__PURE__*/React.createElement(IconBtn, {
        icon: "bell"
      })
    }),
    tabBar: tabBar
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 16px 6px",
      position: "sticky",
      top: 0,
      background: "var(--bg)",
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-input-wrap"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search",
    className: "gk-input-wrap__icon"
  }), /*#__PURE__*/React.createElement("input", {
    className: "gk-input",
    placeholder: "Search a job \u2014 \u201Cslab leak\u201D, \u201Cpanel\u201D\u2026"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      overflowX: "auto",
      marginTop: 10,
      paddingBottom: 2
    },
    className: "gk-scroll"
  }, TRADES.map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => setTrade(t),
    style: {
      flex: "0 0 auto",
      fontSize: 13,
      fontWeight: 600,
      padding: "7px 14px",
      borderRadius: 999,
      cursor: "pointer",
      border: `1px solid ${trade === t ? "var(--primary)" : "var(--border-2)"}`,
      background: trade === t ? "var(--tint)" : "var(--surface)",
      color: trade === t ? "var(--tint-text)" : "var(--text-2)"
    }
  }, t)))), /*#__PURE__*/React.createElement(Body, {
    style: {
      paddingTop: 6
    },
    gap: 12
  }, list.map(p => /*#__PURE__*/React.createElement(Card, {
    key: p.id,
    press: true,
    onClick: () => go("s2_2", p),
    style: {
      padding: 0,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(BeforeAfter, {
    h: 150,
    before: p.title,
    after: "verified result"
  }), p.verified && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 10,
      right: 10,
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontSize: 11,
      fontWeight: 700,
      padding: "5px 10px",
      borderRadius: 999,
      background: "var(--surface)",
      color: "var(--green-fg)",
      boxShadow: "var(--shadow-sm)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "discount-check-filled",
    size: 14
  }), "Verified invoice")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: p.pro,
    size: 38
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15
    }
  }, p.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--text-3)"
    }
  }, p.pro, " \xB7 ", p.trade)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 16
    }
  }, p.invoice), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-3)"
    }
  }, "actual cost"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginTop: 10,
      fontSize: 12.5,
      color: "var(--text-3)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 3
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "map-pin",
    size: 14
  }), p.dist), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 3
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "rosette-discount-check",
    size: 14
  }), p.recs, " recommendations"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      color: "var(--yellow-6)",
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "star-filled",
    size: 14
  }), p.stars, ".0")))))));
}

/* 2.2 — Pro Profile / Proof Detail */
function S2_2_ProofDetail({
  go,
  ctx
}) {
  const p = ctx || PROOFS[0];
  const more = [["Slab leak repair", "$980"], ["Water heater swap", "$1,250"], ["Faucet + disposal", "$310"]];
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      onBack: () => go("s2_1"),
      left: /*#__PURE__*/React.createElement(Avatar, {
        name: p.pro,
        size: 38
      }),
      title: p.pro,
      subtitle: `${p.trade} · ${p.dist}`,
      right: /*#__PURE__*/React.createElement(IconBtn, {
        icon: "heart"
      })
    }),
    footer: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Btn, {
      variant: "default",
      leftIcon: "message",
      auto: true,
      style: {
        flex: 1
      },
      onClick: () => go("s2_4")
    }, "Message"), /*#__PURE__*/React.createElement(Btn, {
      leftIcon: "file-dollar",
      auto: true,
      style: {
        flex: 2
      },
      onClick: () => go("s2_4")
    }, "Request a quote"))
  }, /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      gap: 14,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 800,
      color: "var(--primary)"
    }
  }, p.recs), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, "RECS")), /*#__PURE__*/React.createElement(Divider, {
    style: {
      width: 1,
      height: 40
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 800,
      color: "var(--yellow-6)"
    }
  }, p.stars, ".0"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, "RATING")), /*#__PURE__*/React.createElement(Divider, {
    style: {
      width: 1,
      height: 40
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "green",
    icon: "discount-check"
  }, "Verified"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)",
      marginTop: 6
    }
  }, "Licensed \xB7 Insured \xB7 4h response"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 8
    }
  }, "Featured Kraft \xB7 ", p.title), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 0,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(BeforeAfter, {
    h: 170,
    before: p.title,
    after: "copper, pressure-tested"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 12px",
      borderRadius: "var(--r-md)",
      background: "var(--green-bg)",
      border: "1px solid var(--green-bd)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "receipt",
    size: 18,
    style: {
      color: "var(--green-fg)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: "var(--green-fg)"
    }
  }, "Verified job invoice"), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      marginLeft: "auto",
      fontWeight: 800,
      color: "var(--green-fg)"
    }
  }, p.invoice)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: "var(--text-2)",
      lineHeight: 1.55,
      marginTop: 12
    }
  }, "Replaced corroded galvanized riser with type-L copper, pressure-tested the line and patched the drywall. Same-day invoice issued.")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 8
    }
  }, "More verified work"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, more.map(([t, c]) => /*#__PURE__*/React.createElement(Card, {
    key: t,
    press: true,
    style: {
      padding: 0,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(Photo, {
    h: 84,
    filled: true,
    tone: "after",
    label: t
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 10px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, t), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: "var(--green-fg)"
    }
  }, c)))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 8
    }
  }, "What clients say"), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Priya Shah",
    size: 34
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 13.5
    }
  }, "Priya Shah"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-3)"
    }
  }, "Repeat client")), /*#__PURE__*/React.createElement(Stars, {
    value: 5,
    size: 15
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: "var(--text-2)",
      lineHeight: 1.55
    }
  }, "\"Found the slab leak two other plumbers missed. Clean copper work, invoice same day.\"")))));
}

/* 2.3 — Emergency Broadcast */
const EM_TYPES = [{
  id: "burst",
  icon: "droplet",
  label: "Burst pipe / leak"
}, {
  id: "power",
  icon: "bolt",
  label: "Power / electrical"
}, {
  id: "hvac",
  icon: "temperature",
  label: "No heat / AC"
}, {
  id: "lock",
  icon: "lock",
  label: "Lock / door"
}, {
  id: "other",
  icon: "alert-triangle",
  label: "Other"
}];
function S2_3_Emergency({
  tabBar,
  go,
  toast
}) {
  const [type, setType] = useC("burst");
  const [budget, setBudget] = useC(150);
  const [sent, setSent] = useC(false);
  if (sent) {
    return /*#__PURE__*/React.createElement(Screen, {
      appBar: /*#__PURE__*/React.createElement(AppBar, {
        title: "Broadcast live"
      }),
      tabBar: tabBar
    }, /*#__PURE__*/React.createElement(Body, {
      gap: 16,
      style: {
        paddingTop: 28
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 84,
        height: 84,
        borderRadius: "50%",
        background: "var(--red-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        border: "2px solid var(--red-fg)",
        animation: "gkpulse 1.6s ease-out infinite"
      }
    }), /*#__PURE__*/React.createElement(Icon, {
      name: "broadcast",
      size: 40,
      style: {
        color: "var(--red-fg)"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 20,
        fontWeight: 800
      }
    }, "Dispatched to 8 local pros"), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--text-3)",
        fontSize: 14,
        maxWidth: 280
      }
    }, "Beamed over SMS + WhatsApp to proven pros within node SW-04. First to claim chats you directly.")), /*#__PURE__*/React.createElement(Card, {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, [["Marcus Bell", "Plumbing", "claimed · 1m"], ["Tasha Quinn", "Drywall", "notified"], ["Leo Park", "Electrical", "notified"]].map(([n, t, s]) => /*#__PURE__*/React.createElement("div", {
      key: n,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: n,
      size: 36
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 600,
        fontSize: 14
      }
    }, n), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--text-3)"
      }
    }, t)), /*#__PURE__*/React.createElement(Badge, {
      tone: s.includes("claimed") ? "green" : undefined
    }, s)))), /*#__PURE__*/React.createElement(Btn, {
      leftIcon: "message",
      onClick: () => go("s2_4")
    }, "Open chat with Marcus")), /*#__PURE__*/React.createElement("style", null, `@keyframes gkpulse{0%{transform:scale(1);opacity:.9}100%{transform:scale(1.5);opacity:0}}`));
  }
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      title: "Emergency broadcast",
      subtitle: "Blast nearby pros now",
      right: /*#__PURE__*/React.createElement(Badge, {
        tone: "red",
        icon: "bolt"
      }, "Live")
    }),
    tabBar: tabBar,
    footer: /*#__PURE__*/React.createElement(Btn, {
      variant: "danger",
      leftIcon: "broadcast",
      onClick: () => {
        setSent(true);
        toast("Broadcast sent to node SW-04.");
      },
      style: {
        background: "var(--red-6)",
        color: "#fff",
        border: "none"
      }
    }, "Broadcast to local pros")
  }, /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 8
    }
  }, "What's the emergency?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, EM_TYPES.map(e => /*#__PURE__*/React.createElement("button", {
    key: e.id,
    onClick: () => setType(e.id),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "13px 12px",
      borderRadius: "var(--r-md)",
      cursor: "pointer",
      background: type === e.id ? "var(--tint)" : "var(--surface)",
      border: `1px solid ${type === e.id ? "var(--primary)" : "var(--border-2)"}`,
      color: type === e.id ? "var(--tint-text)" : "var(--text-2)",
      fontWeight: 600,
      fontSize: 13.5,
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: e.icon,
    size: 20
  }), e.label)))), /*#__PURE__*/React.createElement(Textarea, {
    label: "Describe what's happening",
    rows: 3,
    defaultValue: "Kitchen pipe burst under the sink, water pooling on the floor. Shut-off valve isn't holding."
  }), /*#__PURE__*/React.createElement(TextInput, {
    label: "Address",
    icon: "map-pin",
    defaultValue: "1820 W Roosevelt St, 85007"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 10
    }
  }, "Budget ceiling"), /*#__PURE__*/React.createElement(Slider, {
    min: 50,
    max: 1000,
    value: budget,
    onChange: setBudget,
    unit: ""
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)",
      marginTop: 6
    }
  }, "Pros see this upfront \u2014 concrete budgets get faster claims.")), /*#__PURE__*/React.createElement(Card, {
    flat: true,
    style: {
      display: "flex",
      gap: 10,
      alignItems: "center",
      background: "var(--bg-2)",
      border: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "messages",
    size: 22,
    style: {
      color: "var(--text-2)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--text-2)"
    }
  }, "Sent over ", /*#__PURE__*/React.createElement("strong", null, "SMS + WhatsApp"), " to proven pros in your ZIP node."))));
}

/* 2.4 — Request a Quote / Chat with pro */
function S2_4_QuoteChat({
  go,
  toast,
  tabBar
}) {
  const [draft, setDraft] = useC("");
  const feedRef = useCRef(null);
  const [msgs, setMsgs] = useC([{
    me: true,
    t: "Hi Marcus — pipe burst under the kitchen sink. Can you come today?",
    time: "1:01 PM"
  }, {
    me: false,
    t: "On it. I can be there within the hour. Quote below — covers valve, fittings and cleanup.",
    time: "1:03 PM"
  }, {
    me: false,
    quote: true,
    time: "1:03 PM"
  }]);
  const send = () => {
    if (!draft.trim()) return;
    setMsgs([...msgs, {
      me: true,
      t: draft,
      time: "1:05 PM"
    }]);
    setDraft("");
  };
  useCEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [msgs]);
  return /*#__PURE__*/React.createElement(Screen, {
    scrollRef: feedRef,
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      onBack: () => go("s2_1"),
      left: /*#__PURE__*/React.createElement(Avatar, {
        name: "Marcus Bell",
        size: 38
      }),
      title: "Marcus Bell",
      subtitle: "Plumbing \xB7 1.4 mi \xB7 \u26A1 responds in 4h",
      right: /*#__PURE__*/React.createElement(IconBtn, {
        icon: "phone",
        onClick: () => toast("Calling Marcus…")
      })
    }),
    footer: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(IconBtn, {
      icon: "paperclip"
    }), /*#__PURE__*/React.createElement("input", {
      className: "gk-input",
      value: draft,
      onChange: e => setDraft(e.target.value),
      onKeyDown: e => e.key === "Enter" && send(),
      placeholder: "Message\u2026",
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("button", {
      className: "gk-btn gk-btn--filled gk-btn--auto",
      style: {
        width: 46,
        height: 46,
        padding: 0,
        borderRadius: 12
      },
      onClick: send
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "send"
    })))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      fontSize: 11,
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, "TODAY"), msgs.map((m, i) => m.quote ? /*#__PURE__*/React.createElement(Card, {
    key: i,
    style: {
      alignSelf: "flex-start",
      maxWidth: "88%",
      padding: 0,
      overflow: "hidden",
      border: "1px solid var(--primary)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 14px",
      background: "var(--tint)",
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "file-dollar",
    size: 18,
    style: {
      color: "var(--primary)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 13.5,
      color: "var(--tint-text)"
    }
  }, "Quote \xB7 Kitchen valve repair")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14
    }
  }, [["Emergency valve repair", "$120"], ["Fittings & solder", "$28"], ["Same-day call-out", "$0"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 13.5,
      padding: "5px 0",
      color: "var(--text-2)"
    }
  }, /*#__PURE__*/React.createElement("span", null, k), /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, v))), /*#__PURE__*/React.createElement(Divider, {
    style: {
      margin: "8px 0"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontWeight: 800,
      fontSize: 16
    }
  }, /*#__PURE__*/React.createElement("span", null, "Total"), /*#__PURE__*/React.createElement("span", {
    className: "mono"
  }, "$148")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "default",
    size: "sm",
    auto: true,
    style: {
      flex: 1
    }
  }, "Counter"), /*#__PURE__*/React.createElement(Btn, {
    size: "sm",
    leftIcon: "check",
    auto: true,
    style: {
      flex: 2
    },
    onClick: () => toast("Quote accepted — Marcus is on the way.")
  }, "Accept $148")))) : /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      alignSelf: m.me ? "flex-end" : "flex-start",
      maxWidth: "82%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 14px",
      borderRadius: 16,
      borderBottomRightRadius: m.me ? 4 : 16,
      borderBottomLeftRadius: m.me ? 16 : 4,
      background: m.me ? "var(--primary)" : "var(--surface)",
      color: m.me ? "#fff" : "var(--text)",
      border: m.me ? "none" : "1px solid var(--border)",
      fontSize: 14.5,
      lineHeight: 1.5
    }
  }, m.t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: "var(--text-3)",
      textAlign: m.me ? "right" : "left",
      marginTop: 3,
      padding: "0 4px"
    }
  }, m.time)))));
}

/* 2.5 — Leave a Recommendation (magic-link review) */
function S2_5_Review({
  go,
  toast
}) {
  const [stars, setStars] = useC(5);
  const [photos, setPhotos] = useC([true, false]);
  const [text, setText] = useC("Marcus found the slab leak two other plumbers missed. Clean copper work and the invoice came same day.");
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      title: "Recommend Marcus",
      subtitle: "Secure link \xB7 no account needed",
      onBack: () => go("s2_2")
    }),
    footer: /*#__PURE__*/React.createElement(Btn, {
      leftIcon: "rosette-discount-check",
      onClick: () => {
        toast("Recommendation submitted — thank you!");
        go("s2_1");
      }
    }, "Publish recommendation")
  }, /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Marcus Bell",
    size: 44
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700
    }
  }, "Marcus Bell"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--text-3)"
    }
  }, "Copper riser re-pipe \xB7 $1,840")), /*#__PURE__*/React.createElement(Badge, {
    tone: "green",
    icon: "check"
  }, "Job done")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 12
    }
  }, "How was the work?"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Stars, {
    value: stars,
    onChange: setStars,
    size: 38
  }))), /*#__PURE__*/React.createElement(Textarea, {
    label: "Tell other neighbors what happened",
    rows: 4,
    value: text,
    onChange: e => setText(e.target.value)
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 8
    }
  }, "Add your own before/after ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-3)",
      fontWeight: 500
    }
  }, "(optional)")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Photo, {
    h: 92,
    filled: photos[0],
    tone: "before",
    label: photos[0] ? "your before" : "Add before",
    dashed: !photos[0],
    onClick: () => setPhotos([true, photos[1]])
  }), /*#__PURE__*/React.createElement(Photo, {
    h: 92,
    filled: photos[1],
    tone: "after",
    accent: !photos[1],
    label: photos[1] ? "your after" : "Add after",
    dashed: !photos[1],
    onClick: () => setPhotos([photos[0], true])
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      fontSize: 12,
      color: "var(--text-3)",
      padding: "0 2px"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "lock",
    size: 15
  }), " Verified through your secure GigKraft review link.")));
}

/* 2.6 — Your account (homeowner) */
function S2_6_Account({
  tabBar,
  go,
  toast
}) {
  const [sms, setSms] = useC(true);
  const [whatsapp, setWhatsapp] = useC(true);
  const [digest, setDigest] = useC(false);
  const saved = [{
    pro: "Marcus Bell",
    trade: "Plumbing",
    dist: "1.4 mi",
    recs: 42,
    proof: PROOFS[0]
  }, {
    pro: "Leo Park",
    trade: "Electrical",
    dist: "3.4 mi",
    recs: 27,
    proof: PROOFS[2]
  }];
  const past = [{
    pro: "Marcus Bell",
    title: "Copper riser re-pipe",
    invoice: "$1,840",
    when: "Apr 2026",
    recommended: true
  }, {
    pro: "Tasha Quinn",
    title: "Ceiling water-stain patch",
    invoice: "$420",
    when: "Feb 2026",
    recommended: false
  }];
  const settings = [{
    icon: "map-pin",
    label: "Saved addresses",
    meta: "2 properties"
  }, {
    icon: "credit-card",
    label: "Payment methods",
    meta: "Visa ··4291"
  }, {
    icon: "shield-check",
    label: "Help & safety",
    meta: ""
  }];
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      title: "You",
      subtitle: "Homeowner \xB7 node SW-04",
      right: /*#__PURE__*/React.createElement(IconBtn, {
        icon: "settings",
        onClick: () => toast("Account settings")
      })
    }),
    tabBar: tabBar
  }, /*#__PURE__*/React.createElement(Body, {
    gap: 16
  }, /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Jordan Avery",
    size: 56
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 18,
      letterSpacing: "-.3px"
    }
  }, "Jordan Avery"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--text-3)",
      display: "flex",
      alignItems: "center",
      gap: 4,
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "map-pin",
    size: 13
  }), "1820 W Roosevelt St \xB7 85007")), /*#__PURE__*/React.createElement(Btn, {
    variant: "default",
    size: "sm",
    auto: true,
    onClick: () => toast("Edit profile")
  }, "Edit")), /*#__PURE__*/React.createElement(Card, {
    flat: true,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-around",
      background: "var(--bg-2)",
      border: "1px solid var(--border)"
    }
  }, [["4", "Jobs hired"], ["6", "Saved pros"], ["3", "Recs given"]].map(([v, k], i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: k
  }, i > 0 && /*#__PURE__*/React.createElement(Divider, {
    style: {
      width: 1,
      height: 34
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "2px 4px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      letterSpacing: "-.5px"
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-3)",
      fontWeight: 600,
      marginTop: 2
    }
  }, k))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Saved pros"), /*#__PURE__*/React.createElement("button", {
    onClick: () => go("s2_1"),
    style: {
      marginLeft: "auto",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: 12.5,
      fontWeight: 700,
      color: "var(--primary)"
    }
  }, "Discover more")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, saved.map(s => /*#__PURE__*/React.createElement(Card, {
    key: s.pro,
    press: true,
    onClick: () => go("s2_2", s.proof),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: s.pro,
    size: 40
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14.5
    }
  }, s.pro), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)",
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: 1,
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/React.createElement("span", null, s.trade), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "map-pin",
    size: 12
  }), s.dist), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "rosette-discount-check",
    size: 12
  }), s.recs))), /*#__PURE__*/React.createElement(IconBtn, {
    icon: "message",
    onClick: e => {
      e.stopPropagation();
      go("s2_4");
    }
  }))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 8
    }
  }, "Past jobs"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, past.map(j => /*#__PURE__*/React.createElement(Card, {
    key: j.title,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Photo, {
    h: 48,
    filled: true,
    tone: "after",
    label: "",
    icon: "check"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, j.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)",
      marginTop: 1
    }
  }, j.pro, " \xB7 ", j.when)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontWeight: 800,
      fontSize: 13.5,
      color: "var(--green-fg)"
    }
  }, j.invoice), j.recommended ? /*#__PURE__*/React.createElement(Badge, {
    tone: "green",
    icon: "check"
  }, "Recommended") : /*#__PURE__*/React.createElement("button", {
    onClick: () => go("s2_5"),
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: 12,
      fontWeight: 700,
      color: "var(--primary)",
      display: "inline-flex",
      alignItems: "center",
      gap: 3
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "star",
    size: 13
  }), "Recommend")))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 8
    }
  }, "Dispatch alerts"), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement(SwitchRow, {
    label: "SMS alerts",
    desc: "Pro claims & quote updates by text",
    on: sms,
    onChange: setSms
  }), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(SwitchRow, {
    label: "WhatsApp dispatch",
    desc: "Emergency broadcasts to nearby pros",
    on: whatsapp,
    onChange: setWhatsapp
  }), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(SwitchRow, {
    label: "Weekly node digest",
    desc: "New verified Krafts in node SW-04",
    on: digest,
    onChange: setDigest
  }))), /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 0,
      overflow: "hidden"
    }
  }, settings.map((s, i) => /*#__PURE__*/React.createElement("button", {
    key: s.label,
    onClick: () => toast(s.label),
    style: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "13px 14px",
      background: "none",
      border: "none",
      borderTop: i > 0 ? "1px solid var(--border)" : "none",
      cursor: "pointer",
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: s.icon,
    size: 20,
    style: {
      color: "var(--text-2)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 14,
      fontWeight: 600,
      color: "var(--text)"
    }
  }, s.label), s.meta && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: "var(--text-3)"
    }
  }, s.meta), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 18,
    style: {
      color: "var(--text-3)"
    }
  })))), /*#__PURE__*/React.createElement(Btn, {
    variant: "default",
    leftIcon: "logout",
    onClick: () => toast("Signed out"),
    style: {
      color: "var(--red-fg)"
    }
  }, "Sign out"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      fontSize: 11,
      color: "var(--text-3)",
      paddingBottom: 4
    }
  }, "GigKraft \xB7 node southwest-us-04 \xB7 v1.0")));
}
Object.assign(window, {
  S2_1_Discover,
  S2_2_ProofDetail,
  S2_3_Emergency,
  S2_4_QuoteChat,
  S2_5_Review,
  S2_6_Account
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "screens/consumer/screens.jsx", error: String((e && e.message) || e) }); }

// screens/handyman/app.jsx
try { (() => {
/* global React, ReactDOM, PhoneFrame, BottomTab, Icon,
   S1_1_Auth, S1_2_ServiceArea, S1_3_Visual, S1_4_Credentials, S1_5_Categorization,
   S1_6_ProjectCreator, S1_7_RecRequest, S1_8_Moderation, S1_9_Leads, S1_10_Chat,
   S1_11_Analytics, S1_12_Billing, S1_13_Network, AccountHub */
const {
  useState,
  useEffect,
  useLayoutEffect,
  useRef
} = React;
const SCREENS = {
  s1_1: S1_1_Auth,
  s1_2: S1_2_ServiceArea,
  s1_3: S1_3_Visual,
  s1_4: S1_4_Credentials,
  s1_5: S1_5_Categorization,
  s1_6: S1_6_ProjectCreator,
  s1_7: S1_7_RecRequest,
  s1_8: S1_8_Moderation,
  s1_9: S1_9_Leads,
  s1_10: S1_10_Chat,
  s1_11: S1_11_Analytics,
  s1_12: S1_12_Billing,
  s1_13: S1_13_Network,
  account: AccountHub
};
const TABS = [{
  id: "s1_9",
  icon: "inbox",
  iconOn: "inbox",
  label: "Leads"
}, {
  id: "s1_11",
  icon: "chart-bar",
  label: "Stats"
}, {
  id: "s1_6",
  icon: "plus",
  label: "Add",
  primary: true
}, {
  id: "s1_13",
  icon: "users",
  label: "Network"
}, {
  id: "account",
  icon: "user",
  label: "Account"
}];
const TAB_IDS = TABS.map(t => t.id);
const RAIL = [{
  group: "Onboarding & account",
  items: [["s1_1", "1.1", "Authentication"], ["s1_2", "1.2", "Service area"], ["s1_3", "1.3", "Visual customization"], ["s1_4", "1.4", "Credentials"], ["s1_5", "1.5", "Categorization"]]
}, {
  group: "Portfolio & recommendations",
  items: [["s1_6", "1.6", "Project creator"], ["s1_7", "1.7", "Recommendation request"], ["s1_8", "1.8", "Moderation queue"]]
}, {
  group: "Leads & communication",
  items: [["s1_9", "1.9", "Leads dashboard"], ["s1_10", "1.10", "Direct chat"]]
}, {
  group: "Business operations",
  items: [["s1_11", "1.11", "Performance & analytics"], ["s1_12", "1.12", "Subscription & billing"], ["s1_13", "1.13", "B2B network"]]
}];
function useScale() {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const calc = () => {
      const wrap = ref.current;
      if (!wrap) return;
      const availH = wrap.clientHeight - 24;
      const availW = wrap.clientWidth - 24;
      setScale(Math.min(1, availH / 836, availW / 398));
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (ref.current) ro.observe(ref.current);
    window.addEventListener("resize", calc);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", calc);
    };
  }, []);
  return [ref, scale];
}
function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("gk_theme") || "light");
  const [screen, setScreen] = useState(() => localStorage.getItem("gk_screen") || "s1_9");
  const [toastMsg, setToastMsg] = useState(null);
  const [wrapRef, scale] = useScale();
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("gk_theme", theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("gk_screen", screen);
  }, [screen]);
  const go = s => {
    if (SCREENS[s]) setScreen(s);
  };
  const toast = m => {
    if (!m) return;
    setToastMsg(m);
    clearTimeout(window.__t);
    window.__t = setTimeout(() => setToastMsg(null), 2200);
  };
  const Active = SCREENS[screen];
  const tabBar = TAB_IDS.includes(screen) ? /*#__PURE__*/React.createElement(BottomTab, {
    tabs: TABS,
    active: screen,
    onTab: go
  }) : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: "100vh",
      width: "100vw",
      overflow: "hidden",
      background: "var(--bg-2)"
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 268,
      flex: "0 0 auto",
      borderRight: "1px solid var(--border)",
      background: "var(--surface)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 20px 16px",
      borderBottom: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      borderRadius: 9,
      background: "var(--primary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "tools",
    size: 20,
    style: {
      color: "#fff"
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 17,
      letterSpacing: "-.3px",
      lineHeight: 1
    }
  }, "GigKraft"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, "Handyman \xB7 13 screens")))), /*#__PURE__*/React.createElement("div", {
    className: "gk-scroll",
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "12px 12px 24px"
    }
  }, RAIL.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.group,
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-eyebrow",
    style: {
      padding: "6px 10px"
    }
  }, g.group), g.items.map(([id, num, label]) => {
    const on = screen === id;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => go(id),
      style: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 10px",
        marginBottom: 2,
        borderRadius: 9,
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        background: on ? "var(--tint)" : "transparent",
        color: on ? "var(--tint-text)" : "var(--text-2)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "mono",
      style: {
        fontSize: 11,
        fontWeight: 600,
        width: 26,
        color: on ? "var(--primary)" : "var(--text-3)"
      }
    }, num), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        fontWeight: on ? 700 : 500
      }
    }, label));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 16px",
      borderTop: "1px solid var(--border)",
      fontSize: 11,
      color: "var(--text-3)",
      lineHeight: 1.5
    }
  }, "Mantine + Tabler \xB7 click any screen or use the in\u2011app tab bar.")), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      flex: "0 0 auto",
      height: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      borderBottom: "1px solid var(--border)",
      background: "var(--surface)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 15
    }
  }, RAIL.flatMap(g => g.items).find(([id]) => id === screen)?.[2] || (screen === "account" ? "Account" : ""), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-3)",
      fontWeight: 500,
      marginLeft: 8,
      fontSize: 13
    }
  }, "iPhone \xB7 390\xD7844")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setTheme(theme === "light" ? "dark" : "light"),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      height: 38,
      padding: "0 14px",
      borderRadius: 999,
      border: "1px solid var(--border-2)",
      background: "var(--surface)",
      color: "var(--text-2)",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: theme === "light" ? "moon" : "sun",
    size: 17
  }), theme === "light" ? "Dark" : "Light")), /*#__PURE__*/React.createElement("div", {
    ref: wrapRef,
    style: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      transform: `scale(${scale})`,
      transformOrigin: "center center"
    }
  }, /*#__PURE__*/React.createElement(PhoneFrame, null, /*#__PURE__*/React.createElement(Active, {
    go: go,
    toast: toast,
    tabBar: tabBar
  }))), toastMsg && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 28,
      left: "50%",
      transform: "translateX(-50%)",
      background: "var(--gray-9)",
      color: "#fff",
      padding: "11px 18px",
      borderRadius: 12,
      fontSize: 13.5,
      fontWeight: 600,
      boxShadow: "var(--shadow-lg)",
      display: "flex",
      alignItems: "center",
      gap: 8,
      maxWidth: 360,
      zIndex: 50
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "circle-check-filled",
    size: 18,
    style: {
      color: "var(--blue-3)"
    }
  }), toastMsg))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "screens/handyman/app.jsx", error: String((e && e.message) || e) }); }

// screens/handyman/business.jsx
try { (() => {
/* global React, AppBar, Screen, Body, Card, Btn, IconBtn, TextInput, Icon, Eyebrow, Divider, Photo, Avatar, Badge, Segmented, Stat, BarChart */
// GigKraft Handyman — Analytics, Billing, Network + Account hub (1.11–1.13).
const {
  useState: useStateB
} = React;

/* 1.11 — Performance & Analytics */
function S1_11_Analytics({
  tabBar
}) {
  const [range, setRange] = useStateB("30");
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      title: "Performance",
      subtitle: "Your numbers in node SW\u201104",
      right: /*#__PURE__*/React.createElement(IconBtn, {
        icon: "download"
      })
    }),
    tabBar: tabBar
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 16px 6px",
      position: "sticky",
      top: 0,
      background: "var(--bg)",
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement(Segmented, {
    value: range,
    onChange: setRange,
    options: [{
      value: "7",
      label: "7 days"
    }, {
      value: "30",
      label: "30 days"
    }, {
      value: "90",
      label: "90 days"
    }]
  })), /*#__PURE__*/React.createElement(Body, {
    style: {
      paddingTop: 6
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Profile"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    k: "Profile views",
    v: "1,284",
    delta: "+18%",
    icon: "eye"
  }), /*#__PURE__*/React.createElement(Stat, {
    k: "Search appearances",
    v: "3,902",
    delta: "+9%",
    icon: "search"
  }), /*#__PURE__*/React.createElement(Stat, {
    k: "Link clicks",
    v: "221",
    delta: "+24%",
    icon: "link"
  }), /*#__PURE__*/React.createElement(Stat, {
    k: "Won jobs",
    v: "14",
    delta: "+3",
    icon: "briefcase"
  })), /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginTop: 4
    }
  }, "Leads"), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, "Conversion rate"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 28,
      fontWeight: 800,
      letterSpacing: "-.5px"
    }
  }, "38%"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)"
    }
  }, "14 won of 37 inquiries")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 76,
      height: 76,
      borderRadius: "50%",
      background: `conic-gradient(var(--primary) 0 38%, var(--bg-2) 38% 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      borderRadius: "50%",
      background: "var(--surface)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 800,
      fontSize: 14
    }
  }, "38%"))), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 10,
      background: "var(--green-bg)",
      color: "var(--green-fg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock-check",
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700
    }
  }, "Avg response 1h 52m"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)"
    }
  }, "Well inside your 4\u2011hour promise")), /*#__PURE__*/React.createElement(Badge, {
    tone: "green",
    icon: "check"
  }, "On target"))), /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginTop: 4
    }
  }, "Revenue"), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 26,
      fontWeight: 800,
      letterSpacing: "-.5px"
    }
  }, "$11,460"), /*#__PURE__*/React.createElement(Badge, {
    tone: "green",
    icon: "trending-up"
  }, "+22% vs prev")), /*#__PURE__*/React.createElement(BarChart, {
    data: [{
      l: "Jan",
      v: 1.2
    }, {
      l: "Feb",
      v: 1.6
    }, {
      l: "Mar",
      v: 1.4
    }, {
      l: "Apr",
      v: 2.1
    }, {
      l: "May",
      v: 2.4
    }, {
      l: "Jun",
      v: 2.7,
      hl: true
    }]
  })), /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginTop: 4
    }
  }, "Trust"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    k: "Approved recs",
    v: "42",
    icon: "rosette-discount-check"
  }), /*#__PURE__*/React.createElement(Stat, {
    k: "Pending requests",
    v: "3",
    icon: "hourglass",
    deltaTone: "muted"
  }))));
}

/* 1.12 — Subscription & Billing */
const INVOICES = [{
  id: "GK‑20460",
  date: "Jun 1, 2026",
  amt: "$199.00"
}, {
  id: "GK‑19884",
  date: "Jun 1, 2025",
  amt: "$199.00"
}, {
  id: "GK‑11237",
  date: "Apr 12, 2025",
  amt: "$19.99"
}];
function S1_12_Billing({
  go,
  toast
}) {
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      title: "Subscription & billing",
      onBack: () => go("account")
    })
  }, /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement(Card, {
    padLg: true,
    style: {
      background: "linear-gradient(135deg, var(--blue-7), var(--blue-9))",
      border: "none",
      color: "#fff"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: ".5px",
      opacity: .8
    }
  }, "CURRENT PLAN"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      marginTop: 4
    }
  }, "Pro Vault \xB7 Annual")), /*#__PURE__*/React.createElement(Icon, {
    name: "discount-check-filled",
    size: 30,
    style: {
      opacity: .9
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      fontSize: 13,
      opacity: .85
    }
  }, "Renews ", /*#__PURE__*/React.createElement("strong", null, "June 1, 2027"), " \xB7 $199/yr")), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(TextInput, {
    label: "Coupon code",
    icon: "ticket",
    placeholder: "Enter code",
    defaultValue: ""
  }), /*#__PURE__*/React.createElement(Btn, {
    variant: "light",
    size: "sm",
    onClick: () => toast("Coupon applied — 20% off next renewal.")
  }, "Apply coupon")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 8
    }
  }, "Payment method"), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 42,
      height: 30,
      borderRadius: 6,
      background: "var(--bg-2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "credit-card",
    size: 20,
    style: {
      color: "var(--text-2)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14
    },
    className: "mono"
  }, "\u2022\u2022\u2022\u2022 8832"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)"
    }
  }, "Visa \xB7 expires 12/28")), /*#__PURE__*/React.createElement(Btn, {
    variant: "default",
    size: "xs",
    onClick: () => toast("Opening secure card update…")
  }, "Update"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 8
    }
  }, "Billing history"), /*#__PURE__*/React.createElement(Card, {
    flat: true,
    style: {
      padding: 4
    }
  }, INVOICES.map((inv, i) => /*#__PURE__*/React.createElement("div", {
    key: inv.id
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 10px"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "file-invoice",
    size: 20,
    style: {
      color: "var(--text-3)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14
    },
    className: "mono"
  }, inv.id), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)"
    }
  }, inv.date)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 14
    }
  }, inv.amt), /*#__PURE__*/React.createElement(IconBtn, {
    icon: "download",
    onClick: () => toast("Downloading " + inv.id)
  })), i < INVOICES.length - 1 && /*#__PURE__*/React.createElement(Divider, null)))))));
}

/* 1.13 — B2B Networking Search */
const PROS = [{
  name: "Tasha Quinn",
  trade: "Drywall & Paint",
  dist: "2.1 mi",
  phone: "(602) 555‑0192",
  tags: ["Patch", "Texture"]
}, {
  name: "Leo Park",
  trade: "Electrical",
  dist: "3.4 mi",
  phone: "(602) 555‑0177",
  tags: ["Panels", "EV chargers"]
}, {
  name: "Ramon Alvarez",
  trade: "HVAC",
  dist: "4.0 mi",
  phone: "(480) 555‑0143",
  tags: ["AC", "Ducting"]
}, {
  name: "Bea Foster",
  trade: "Tile & Flooring",
  dist: "5.2 mi",
  phone: "(480) 555‑0110",
  tags: ["Bath", "LVP"]
}];
function S1_13_Network({
  tabBar,
  toast
}) {
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      title: "Pro network",
      subtitle: "Find complementary trades to refer"
    }),
    tabBar: tabBar
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 16px 6px",
      position: "sticky",
      top: 0,
      background: "var(--bg)",
      zIndex: 2,
      display: "flex",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-input-wrap",
    style: {
      flex: 2
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "tools",
    className: "gk-input-wrap__icon"
  }), /*#__PURE__*/React.createElement("input", {
    className: "gk-input",
    placeholder: "Trade or skill",
    defaultValue: ""
  })), /*#__PURE__*/React.createElement("div", {
    className: "gk-input-wrap",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "gk-input mono",
    placeholder: "ZIP",
    defaultValue: "85004"
  }))), /*#__PURE__*/React.createElement(Body, {
    style: {
      paddingTop: 6
    },
    gap: 10
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)",
      fontWeight: 600
    }
  }, PROS.length, " pros near 85004"), PROS.map(p => /*#__PURE__*/React.createElement(Card, {
    key: p.name,
    style: {
      display: "flex",
      gap: 12,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: p.name,
    size: 46
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700
    }
  }, p.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--primary)",
      fontWeight: 600
    }
  }, p.trade), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginTop: 6,
      flexWrap: "wrap"
    }
  }, p.tags.map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: "var(--text-3)",
      background: "var(--bg-2)",
      padding: "2px 8px",
      borderRadius: 999
    }
  }, t)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--text-3)",
      display: "inline-flex",
      alignItems: "center",
      gap: 3
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "map-pin",
    size: 13
  }), p.dist), /*#__PURE__*/React.createElement(IconBtn, {
    icon: "phone",
    onClick: () => toast("Calling " + p.name)
  }))))));
}

/* Account hub — ties the secondary screens together (Account tab) */
function AccountHub({
  go,
  tabBar
}) {
  const groups = [{
    title: "Recommendations",
    items: [{
      icon: "send",
      label: "Request a recommendation",
      to: "s1_7"
    }, {
      icon: "checkup-list",
      label: "Review queue",
      to: "s1_8",
      badge: "3"
    }]
  }, {
    title: "Profile",
    items: [{
      icon: "map-pin",
      label: "Service area",
      to: "s1_2"
    }, {
      icon: "photo",
      label: "Profile look",
      to: "s1_3"
    }, {
      icon: "shield-check",
      label: "Credentials",
      to: "s1_4"
    }, {
      icon: "tools",
      label: "Trade & skills",
      to: "s1_5"
    }]
  }, {
    title: "Account",
    items: [{
      icon: "credit-card",
      label: "Subscription & billing",
      to: "s1_12"
    }]
  }];
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      title: "Account",
      right: /*#__PURE__*/React.createElement(IconBtn, {
        icon: "settings"
      })
    }),
    tabBar: tabBar
  }, /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Marcus Bell",
    size: 56
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 17
    }
  }, "Marcus Bell"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text-3)"
    }
  }, "Plumbing Pro \xB7 SW\u201104"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "green",
    icon: "discount-check"
  }, "Verified"), /*#__PURE__*/React.createElement(Badge, {
    tone: "blue",
    icon: "shield-check"
  }, "Insured")))), groups.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.title
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 8
    }
  }, g.title), /*#__PURE__*/React.createElement(Card, {
    flat: true,
    style: {
      padding: 4
    }
  }, g.items.map((it, i) => /*#__PURE__*/React.createElement("div", {
    key: it.label
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => go(it.to),
    style: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "13px 10px",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "var(--text)",
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: it.icon,
    size: 20,
    style: {
      color: "var(--text-2)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontWeight: 600,
      fontSize: 14.5
    }
  }, it.label), it.badge && /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 20,
      height: 20,
      borderRadius: 999,
      background: "var(--primary)",
      color: "#fff",
      fontSize: 11,
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 6px"
    }
  }, it.badge), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 18,
    style: {
      color: "var(--text-3)"
    }
  })), i < g.items.length - 1 && /*#__PURE__*/React.createElement(Divider, null))))))));
}
Object.assign(window, {
  S1_11_Analytics,
  S1_12_Billing,
  S1_13_Network,
  AccountHub
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "screens/handyman/business.jsx", error: String((e && e.message) || e) }); }

// screens/handyman/leads.jsx
try { (() => {
/* global React, AppBar, Screen, Body, Card, Btn, IconBtn, Icon, Eyebrow, Divider, Photo, Avatar, Badge, Segmented */
// GigKraft Handyman — Leads & Communication screens 1.9–1.10.
const {
  useState: useStateL,
  useRef: useRefL,
  useEffect: useEffectL
} = React;
const LEADS = {
  active: [{
    id: "jenkins",
    name: "Tom Jenkins",
    job: "Kitchen valve leak",
    frag: "Water's isolated at the street valve but the floor is getting soggy — can you fix today?",
    when: "12m",
    unread: 2,
    left: "3h 48m",
    urgent: false
  }, {
    id: "shah",
    name: "Priya Shah",
    job: "Water heater swap",
    frag: "Can you quote a 50‑gal water heater replacement for next week?",
    when: "1h",
    unread: 1,
    left: "2h 10m",
    urgent: false
  }, {
    id: "castellano",
    name: "R. Castellano",
    job: "Garbage disposal",
    frag: "Disposal just hums and won't spin. Smells a bit electrical.",
    when: "3h",
    unread: 0,
    left: "38m",
    urgent: true
  }],
  progress: [{
    id: "whitfield",
    name: "Dana Whitfield",
    job: "Water heater install",
    frag: "Great — see you at 2pm. I'll leave the side gate open.",
    when: "Today",
    unread: 0,
    tag: "Scheduled"
  }, {
    id: "okafor",
    name: "M. Okafor",
    job: "Slab leak repair",
    frag: "Invoice received, thank you! Booking the drywall patch.",
    when: "Today",
    unread: 0,
    tag: "Quoted"
  }],
  archived: [{
    id: "ortega",
    name: "Carl & Mei Ortega",
    job: "Re‑pipe",
    frag: "Job closed · $1,840 · 5★ recommendation",
    when: "May 28",
    unread: 0,
    tag: "Won"
  }, {
    id: "tran",
    name: "L. Tran",
    job: "Faucet replace",
    frag: "Job closed · $180",
    when: "May 24",
    unread: 0,
    tag: "Won"
  }]
};

/* 1.9 — Leads Dashboard */
function S1_9_Leads({
  go,
  tabBar
}) {
  const [tab, setTab] = useStateL("active");
  const list = LEADS[tab];
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      title: "Leads",
      subtitle: "Node SW\u201104 \xB7 4\u2011hour response promise",
      right: /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex"
        }
      }, /*#__PURE__*/React.createElement(IconBtn, {
        icon: "search"
      }), /*#__PURE__*/React.createElement(IconBtn, {
        icon: "bell"
      }))
    }),
    tabBar: tabBar
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 16px 8px",
      position: "sticky",
      top: 0,
      background: "var(--bg)",
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement(Segmented, {
    value: tab,
    onChange: setTab,
    options: [{
      value: "active",
      label: "Active"
    }, {
      value: "progress",
      label: "In‑progress"
    }, {
      value: "archived",
      label: "Archived"
    }]
  })), /*#__PURE__*/React.createElement(Body, {
    style: {
      paddingTop: 4
    },
    gap: 10
  }, list.map(l => /*#__PURE__*/React.createElement(Card, {
    key: l.id,
    press: true,
    onClick: () => go("s1_10"),
    style: {
      display: "flex",
      gap: 12,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: l.name,
    size: 44
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      fontSize: 15
    }
  }, l.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--text-3)",
      marginLeft: "auto"
    }
  }, l.when)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--primary)",
      fontWeight: 600,
      margin: "1px 0 4px"
    }
  }, l.job), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text-3)",
      lineHeight: 1.4,
      overflow: "hidden",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical"
    }
  }, l.frag), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: 8
    }
  }, tab === "active" ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      fontSize: 11,
      fontWeight: 700,
      padding: "3px 8px",
      borderRadius: 999,
      background: l.urgent ? "var(--red-bg)" : "var(--green-bg)",
      color: l.urgent ? "var(--red-fg)" : "var(--green-fg)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "clock",
    size: 13
  }), l.left, " left") : /*#__PURE__*/React.createElement(Badge, {
    tone: l.tag === "Won" ? "green" : "blue"
  }, l.tag), l.unread > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      minWidth: 20,
      height: 20,
      borderRadius: 999,
      background: "var(--primary)",
      color: "#fff",
      fontSize: 11,
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 6px"
    }
  }, l.unread))))), tab === "archived" && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--text-3)",
      fontSize: 13,
      padding: 8
    }
  }, "2 jobs won \xB7 $2,020 lifetime in this view")));
}

/* 1.10 — Direct Chat Interface */
const QUICK = [{
  label: "Send quote",
  icon: "file-dollar"
}, {
  label: "Send invoice",
  icon: "receipt"
}, {
  label: "Mark complete",
  icon: "circle-check"
}, {
  label: "Request review",
  icon: "star"
}];
function S1_10_Chat({
  go,
  toast
}) {
  const [draft, setDraft] = useStateL("Heading over now — torch and fittings are in the rig.");
  const feedRef = useRefL(null);
  const [msgs, setMsgs] = useStateL([{
    me: false,
    t: "Water's isolated at the street valve but the kitchen floor is getting soggy. Can you fix today?",
    time: "1:02 PM"
  }, {
    me: true,
    t: "Yes — I can be there within the hour. Holding to the $120 valve‑repair baseline.",
    time: "1:04 PM"
  }, {
    me: false,
    t: "Perfect. Here's the access photo.",
    time: "1:05 PM",
    photo: true
  }]);
  const send = () => {
    if (!draft.trim()) return;
    setMsgs([...msgs, {
      me: true,
      t: draft,
      time: "1:06 PM"
    }]);
    setDraft("");
  };
  useEffectL(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [msgs]);
  return /*#__PURE__*/React.createElement(Screen, {
    scrollRef: feedRef,
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      onBack: () => go("s1_9"),
      left: /*#__PURE__*/React.createElement(Avatar, {
        name: "Tom Jenkins",
        size: 38
      }),
      title: "Tom Jenkins",
      subtitle: "Kitchen valve leak \xB7 1.4 mi",
      right: /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex"
        }
      }, /*#__PURE__*/React.createElement(IconBtn, {
        icon: "phone",
        onClick: () => toast("Calling…")
      }), /*#__PURE__*/React.createElement(IconBtn, {
        icon: "dots-vertical"
      }))
    }),
    footer: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        overflowX: "auto",
        margin: "0 -16px",
        padding: "0 16px"
      },
      className: "gk-scroll"
    }, QUICK.map(q => /*#__PURE__*/React.createElement("button", {
      key: q.label,
      onClick: () => toast(q.label + " sent."),
      style: {
        flex: "0 0 auto",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12.5,
        fontWeight: 600,
        padding: "7px 12px",
        borderRadius: 999,
        border: "1px solid var(--border-2)",
        background: "var(--surface)",
        color: "var(--text-2)",
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: q.icon,
      size: 15
    }), q.label))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(IconBtn, {
      icon: "paperclip",
      onClick: () => toast("Attach a photo, quote or invoice")
    }), /*#__PURE__*/React.createElement("input", {
      className: "gk-input",
      value: draft,
      onChange: e => setDraft(e.target.value),
      onKeyDown: e => e.key === "Enter" && send(),
      placeholder: "Message\u2026",
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("button", {
      className: "gk-btn gk-btn--filled gk-btn--auto",
      style: {
        width: 46,
        height: 46,
        padding: 0,
        borderRadius: 12
      },
      onClick: send
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "send"
    }))))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      fontSize: 11,
      color: "var(--text-3)",
      fontWeight: 600,
      margin: "2px 0 6px"
    }
  }, "TODAY"), msgs.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      alignSelf: m.me ? "flex-end" : "flex-start",
      maxWidth: "82%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: m.photo ? 6 : "10px 14px",
      borderRadius: 16,
      borderBottomRightRadius: m.me ? 4 : 16,
      borderBottomLeftRadius: m.me ? 16 : 4,
      background: m.me ? "var(--primary)" : "var(--surface)",
      color: m.me ? "#fff" : "var(--text)",
      border: m.me ? "none" : "1px solid var(--border)",
      fontSize: 14.5,
      lineHeight: 1.5
    }
  }, m.photo ? /*#__PURE__*/React.createElement(Photo, {
    h: 120,
    filled: true,
    label: "under\u2011sink access"
  }) : m.t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: "var(--text-3)",
      textAlign: m.me ? "right" : "left",
      marginTop: 3,
      padding: "0 4px"
    }
  }, m.time)))));
}
Object.assign(window, {
  S1_9_Leads,
  S1_10_Chat
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "screens/handyman/leads.jsx", error: String((e && e.message) || e) }); }

// screens/handyman/onboarding.jsx
try { (() => {
/* global React, AppBar, Screen, Steps, Body, Card, Btn, TextInput, Textarea, Select, Segmented, Switch, SwitchRow, Slider, Chip, Icon, Eyebrow, Divider, Photo, Avatar, Badge */
// GigKraft Handyman — Onboarding screens 1.1–1.5.
const {
  useState: useStateOnb
} = React;
function OnbHead({
  title,
  step,
  onBack
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "0 0 auto",
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      paddingBottom: 10
    }
  }, /*#__PURE__*/React.createElement(AppBar, {
    title: title,
    subtitle: `Step ${step + 1} of 5 · Pro onboarding`,
    onBack: onBack,
    right: /*#__PURE__*/React.createElement("button", {
      className: "gk-btn gk-btn--subtle gk-btn--xs",
      style: {
        color: "var(--text-3)"
      }
    }, "Skip")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 10
    }
  }, /*#__PURE__*/React.createElement(Steps, {
    total: 5,
    current: step
  })));
}

/* 1.1 — Authentication (Signup / Login) */
function S1_1_Auth({
  go
}) {
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(OnbHead, {
      title: "Create your account",
      step: 0
    }),
    footer: /*#__PURE__*/React.createElement(Btn, {
      rightIcon: "arrow-right",
      onClick: () => go("s1_2")
    }, "Continue")
  }, /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 800,
      letterSpacing: "-.5px"
    }
  }, "Join the proof network."), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--text-3)",
      marginTop: 4,
      fontSize: "var(--fz-md)"
    }
  }, "Publish before/after Krafts and claim local leads in node SW\u201104.")), /*#__PURE__*/React.createElement(Btn, {
    variant: "default",
    leftIcon: "brand-google"
  }, "Continue with Google"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      color: "var(--text-3)"
    }
  }, /*#__PURE__*/React.createElement(Divider, {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600
    }
  }, "or"), /*#__PURE__*/React.createElement(Divider, {
    style: {
      flex: 1
    }
  })), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(TextInput, {
    label: "Email",
    required: true,
    icon: "mail",
    type: "email",
    defaultValue: "marcus.bell@gmail.com"
  }), /*#__PURE__*/React.createElement(TextInput, {
    label: "Mobile number",
    required: true,
    icon: "phone",
    defaultValue: "+1 (602) 555\u20110148",
    hint: "We send a 4\u2011digit SMS token to verify your number."
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)",
      textAlign: "center",
      lineHeight: 1.5
    }
  }, "By continuing you agree to GigKraft's Terms & Privacy Policy.")));
}

/* 1.2 — Base Service Area */
function S1_2_ServiceArea({
  go
}) {
  const [mode, setMode] = useStateOnb("explicit");
  const [zips, setZips] = useStateOnb(["85004", "85016", "85254"]);
  const [miles, setMiles] = useStateOnb(15);
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(OnbHead, {
      title: "Service area",
      step: 1,
      onBack: () => go("s1_1")
    }),
    footer: /*#__PURE__*/React.createElement(Btn, {
      rightIcon: "arrow-right",
      onClick: () => go("s1_3")
    }, "Continue")
  }, /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement(TextInput, {
    label: "Home ZIP code",
    required: true,
    icon: "map-pin",
    defaultValue: "85004",
    inputMode: "numeric",
    hint: "Your base \u2014 used to rank you by proximity in local search."
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 8
    }
  }, "How do you cover your area?"), /*#__PURE__*/React.createElement(Segmented, {
    value: mode,
    onChange: setMode,
    options: [{
      value: "explicit",
      label: "Specific ZIPs"
    }, {
      value: "radial",
      label: "Center + radius"
    }]
  })), mode === "explicit" ? /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-field__label"
  }, "Served ZIP codes"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--text-3)"
    }
  }, zips.length, " of 3")), zips.map((z, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "gk-input-wrap"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "map-pin",
    className: "gk-input-wrap__icon"
  }), /*#__PURE__*/React.createElement("input", {
    className: "gk-input mono",
    defaultValue: z,
    inputMode: "numeric"
  }), /*#__PURE__*/React.createElement("button", {
    className: "gk-iconbtn",
    style: {
      position: "absolute",
      right: 4
    },
    onClick: () => setZips(zips.filter((_, j) => j !== i))
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "x",
    size: 18
  })))), zips.length < 3 && /*#__PURE__*/React.createElement(Btn, {
    variant: "light",
    size: "sm",
    leftIcon: "plus",
    onClick: () => setZips([...zips, ""])
  }, "Add ZIP code")) : /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(TextInput, {
    label: "Center ZIP code",
    icon: "map-pin",
    defaultValue: "85004",
    inputMode: "numeric"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 10
    }
  }, "Coverage radius"), /*#__PURE__*/React.createElement(Slider, {
    min: 1,
    max: 100,
    value: miles,
    onChange: setMiles,
    unit: " mi"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 150,
      borderRadius: "var(--r-md)",
      border: "1px solid var(--border-2)",
      position: "relative",
      overflow: "hidden",
      background: "var(--bg-2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
      backgroundSize: "26px 26px",
      opacity: .6
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40 + miles * 1.0,
      height: 40 + miles * 1.0,
      maxWidth: 150,
      maxHeight: 130,
      borderRadius: "50%",
      background: "var(--tint)",
      border: "2px solid var(--primary)"
    }
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "map-pin-filled",
    size: 20,
    style: {
      position: "absolute",
      color: "var(--primary)"
    }
  })))));
}

/* 1.3 — Visual Customization */
const WALLPAPERS = [{
  id: 0,
  c: "linear-gradient(135deg,#228be6,#1864ab)"
}, {
  id: 1,
  c: "linear-gradient(135deg,#0ca678,#087f5b)"
}, {
  id: 2,
  c: "linear-gradient(135deg,#343a40,#101113)"
}, {
  id: 3,
  c: "linear-gradient(135deg,#f76707,#d9480f)"
}, {
  id: 4,
  c: "linear-gradient(135deg,#7048e8,#5f3dc4)"
}];
function S1_3_Visual({
  go
}) {
  const [wp, setWp] = useStateOnb(0);
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(OnbHead, {
      title: "Profile look",
      step: 2,
      onBack: () => go("s1_2")
    }),
    footer: /*#__PURE__*/React.createElement(Btn, {
      rightIcon: "arrow-right",
      onClick: () => go("s1_4")
    }, "Continue")
  }, /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement(Card, {
    flat: true,
    style: {
      padding: 0,
      overflow: "hidden",
      border: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 96,
      background: WALLPAPERS[wp].c
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 16px 16px",
      marginTop: -36
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Marcus Bell",
    size: 72,
    style: {
      border: "4px solid var(--surface)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 18,
      marginTop: 8
    }
  }, "Marcus Bell"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--text-3)",
      fontSize: 13
    }
  }, "Plumbing Pro \xB7 SW\u201104"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 8
    }
  }, "Profile photo"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    variant: "default",
    size: "sm",
    leftIcon: "brand-google",
    auto: true,
    style: {
      flex: 1
    }
  }, "Use Google photo"), /*#__PURE__*/React.createElement(Btn, {
    variant: "default",
    size: "sm",
    leftIcon: "upload",
    auto: true,
    style: {
      flex: 1
    }
  }, "Upload"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 8
    }
  }, "Header wallpaper"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 9,
      flexWrap: "wrap"
    }
  }, WALLPAPERS.map(w => /*#__PURE__*/React.createElement("button", {
    key: w.id,
    onClick: () => setWp(w.id),
    style: {
      width: 52,
      height: 52,
      borderRadius: 12,
      background: w.c,
      border: wp === w.id ? "3px solid var(--primary)" : "3px solid transparent",
      boxShadow: "var(--shadow-xs)",
      cursor: "pointer",
      outline: "1px solid var(--border)"
    }
  })), /*#__PURE__*/React.createElement("button", {
    style: {
      width: 52,
      height: 52,
      borderRadius: 12,
      border: "1.5px dashed var(--border-2)",
      background: "transparent",
      color: "var(--text-3)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus"
  }))))));
}

/* 1.4 — Professional Credentials */
function S1_4_Credentials({
  go
}) {
  const [emp, setEmp] = useStateOnb("full");
  const [lic, setLic] = useStateOnb(true);
  const [ins, setIns] = useStateOnb(true);
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(OnbHead, {
      title: "Credentials",
      step: 3,
      onBack: () => go("s1_3")
    }),
    footer: /*#__PURE__*/React.createElement(Btn, {
      rightIcon: "arrow-right",
      onClick: () => go("s1_5")
    }, "Continue")
  }, /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 8
    }
  }, "Availability"), /*#__PURE__*/React.createElement(Segmented, {
    value: emp,
    onChange: setEmp,
    options: [{
      value: "full",
      label: "Full‑time"
    }, {
      value: "part",
      label: "Part‑time"
    }]
  })), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(SwitchRow, {
    label: "Licensed",
    desc: "Show a verified license badge on your profile",
    on: lic,
    onChange: setLic
  }), lic && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      paddingLeft: 2
    }
  }, /*#__PURE__*/React.createElement(TextInput, {
    label: "License number",
    defaultValue: "AZ\u2011ROC\u2011284517"
  }), /*#__PURE__*/React.createElement(Photo, {
    label: "Upload license PDF",
    h: 64,
    icon: "file-text",
    dashed: true,
    onClick: () => {}
  }))), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(SwitchRow, {
    label: "Insured",
    desc: "Upload a Certificate of Insurance (COI)",
    on: ins,
    onChange: setIns
  }), ins && /*#__PURE__*/React.createElement(Photo, {
    label: "Upload COI PDF",
    h: 64,
    icon: "file-certificate",
    dashed: true,
    onClick: () => {}
  })), /*#__PURE__*/React.createElement(Select, {
    label: "Guaranteed response time",
    defaultValue: "4",
    hint: "Leads track you against this promise. Default is 4 hours."
  }, /*#__PURE__*/React.createElement("option", {
    value: "1"
  }, "Within 1 hour"), /*#__PURE__*/React.createElement("option", {
    value: "2"
  }, "Within 2 hours"), /*#__PURE__*/React.createElement("option", {
    value: "4"
  }, "Within 4 hours"), /*#__PURE__*/React.createElement("option", {
    value: "8"
  }, "Within 8 hours"), /*#__PURE__*/React.createElement("option", {
    value: "12"
  }, "Within 12 hours"), /*#__PURE__*/React.createElement("option", {
    value: "24"
  }, "Within 24 hours"))));
}

/* 1.5 — Core Categorization */
const SUGGESTED = ["Faucet repair", "Clogged drains", "Drywall patch", "Water heaters", "Garbage disposal", "Re‑pipe", "Leak detection"];
function S1_5_Categorization({
  go,
  toast
}) {
  const [tags, setTags] = useStateOnb(["Leak detection", "Re‑pipe", "Water heaters"]);
  const [bio, setBio] = useStateOnb("15 yrs on the tools across Phoenix. Licensed + insured. I send a real invoice and a clean before/after on every job — no vague quotes.");
  const toggle = t => setTags(tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t]);
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(OnbHead, {
      title: "Your trade",
      step: 4,
      onBack: () => go("s1_4")
    }),
    footer: /*#__PURE__*/React.createElement(Btn, {
      rightIcon: "check",
      onClick: () => {
        toast("Profile published to node SW‑04.");
        go("s1_9");
      }
    }, "Finish & go live")
  }, /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement(Select, {
    label: "Primary trade",
    required: true,
    defaultValue: "plumbing"
  }, /*#__PURE__*/React.createElement("option", {
    value: "plumbing"
  }, "Plumbing"), /*#__PURE__*/React.createElement("option", {
    value: "electrical"
  }, "Electrical"), /*#__PURE__*/React.createElement("option", {
    value: "carpentry"
  }, "Carpentry"), /*#__PURE__*/React.createElement("option", {
    value: "hvac"
  }, "HVAC"), /*#__PURE__*/React.createElement("option", {
    value: "drywall"
  }, "Drywall & Paint"), /*#__PURE__*/React.createElement("option", {
    value: "handyman"
  }, "General Handyman")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 4
    }
  }, "Skill tags"), /*#__PURE__*/React.createElement("div", {
    className: "gk-field__hint",
    style: {
      marginBottom: 10
    }
  }, "Customers search these. Tap to add or remove."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8
    }
  }, [...new Set([...tags, ...SUGGESTED])].map(t => /*#__PURE__*/React.createElement(Chip, {
    key: t,
    on: tags.includes(t),
    onClick: () => toggle(t)
  }, t)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Textarea, {
    label: "Short bio",
    rows: 4,
    maxLength: 500,
    value: bio,
    onChange: e => setBio(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right",
      fontSize: 11,
      color: "var(--text-3)",
      marginTop: 4
    },
    className: "mono"
  }, bio.length, " / 500"))));
}
Object.assign(window, {
  S1_1_Auth,
  S1_2_ServiceArea,
  S1_3_Visual,
  S1_4_Credentials,
  S1_5_Categorization
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "screens/handyman/onboarding.jsx", error: String((e && e.message) || e) }); }

// screens/handyman/portfolio.jsx
try { (() => {
/* global React, AppBar, Screen, Body, Card, Btn, IconBtn, TextInput, Textarea, Select, Segmented, Icon, Eyebrow, Divider, Photo, Avatar, Badge, Stars */
// GigKraft Handyman — Portfolio & Recommendations screens 1.6–1.8.
const {
  useState: useStateP
} = React;

/* 1.6 — Project Creator ("Add Kraft") */
function S1_6_ProjectCreator({
  toast,
  tabBar
}) {
  const [ba, setBa] = useStateP(true);
  const [pre, setPre] = useStateP([false, false]);
  const [post, setPost] = useStateP([true, false]);
  const fill = (arr, set, i) => set(arr.map((v, j) => j === i ? true : v));
  const hasAfter = post.some(Boolean);
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      title: "Add a Kraft",
      subtitle: "Publish a verified before/after",
      right: /*#__PURE__*/React.createElement(Badge, {
        tone: "blue",
        icon: "bolt"
      }, "Proof")
    }),
    tabBar: tabBar,
    footer: /*#__PURE__*/React.createElement(Btn, {
      disabled: !hasAfter,
      leftIcon: "cloud-upload",
      onClick: () => toast(hasAfter ? "Kraft published to node directory." : "")
    }, hasAfter ? "Publish Kraft" : "Add an After photo to publish")
  }, /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement(TextInput, {
    label: "Project title",
    required: true,
    defaultValue: "Copper riser re\u2011pipe",
    maxLength: 100
  }), /*#__PURE__*/React.createElement(Textarea, {
    label: "Description",
    rows: 3,
    defaultValue: "Replaced corroded galvanized riser with type\u2011L copper, pressure\u2011tested the line and patched drywall.",
    maxLength: 1000
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Final job cost",
    defaultValue: "2"
  }, /*#__PURE__*/React.createElement("option", {
    value: "0"
  }, "Under $250"), /*#__PURE__*/React.createElement("option", {
    value: "1"
  }, "$250 \u2013 $500"), /*#__PURE__*/React.createElement("option", {
    value: "2"
  }, "$500 \u2013 $1,000"), /*#__PURE__*/React.createElement("option", {
    value: "3"
  }, "$1,000+")), /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600
    }
  }, "Before / after project?"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text-3)",
      marginTop: 2
    }
  }, "Shows the transformation, not just the result.")), /*#__PURE__*/React.createElement("button", {
    className: `gk-switch${ba ? " gk-switch--on" : ""}`,
    onClick: () => setBa(!ba)
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-switch__dot"
  }))), ba && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-field__label"
  }, "Before photos"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--text-3)"
    }
  }, "Optional \xB7 max 5")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, pre.map((f, i) => /*#__PURE__*/React.createElement(Photo, {
    key: i,
    h: 96,
    filled: f,
    tone: "before",
    label: f ? "before · riser" : "Add before",
    dashed: !f,
    onClick: () => fill(pre, setPre, i)
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 8,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-field__label"
  }, "After photos", /*#__PURE__*/React.createElement("span", {
    className: "gk-field__req"
  }, "*")), /*#__PURE__*/React.createElement(Badge, {
    tone: hasAfter ? "green" : "yellow",
    icon: hasAfter ? "check" : "alert-triangle"
  }, hasAfter ? "Proof set" : "Required")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8
    }
  }, post.map((f, i) => /*#__PURE__*/React.createElement(Photo, {
    key: i,
    h: 96,
    filled: f,
    tone: "after",
    accent: !f,
    label: f ? "after · copper" : "Add after",
    dashed: !f,
    onClick: () => fill(post, setPost, i)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "gk-field__hint",
    style: {
      marginTop: 8
    }
  }, "A real After image is mandatory \u2014 it's what makes the Kraft verifiable."))));
}

/* 1.7 — Recommendation Request Engine */
const CHANNELS = [{
  id: "whatsapp",
  label: "WhatsApp",
  icon: "brand-whatsapp",
  c: "var(--whatsapp)"
}, {
  id: "sms",
  label: "SMS",
  icon: "message-2",
  c: "var(--blue-6)"
}, {
  id: "email",
  label: "Email",
  icon: "mail",
  c: "var(--grape-6)"
}];
const RECENT_REQ = [{
  name: "Priya Shah",
  via: "WhatsApp",
  when: "2h ago",
  status: "Opened"
}, {
  name: "Dana Whitfield",
  via: "SMS",
  when: "Yesterday",
  status: "Sent"
}, {
  name: "Carl & Mei Ortega",
  via: "Email",
  when: "3 days ago",
  status: "Reviewed"
}];
function S1_7_RecRequest({
  go,
  toast
}) {
  const [ch, setCh] = useStateP("whatsapp");
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      title: "Request a recommendation",
      onBack: () => go("account")
    }),
    footer: /*#__PURE__*/React.createElement(Btn, {
      leftIcon: "send",
      onClick: () => toast("Magic link sent via " + CHANNELS.find(c => c.id === ch).label + ".")
    }, "Send review link")
  }, /*#__PURE__*/React.createElement(Body, null, /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(TextInput, {
    label: "Client name",
    icon: "user",
    defaultValue: "Priya Shah"
  }), /*#__PURE__*/React.createElement(TextInput, {
    label: "Phone or email",
    icon: "at",
    defaultValue: "priya.shah@gmail.com"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 8
    }
  }, "Send via"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, CHANNELS.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.id,
    onClick: () => setCh(c.id),
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      padding: "14px 6px",
      borderRadius: "var(--r-md)",
      cursor: "pointer",
      background: ch === c.id ? "var(--tint)" : "var(--surface)",
      border: `1px solid ${ch === c.id ? "var(--primary)" : "var(--border-2)"}`
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: c.icon,
    size: 24,
    style: {
      color: c.c
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: ch === c.id ? "var(--tint-text)" : "var(--text-2)"
    }
  }, c.label))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "gk-field__label",
    style: {
      marginBottom: 8
    }
  }, "Secure magic link"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "12px 14px",
      borderRadius: "var(--r-md)",
      background: "var(--bg-2)",
      border: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "link",
    size: 18,
    style: {
      color: "var(--text-3)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "mono",
    style: {
      fontSize: 12,
      color: "var(--text-2)",
      flex: 1,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, "gigkraft.com/review?t=8fK2\u2026aQ9"), /*#__PURE__*/React.createElement(IconBtn, {
    icon: "copy",
    onClick: () => toast("Link copied.")
  })), /*#__PURE__*/React.createElement("div", {
    className: "gk-field__hint",
    style: {
      marginTop: 8
    }
  }, "Passwordless \u2014 your client rates the job without making an account.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 8
    }
  }, "Recent requests"), /*#__PURE__*/React.createElement(Card, {
    flat: true,
    style: {
      padding: 4
    }
  }, RECENT_REQ.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: r.name
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 10px"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: r.name,
    size: 36
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      fontSize: 14
    }
  }, r.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-3)"
    }
  }, r.via, " \xB7 ", r.when)), /*#__PURE__*/React.createElement(Badge, {
    tone: r.status === "Reviewed" ? "green" : r.status === "Opened" ? "blue" : undefined
  }, r.status)), i < RECENT_REQ.length - 1 && /*#__PURE__*/React.createElement(Divider, null)))))));
}

/* 1.8 — Recommendation Moderation Queue */
const PENDING = [{
  name: "Priya Shah",
  rel: "Repeat client",
  when: "2h ago",
  stars: 5,
  photos: 2,
  text: "Marcus found the slab leak two other plumbers missed. Clean copper work and he sent the invoice the same day."
}, {
  name: "Dana Whitfield",
  rel: "Neighbor",
  when: "Yesterday",
  stars: 4,
  photos: 1,
  text: "Fast and tidy. Water heater swap done in an afternoon, no mess left behind."
}];
function S1_8_Moderation({
  go,
  toast
}) {
  const [done, setDone] = useStateP([]);
  const approve = n => {
    setDone([...done, n]);
    toast("Published to your public profile.");
  };
  return /*#__PURE__*/React.createElement(Screen, {
    appBar: /*#__PURE__*/React.createElement(AppBar, {
      title: "Review queue",
      subtitle: `${PENDING.length - done.length} pending`,
      onBack: () => go("account"),
      right: /*#__PURE__*/React.createElement(Badge, {
        tone: "yellow"
      }, PENDING.length - done.length, " new")
    })
  }, /*#__PURE__*/React.createElement(Body, null, PENDING.map(r => {
    const isDone = done.includes(r.name);
    return /*#__PURE__*/React.createElement(Card, {
      key: r.name,
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        opacity: isDone ? .55 : 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: r.name,
      size: 42
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 700
      }
    }, r.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: "var(--text-3)"
      }
    }, r.rel, " \xB7 ", r.when)), /*#__PURE__*/React.createElement(Stars, {
      value: r.stars,
      size: 18
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        color: "var(--text-2)",
        lineHeight: 1.55
      }
    }, "\"", r.text, "\""), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: `repeat(${r.photos}, 1fr)`,
        gap: 8
      }
    }, Array.from({
      length: r.photos
    }).map((_, i) => /*#__PURE__*/React.createElement(Photo, {
      key: i,
      h: 80,
      filled: true,
      tone: "after",
      label: "job photo"
    }))), /*#__PURE__*/React.createElement(Divider, null), isDone ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: "var(--green-fg)",
        fontWeight: 600,
        fontSize: 14,
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "circle-check-filled",
      size: 18
    }), " Published to profile") : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Btn, {
      variant: "default",
      size: "sm",
      leftIcon: "message",
      auto: true,
      style: {
        flex: 1
      },
      onClick: () => go("s1_10")
    }, "Reply"), /*#__PURE__*/React.createElement(Btn, {
      size: "sm",
      leftIcon: "check",
      auto: true,
      style: {
        flex: 2
      },
      onClick: () => approve(r.name)
    }, "Approve & publish")));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      color: "var(--text-3)",
      fontSize: 13,
      padding: "8px 0"
    }
  }, "Approved recommendations show on your public profile.")));
}
Object.assign(window, {
  S1_6_ProjectCreator,
  S1_7_RecRequest,
  S1_8_Moderation
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "screens/handyman/portfolio.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile-app/PhoneFrame.jsx
try { (() => {
/* global React */
// GigKraft Mobile — device shell: notch, brand header, scroll area, tab bar.

function PhoneFrame({
  brand,
  brandTail,
  right,
  children,
  tabs,
  activeTab,
  onTab
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "gk-phone"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-phone__notch"
  }), /*#__PURE__*/React.createElement("div", {
    className: "gk-phone__header"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-phone__logo"
  }, brand, /*#__PURE__*/React.createElement("span", null, brandTail)), /*#__PURE__*/React.createElement("span", {
    className: "gk-phone__right"
  }, right)), /*#__PURE__*/React.createElement("div", {
    className: "gk-phone__scroll"
  }, children), tabs && /*#__PURE__*/React.createElement("div", {
    className: "gk-phone__tabbar"
  }, tabs.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    className: `gk-tab ${activeTab === t.id ? "gk-tab--active" : ""}`,
    onClick: () => onTab && onTab(t.id)
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-tab__icon"
  }, t.icon), /*#__PURE__*/React.createElement("span", null, t.label)))));
}
Object.assign(window, {
  PhoneFrame
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile-app/PhoneFrame.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile-app/Primitives.jsx
try { (() => {
/* global React */
// GigKraft Mobile — Primitive UI components.
// Visuals are driven by classNames defined in index.html's <style>.

const {
  useState
} = React;

// ---- Button -----------------------------------------------------------------
function GkButton({
  variant = "primary",
  children,
  onClick,
  style
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: `gk-btn gk-btn--${variant}`,
    onClick: onClick,
    style: style
  }, children);
}

// ---- Text input -------------------------------------------------------------
function GkInput({
  label,
  value,
  onChange,
  hint,
  placeholder,
  type = "text"
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "gk-field"
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "gk-field__label"
  }, label), /*#__PURE__*/React.createElement("input", {
    className: "gk-field__input",
    type: type,
    value: value,
    placeholder: placeholder,
    onChange: e => onChange && onChange(e.target.value)
  }), hint && /*#__PURE__*/React.createElement("p", {
    className: "gk-field__hint"
  }, hint));
}

// ---- Card -------------------------------------------------------------------
function GkCard({
  variant = "default",
  children,
  onClick,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `gk-card gk-card--${variant}`,
    onClick: onClick,
    style: {
      cursor: onClick ? "pointer" : "default",
      ...style
    }
  }, children);
}

// ---- Badge / status ---------------------------------------------------------
function GkBadge({
  tone = "lime",
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: `gk-badge gk-badge--${tone}`
  }, children);
}
function GkStatus({
  children,
  color = "var(--gk-success)"
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "gk-status",
    style: {
      color
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-status__dot",
    style: {
      background: color
    }
  }), children);
}

// ---- Before / After proof split --------------------------------------------
function BeforeAfter({
  before,
  after,
  height = 96
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "gk-split",
    style: {
      height
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-split__before"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-split__icon"
  }, "\uD83D\uDCF7"), /*#__PURE__*/React.createElement("span", null, before)), /*#__PURE__*/React.createElement("div", {
    className: "gk-split__after"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-split__icon"
  }, "\u2728"), /*#__PURE__*/React.createElement("span", null, after)));
}

// ---- Eyebrow ----------------------------------------------------------------
function GkEyebrow({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "gk-eyebrow-lbl"
  }, children);
}
Object.assign(window, {
  GkButton,
  GkInput,
  GkCard,
  GkBadge,
  GkStatus,
  BeforeAfter,
  GkEyebrow
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile-app/Primitives.jsx", error: String((e && e.message) || e) }); }

// ui_kits/mobile-app/Screens.jsx
try { (() => {
/* global React, PhoneFrame, GkButton, GkInput, GkCard, GkBadge, GkStatus, BeforeAfter, GkEyebrow */
// GigKraft Mobile — screens + click-through state machine.

const {
  useState
} = React;
const PRO_TABS = [{
  id: "pro-dash",
  icon: "📊",
  label: "Dashboard"
}, {
  id: "pro-add",
  icon: "➕",
  label: "Add Kraft"
}, {
  id: "pro-billing",
  icon: "💳",
  label: "Billing"
}];
const CLIENT_TABS = [{
  id: "client-feed",
  icon: "🔍",
  label: "Discover"
}, {
  id: "client-broadcast",
  icon: "🚨",
  label: "Emergency"
}];

// ---------- GUEST ----------
function SplashScreen({
  go
}) {
  return /*#__PURE__*/React.createElement(PhoneFrame, {
    brand: "gigkraft",
    brandTail: ".com",
    right: /*#__PURE__*/React.createElement("span", {
      className: "gk-loc"
    }, "\uD83D\uDCCD SW-04")
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-splash"
  }, /*#__PURE__*/React.createElement("img", {
    className: "gk-splash__logo",
    src: "../../assets/gigkraft-logo.png",
    alt: "GigKraft"
  }), /*#__PURE__*/React.createElement("h1", {
    className: "gk-splash__h"
  }, "Local Handyman Proof, Fast."), /*#__PURE__*/React.createElement("p", {
    className: "gk-splash__p"
  }, "Skip the reviews. See actual before/after invoices confirmed within your immediate zip code node."), /*#__PURE__*/React.createElement(GkButton, {
    variant: "navy",
    onClick: () => go("router")
  }, "Enter Neighborhood Hub")));
}
function RouterScreen({
  go
}) {
  return /*#__PURE__*/React.createElement(PhoneFrame, {
    brand: "gigkraft",
    brandTail: "",
    right: /*#__PURE__*/React.createElement("span", {
      className: "gk-hsub"
    }, "Intent Route")
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-router"
  }, /*#__PURE__*/React.createElement(GkEyebrow, null, "Screen 2 of 4 \u2022 Onboarding"), /*#__PURE__*/React.createElement(GkCard, {
    variant: "select",
    onClick: () => go("signup"),
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "gk-router__t gk-router__t--o"
  }, "\uD83D\uDD27 I am a Trade Pro"), /*#__PURE__*/React.createElement("p", {
    className: "gk-router__p"
  }, "Publish case studies & claim local leads for $19.99/mo.")), /*#__PURE__*/React.createElement(GkCard, {
    onClick: () => go("client-feed"),
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "gk-router__t"
  }, "\uD83C\uDFE0 I Need to Hire"), /*#__PURE__*/React.createElement("p", {
    className: "gk-router__p"
  }, "Search local project feeds and post emergency broadcasts."))));
}
function SignupScreen({
  go,
  toast
}) {
  const [phone, setPhone] = useState("+1 (555) 014-9988");
  return /*#__PURE__*/React.createElement(PhoneFrame, {
    brand: "gigkraft",
    brandTail: "",
    right: /*#__PURE__*/React.createElement("span", {
      className: "gk-hsub"
    }, "Secure Account")
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-stack"
  }, /*#__PURE__*/React.createElement(GkEyebrow, null, "Screen 3 of 4 \u2022 Onboarding"), /*#__PURE__*/React.createElement(GkCard, null, /*#__PURE__*/React.createElement(GkInput, {
    label: "Enter Mobile Terminal Number",
    value: phone,
    onChange: setPhone,
    hint: "A secure 4-digit token challenge will be issued instantly via SMS."
  })), /*#__PURE__*/React.createElement(GkButton, {
    onClick: () => {
      toast("SMS token broadcast triggered.");
      go("paywall");
    }
  }, "Issue Verification Token")));
}
function PaywallScreen({
  go,
  toast
}) {
  return /*#__PURE__*/React.createElement(PhoneFrame, {
    brand: "gk",
    brandTail: ".pro",
    right: /*#__PURE__*/React.createElement("span", {
      className: "gk-hsub"
    }, "Ledger Setup")
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-stack"
  }, /*#__PURE__*/React.createElement(GkEyebrow, null, "Screen 4 of 4 \u2022 Onboarding"), /*#__PURE__*/React.createElement(GkCard, {
    variant: "hero"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "gk-hero__t"
  }, "GigKraft Pro Vault Tier"), /*#__PURE__*/React.createElement("p", {
    className: "gk-hero__p"
  }, "$19.99 / month micro-subscription ledger")), /*#__PURE__*/React.createElement(GkCard, null, /*#__PURE__*/React.createElement(GkInput, {
    label: "Credit Card Number",
    value: "4111 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 8832",
    onChange: () => {}
  }), /*#__PURE__*/React.createElement("div", {
    className: "gk-grid2"
  }, /*#__PURE__*/React.createElement(GkInput, {
    label: "Expiry",
    value: "12/28",
    onChange: () => {}
  }), /*#__PURE__*/React.createElement(GkInput, {
    label: "CVC",
    value: "092",
    onChange: () => {}
  }))), /*#__PURE__*/React.createElement(GkButton, {
    onClick: () => {
      toast("Account set to PRO ACTIVE.");
      go("pro-dash");
    }
  }, "Activate Account ($19.99)")));
}

// ---------- PRO TRACK ----------
function ProDashboard({
  go
}) {
  return /*#__PURE__*/React.createElement(PhoneFrame, {
    brand: "gk",
    brandTail: ".pro",
    tabs: PRO_TABS,
    activeTab: "pro-dash",
    onTab: go,
    right: /*#__PURE__*/React.createElement(GkStatus, null, "Active")
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-stack"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-grid2"
  }, /*#__PURE__*/React.createElement(GkCard, {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-metric__k"
  }, "VIEWS"), /*#__PURE__*/React.createElement("div", {
    className: "gk-metric__v gk-metric__v--o"
  }, "42 Pros")), /*#__PURE__*/React.createElement(GkCard, {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "gk-metric__k"
  }, "OPEN GIGS"), /*#__PURE__*/React.createElement("div", {
    className: "gk-metric__v"
  }, "3 Leads"))), /*#__PURE__*/React.createElement("p", {
    className: "gk-section-lbl"
  }, "\u26A1 Live Local Pro Triage Alerts"), /*#__PURE__*/React.createElement(GkCard, {
    style: {
      borderLeft: "5px solid var(--gk-orange)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-lead__t"
  }, "Kitchen Line Valve Leak"), /*#__PURE__*/React.createElement("p", {
    className: "gk-lead__p"
  }, "Proximity: 1.4 miles away \u2022 Downtown"), /*#__PURE__*/React.createElement(GkButton, {
    style: {
      marginTop: 8,
      padding: "7px"
    },
    onClick: () => go("pro-chat")
  }, "Claim Chat Routing")), /*#__PURE__*/React.createElement(GkCard, {
    style: {
      borderLeft: "5px solid var(--gk-muted)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-lead__t"
  }, "Breaker Panel Trip"), /*#__PURE__*/React.createElement("p", {
    className: "gk-lead__p"
  }, "Proximity: 2.8 miles away \u2022 Eastside"), /*#__PURE__*/React.createElement(GkButton, {
    variant: "secondary",
    style: {
      marginTop: 8,
      padding: "7px"
    },
    onClick: () => go("pro-chat")
  }, "Claim Chat Routing"))));
}
function ProAddKraft({
  go,
  toast
}) {
  const [active, setActive] = useState(false);
  return /*#__PURE__*/React.createElement(PhoneFrame, {
    brand: "gk",
    brandTail: ".pro",
    tabs: PRO_TABS,
    activeTab: "pro-add",
    onTab: go,
    right: /*#__PURE__*/React.createElement("span", {
      className: "gk-hsub"
    }, "Add Case Asset")
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-stack"
  }, /*#__PURE__*/React.createElement(GkCard, null, /*#__PURE__*/React.createElement(GkInput, {
    label: "Project Title Descriptor",
    value: "Copper Pipe Valve Resolder",
    onChange: () => {}
  }), /*#__PURE__*/React.createElement("div", {
    className: "gk-grid2",
    style: {
      margin: "10px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-upload gk-upload--optional"
  }, "\uD83D\uDCF7 Before", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("small", null, "(Optional)")), /*#__PURE__*/React.createElement("div", {
    className: `gk-upload gk-upload--mandatory ${active ? "gk-upload--filled" : ""}`,
    onClick: () => setActive(true)
  }, active ? "✅ After Saved" : /*#__PURE__*/React.createElement(React.Fragment, null, "\u2728 After Image", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("small", null, "(MANDATORY)")))), /*#__PURE__*/React.createElement(GkInput, {
    label: "Real Final Job Cost ($)",
    value: "120.00",
    onChange: () => {}
  })), /*#__PURE__*/React.createElement(GkButton, {
    onClick: () => active ? toast("Case study published to node directory.") : toast("⚠️ After image is mandatory.")
  }, "Publish Portfolio Record")));
}
function ProMessenger({
  go,
  toast
}) {
  const [draft, setDraft] = useState("Heading out now...");
  return /*#__PURE__*/React.createElement(PhoneFrame, {
    brand: "gk",
    brandTail: ".chat",
    right: /*#__PURE__*/React.createElement("span", {
      className: "gk-hsub"
    }, "T. Jenkins")
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-chat"
  }, /*#__PURE__*/React.createElement("button", {
    className: "gk-back",
    onClick: () => go("pro-dash")
  }, "\u2039 Back to dashboard"), /*#__PURE__*/React.createElement("div", {
    className: "gk-chat__feed"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-bubble gk-bubble--them"
  }, "Water is isolated at the street valve but the kitchen floor is getting soggy. Can you fix today?"), /*#__PURE__*/React.createElement("div", {
    className: "gk-bubble gk-bubble--me"
  }, "Yes \u2014 torch and solder fittings are loaded in my rig now. Sticking to the $120 baseline.")), /*#__PURE__*/React.createElement("div", {
    className: "gk-chat__compose"
  }, /*#__PURE__*/React.createElement("input", {
    className: "gk-field__input",
    value: draft,
    onChange: e => setDraft(e.target.value)
  }), /*#__PURE__*/React.createElement(GkButton, {
    style: {
      width: "auto",
      padding: "9px 13px"
    },
    onClick: () => {
      toast("Message dispatched.");
      setDraft("");
    }
  }, "\u2794"))));
}
function ProBilling({
  go,
  toast
}) {
  return /*#__PURE__*/React.createElement(PhoneFrame, {
    brand: "gk",
    brandTail: ".vault",
    tabs: PRO_TABS,
    activeTab: "pro-billing",
    onTab: go,
    right: /*#__PURE__*/React.createElement("span", {
      className: "gk-hsub"
    }, "Ledger")
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-stack"
  }, /*#__PURE__*/React.createElement(GkCard, null, /*#__PURE__*/React.createElement("div", {
    className: "gk-metric__k"
  }, "CURRENT STATUS"), /*#__PURE__*/React.createElement(GkStatus, null, "Subscription Paid"), /*#__PURE__*/React.createElement("p", {
    className: "gk-lead__p",
    style: {
      marginTop: 6
    }
  }, "Next billing recurrence: ", /*#__PURE__*/React.createElement("strong", null, "June 1, 2026"))), /*#__PURE__*/React.createElement(GkButton, {
    variant: "secondary",
    onClick: () => toast("Opening secure card update link...")
  }, "Update Card Credentials"), /*#__PURE__*/React.createElement(GkButton, {
    variant: "danger",
    onClick: () => toast("Subscription ledger paused.")
  }, "Pause Account Subscription")));
}

// ---------- CLIENT TRACK ----------
function ClientFeed({
  go
}) {
  return /*#__PURE__*/React.createElement(PhoneFrame, {
    brand: "gk",
    brandTail: ".feed",
    tabs: CLIENT_TABS,
    activeTab: "client-feed",
    onTab: go,
    right: /*#__PURE__*/React.createElement("span", {
      className: "gk-hsub"
    }, "Plumbing")
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-stack"
  }, /*#__PURE__*/React.createElement(GkInput, {
    value: "Search Plumbing Proof...",
    onChange: () => {}
  }), /*#__PURE__*/React.createElement(GkCard, {
    onClick: () => go("client-proof")
  }, /*#__PURE__*/React.createElement(BeforeAfter, {
    before: "LEAK VALVE",
    after: "RESOLDER OK",
    height: 88
  }), /*#__PURE__*/React.createElement("div", {
    className: "gk-lead__t",
    style: {
      marginTop: 8
    }
  }, "Dave Miller \u2022 Plumbing Pro"), /*#__PURE__*/React.createElement("div", {
    className: "gk-price"
  }, "Verified Job Invoice: $120.00")), /*#__PURE__*/React.createElement(GkCard, {
    onClick: () => go("client-proof")
  }, /*#__PURE__*/React.createElement(BeforeAfter, {
    before: "DEAD PANEL",
    after: "NEW BREAKER",
    height: 88
  }), /*#__PURE__*/React.createElement("div", {
    className: "gk-lead__t",
    style: {
      marginTop: 8
    }
  }, "R. Alvarez \u2022 Electrical Pro"), /*#__PURE__*/React.createElement("div", {
    className: "gk-price"
  }, "Verified Job Invoice: $240.00"))));
}
function ClientProof({
  go,
  toast
}) {
  return /*#__PURE__*/React.createElement(PhoneFrame, {
    brand: "gk",
    brandTail: ".proof",
    right: /*#__PURE__*/React.createElement("span", {
      className: "gk-hsub"
    }, "Case #902")
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-stack"
  }, /*#__PURE__*/React.createElement("button", {
    className: "gk-back",
    onClick: () => go("client-feed")
  }, "\u2039 Back to feed"), /*#__PURE__*/React.createElement(BeforeAfter, {
    before: "GREY CORROSION Main Line Rupture",
    after: "SHINY NEW PVC Fittings Resoldered",
    height: 140
  }), /*#__PURE__*/React.createElement(GkCard, null, /*#__PURE__*/React.createElement("h3", {
    className: "gk-router__t"
  }, "Dave Miller"), /*#__PURE__*/React.createElement("p", {
    className: "gk-lead__p"
  }, "Verified Regional Invoice: $120.00 total"), /*#__PURE__*/React.createElement("p", {
    className: "gk-quote"
  }, "\u201CDave responded instantly during the valve rupture emergency and handled the line fitting isolation flawlessly.\u201D")), /*#__PURE__*/React.createElement(GkButton, {
    onClick: () => {
      toast("Secure messenger thread opened.");
      go("client-review");
    }
  }, "Request Direct Quote From Pro")));
}
function ClientBroadcast({
  go,
  toast
}) {
  return /*#__PURE__*/React.createElement(PhoneFrame, {
    brand: "gk",
    brandTail: ".triage",
    tabs: CLIENT_TABS,
    activeTab: "client-broadcast",
    onTab: go,
    right: /*#__PURE__*/React.createElement("span", {
      className: "gk-hsub"
    }, "Fast Post")
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-stack"
  }, /*#__PURE__*/React.createElement(GkBadge, {
    tone: "orange"
  }, "\uD83D\uDEA8 Emergency Broadcast"), /*#__PURE__*/React.createElement(GkCard, null, /*#__PURE__*/React.createElement(GkInput, {
    label: "Describe the Problem",
    value: "Kitchen pipe main valve leak. Water pooling on flooring.",
    onChange: () => {}
  }), /*#__PURE__*/React.createElement(GkInput, {
    label: "Proposed Budget ($)",
    value: "120.00",
    onChange: () => {}
  })), /*#__PURE__*/React.createElement(GkButton, {
    onClick: () => toast("Broadcast beamed to SW-04 node managers.")
  }, "Blast to Local Node")));
}
function ClientReview({
  go,
  toast
}) {
  const [stars, setStars] = useState(5);
  return /*#__PURE__*/React.createElement(PhoneFrame, {
    brand: "gk",
    brandTail: ".review",
    right: /*#__PURE__*/React.createElement("span", {
      className: "gk-hsub"
    }, "Job Close")
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-stack"
  }, /*#__PURE__*/React.createElement(GkCard, {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-lead__t"
  }, "Rate Dave Miller's Fix"), /*#__PURE__*/React.createElement("div", {
    className: "gk-stars"
  }, [1, 2, 3, 4, 5].map(n => /*#__PURE__*/React.createElement("span", {
    key: n,
    className: n <= stars ? "on" : "",
    onClick: () => setStars(n)
  }, "\u2605"))), /*#__PURE__*/React.createElement("textarea", {
    className: "gk-field__input",
    style: {
      height: 64,
      resize: "none"
    },
    defaultValue: "Incredibly fast response and clean resolder line validation."
  })), /*#__PURE__*/React.createElement(GkButton, {
    onClick: () => {
      toast("Verified ledger entry submitted.");
      go("client-feed");
    }
  }, "Submit Verified Ledger Entry")));
}

// ---------- APP SHELL ----------
function GkApp() {
  const [screen, setScreen] = useState("splash");
  const [toastMsg, setToastMsg] = useState(null);
  const toast = m => {
    setToastMsg(m);
    clearTimeout(window.__gkT);
    window.__gkT = setTimeout(() => setToastMsg(null), 2200);
  };
  const go = s => setScreen(s);
  const screens = {
    splash: SplashScreen,
    router: RouterScreen,
    signup: SignupScreen,
    paywall: PaywallScreen,
    "pro-dash": ProDashboard,
    "pro-add": ProAddKraft,
    "pro-chat": ProMessenger,
    "pro-billing": ProBilling,
    "client-feed": ClientFeed,
    "client-proof": ClientProof,
    "client-broadcast": ClientBroadcast,
    "client-review": ClientReview
  };
  const Active = screens[screen];

  // Map for the role jump chips
  const chips = [{
    id: "splash",
    label: "Guest"
  }, {
    id: "pro-dash",
    label: "Handyman Pro"
  }, {
    id: "client-feed",
    label: "Consumer"
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "gk-stage"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-chrome"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gk-chrome__title"
  }, "gigkraft", /*#__PURE__*/React.createElement("span", null, ".app")), /*#__PURE__*/React.createElement("div", {
    className: "gk-chrome__chips"
  }, chips.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.id,
    className: "gk-chip",
    onClick: () => go(c.id)
  }, c.label)))), /*#__PURE__*/React.createElement("div", {
    className: "gk-device-wrap"
  }, /*#__PURE__*/React.createElement(Active, {
    go: go,
    toast: toast
  })), toastMsg && /*#__PURE__*/React.createElement("div", {
    className: "gk-toast"
  }, toastMsg));
}
Object.assign(window, {
  GkApp
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/mobile-app/Screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-admin/AdminComponents.jsx
try { (() => {
/* global React */
// GigKraft Admin — desktop console components (browser shell, sidebar, tiles, table).

const {
  useState: useStateAdmin
} = React;
function BrowserShell({
  url,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ad-browser"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ad-browser__bar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ad-dot",
    style: {
      background: "#EF4444"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "ad-dot",
    style: {
      background: "#FBBF24"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "ad-dot",
    style: {
      background: "#34D399"
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "ad-browser__url"
  }, url)), /*#__PURE__*/React.createElement("div", {
    className: "ad-browser__body"
  }, children));
}
function Sidebar({
  items,
  active,
  onNav
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ad-sidebar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ad-sidebar__brand"
  }, "gigkraft", /*#__PURE__*/React.createElement("span", null, ".admin")), items.map(it => /*#__PURE__*/React.createElement("div", {
    key: it.id,
    className: `ad-nav ${active === it.id ? "ad-nav--active" : ""}`,
    onClick: () => onNav(it.id)
  }, /*#__PURE__*/React.createElement("span", null, it.icon), it.label)), /*#__PURE__*/React.createElement("div", {
    className: "ad-sidebar__foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ad-node"
  }, "\uD83D\uDCCD Southwest US-04"), /*#__PURE__*/React.createElement("div", {
    className: "ad-node__sub"
  }, "Regional Operational Node")));
}
function MetricTile({
  k,
  v,
  accent
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ad-tile"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ad-tile__k"
  }, k), /*#__PURE__*/React.createElement("div", {
    className: "ad-tile__v",
    style: accent ? {
      color: "var(--gk-orange)"
    } : null
  }, v));
}
function SectionHead({
  title,
  badge
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "ad-head"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "ad-head__t"
  }, title), badge && /*#__PURE__*/React.createElement("span", {
    className: "ad-head__badge"
  }, badge));
}
function InlineBtn({
  tone,
  children,
  onClick
}) {
  const bg = {
    whatsapp: "var(--gk-success)",
    sms: "var(--gk-info)",
    green: "#34D399",
    red: "var(--gk-danger)"
  }[tone] || "var(--gk-orange)";
  return /*#__PURE__*/React.createElement("button", {
    className: "ad-ibtn",
    style: {
      background: bg
    },
    onClick: onClick
  }, children);
}
Object.assign(window, {
  BrowserShell,
  Sidebar,
  MetricTile,
  SectionHead,
  InlineBtn
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-admin/AdminComponents.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-admin/AdminViews.jsx
try { (() => {
/* global React, BrowserShell, Sidebar, MetricTile, SectionHead, InlineBtn */
// GigKraft Admin — views + app shell (Community Node Manager console).

const {
  useState
} = React;
const NAV = [{
  id: "ops",
  icon: "⚡",
  label: "Regional Core Ops"
}, {
  id: "triage",
  icon: "📡",
  label: "Cross-Channel Desk"
}, {
  id: "safety",
  icon: "⚠️",
  label: "Safety & Hygiene"
}];
function OpsView({
  toast
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHead, {
    title: "Regional Core Operations Command",
    badge: "HUB: SOUTHWEST US-04"
  }), /*#__PURE__*/React.createElement("div", {
    className: "ad-metrics"
  }, /*#__PURE__*/React.createElement(MetricTile, {
    k: "PENDING TRIAGE",
    v: "3 Tasks"
  }), /*#__PURE__*/React.createElement(MetricTile, {
    k: "ACTIVE LEDGER PROS",
    v: "142 Pros"
  }), /*#__PURE__*/React.createElement(MetricTile, {
    k: "MONTHLY RUN RATE",
    v: "$2,838.58",
    accent: true
  })), /*#__PURE__*/React.createElement("p", {
    className: "ad-note"
  }, "This control screen monitors real-time regional key metrics. Programmatic alerts fire instantly if emergency requests sit unassigned for more than 15 minutes."), /*#__PURE__*/React.createElement("div", {
    className: "ad-feed-head"
  }, "Recent Node Activity"), /*#__PURE__*/React.createElement("div", {
    className: "ad-activity"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ad-act"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ad-act__dot",
    style: {
      background: "var(--gk-success)"
    }
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Dave Miller"), " published a Kraft \xB7 Copper Pipe Valve Resolder \xB7 $120.00"), /*#__PURE__*/React.createElement("span", {
    className: "ad-act__t"
  }, "2m ago")), /*#__PURE__*/React.createElement("div", {
    className: "ad-act"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ad-act__dot",
    style: {
      background: "var(--gk-orange)"
    }
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "Emergency broadcast"), " received \xB7 Kitchen Pipe Burst \xB7 Downtown"), /*#__PURE__*/React.createElement("span", {
    className: "ad-act__t"
  }, "8m ago")), /*#__PURE__*/React.createElement("div", {
    className: "ad-act"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ad-act__dot",
    style: {
      background: "var(--gk-info)"
    }
  }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "R. Alvarez"), " claimed lead \xB7 Breaker Panel Trip \xB7 Eastside"), /*#__PURE__*/React.createElement("span", {
    className: "ad-act__t"
  }, "14m ago"))));
}
function TriageView({
  toast
}) {
  const rows = [{
    id: "TSK-8902",
    ctx: "Kitchen Pipe Main Line Burst",
    sub: "Water pooling on floor • Downtown Node",
    budget: "$120.00"
  }, {
    id: "TSK-8911",
    ctx: "Breaker Panel Total Trip",
    sub: "No power to property • Eastside Node",
    budget: "$240.00"
  }];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHead, {
    title: "Cross-Channel Outreach Triage Desk"
  }), /*#__PURE__*/React.createElement("table", {
    className: "ad-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Task ID"), /*#__PURE__*/React.createElement("th", null, "Context Parameters"), /*#__PURE__*/React.createElement("th", null, "Budget"), /*#__PURE__*/React.createElement("th", null, "Outbound Dispatch Triggers"))), /*#__PURE__*/React.createElement("tbody", null, rows.map(r => /*#__PURE__*/React.createElement("tr", {
    key: r.id
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "#", r.id)), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, r.ctx), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "ad-sub"
  }, r.sub)), /*#__PURE__*/React.createElement("td", {
    className: "ad-price"
  }, r.budget), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "ad-actions"
  }, /*#__PURE__*/React.createElement(InlineBtn, {
    tone: "whatsapp",
    onClick: () => toast("WhatsApp Business blast dispatched.")
  }, "WhatsApp Blast"), /*#__PURE__*/React.createElement(InlineBtn, {
    tone: "sms",
    onClick: () => toast("Twilio SMS pin broadcast.")
  }, "SMS Pin"))))))), /*#__PURE__*/React.createElement("p", {
    className: "ad-note"
  }, "Beams payload data instantly to proven local pros over native SMS and WhatsApp automation channels."));
}
function SafetyView({
  toast
}) {
  const [hidden, setHidden] = useState([]);
  const rows = [{
    id: "DISP-302",
    who: "John Doe (Carpenter)",
    ctx: "Reported off-platform pricing variance vs visual portfolio parameters."
  }, {
    id: "DISP-318",
    who: "M. Reyes (Roofer)",
    ctx: "Missing mandatory After image on 2 published Krafts."
  }];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHead, {
    title: "Verification Compliance & Safety Queue"
  }), /*#__PURE__*/React.createElement("table", {
    className: "ad-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Log ID"), /*#__PURE__*/React.createElement("th", null, "Target Profile"), /*#__PURE__*/React.createElement("th", null, "Infraction Context"), /*#__PURE__*/React.createElement("th", null, "Override Options"))), /*#__PURE__*/React.createElement("tbody", null, rows.filter(r => !hidden.includes(r.id)).map(r => /*#__PURE__*/React.createElement("tr", {
    key: r.id
  }, /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("strong", null, "#", r.id)), /*#__PURE__*/React.createElement("td", null, r.who), /*#__PURE__*/React.createElement("td", {
    className: "ad-infraction"
  }, r.ctx), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("div", {
    className: "ad-actions"
  }, /*#__PURE__*/React.createElement(InlineBtn, {
    tone: "green",
    onClick: () => {
      setHidden(h => [...h, r.id]);
      toast("Dispute dismissed & archived.");
    }
  }, "Dismiss"), /*#__PURE__*/React.createElement(InlineBtn, {
    tone: "red",
    onClick: () => {
      setHidden(h => [...h, r.id]);
      toast("Profile suspended (hidden from directory).");
    }
  }, "Suspend"))))))), rows.every(r => hidden.includes(r.id)) && /*#__PURE__*/React.createElement("p", {
    className: "ad-note"
  }, "\u2705 Queue clear \u2014 local marketplace hygiene maintained."));
}
function AdminApp() {
  const [view, setView] = useState("ops");
  const [toastMsg, setToastMsg] = useState(null);
  const toast = m => {
    setToastMsg(m);
    clearTimeout(window.__adT);
    window.__adT = setTimeout(() => setToastMsg(null), 2200);
  };
  const Views = {
    ops: OpsView,
    triage: TriageView,
    safety: SafetyView
  };
  const Active = Views[view];
  return /*#__PURE__*/React.createElement("div", {
    className: "ad-stage"
  }, /*#__PURE__*/React.createElement(BrowserShell, {
    url: "https://admin.gigkraft.com/node/southwest-us-04/control-panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ad-layout"
  }, /*#__PURE__*/React.createElement(Sidebar, {
    items: NAV,
    active: view,
    onNav: setView
  }), /*#__PURE__*/React.createElement("div", {
    className: "ad-canvas"
  }, /*#__PURE__*/React.createElement(Active, {
    toast: toast
  })))), toastMsg && /*#__PURE__*/React.createElement("div", {
    className: "ad-toast"
  }, toastMsg));
}
Object.assign(window, {
  AdminApp
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-admin/AdminViews.jsx", error: String((e && e.message) || e) }); }

})();
