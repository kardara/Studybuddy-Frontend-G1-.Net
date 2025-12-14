import { apiClient } from "@/lib/api.config";

// Backend DTO interfaces matching database schema exactly
interface BackendUserDto {
  UserId: number;
  Email: string;
  FirstName: string;
  LastName: string;
  Role: string;
  IsActive: boolean;
  IsBlocked: boolean;
  PhoneNumber?: string;
  CreatedAt: string;
  UpdatedAt?: string;
  LastLoginAt?: string;
  BlockReason?: string;
}

interface BackendUserListResponseDto {
  Users: BackendUserDto[];
  TotalCount: number;
  PageNumber: number;
  PageSize: number;
  TotalPages: number;
}

interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
}

interface PermissionDto {
  PermissionId: number;
  PermissionName: string;
  Description: string;
  CreatedAt: string;
}

interface RolePermissionDto {
  RolePermissionId: number;
  Role: string;
  PermissionId: number;
}

// Enhanced interfaces for comprehensive admin management
export interface AdminUser {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isBlocked: boolean;
  isActive: boolean;
  phoneNumber?: string;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  blockReason?: string;
}

export interface UserDetails extends AdminUser {
  permissions: PermissionDto[];
  totalEnrollments: number;
  completedCourses: number;
  totalTimeSpent: number;
  averageQuizScore: number;
  certificatesEarned: number;
  lastActivity: string;
  accountStatus: "active" | "inactive" | "suspended" | "pending_verification";
  subscriptionStatus?: "free" | "premium" | "enterprise";
  referredBy?: number;
  totalReferrals: number;
}

export interface BlockUserRequest {
  blockReason: string;
  duration?: number; // in days, null for permanent
  notifyUser?: boolean;
}

export interface AuditLog {
  auditLogId: number;
  actionType: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  timestamp: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  result: "success" | "failure" | "partial";
}

export interface AuditLogFilters {
  startDate?: string;
  endDate?: string;
  actionType?: string;
  entityType?: string;
  performedBy?: string;
  result?: "success" | "failure" | "partial";
  limit?: number;
  offset?: number;
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  role?: string;
  isBlocked?: boolean;
  isActive?: boolean;
  phoneNumber?: string;
  blockReason?: string;
}

// Enhanced admin interfaces
export interface Permission {
  permissionId: number;
  permissionName: string;
  description: string;
  createdAt: string;
}

export interface Role {
  roleId: number;
  name: string;
  description: string;
  permissions: Permission[];
  userCount: number;
  isSystem: boolean; // true for built-in roles
}

export interface SystemSettings {
  settingId: string;
  category: string;
  key: string;
  value: unknown;
  description: string;
  isEditable: boolean;
  lastModified: string;
  modifiedBy: string;
}

export interface BulkActionRequest {
  action: "block" | "unblock" | "delete" | "change_role" | "send_email";
  userIds: number[];
  parameters?: {
    role?: string;
    reason?: string;
    emailTemplate?: string;
  };
}

export interface BulkActionResult {
  successful: number;
  failed: number;
  errors: { userId: number; error: string }[];
}

export interface SystemHealth {
  status: "healthy" | "warning" | "critical";
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  activeConnections: number;
  lastBackup: string;
  databaseStatus: "connected" | "disconnected" | "error";
}

export const adminService = {
  // Enhanced user management
  async getAllUsers(
    page: number = 1,
    limit: number = 50,
    filters?: {
      role?: string;
      status?: string;
      search?: string;
    }
  ): Promise<AdminUser[]> {
    console.log("AdminService: getAllUsers called with:", {
      page,
      limit,
      filters,
    });

    try {
      const response = await apiClient.get<BackendUserListResponseDto>(
        "/admin/users",
        {
          params: { page, limit, ...filters },
        }
      );

      console.log("AdminService: Raw response data:", response.data);

      // Handle the backend response structure and map to frontend format
      const backendData = response.data;

      // FIXED: Check for both capital 'Users' and lowercase 'users' properties
      if (backendData && (backendData.Users || (backendData as any).users)) {
        // Backend returns UserListResponseDto with Users array
        const usersArray = backendData.Users || (backendData as any).users;
        console.log("AdminService: Processing Users array:", usersArray);
        const users = usersArray.map((user: any) => ({
          userId: user.UserId || user.Id || user.userId,
          email: user.Email || user.email,
          firstName: user.FirstName || user.firstName,
          lastName: user.LastName || user.lastName,
          role: user.Role || user.role,
          isBlocked: user.IsBlocked || user.isBlocked,
          isActive: user.IsActive !== undefined ? user.IsActive : true,
          phoneNumber: user.PhoneNumber || user.phoneNumber,
          createdAt: user.CreatedAt || user.createdAt,
          updatedAt: user.UpdatedAt || user.updatedAt,
          lastLoginAt: user.LastLoginAt || user.lastLoginAt,
          blockReason: user.BlockReason || user.blockReason,
        }));
        console.log("AdminService: Mapped users:", users);
        return users;
      }

      // Fallback for direct array response (legacy support)
      if (Array.isArray(backendData)) {
        console.log("AdminService: Processing direct array:", backendData);
        const users = backendData.map((user: any) => ({
          userId: user.UserId || user.Id || user.userId,
          email: user.Email || user.email,
          firstName: user.FirstName || user.firstName,
          lastName: user.LastName || user.lastName,
          role: user.Role || user.role,
          isBlocked: user.IsBlocked || user.isBlocked,
          isActive: user.IsActive !== undefined ? user.IsActive : true,
          phoneNumber: user.PhoneNumber || user.phoneNumber,
          createdAt: user.CreatedAt || user.createdAt,
          updatedAt: user.UpdatedAt || user.updatedAt,
          lastLoginAt: user.LastLoginAt || user.lastLoginAt,
          blockReason: user.BlockReason || user.blockReason,
        }));
        console.log("AdminService: Mapped users from array:", users);
        return users;
      }

      console.log("AdminService: No users found in response");
      return [];
    } catch (error) {
      console.error("AdminService: Error in getAllUsers:", error);
      throw error;
    }
  },

  async createUser(userData: CreateUserRequest): Promise<AdminUser> {
    const response = await apiClient.post<AdminUser>("/admin/users", userData);
    return response.data;
  },

  async getUserDetails(userId: number): Promise<UserDetails> {
    const response = await apiClient.get<UserDetails>(`/admin/users/${userId}`);
    return response.data;
  },

  async updateUser(
    userId: number,
    userData: UserUpdateRequest
  ): Promise<AdminUser> {
    const response = await apiClient.put<AdminUser>(
      `/admin/users/${userId}`,
      userData
    );
    return response.data;
  },

  async deleteUser(userId: number, reason?: string): Promise<void> {
    await apiClient.delete(`/admin/users/${userId}`, {
      data: { reason },
    });
  },

  async blockUser(userId: number, request: BlockUserRequest): Promise<void> {
    await apiClient.put(`/admin/users/${userId}/block`, {
      blockReason: request.blockReason,
      notifyUser: request.notifyUser || false,
    });
  },

  async unblockUser(userId: number): Promise<void> {
    await apiClient.put(`/admin/users/${userId}/unblock`);
  },

  async bulkUserAction(request: BulkActionRequest): Promise<BulkActionResult> {
    const response = await apiClient.post<BulkActionResult>(
      "/admin/users/bulk-action",
      request
    );
    return response.data;
  },

  // Permission management
  async getPermissions(): Promise<Permission[]> {
    const response = await apiClient.get<Permission[]>("/permissions");
    return response.data;
  },

  async getUserPermissions(userId: number): Promise<Permission[]> {
    const response = await apiClient.get<Permission[]>(
      `/permissions/user/${userId}`
    );
    return response.data;
  },

  async grantPermission(userId: number, permissionId: number): Promise<void> {
    await apiClient.post(`/permissions/grant`, {
      userId,
      permissionId,
    });
  },

  async revokePermission(userId: number, permissionId: number): Promise<void> {
    await apiClient.delete(
      `/permissions/user/${userId}/permission/${permissionId}`
    );
  },

  async getRoles(): Promise<Role[]> {
    const response = await apiClient.get<Role[]>("/admin/roles");
    return response.data;
  },

  async createRole(
    role: Omit<Role, "roleId" | "userCount" | "isSystem">
  ): Promise<Role> {
    const response = await apiClient.post<Role>("/admin/roles", role);
    return response.data;
  },

  async updateRole(roleId: number, updates: Partial<Role>): Promise<Role> {
    const response = await apiClient.put<Role>(
      `/admin/roles/${roleId}`,
      updates
    );
    return response.data;
  },

  async deleteRole(roleId: number): Promise<void> {
    await apiClient.delete(`/admin/roles/${roleId}`);
  },

  async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    await apiClient.post(`/admin/users/${userId}/roles/${roleId}`);
  },

  async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
    await apiClient.delete(`/admin/users/${userId}/roles/${roleId}`);
  },

  // Audit logs
  async getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLog[]> {
    const response = await apiClient.post<AuditLog[]>(
      "/admin/audit-logs",
      filters
    );
    return response.data;
  },

  // System management
  async getSystemSettings(): Promise<SystemSettings[]> {
    const response = await apiClient.get<SystemSettings[]>("/admin/settings");
    return response.data;
  },

  async updateSystemSetting(
    key: string,
    value: unknown
  ): Promise<SystemSettings> {
    const response = await apiClient.put<SystemSettings>(
      `/admin/settings/${key}`,
      {
        value,
      }
    );
    return response.data;
  },

  async getSystemHealth(): Promise<SystemHealth> {
    const response = await apiClient.get<SystemHealth>("/admin/system/health");
    return response.data;
  },

  async backupDatabase(): Promise<{ backupId: string; downloadUrl: string }> {
    const response = await apiClient.post<{
      backupId: string;
      downloadUrl: string;
    }>("/admin/system/backup");
    return response.data;
  },

  // Email management
  async sendBulkEmail(request: {
    userIds: number[];
    subject: string;
    content: string;
    templateId?: string;
    scheduledDate?: string;
  }): Promise<{ emailId: string; recipientCount: number }> {
    const response = await apiClient.post("/admin/email/bulk", request);
    return response.data;
  },

  async getEmailTemplates(): Promise<
    Array<{
      templateId: string;
      name: string;
      subject: string;
      category: string;
      isActive: boolean;
    }>
  > {
    const response = await apiClient.get("/admin/email/templates");
    return response.data;
  },

  // Legacy compatibility methods
  async getUserPermissionsLegacy(userId: number): Promise<string[]> {
    const response = await apiClient.get<string[]>(
      `/admin/users/${userId}/permissions`
    );
    return response.data;
  },

  async getStudentAnalytics(
    filters: Record<string, unknown> = {}
  ): Promise<AdminUser[]> {
    const response = await apiClient.get<AdminUser[]>("/analytics/students", {
      params: filters,
    });
    return response.data;
  },
};
