/**
 * HTML Sanitization Utility
 * Removes potentially dangerous HTML tags and attributes to prevent XSS attacks
 */

interface SanitizationConfig {
  allowedTags?: string[];
  allowedAttributes?: string[];
}

const DEFAULT_ALLOWED_TAGS = [
  'p',
  'b',
  'i',
  'u',
  'em',
  'strong',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'a',
  'br',
  'hr',
  'blockquote',
  'pre',
  'code',
  'span',
  'div',
];

const DEFAULT_ALLOWED_ATTRIBUTES = ['href', 'title', 'class', 'id'];

/**
 * Sanitizes HTML content to remove potentially dangerous elements
 * @param html - The HTML string to sanitize
 * @param config - Configuration for allowed tags and attributes
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(
  html: string,
  config: SanitizationConfig = {}
): string {
  const allowedTags = config.allowedTags || DEFAULT_ALLOWED_TAGS;
  const allowedAttributes = config.allowedAttributes || DEFAULT_ALLOWED_ATTRIBUTES;

  // Create a temporary container to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Recursively clean the DOM tree
  const clean = (node: Node): void => {
    for (let i = node.childNodes.length - 1; i >= 0; i--) {
      const child = node.childNodes[i];

      if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as HTMLElement;
        const tagName = element.tagName.toLowerCase();

        // Remove disallowed tags but keep their content
        if (!allowedTags.includes(tagName)) {
          while (element.firstChild) {
            element.parentNode?.insertBefore(element.firstChild, element);
          }
          element.parentNode?.removeChild(element);
        } else {
          // Remove disallowed attributes
          const attributes = element.attributes;
          for (let j = attributes.length - 1; j >= 0; j--) {
            const attr = attributes[j];
            if (!allowedAttributes.includes(attr.name.toLowerCase())) {
              element.removeAttribute(attr.name);
            }
          }

          // Recursively clean child nodes
          clean(element);
        }
      } else if (child.nodeType === Node.COMMENT_NODE) {
        // Remove comment nodes
        child.parentNode?.removeChild(child);
      }
    }
  };

  clean(temp);
  return temp.innerHTML;
}

/**
 * Escapes HTML special characters to prevent XSS
 * @param text - The text to escape
 * @returns Escaped text safe for HTML
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Strips all HTML tags from text
 * @param html - The HTML string to strip
 * @returns Plain text without HTML tags
 */
export function stripHtmlTags(html: string): string {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
}
