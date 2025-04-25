
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
  document.body.classList.remove('dialog-open', 'sheet-open', 'dialog-pending');
  
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
  
  // Apply dialog-open class immediately
  document.body.classList.add('dialog-open');
  
  // Force a small reflow to ensure styles are applied
  void document.body.offsetHeight;
  
  console.log('Dialog open styles applied immediately');
};

/**
 * Apply styles for an open sheet
 */
export const applySheetOpenStyles = () => {
  // Ensure any previous styles are cleared first
  resetBodyStyles();
  
  // Apply sheet-open class immediately
  document.body.classList.add('sheet-open');
  
  // Force a small reflow to ensure styles are applied
  void document.body.offsetHeight;
  
  console.log('Sheet open styles applied immediately');
};

/**
 * Create a consistent dialog cleanup handler
 * This function returns a closure that can be used for cleanup
 */
export const createDialogCloseHandler = (closeFunction: (open: boolean) => void) => {
  return () => {
    closeFunction(false);
    // Add significant delay before cleanup to ensure animation completes
    setTimeout(() => {
      resetBodyStyles();
      console.log('Dialog close handler executed with delay');
    }, 600); // Increased for more reliability
  };
};

/**
 * Force full DOM cleanup for all dialogs
 * This is a last resort function to ensure UI remains clickable
 */
export const forceFullDialogCleanup = () => {
  // Reset all dialog-related styles and classes
  resetBodyStyles();
  
  // Clear any remaining backdrop elements with a delay to ensure animation completes
  setTimeout(() => {
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
  }, 200); // Increased delay for more reliable cleanup
};

/**
 * Initialize dialog state - resolves flash open/close issue
 * This ensures the dialog state is properly initialized before opening
 */
export const initializeDialogState = async () => {
  // First ensure any lingering state is cleared
  forceFullDialogCleanup();
  
  // Mark dialog as pending to prevent early cleanup
  document.body.classList.add('dialog-pending');
  
  // Force removal of any remaining Radix portal elements
  const removePortals = new Promise<void>((resolve) => {
    setTimeout(() => {
      document.querySelectorAll('[data-radix-portal]').forEach(element => {
        if (element.children.length === 0) {
          try {
            element.remove();
          } catch (e) {
            console.warn('Error removing empty Radix portal:', e);
          }
        }
      });
      resolve();
    }, 50);
  });
  
  await removePortals;
  
  // Add a small delay before allowing the dialog to open
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      try {
        // Apply dialog styles immediately before opening
        document.body.classList.add('dialog-open');
        
        // Add another small delay to ensure styles are applied
        setTimeout(() => {
          document.body.classList.remove('dialog-pending');
          console.log('Dialog state fully initialized');
          resolve(true);
        }, 100);
      } catch (error) {
        console.error('Error during dialog initialization:', error);
        resolve(false);
      }
    }, 150); // Increased for more reliable initialization
  });
};
