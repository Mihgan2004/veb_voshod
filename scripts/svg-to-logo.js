const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const svgPath = path.join(root, "public", "header", "svg-logo.svg");
const svg = fs.readFileSync(svgPath, "utf8");

// Extract path d attributes (can span multiple lines)
const paths = [];
const pathTagRegex = /<path\s+class="st\d"\s+d="/g;
let m;
while ((m = pathTagRegex.exec(svg)) !== null) {
  const afterQuote = m.index + m[0].length;
  let close = afterQuote;
  while (close < svg.length && svg[close] !== '"') close++;
  const d = svg.slice(afterQuote, close).replace(/\s+/g, " ").trim();
  paths.push(d);
}

const pathElements = paths
  .map((d) => {
    const escaped = d.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\$/g, "\\$");
    return `          <path pathLength={1} className="vx-logo-path" d={"${escaped}"} />`;
  })
  .join("\n");

const component = `"use client";

export function LogoDraw({
  className = "",
  stroke = "#FFFFFF",
  fill = "transparent",
}: {
  className?: string;
  stroke?: string;
  fill?: string;
}) {
  return (
    <svg
      className={\`vx-logo-draw \${className}\`}
      viewBox="0 0 2500 2500"
      aria-label="ВОСХОД"
      role="img"
    >
      <g>
        <g>
${pathElements}
        </g>
      </g>
    </svg>
  );
}
`;

const outPath = path.join(root, "components", "brand", "LogoDraw.tsx");
try {
  fs.writeFileSync(outPath, component);
  fs.writeFileSync(path.join(root, "scripts", "run.log"), "OK " + paths.length);
} catch (e) {
  fs.writeFileSync(path.join(root, "scripts", "run.log"), String(e));
}
