
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  StarOff, 
  Archive, 
  ArchiveRestore,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusType = 'favorite' | 'archive' | 'important';

interface ToggleStatusButtonProps {
  status: StatusType;
  isActive: boolean;
  onClick: () => Promise<void>;
  size?: 'xs' | 'sm' | 'default';
  className?: string;
  showText?: boolean;
  disabled?: boolean;
}

const ToggleStatusButton: React.FC<ToggleStatusButtonProps> = ({
  status,
  isActive,
  onClick,
  size = 'default',
  className,
  showText = false,
  disabled = false
}) => {
  const getIcon = () => {
    switch (status) {
      case 'favorite':
        return isActive ? <Star className="fill-yellow-400 text-yellow-400" /> : <Star />;
      case 'archive':
        return isActive ? <ArchiveRestore /> : <Archive />;
      case 'important':
        return isActive ? <AlertTriangle className="fill-orange-400 text-orange-400" /> : <AlertTriangle />;
      default:
        return null;
    }
  };

  const getLabel = () => {
    if (!showText) return null;
    
    switch (status) {
      case 'favorite':
        return isActive ? 'Favorited' : 'Favorite';
      case 'archive':
        return isActive ? 'Unarchive' : 'Archive';
      case 'important':
        return isActive ? 'Important' : 'Mark Important';
      default:
        return '';
    }
  };

  const getTooltip = () => {
    switch (status) {
      case 'favorite':
        return isActive ? 'Remove from favorites' : 'Add to favorites';
      case 'archive':
        return isActive ? 'Restore from archive' : 'Archive this item';
      case 'important':
        return isActive ? 'Remove important flag' : 'Mark as important';
      default:
        return '';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'xs':
        return 'h-6 w-6 p-0';
      case 'sm':
        return 'h-8 w-8 p-0';
      default:
        return 'h-10 w-10 p-0';
    }
  };

  const getIconClass = () => {
    switch (size) {
      case 'xs':
        return 'h-3 w-3';
      case 'sm':
        return 'h-4 w-4';
      default:
        return 'h-5 w-5';
    }
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      await onClick();
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(getSizeClass(), className)}
      title={getTooltip()}
      onClick={handleClick}
      disabled={disabled}
    >
      <span className={cn(getIconClass(), "transition-all", {
        "text-muted-foreground": !isActive,
      })}>
        {getIcon()}
      </span>
      {showText && <span className="ml-2">{getLabel()}</span>}
    </Button>
  );
};

export default ToggleStatusButton;
