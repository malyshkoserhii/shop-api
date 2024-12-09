import { Role } from '@prisma/client';

export const matchRoles = (roles: Array<Role>, role: Role) => {
	console.log('🚀 ~ matchRoles ~ role_:', role);
	console.log('🚀 ~ matchRoles ~ roles_:', roles);
	const result = roles.includes(role);
	console.log('🚀 ~ matchRoles ~ result:', result);
	return result;
};
