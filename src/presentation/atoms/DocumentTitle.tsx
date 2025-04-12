/* eslint-disable */
import React, { useEffect } from 'react';

interface DocumentTitleProps {
  title: string;
  children?: React.ReactNode;
}

/**
 * DocumentTitle component - Updates the document title and optionally renders children
 *
 * This is an atomic component that changes the browser tab title
 * and can optionally wrap child content.
 *
 * @example
 * // Basic usage - just set the title
 * <DocumentTitle title="Dashboard - Novamind" />
 *
 * @example
 * // With children - wrap content while setting title
 * <DocumentTitle title="Patient Profile - Novamind">
 *   <div>Content here</div>
 * </DocumentTitle>
 */
export const DocumentTitle: React.FC<DocumentTitleProps> = ({ title, children }) => {
  useEffect(() => {
    // Save previous title to restore on unmount
    const prevTitle = document.title;

    // Set the new title
    document.title = title;

    // Clean up function to restore original title when component unmounts
    return () => {
      document.title = prevTitle;
    };
  }, [title]);

  // Either return children if provided, or render nothing (null)
  return children ? <>{children}</> : null;
};

export default DocumentTitle;
