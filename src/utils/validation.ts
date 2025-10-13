/**
 * Input validation utilities for database operations
 */

/**
 * Validate that a timestamp is a valid ISO8601 string and not in the future
 * @param timestamp - ISO8601 timestamp string
 * @returns true if valid, error message if invalid
 */
export function validateTimestamp(timestamp: string): string | true {
  // Check if it's a valid date string
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return 'Invalid timestamp format';
  }

  // Check if date is in the future (allow up to 1 minute of clock skew)
  const now = Date.now();
  const maxAllowedTime = now + 60000; // 1 minute buffer
  if (date.getTime() > maxAllowedTime) {
    return 'Timestamp cannot be in the future';
  }

  // Check if date is too far in the past (before year 2000)
  const minAllowedTime = new Date('2000-01-01').getTime();
  if (date.getTime() < minAllowedTime) {
    return 'Timestamp is too far in the past';
  }

  return true;
}

/**
 * Sanitize a string input to prevent injection and trim whitespace
 * @param input - String to sanitize
 * @param maxLength - Maximum allowed length (default: 1000)
 * @returns Sanitized string
 */
export function sanitizeString(input: string | undefined, maxLength: number = 1000): string | undefined {
  if (!input) return undefined;
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // Remove any null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  return sanitized || undefined;
}

/**
 * Validate an array of tags
 * @param tags - Array of tag strings
 * @returns true if valid, error message if invalid
 */
export function validateTags(tags: string[] | undefined): string | true {
  if (!tags) return true;
  
  if (!Array.isArray(tags)) {
    return 'Tags must be an array';
  }
  
  if (tags.length > 10) {
    return 'Maximum 10 tags allowed';
  }
  
  for (const tag of tags) {
    if (typeof tag !== 'string') {
      return 'All tags must be strings';
    }
    if (tag.trim().length === 0) {
      return 'Tags cannot be empty';
    }
    if (tag.length > 50) {
      return 'Tag length cannot exceed 50 characters';
    }
  }
  
  return true;
}

/**
 * Validate note input
 * @param note - Note string
 * @returns true if valid, error message if invalid
 */
export function validateNote(note: string | undefined): string | true {
  if (!note) return true;
  
  if (typeof note !== 'string') {
    return 'Note must be a string';
  }
  
  if (note.trim().length === 0) {
    return true; // Empty notes are okay
  }
  
  if (note.length > 5000) {
    return 'Note cannot exceed 5000 characters';
  }
  
  return true;
}

/**
 * Validate context input for urges
 * @param context - Context string
 * @returns true if valid, error message if invalid
 */
export function validateContext(context: string | undefined): string | true {
  if (!context) return true;
  
  if (typeof context !== 'string') {
    return 'Context must be a string';
  }
  
  if (context.trim().length === 0) {
    return true; // Empty context is okay
  }
  
  if (context.length > 100) {
    return 'Context cannot exceed 100 characters';
  }
  
  return true;
}
