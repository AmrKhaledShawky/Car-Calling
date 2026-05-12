export const DEFAULT_ROLE = "user";

export const ROLE_HOME_ROUTES = {
  admin: "/admin/dashboard",
  landlord: "/landlord/dashboard",
  user: "/browse-cars",
};

export const normalizeRole = (role) => {
  if (!role || typeof role !== "string") {
    return DEFAULT_ROLE;
  }

  const normalizedRole = role.toLowerCase();
  return ROLE_HOME_ROUTES[normalizedRole] ? normalizedRole : DEFAULT_ROLE;
};

export const getAuthorizedRoute = (role) => {
  const normalizedRole = normalizeRole(role);
  return ROLE_HOME_ROUTES[normalizedRole];
};
