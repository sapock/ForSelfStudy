/* OPUS-X UI Kit — atoms and shared components.
   Exports everything to window so other Babel scripts can use them. */

const { useState, useMemo, Fragment } = React;

/* tiny lucide-as-React wrapper */
function Icon({ name, size = 18, color, style, ...rest }) {
  // Wrap an <i data-lucide=…> so lucide.createIcons() can replace it.
  return (
    <i
      data-lucide={name}
      style={{
        display: "inline-flex",
        width: size, height: size,
        color: color || "currentColor",
        ...style,
      }}
      {...rest}
    />
  );
}

/* ─── Button ─── */
function Button({
  children,
  variant = "outline",   // solid-primary | solid-neutral | outline | ghost
  size = "md",           // sm | md | lg
  leadingIcon,
  trailingIcon,
  disabled,
  onClick,
  style,
}) {
  return (
    <button
      className={`btn ${size} ${variant}`}
      disabled={disabled}
      onClick={onClick}
      style={style}
    >
      {leadingIcon && <Icon name={leadingIcon} size={size === "lg" ? 18 : 16} />}
      {children}
      {trailingIcon && <Icon name={trailingIcon} size={size === "lg" ? 18 : 16} />}
    </button>
  );
}

/* ─── IconButton ─── */
function IconButton({ name, onClick, label }) {
  return (
    <button className="icon-btn" onClick={onClick} aria-label={label}>
      <Icon name={name} size={20} />
    </button>
  );
}

/* ─── Avatar ─── */
function Avatar({ initials, tint = "p", size = "md" }) {
  const map = { p: "", b: "b", g: "g", y: "y" };
  return <span className={`avatar ${size} ${map[tint] || ""}`}>{initials}</span>;
}

/* ─── Badge ─── */
function Badge({ tone = "neutral", children, dot = true }) {
  return (
    <span className={`badge ${tone}`}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}

/* ─── Chip (filter / segmented) ─── */
function Chip({ children, active, onClick, removable }) {
  return (
    <span className={`chip ${active ? "on" : ""}`} onClick={onClick}>
      {children}
      {removable && <span className="x">✕</span>}
    </span>
  );
}

/* ─── KPI Card ─── */
function KPICard({ label, value, delta, deltaDir }) {
  return (
    <div className="card-surface kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {delta && (
        <div className={`kpi-delta ${deltaDir}`}>
          <Icon
            name={deltaDir === "up" ? "trending-up" : "trending-down"}
            size={14}
          />
          {delta}
        </div>
      )}
    </div>
  );
}

/* ─── Text input ─── */
function TextInput({ value, onChange, placeholder, ...rest }) {
  return (
    <input
      className="text-input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...rest}
    />
  );
}

/* ─── Breadcrumb ─── */
function Breadcrumb({ items }) {
  const nodes = [];
  items.forEach((it, i) => {
    if (i > 0) nodes.push(<span key={`s${i}`} className="sep">/</span>);
    nodes.push(
      i < items.length - 1
        ? <a key={i} href="#">{it}</a>
        : <span key={i} className="curr">{it}</span>
    );
  });
  return <div className="breadcrumb">{nodes}</div>;
}

/* ─── Tabs ─── */
function Tabs({ items, value, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {items.map((t) => (
        <div
          key={t.id}
          className={`tab ${value === t.id ? "on" : ""}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          {typeof t.count === "number" && (
            <span className="count">{t.count}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* expose to other Babel scripts */
Object.assign(window, {
  Icon, Button, IconButton, Avatar, Badge, Chip, KPICard,
  TextInput, Breadcrumb, Tabs,
});
