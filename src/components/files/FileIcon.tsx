interface FileIconProps {
  path: string;
  isDirectory: boolean;
}

function extFromPath(path: string): string {
  const base = path.split("/").pop() ?? path;
  const dot = base.lastIndexOf(".");
  if (dot <= 0) {
    return "";
  }
  return base.slice(dot + 1).toLowerCase();
}

const EXT_COLORS: Record<string, string> = {
  js: "#f7df1e",
  mjs: "#f7df1e",
  cjs: "#f7df1e",
  ts: "#3178c6",
  tsx: "#3178c6",
  php: "#8892bf",
  py: "#3776ab",
  rb: "#cc342d",
  c: "#659ad2",
  cpp: "#659ad2",
  cc: "#659ad2",
  h: "#659ad2",
  hpp: "#659ad2",
  json: "#facc15",
  md: "#a1a1aa",
  html: "#f87171",
  css: "#60a5fa",
};

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M1.5 4.5A1 1 0 0 1 2.5 3.5H6l1.5 1.5H13.5A1 1 0 0 1 14.5 6v6.5a1 1 0 0 1-1 1H2.5a1 1 0 0 1-1-1V4.5Z"
        fill="#5865f2"
        fillOpacity="0.25"
        stroke="#5865f2"
        strokeWidth="1"
      />
    </svg>
  );
}

function FileIconSvg({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 1.5h5.5L13 5v8.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Z"
        fill={color}
        fillOpacity="0.2"
        stroke={color}
        strokeWidth="1"
      />
      <path d="M9 1.5V5h3.5" stroke={color} strokeWidth="1" />
    </svg>
  );
}

export function FileIcon({ path, isDirectory }: FileIconProps) {
  if (isDirectory) {
    return (
      <span className="file-tree__icon">
        <FolderIcon />
      </span>
    );
  }

  const ext = extFromPath(path);
  const color = EXT_COLORS[ext] ?? "#a1a1aa";

  return (
    <span className="file-tree__icon">
      <FileIconSvg color={color} />
    </span>
  );
}
