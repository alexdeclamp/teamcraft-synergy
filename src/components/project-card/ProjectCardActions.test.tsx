
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectCardActions from './ProjectCardActions';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    update: vi.fn(() => ({
      eq: vi.fn().mockReturnValue({ error: null })
    }))
  }))
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

describe('ProjectCardActions', () => {
  const defaultProps = {
    id: '123',
    isOwner: true,
    isFavorite: false,
    setFavorite: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders favorite button correctly', () => {
    render(
      <BrowserRouter>
        <ProjectCardActions {...defaultProps} />
      </BrowserRouter>
    );
    
    // Star icon should be rendered
    const favoriteButton = screen.getByLabelText('Add to favorites');
    expect(favoriteButton).toBeInTheDocument();
  });

  it('renders menu button correctly', () => {
    render(
      <BrowserRouter>
        <ProjectCardActions {...defaultProps} />
      </BrowserRouter>
    );
    
    const menuButton = screen.getByLabelText('Open menu');
    expect(menuButton).toBeInTheDocument();
  });

  it('toggles favorite status on click', async () => {
    render(
      <BrowserRouter>
        <ProjectCardActions {...defaultProps} />
      </BrowserRouter>
    );
    
    const favoriteButton = screen.getByLabelText('Add to favorites');
    fireEvent.click(favoriteButton);
    
    // Check if Supabase was called
    expect(mockSupabase.from).toHaveBeenCalledWith('projects');
    
    // Check if setFavorite was called with the new status
    expect(defaultProps.setFavorite).toHaveBeenCalledWith(true);
    
    // Check if success toast was shown
    expect(toast.success).toHaveBeenCalledWith('Added to favorites');
  });

  it('renders archive option only for owners', () => {
    const { rerender } = render(
      <BrowserRouter>
        <ProjectCardActions {...defaultProps} />
      </BrowserRouter>
    );
    
    // Open the dropdown menu
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    
    // Archive option should be visible for owners
    const archiveOption = screen.getByText('Archive brain');
    expect(archiveOption).toBeInTheDocument();
    
    // Re-render with non-owner
    rerender(
      <BrowserRouter>
        <ProjectCardActions {...defaultProps} isOwner={false} />
      </BrowserRouter>
    );
    
    // Open the dropdown menu again
    fireEvent.click(menuButton);
    
    // Archive option should not be visible for non-owners
    expect(screen.queryByText('Archive brain')).not.toBeInTheDocument();
  });
});
