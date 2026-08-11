/**
 * Get displayable name for a logged in user object.
 * Priority: First + Last Name > Name > Business Name > Email prefix > Fallback.
 */
export const getUserDisplayName = (user) => {
  if (!user) return "Admin User";
  const nameFromParts = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (nameFromParts) return nameFromParts;
  if (user.name && user.name.trim()) return user.name.trim();
  if (user.businessName && user.businessName.trim()) return user.businessName.trim();
  if (user.email && user.email.trim()) {
    const prefix = user.email.split("@")[0];
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }
  return "Admin User";
};

/**
 * Extract up to 2 uppercase initials from a user's display name.
 */
export const getUserInitials = (name) => {
  if (!name || !name.trim()) return "AU";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return parts[0].toUpperCase();
};
