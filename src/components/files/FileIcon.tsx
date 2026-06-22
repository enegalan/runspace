import { FileIcon as MaterialFileIcon } from "react-material-vscode-icons";
import { basename } from "../../core/path/basename";

interface FileIconProps {
  path: string;
  isDirectory: boolean;
  isExpanded?: boolean;
}

export function FileIcon({ path, isDirectory, isExpanded = false }: FileIconProps) {
  return (
    <span className="file-tree__icon" aria-hidden="true">
      <MaterialFileIcon
        fileName={basename(path)}
        isFolder={isDirectory}
        isExpanded={isDirectory && isExpanded}
        size={16}
      />
    </span>
  );
}
