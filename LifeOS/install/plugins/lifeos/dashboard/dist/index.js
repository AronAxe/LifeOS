(function () {
  "use strict";
  const SDK = window.__HERMES_PLUGIN_SDK__;
  const React = SDK.React;
  const { Card, CardHeader, CardTitle, CardContent, Badge } = SDK.components;
  const { useEffect, useState } = SDK.hooks;

  function formatMinutes(value) {
    const minutes = Number(value || 0);
    return `${Math.floor(minutes / 60)}h ${Math.round(minutes % 60)}m`;
  }

  function LifeOSPage() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(function () {
      SDK.fetchJSON("/api/plugins/lifeos/overview")
        .then(setData)
        .catch(function (err) { setError(String(err)); });
    }, []);

    if (error) return React.createElement("p", { className: "text-sm text-destructive" }, `LifeOS runtime unavailable: ${error}`);
    if (!data) return React.createElement("p", { className: "text-sm text-muted-foreground" }, "Loading LifeOS state…");

    const rollup = data.rollup || {};
    return React.createElement("div", { className: "space-y-4" },
      React.createElement("div", null,
        React.createElement("h1", { className: "text-2xl font-semibold" }, "LifeOS"),
        React.createElement("p", { className: "text-sm text-muted-foreground" }, "ISA progress and evidence for ", data.date),
      ),
      React.createElement(Card, null,
        React.createElement(CardHeader, null, React.createElement(CardTitle, null, "Daily evidence")),
        React.createElement(CardContent, { className: "grid grid-cols-2 gap-3 text-sm md:grid-cols-4" },
          [
            ["Creation", formatMinutes(rollup.creation_minutes)],
            ["Consumption", formatMinutes(rollup.consumption_minutes)],
            ["Commits", String(rollup.commits || 0)],
            ["Sessions", String(rollup.sessions || 0)],
          ].map(function (item) {
            return React.createElement("div", { key: item[0], className: "rounded border p-3" },
              React.createElement("div", { className: "text-muted-foreground" }, item[0]),
              React.createElement("div", { className: "text-lg font-medium" }, item[1]),
            );
          }),
        ),
      ),
      React.createElement(Card, null,
        React.createElement(CardHeader, null, React.createElement(CardTitle, null, "Ideal State Artifacts")),
        React.createElement(CardContent, { className: "space-y-3" },
          (data.isas || []).length ? data.isas.map(function (isa) {
            const progress = isa.progress || { complete: 0, total: 0 };
            return React.createElement("div", { key: isa.id, className: "rounded border p-3" },
              React.createElement("div", { className: "flex items-center justify-between gap-2" },
                React.createElement("strong", null, isa.title),
                React.createElement(Badge, null, String(isa.phase || "observe").toUpperCase()),
              ),
              React.createElement("p", { className: "mt-1 text-sm text-muted-foreground" }, isa.goal),
              React.createElement("p", { className: "mt-2 text-xs" }, `${progress.complete}/${progress.total} criteria evidenced`),
            );
          }) : React.createElement("p", { className: "text-sm text-muted-foreground" }, "No ISA recorded yet. Create one through the LifeOS skill or lifeos_isa tool."),
        ),
      ),
    );
  }

  window.__HERMES_PLUGINS__.register("lifeos", LifeOSPage);
})();
