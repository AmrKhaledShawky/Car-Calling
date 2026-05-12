const ROLE_ALIASES = {
  owner: 'landlord'
};

export const normalizeRole = (role) => {
  if (typeof role !== 'string') {
    return '';
  }

  const normalizedRole = role.trim().toLowerCase();
  return ROLE_ALIASES[normalizedRole] || normalizedRole;
};

const getAllowedRoles = (roles = []) => roles
  .flat()
  .map(normalizeRole)
  .filter(Boolean);

const sendUnauthorized = (res, message = 'User not authenticated') => res.status(401).json({
  success: false,
  message
});

const sendForbidden = (res, message = 'Access denied') => res.status(403).json({
  success: false,
  message
});

const getUserRole = (req) => normalizeRole(req.user?.role);

const getUserId = (user) => user?._id?.toString() || user?.id?.toString();

const getResourceOwnerId = (req) => (
  req.params?.ownerId
  || req.params?.userId
  || req.body?.ownerId
  || req.body?.userId
  || req.body?.owner
  || req.params?.id
);

// Grant access to users with any of the provided roles.
export const authorize = (...roles) => {
  const allowedRoles = getAllowedRoles(roles);

  return (req, res, next) => {
    if (!req.user) {
      return sendUnauthorized(res);
    }

    const userRole = getUserRole(req);

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return sendForbidden(
        res,
        `User role ${req.user.role} is not authorized to access this route`
      );
    }

    return next();
  };
};

export const adminAccess = authorize('admin');
export const landlordAccess = authorize('landlord');
export const ownerAccess = authorize('owner');

export const isAdmin = (req) => getUserRole(req) === 'admin';
export const isLandlord = (req) => getUserRole(req) === 'landlord';
export const isOwnerRole = (req) => getUserRole(req) === 'landlord';

// Check if the authenticated user owns the requested resource or is an admin.
export const ownerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return sendUnauthorized(res);
  }

  if (isAdmin(req)) {
    return next();
  }

  const resourceOwnerId = getResourceOwnerId(req);

  if (!resourceOwnerId) {
    return res.status(400).json({
      success: false,
      message: 'Resource owner ID not found'
    });
  }

  if (getUserId(req.user) !== resourceOwnerId.toString()) {
    return sendForbidden(res, 'Not authorized to access this resource');
  }

  return next();
};

export default authorize;
