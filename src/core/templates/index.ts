export const RUNTIME_TEMPLATES: Record<string, string> = {
  nodejs: "console.log('Hello from Node.js!');\n",
  php: '<?php\necho "Hello from PHP!";\n',
  python: "print('Hello from Python!')\n",
  ruby: "puts 'Hello from Ruby!'\n",
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
    laravel: "php",
    symfony: "php",
  } as Record<string, string>;

  return fromCatalog[environmentId] ?? "plaintext";
}
