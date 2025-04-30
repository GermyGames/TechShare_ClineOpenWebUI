import { colors } from '../../../theme/colors';
import { branding } from '../../../theme/branding';

export const paperStyles = {
  root: {
    background: colors.bgColor,
    border: `1px solid ${colors.darkPurple}`,
  }
};

export const buttonStyles = {
  root: {
    background: branding.primaryColor,
    color: "white",
    minWidth: 100,
  }
};

export const sourceItemStyles = {
  root: {
    borderRadius: 6,
    border: `1px solid ${colors.darkPurple}`,
    transition: "background 0.2s",
  }
};

export const badgeStyles = {
  root: {
    fontWeight: 600,
    letterSpacing: 0.2,
    color: "white",
  }
}; 