
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
  document.body.style.pointerEvents = '';
  
  // Remove all dialog-related classes
  document.body.classList.remove('dialog-open', 'sheet-open');
  
  // Force a small reflow to ensure styles are applied
  void document.body.offsetHeight;
  
  // Additional cleanup for any aria attributes
  document.body.removeAttribute('aria-hidden');
  
  console.log('Dialog cleanup executed: Body styles and classes reset');
};

/**
 * Apply styles for an open dialog
 */
export const applyDialogOpenStyles = () => {
  // Ensure any previous styles are cleared first
  resetBodyStyles();
  // Then apply the new class
  setTimeout(() => {
    document.body.classList.add('dialog-open');
    console.log('Dialog open styles applied');
  }, 10);
};

/**
 * Apply styles for an open sheet
 */
export const applySheetOpenStyles = () => {
  // Ensure any previous styles are cleared first
  resetBodyStyles();
  // Then apply the new class
  setTimeout(() => {
    document.body.classList.add('sheet-open');
    console.log('Sheet open styles applied');
  }, 10);
};

/**
 * Create a consistent dialog cleanup handler
 * This function returns a closure that can be used for cleanup
 */
export const createDialogCloseHandler = (closeFunction: (open: boolean) => void) => {
  return () => {
    closeFunction(false);
    // Add delay before cleanup
    setTimeout(() => {
      resetBodyStyles();
      console.log('Dialog close handler executed with delay');
    }, 250);
  };
};

/**
 * Force full DOM cleanup for all dialogs
 * This is a last resort function to ensure UI remains clickable
 */
export const forceFullDialogCleanup = () => {
  // Reset all dialog-related styles and classes
  resetBodyStyles();
  
  // Clear any remaining backdrop elements
  const backdropElements = document.querySelectorAll('[data-radix-portal]');
  backdropElements.forEach(element => {
    try {
      element.remove();
    } catch (e) {
      console.warn('Error removing backdrop element:', e);
    }
  });
  
  // Also clear any aria-hidden attributes from other elements
  document.querySelectorAll('[aria-hidden="true"]').forEach(el => {
    if (el !== document.body) {
      el.removeAttribute('aria-hidden');
    }
  });
  
  // Ensure pointer events are reset on all relevant elements
  document.querySelectorAll('div[style*="pointer-events: none"]').forEach(el => {
    (el as HTMLElement).style.pointerEvents = '';
  });
  
  console.log('Force full dialog cleanup executed');
};
