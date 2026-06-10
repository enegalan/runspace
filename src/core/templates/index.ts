export const RUNTIME_TEMPLATES: Record<string, string> = {
  nodejs: "console.log('Hello from Node.js!');\n",
  php: '<?php\necho "Hello from PHP!";\n',
  python: "print('Hello from Python!')\n",
  ruby: "puts 'Hello from Ruby!'\n",
  gcc: '#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}\n',
  gpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}\n',
  laravel:
    "<?php\n\nuse Illuminate\\Support\\Str;\n\necho Str::upper('Hello from Laravel!');\n",
  symfony:
    "<?php\n\nuse Symfony\\Component\\String\\UnicodeString;\n\necho (new UnicodeString('hello'))->upper();\n",
};

export function getRuntimeTemplate(environmentId: string): string {
  return RUNTIME_TEMPLATES[environmentId] ?? RUNTIME_TEMPLATES.nodejs;
}

export function getMonacoLanguage(environmentId: string): string {
  const fromCatalog = {
    nodejs: "javascript",
    php: "php",
    python: "python",
    ruby: "ruby",
    gcc: "c",
    gpp: "cpp",
    laravel: "php",
    symfony: "php",
  } as Record<string, string>;

  return fromCatalog[environmentId] ?? "plaintext";
}
