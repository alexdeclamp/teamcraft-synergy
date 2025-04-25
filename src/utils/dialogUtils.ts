
/**
 * Utility functions for managing dialog and sheet-related DOM manipulations
 */

/**
 * Reset all body styles and classes related to dialogs/sheets
 * This ensures the UI remains clickable after dialogs are closed
 */
export const resetBodyStyles = () => {
  try {
    // Use safe way to access and modify document elements
    if (typeof document !== 'undefined' && document.body) {
      // Reset scroll behavior
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
      
      // Remove all dialog-related classes
      document.body.classList.remove('dialog-open', 'sheet-open');
      
      // Force a small reflow to ensure styles are applied
      void document.body.offsetHeight;
      
      // Additional cleanup for any aria attributes
      document.body.removeAttribute('aria-hidden');
      
      console.log('Dialog cleanup executed: Body styles and classes reset');
    }
  } catch (error) {
    console.error('Error in resetBodyStyles:', error);
  }
};

/**
 * Apply styles for an open dialog
 */
export const applyDialogOpenStyles = () => {
  try {
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.add('dialog-open');
    }
  } catch (error) {
    console.error('Error in applyDialogOpenStyles:', error);
  }
};

/**
 * Apply styles for an open sheet
 */
export const applySheetOpenStyles = () => {
  try {
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.add('sheet-open');
    }
  } catch (error) {
    console.error('Error in applySheetOpenStyles:', error);
  }
};

/**
 * Create a consistent dialog cleanup handler
 * This function returns a closure that can be used for cleanup
 */
export const createDialogCloseHandler = (closeFunction: (open: boolean) => void) => {
  return () => {
    try {
      closeFunction(false);
      resetBodyStyles();
      console.log('Dialog close handler executed');
    } catch (error) {
      console.error('Error in dialog close handler:', error);
    }
  };
};

/**
 * Force full DOM cleanup for all dialogs
 * This is a last resort function to ensure UI remains clickable
 */
export const forceFullDialogCleanup = () => {
  try {
    // Reset all dialog-related styles and classes
    resetBodyStyles();
    
    // Clear any remaining backdrop elements - use safe DOM methods
    if (typeof document !== 'undefined') {
      const backdropElements = document.querySelectorAll('[data-radix-portal]');
      backdropElements.forEach(element => {
        try {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
        } catch (e) {
          console.warn('Error removing backdrop element:', e);
        }
      });
    }
    
    console.log('Force full dialog cleanup executed');
  } catch (error) {
    console.error('Error in forceFullDialogCleanup:', error);
  }
};
