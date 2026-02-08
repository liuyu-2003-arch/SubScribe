/**
 * Parses an SRT file string into plain text, removing timestamps and indices.
 */
export const parseSrtToText = (srtContent: string): string => {
  // Normalize line endings
  const lines = srtContent.replace(/\r\n/g, '\n').split('\n');
  const textLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines
    if (!trimmed) continue;
    // Skip numeric indices (e.g., "1", "105") - strict check to avoid deleting short dialogue numbers
    if (/^\d+$/.test(trimmed)) continue;
    
    // Skip timestamp lines. 
    // Matches: 00:00:00,000 --> 00:00:00,000 (supports comma or dot for ms, and loose spacing)
    if (/^\d{1,2}:\d{2}:\d{2}[,.]\d{3}\s*-->\s*\d{1,2}:\d{2}:\d{2}[,.]\d{3}.*$/.test(trimmed)) continue;
    
    // It's text content
    textLines.push(trimmed);
  }

  // Join with spaces to create a continuous stream for the LLM
  return textLines.join(' ');
};