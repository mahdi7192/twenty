import {
  type LanguageModelV4Prompt,
  type LanguageModelV4ToolResultPart,
} from '@ai-sdk/provider';
import { isArray, isObject, isString } from '@sniptt/guards';

const containsJsonSchemaDefsRef = (value: unknown): boolean => {
  if (isArray(value)) {
    return value.some(containsJsonSchemaDefsRef);
  }

  if (!isObject(value)) {
    return (
      isString(value) && (value.includes('$defs') || value.includes('$ref'))
    );
  }

  return (
    ('$ref' in value && isString(value.$ref)) ||
    '$defs' in value ||
    Object.values(value).some(containsJsonSchemaDefsRef)
  );
};

const sanitizeJsonSchemaRefs = (value: unknown): unknown => {
  if (isArray(value)) {
    return value.map(sanitizeJsonSchemaRefs);
  }

  if (!isObject(value)) {
    if (isString(value)) {
      return value.replaceAll('#/$defs/', '#/definitions/');
    }

    return value;
  }

  const result: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(value)) {
    const newKey =
      key === '$ref' ? 'ref' : key === '$defs' ? 'definitions' : key;

    result[newKey] = sanitizeJsonSchemaRefs(val);
  }

  return result;
};

const sanitizeToolResultPart = (
  part: LanguageModelV4ToolResultPart,
): LanguageModelV4ToolResultPart => {
  if (!containsJsonSchemaDefsRef(part.output.value)) {
    return part;
  }

  if (part.output.type === 'json' || part.output.type === 'error-json') {
    const sanitizedValue = sanitizeJsonSchemaRefs(part.output.value);
    const value = JSON.stringify(sanitizedValue);
    const providerOptions = part.output.providerOptions
      ? { providerOptions: part.output.providerOptions }
      : {};

    return {
      ...part,
      output:
        part.output.type === 'error-json'
          ? { type: 'error-text', value, ...providerOptions }
          : { type: 'text', value, ...providerOptions },
    };
  }

  if (
    (part.output.type === 'text' || part.output.type === 'error-text') &&
    isString(part.output.value)
  ) {
    const sanitizedValue = part.output.value
      .replaceAll('"$ref"', '"ref"')
      .replaceAll('"$defs"', '"definitions"')
      .replaceAll('#/$defs/', '#/definitions/');

    return {
      ...part,
      output: {
        ...part.output,
        value: sanitizedValue,
      },
    };
  }

  return part;
};

export const sanitizeToolResultRefs = (
  prompt: LanguageModelV4Prompt,
): LanguageModelV4Prompt =>
  prompt.map((message) =>
    message.role === 'tool'
      ? { ...message, content: message.content.map(sanitizeToolResultPart) }
      : message,
  );
