import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Upload,
  X,
  Copy,
  Archive,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  coursesService,
  CreateCourseRequest,
  UpdateCourseRequest,
} from "@/services/api/courses.service";
import { CourseListDto } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  level: string;
  estimatedDurationHours: string;
  prerequisites: string;
  learningObjectives: string;
  thumbnailUrl: string;
  sourcePdfUrl: string;
  generatedContent: string;
}

export default function AdminCourses() {
  const [courses, setCourses] = useState<CourseListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseListDto | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    category: "",
    level: "Beginner",
    estimatedDurationHours: "",
    prerequisites: "",
    learningObjectives: "",
    thumbnailUrl: "",
    sourcePdfUrl: "",
    generatedContent: "",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await coursesService.getAllCourses();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch courses",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      level: "Beginner",
      estimatedDurationHours: "",
      prerequisites: "",
      learningObjectives: "",
      thumbnailUrl: "",
      sourcePdfUrl: "",
      generatedContent: "",
    });
    setEditingCourse(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (course: CourseListDto) => {
    setFormData({
      title: course.title,
      description: course.description || "",
      category: course.category || "",
      level: (course as any).level || "Beginner",
      estimatedDurationHours: (course as any).estimatedDurationHours?.toString() || "",
      prerequisites: (course as any).prerequisites || "",
      learningObjectives: (course as any).learningObjectives || "",
      thumbnailUrl: (course as any).thumbnailUrl || "",
      sourcePdfUrl: (course as any).sourcePdfUrl || "",
      generatedContent: (course as any).generatedContent || "",
    });
    setEditingCourse(course);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const courseData: CreateCourseRequest | UpdateCourseRequest = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        level: formData.level,
        estimatedDurationHours: formData.estimatedDurationHours
          ? parseInt(formData.estimatedDurationHours)
          : undefined,
        prerequisites: formData.prerequisites,
        learningObjectives: formData.learningObjectives,
        thumbnailUrl: formData.thumbnailUrl,
      };

      if (editingCourse) {
        // Update existing course
        await coursesService.updateCourse({
          courseId: editingCourse.courseId,
          title: formData.title,
          description: formData.description,
          category: formData.category,
        });
        toast({
          title: "Success",
          description: "Course updated successfully",
        });
      } else {
        // Create new course
        await coursesService.createCourse({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          sourcePdfUrl: formData.sourcePdfUrl || undefined,
          generatedContent: formData.generatedContent || undefined,
          createdBy: user?.userId || 1, // Use current user ID or fallback to 1
        });
        toast({
          title: "Success",
          description: "Course created successfully",
        });
      }

      setShowModal(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      console.error("Error saving course:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save course",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (courseId: number) => {
    try {
      await coursesService.deleteCourse(courseId);
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete course",
      });
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const handlePublish = async (courseId: number) => {
    try {
      await coursesService.publishCourse(courseId);
      toast({
        title: "Success",
        description: "Course published successfully",
      });
      fetchCourses();
    } catch (error) {
      console.error("Error publishing course:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to publish course",
      });
    }
  };

  const handleDuplicate = async (courseId: number) => {
    try {
      await coursesService.duplicateCourse(courseId);
      toast({
        title: "Success",
        description: "Course duplicated successfully",
      });
      fetchCourses();
    } catch (error) {
      console.error("Error duplicating course:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to duplicate course",
      });
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (isPublished: boolean) => {
    return (
      <span
        className={cn(
          "badge",
          isPublished ? "badge-success" : "badge-warning"
        )}
      >
        {isPublished ? "Published" : "Draft"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="animate-fade-in flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Courses</h1>
          <p className="text-muted-foreground mt-1">
            Create, edit, and manage your courses
          </p>
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add New Course
        </button>
      </div>

      {/* Filters */}
      <div className="dashboard-card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field w-auto"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <button className="btn-outline">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="dashboard-card overflow-hidden">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first course"}
            </p>
            {!searchTerm && (
              <button onClick={openCreateModal} className="btn-primary">
                <Plus className="w-4 h-4" />
                Create Course
              </button>
            )}
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Students</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.courseId}>
                    <td>
                      <div className="font-medium">{course.title}</div>
                      {course.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {course.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-primary">
                        {course.category || "Uncategorized"}
                      </span>
                    </td>
                    <td>{getStatusBadge(course.isPublished)}</td>
                    <td>{course.enrollmentCount.toLocaleString()}</td>
                    <td className="text-muted-foreground">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="View course"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => openEditModal(course)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Edit course"
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(course.courseId)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Duplicate course"
                        >
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handlePublish(course.courseId)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title={course.isPublished ? "Unpublish" : "Publish"}
                        >
                          {course.isPublished ? (
                            <Archive className="w-4 h-4 text-warning" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-success" />
                          )}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(course.courseId)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Delete course"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing 1-{filteredCourses.length} of {courses.length} courses
              </p>
              <div className="flex gap-2">
                <button className="btn-outline py-2 px-3" disabled>
                  Previous
                </button>
                <button className="btn-primary py-2 px-3" disabled>
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Course Form Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">
                {editingCourse ? "Edit Course" : "Add New Course"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="input-field"
                  placeholder="Enter course title"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter course description"
                  rows={3}
                  className="input-field resize-none"
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="input-field"
                    disabled={submitting}
                  >
                    <option value="">Select category</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Design">Design</option>
                    <option value="AI & ML">AI & ML</option>
                    <option value="Business">Business</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Source PDF URL
                  </label>
                  <input
                    type="url"
                    value={formData.sourcePdfUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, sourcePdfUrl: e.target.value })
                    }
                    placeholder="https://example.com/document.pdf"
                    className="input-field"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Generated Content
                </label>
                <textarea
                  value={formData.generatedContent}
                  onChange={(e) =>
                    setFormData({ ...formData, generatedContent: e.target.value })
                  }
                  placeholder="Auto-generated content from PDF or AI"
                  rows={4}
                  className="input-field resize-none"
                  disabled={submitting}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-outline"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {editingCourse ? "Updating..." : "Creating..."}
                    </div>
                  ) : (
                    editingCourse ? "Update Course" : "Create Course"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            className="modal-content max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Delete Course</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this course? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="btn-destructive"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
