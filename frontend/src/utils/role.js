export function getRoleName(user) {
  if (!user) return null;

  if (typeof user.role === "string") {
    return user.role.toUpperCase();
  }

  return user.role?.name?.toUpperCase() || null;
}

export function isAdmin(user) {
  return getRoleName(user) === "ADMIN";
}

export function isWarga(user) {
  return getRoleName(user) === "WARGA";
}