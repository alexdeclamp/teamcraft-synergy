
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
  // Then apply the new class with a small delay for reliability
  setTimeout(() => {
    document.body.classList.add('dialog-open');
    console.log('Dialog open styles applied');
  }, 100); // Increased delay for more reliable style application
};

/**
 * Apply styles for an open sheet
 */
export const applySheetOpenStyles = () => {
  // Ensure any previous styles are cleared first
  resetBodyStyles();
  // Then apply the new class with a small delay for reliability
  setTimeout(() => {
    document.body.classList.add('sheet-open');
    console.log('Sheet open styles applied');
  }, 100); // Increased delay for more reliable style application
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
    }, 500); // Increased from 400ms to 500ms for more reliability
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
  }, 150); // Small delay to ensure React has finished its updates
};

/**
 * Initialize dialog state - resolves flash open/close issue
 * This ensures the dialog state is properly initialized before opening
 */
export const initializeDialogState = () => {
  // First ensure any lingering state is cleared
  forceFullDialogCleanup();
  
  // Force removal of any remaining Radix portal elements
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
  }, 0);
  
  // Add a small delay before allowing the dialog to open
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      try {
        // Apply dialog styles immediately before opening
        document.body.classList.add('dialog-pending');
        
        // Add another small delay to ensure styles are applied
        setTimeout(() => {
          document.body.classList.remove('dialog-pending');
          console.log('Dialog state fully initialized');
          resolve(true);
        }, 50);
      } catch (error) {
        console.error('Error during dialog initialization:', error);
        resolve(false);
      }
    }, 100); // Increased from 50ms to 100ms for more reliable initialization
  });
};
