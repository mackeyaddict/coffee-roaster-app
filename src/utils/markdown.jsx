import React, { useState, useEffect } from "react";

/**
 * Simple text renderer that converts markdown-like syntax to basic HTML
 * This is a fallback when ReactMarkdown fails or isn't available
 * @param {string} text - The markdown-like text to convert
 * @returns {string} HTML string with basic formatting
 */
export const simpleMarkdownToHtml = (text) => {
  if (!text) return "";
  
  // Basic markdown-like conversion
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Lists (simple implementation)
    .replace(/^\s*-\s+(.*?)$/gm, '<li>$1</li>')
    // Line breaks
    .replace(/\n/g, '<br/>')
    // Strip any remaining markdown symbols that could cause display issues
    .replace(/[\\*_~`#]/g, '');
};

/**
 * Safe text display component that falls back to basic formatting
 * @param {Object} props - Component props
 * @param {string} props.content - Text content to display
 * @returns {JSX.Element} React component with safely rendered content
 */
export const SafeTextDisplay = ({ content }) => {
  const [formattedContent, setFormattedContent] = useState("");
  const [renderMethod, setRenderMethod] = useState("simple");
  
  useEffect(() => {
    // Always start with simple rendering for safety
    const cleanContent = simpleMarkdownToHtml(sanitizeText(content));
    setFormattedContent(cleanContent);
    
    // Attempt to load ReactMarkdown asynchronously if needed
    if (content && content.length > 0 && mayContainMarkdown(content)) {
      try {
        import("react-markdown").then(ReactMarkdown => {
          setRenderMethod("markdown");
        }).catch(err => {
          console.warn("Failed to load ReactMarkdown, using fallback renderer", err);
        });
      } catch (error) {
        console.warn("Error in markdown rendering setup:", error);
      }
    }
  }, [content]);
  
  // Simple safe render without any markdown libraries
  return (
    <div 
      className="markdown-content" 
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  );
};

/**
 * Checks if text may contain markdown syntax (simplified)
 * @param {string} text - The text to check
 * @returns {boolean} Whether the text likely contains markdown
 */
export const mayContainMarkdown = (text) => {
  if (!text) return false;
  
  // Simple check for common markdown patterns
  const simpleMarkdownCheck = /(\*|\#|\`|\[|\]|\(|\)|\>|\-|\|)/g;
  return simpleMarkdownCheck.test(text);
};

/**
 * Basic text sanitization function
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export const sanitizeText = (text) => {
  if (!text) return "";
  
  return String(text)
    // Remove HTML tags completely
    .replace(/<[^>]*>/g, '')
    // Remove escape characters
    .replace(/\\([^\\])/g, '$1')
    // Normalize spaces
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Render content for display in chat
 * This is the main function to use in your component
 * @param {string} content - The content to render
 * @returns {JSX.Element} Rendered content component
 */
export const renderMarkdown = (content) => {
  if (!content) return null;
  
  return <SafeTextDisplay content={content} />;
};

/**
 * Legacy functions for backward compatibility
 */
export const containsMarkdown = (text) => {
  return text; // Simply return the text for backward compatibility
};

export const sanitizeMarkdown = sanitizeText;

export const prepareMarkdownContent = (content) => {
  if (!content) return "";
  return sanitizeText(content);
};