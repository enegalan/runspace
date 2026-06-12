import { FileIcon as MaterialFileIcon } from "react-material-vscode-icons";

interface FileIconProps {
  path: string;
  isDirectory: boolean;
  isExpanded?: boolean;
}

function nameFromPath(path: string): string {
  return path.split("/").pop() ?? path;
}

export function FileIcon({ path, isDirectory, isExpanded = false }: FileIconProps) {
  return (
    <span className="file-tree__icon" aria-hidden="true">
      <MaterialFileIcon
        fileName={nameFromPath(path)}
        isFolder={isDirectory}
        isExpanded={isDirectory && isExpanded}
        size={16}
      />
    </span>
  );
}
