import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Mail,
  RotateCcw,
  Award,
  X,
  Plus,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  Check,
  Loader2,
  Download,
  AlertCircle,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api.config";

interface StudentUser {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  isBlocked: boolean;
  blockReason?: string;
  createdAt: string;
  lastLoginAt?: string;
  totalEnrollments?: number;
  completedCourses?: number;
  totalQuizAttempts?: number;
  certificatesEarned?: number;
}

interface Permission {
  permissionId: number;
  permissionName: string;
  description?: string;
  isActive?: boolean;
}

interface BlockModalData {
  show: boolean;
  studentId?: number;
  studentName?: string;
  currentReason?: string;
}

interface PermissionModalData {
  show: boolean;
  studentId?: number;
  studentName?: string;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "blocked">(
    "all"
  );
  const [expandedStudent, setExpandedStudent] = useState<number | null>(null);
  const [blockModal, setBlockModal] = useState<BlockModalData>({ show: false });
  const [permissionModal, setPermissionModal] = useState<PermissionModalData>({
    show: false,
  });
  const [blockReason, setBlockReason] = useState("");
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>(
    []
  );
  const [studentPermissions, setStudentPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Load students on mount
  useEffect(() => {
    fetchStudents();
    fetchAvailablePermissions();
  }, []);

  // Filter students when search or filter changes
  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterStatus, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("admin/users?role=Student&pageSize=100");
      if (response.data.users) {
        setStudents(response.data.users);
      } else {
        throw new Error("Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load students",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePermissions = async () => {
    try {
      const response = await apiClient.get("permissions/list");
      setAvailablePermissions(response.data);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const fetchStudentPermissions = async (studentId: number) => {
    try {
      const response = await apiClient.get(`admin/users/${studentId}/permissions`);
      setStudentPermissions(response.data.permissions || []);
      setSelectedPermissions(response.data.permissions?.map((p: Permission) => p.permissionId) || []);
    } catch (error) {
      console.error("Error fetching student permissions:", error);
    }
  };

  const applyFilters = () => {
    const filtered = students.filter((student) => {
      const matchesSearch =
        searchTerm === "" ||
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && !student.isBlocked) ||
        (filterStatus === "blocked" && student.isBlocked);

      return matchesSearch && matchesStatus;
    });

    setFilteredStudents(filtered);
  };

  const handleBlockStudent = async () => {
    if (!blockModal.studentId || !blockReason.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a reason for blocking",
      });
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.put(`admin/users/${blockModal.studentId}/block`, { blockReason });

      setStudents(
        students.map((s) =>
          s.userId === blockModal.studentId
            ? { ...s, isBlocked: true, blockReason }
            : s
        )
      );
      setBlockModal({ show: false });
      setBlockReason("");
      toast({
        title: "Success",
        description: "Student has been blocked",
      });
    } catch (error) {
      console.error("Error blocking student:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to block student",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnblockStudent = async (studentId: number) => {
    setSubmitting(true);
    try {
      await apiClient.put(`admin/users/${studentId}/unblock`);

      setStudents(
        students.map((s) =>
          s.userId === studentId ? { ...s, isBlocked: false, blockReason: undefined } : s
        )
      );
      toast({
        title: "Success",
        description: "Student has been unblocked",
      });
    } catch (error) {
      console.error("Error unblocking student:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unblock student",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (!confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.delete(`admin/users/${studentId}`);

      setStudents(students.filter((s) => s.userId !== studentId));
      toast({
        title: "Success",
        description: "Student has been deleted",
      });
    } catch (error) {
      console.error("Error deleting student:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete student",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenPermissionsModal = async (student: StudentUser) => {
    await fetchStudentPermissions(student.userId);
    setPermissionModal({
      show: true,
      studentId: student.userId,
      studentName: `${student.firstName} ${student.lastName}`,
    });
  };

  const handleSavePermissions = async () => {
    if (!permissionModal.studentId) return;

    setSubmitting(true);
    try {
      // Get current permissions
      const currentPermIds = studentPermissions.map((p) => p.permissionId);

      // Find permissions to add and remove
      const toAdd = selectedPermissions.filter((id) => !currentPermIds.includes(id));
      const toRemove = currentPermIds.filter((id) => !selectedPermissions.includes(id));

      // Grant new permissions
      for (const permId of toAdd) {
        await apiClient.post("permissions/grant", {
          userId: permissionModal.studentId,
          permissionId: permId,
        });
      }

      // Revoke removed permissions
      for (const permId of toRemove) {
        await apiClient.delete(`permissions/user/${permissionModal.studentId}/permission/${permId}`);
      }

      toast({
        title: "Success",
        description: "Permissions updated successfully",
      });
      setPermissionModal({ show: false });
      await fetchStudents();
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update permissions",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Student Management</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px]">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "blocked")}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Students</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border">
          <div className="text-sm text-muted-foreground">Total Students</div>
          <div className="text-2xl font-bold">{students.length}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border">
          <div className="text-sm text-muted-foreground">Active</div>
          <div className="text-2xl font-bold">{students.filter((s) => !s.isBlocked).length}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border">
          <div className="text-sm text-muted-foreground">Blocked</div>
          <div className="text-2xl font-bold">{students.filter((s) => s.isBlocked).length}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border">
          <div className="text-sm text-muted-foreground">Avg Progress</div>
          <div className="text-2xl font-bold">
            {students.length > 0
              ? Math.round(
                students.reduce(
                  (sum, s) => sum + ((s.totalEnrollments || 0) > 0 ? 50 : 0),
                  0
                ) / students.length
              )
              : 0}
            %
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Student</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Enrollments</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Certificates</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Joined</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No students found
                  </td>
                </tr>
              ) : (
                <>
                  {filteredStudents.map((student) => (
                    <React.Fragment key={student.userId}>
                      {/* Main Row */}
                      <tr className="hover:bg-muted/50">
                        <td className="px-6 py-4">
                          <div
                            className="cursor-pointer flex items-center gap-2"
                            onClick={() =>
                              setExpandedStudent(
                                expandedStudent === student.userId ? null : student.userId
                              )
                            }
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${expandedStudent === student.userId ? "rotate-180" : ""
                                }`}
                            />
                            <div>
                              <div className="font-medium">{`${student.firstName} ${student.lastName}`}</div>
                              <div className="text-sm text-muted-foreground">
                                {student.phoneNumber || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">{student.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${student.isBlocked
                                ? "bg-red-100 text-red-700"
                                : student.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                          >
                            {student.isBlocked
                              ? "Blocked"
                              : student.isActive
                                ? "Active"
                                : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">{student.totalEnrollments || 0}</td>
                        <td className="px-6 py-4 text-sm">{student.certificatesEarned || 0}</td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(student.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {student.isBlocked ? (
                              <button
                                onClick={() => handleUnblockStudent(student.userId)}
                                disabled={submitting}
                                className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                                title="Unblock student"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  setBlockModal({
                                    show: true,
                                    studentId: student.userId,
                                    studentName: `${student.firstName} ${student.lastName}`,
                                    currentReason: student.blockReason,
                                  })
                                }
                                className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                                title="Block student"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenPermissionsModal(student)}
                              className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                              title="Manage permissions"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.userId)}
                              disabled={submitting}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                              title="Delete student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {expandedStudent === student.userId && (
                        <tr className="bg-muted/30">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              <div>
                                <div className="text-xs text-muted-foreground">Quiz Attempts</div>
                                <div className="text-lg font-bold">{student.totalQuizAttempts || 0}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Completed Courses</div>
                                <div className="text-lg font-bold">{student.completedCourses || 0}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Last Login</div>
                                <div className="text-sm">
                                  {student.lastLoginAt
                                    ? new Date(student.lastLoginAt).toLocaleDateString()
                                    : "Never"}
                                </div>
                              </div>
                              {student.isBlocked && student.blockReason && (
                                <div>
                                  <div className="text-xs text-muted-foreground">Block Reason</div>
                                  <div className="text-sm text-red-600">{student.blockReason}</div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Block Student Modal */}
      {blockModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Block Student</h2>
              <button
                onClick={() => setBlockModal({ show: false })}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Block {blockModal.studentName}
            </p>

            <textarea
              placeholder="Enter reason for blocking..."
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              rows={4}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setBlockModal({ show: false })}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockStudent}
                disabled={submitting || !blockReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Block"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {permissionModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Manage Permissions</h2>
              <button
                onClick={() => setPermissionModal({ show: false })}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Configure permissions for {permissionModal.studentName}
            </p>

            <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
              {availablePermissions.map((perm) => (
                <label key={perm.permissionId} className="flex items-start gap-3 p-2 hover:bg-muted rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm.permissionId)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPermissions([...selectedPermissions, perm.permissionId]);
                      } else {
                        setSelectedPermissions(
                          selectedPermissions.filter((id) => id !== perm.permissionId)
                        );
                      }
                    }}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-sm">{perm.permissionName}</div>
                    {perm.description && (
                      <div className="text-xs text-muted-foreground">{perm.description}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPermissionModal({ show: false })}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePermissions}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:bg-primary/50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
