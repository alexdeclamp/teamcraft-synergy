
/**
 * Utility functions for managing dialog and sheet-related DOM manipulations
 */

/**
 * Reset all body styles and classes related to dialogs/sheets
 * This ensures the UI remains clickable after dialogs are closed
 */
export const resetBodyStyles = () => {
  // Reset scroll behavior
  document.body.style.overflow = '';
  
  // Remove all dialog-related classes
  document.body.classList.remove('dialog-open', 'sheet-open');
  
  // Force a small reflow to ensure styles are applied
  void document.body.offsetHeight;
};

/**
 * Apply styles for an open dialog
 */
export const applyDialogOpenStyles = () => {
  document.body.classList.add('dialog-open');
};

/**
 * Apply styles for an open sheet
 */
export const applySheetOpenStyles = () => {
  document.body.classList.add('sheet-open');
};

/**
 * Create a consistent dialog cleanup handler
 */
export const createDialogCloseHandler = (closeFunction: (open: boolean) => void) => {
  return () => {
    closeFunction(false);
    resetBodyStyles();
  };
};
