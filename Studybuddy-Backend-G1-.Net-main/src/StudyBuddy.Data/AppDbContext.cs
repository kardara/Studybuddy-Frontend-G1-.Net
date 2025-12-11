using Microsoft.EntityFrameworkCore;
using StudyBuddy.Core.Models.Domain;

namespace StudyBuddy.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Module> Modules { get; set; }
        public DbSet<Lesson> Lessons { get; set; }
        public DbSet<LessonMaterial> LessonMaterials { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }
        public DbSet<StudentProgress> StudentProgresses { get; set; }
        public DbSet<Quiz> Quizzes { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<QuestionOption> QuestionOptions { get; set; }
        public DbSet<QuizAttempt> QuizAttempts { get; set; }
        public DbSet<StudentAnswer> StudentAnswers { get; set; }
        public DbSet<Certificate> Certificates { get; set; }
        public DbSet<CertificateTemplate> CertificateTemplates { get; set; }
        public DbSet<ChatSession> ChatSessions { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<FAQTracker> FAQTrackers { get; set; }
        public DbSet<UserActivity> UserActivities { get; set; }
        public DbSet<AnalyticsSnapshot> AnalyticsSnapshots { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // === PRIMARY KEY CONFIGURATIONS ===
            // Explicitly configure all primary keys to avoid EF Core detection issues
            modelBuilder.Entity<User>().HasKey(u => u.UserId);
            modelBuilder.Entity<Permission>().HasKey(p => p.PermissionId);
            modelBuilder.Entity<RolePermission>().HasKey(rp => rp.RolePermissionId);
            modelBuilder.Entity<AuditLog>().HasKey(a => a.AuditLogId);
            modelBuilder.Entity<Course>().HasKey(c => c.CourseId);
            modelBuilder.Entity<Module>().HasKey(m => m.ModuleId);
            modelBuilder.Entity<Lesson>().HasKey(l => l.LessonId);
            modelBuilder.Entity<LessonMaterial>().HasKey(lm => lm.MaterialId);
            modelBuilder.Entity<Enrollment>().HasKey(e => e.EnrollmentId);
            modelBuilder.Entity<StudentProgress>().HasKey(sp => sp.ProgressId);
            modelBuilder.Entity<Quiz>().HasKey(q => q.QuizId);
            modelBuilder.Entity<Question>().HasKey(q => q.QuestionId);
            modelBuilder.Entity<QuestionOption>().HasKey(qo => qo.OptionId);
            modelBuilder.Entity<QuizAttempt>().HasKey(qa => qa.AttemptId);
            modelBuilder.Entity<StudentAnswer>().HasKey(sa => sa.AnswerId);
            modelBuilder.Entity<Certificate>().HasKey(c => c.CertificateId);
            modelBuilder.Entity<CertificateTemplate>().HasKey(ct => ct.TemplateId);
            modelBuilder.Entity<ChatSession>().HasKey(cs => cs.SessionId);
            modelBuilder.Entity<ChatMessage>().HasKey(cm => cm.MessageId);
            modelBuilder.Entity<FAQTracker>().HasKey(f => f.FAQId);
            modelBuilder.Entity<UserActivity>().HasKey(ua => ua.ActivityId);
            modelBuilder.Entity<AnalyticsSnapshot>().HasKey(a => a.SnapshotId);

            // === RELATIONSHIP CONFIGURATIONS ===
            // User - AuditLog (One-to-Many)
            modelBuilder.Entity<User>()
                .HasMany(u => u.AuditLogs)
                .WithOne(a => a.User)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deleting user if logs exist

            // User - Course (Creator) (One-to-Many)
            modelBuilder.Entity<User>()
                .HasMany(u => u.CreatedCourses)
                .WithOne(c => c.Creator)
                .HasForeignKey(c => c.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            // Course - Module (One-to-Many)
            modelBuilder.Entity<Course>()
                .HasMany(c => c.Modules)
                .WithOne(m => m.Course)
                .HasForeignKey(m => m.CourseId)
                .OnDelete(DeleteBehavior.Restrict);

            // Module - Lesson (One-to-Many)
            modelBuilder.Entity<Module>()
                .HasMany(m => m.Lessons)
                .WithOne(l => l.Module)
                .HasForeignKey(l => l.ModuleId)
                .OnDelete(DeleteBehavior.Restrict); // Changed from Cascade to avoid multiple cascade paths

            // Course - Lesson (One-to-Many)
            modelBuilder.Entity<Course>()
                .HasMany(c => c.Lessons)
                .WithOne(l => l.Course)
                .HasForeignKey(l => l.CourseId)
                .OnDelete(DeleteBehavior.NoAction); // Avoid multiple cascade paths

            // Lesson - LessonMaterial (One-to-Many)
            modelBuilder.Entity<Lesson>()
                .HasMany(l => l.Materials)
                .WithOne(m => m.Lesson)
                .HasForeignKey(m => m.LessonId)
                .OnDelete(DeleteBehavior.Restrict); // Changed from Cascade to avoid multiple cascade paths

            // Enrollment (Many-to-Many User-Course)
            modelBuilder.Entity<Enrollment>()
                .HasKey(e => new { e.StudentId, e.CourseId }); // Composite Key? No, using ID. But unique constraint needed.

            modelBuilder.Entity<Enrollment>()
                .HasIndex(e => new { e.StudentId, e.CourseId })
                .IsUnique();

            modelBuilder.Entity<Enrollment>()
                .HasOne(e => e.Student)
                .WithMany(u => u.Enrollments)
                .HasForeignKey(e => e.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Enrollment>()
                .HasOne(e => e.Course)
                .WithMany(c => c.Enrollments)
                .HasForeignKey(e => e.CourseId)
                .OnDelete(DeleteBehavior.Restrict);

            // StudentProgress
            modelBuilder.Entity<StudentProgress>()
                .HasIndex(sp => new { sp.StudentId, sp.LessonId })
                .IsUnique();

            modelBuilder.Entity<StudentProgress>()
                .HasOne(sp => sp.Student)
                .WithMany(u => u.StudentProgresses)
                .HasForeignKey(sp => sp.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<StudentProgress>()
                .HasOne(sp => sp.Lesson)
                .WithMany(l => l.StudentProgresses)
                .HasForeignKey(sp => sp.LessonId)
                .OnDelete(DeleteBehavior.Restrict); // Changed from Cascade to avoid multiple cascade paths

            modelBuilder.Entity<StudentProgress>()
               .HasOne(sp => sp.Course)
               .WithMany(c => c.StudentProgresses)
               .HasForeignKey(sp => sp.CourseId)
               .OnDelete(DeleteBehavior.NoAction);

            // Quiz
            modelBuilder.Entity<Quiz>()
                .HasOne(q => q.Course)
                .WithMany(c => c.Quizzes)
                .HasForeignKey(q => q.CourseId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Quiz>()
                .HasOne(q => q.Module)
                .WithMany(m => m.Quizzes)
                .HasForeignKey(q => q.ModuleId)
                .OnDelete(DeleteBehavior.NoAction);

            // Question
            modelBuilder.Entity<Question>()
                .HasOne(q => q.Quiz)
                .WithMany(qz => qz.Questions)
                .HasForeignKey(q => q.QuizId)
                .OnDelete(DeleteBehavior.Restrict);

            // QuestionOption
            modelBuilder.Entity<QuestionOption>()
                .HasOne(qo => qo.Question)
                .WithMany(q => q.Options)
                .HasForeignKey(qo => qo.QuestionId)
                .OnDelete(DeleteBehavior.Restrict);

            // QuizAttempt
            modelBuilder.Entity<QuizAttempt>()
                .HasOne(qa => qa.Quiz)
                .WithMany(q => q.QuizAttempts)
                .HasForeignKey(qa => qa.QuizId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<QuizAttempt>()
                .HasOne(qa => qa.Student)
                .WithMany(u => u.QuizAttempts)
                .HasForeignKey(qa => qa.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<QuizAttempt>()
               .HasOne(qa => qa.Course)
               .WithMany(c => c.QuizAttempts)
               .HasForeignKey(qa => qa.CourseId)
               .OnDelete(DeleteBehavior.NoAction);

            // StudentAnswer
            modelBuilder.Entity<StudentAnswer>()
                .HasOne(sa => sa.Attempt)
                .WithMany(qa => qa.StudentAnswers)
                .HasForeignKey(sa => sa.AttemptId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<StudentAnswer>()
                .HasOne(sa => sa.Question)
                .WithMany(q => q.StudentAnswers)
                .HasForeignKey(sa => sa.QuestionId)
                .OnDelete(DeleteBehavior.Restrict);

            // Certificate
            modelBuilder.Entity<Certificate>()
                .HasIndex(c => c.CertificateNumber)
                .IsUnique();

            modelBuilder.Entity<Certificate>()
                .HasOne(c => c.Student)
                .WithMany(u => u.Certificates)
                .HasForeignKey(c => c.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Certificate>()
                .HasOne(c => c.Course)
                .WithMany(co => co.Certificates)
                .HasForeignKey(c => c.CourseId)
                .OnDelete(DeleteBehavior.Restrict);

            // ChatSession
            modelBuilder.Entity<ChatSession>()
                .HasOne(cs => cs.Student)
                .WithMany(u => u.ChatSessions)
                .HasForeignKey(cs => cs.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ChatSession>()
                .HasOne(cs => cs.Course)
                .WithMany(c => c.ChatSessions)
                .HasForeignKey(cs => cs.CourseId)
                .OnDelete(DeleteBehavior.Restrict);

            // ChatMessage
            modelBuilder.Entity<ChatMessage>()
                .HasOne(cm => cm.Session)
                .WithMany(cs => cs.Messages)
                .HasForeignKey(cm => cm.SessionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ChatMessage>()
                .HasOne(cm => cm.SenderUser)
                .WithMany(u => u.SentMessages)
                .HasForeignKey(cm => cm.SenderUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // FAQTracker
            modelBuilder.Entity<FAQTracker>()
                .HasOne(f => f.Course)
                .WithMany(c => c.FAQs)
                .HasForeignKey(f => f.CourseId)
                .OnDelete(DeleteBehavior.Restrict);

            // UserActivity
            modelBuilder.Entity<UserActivity>()
                .HasOne(ua => ua.User)
                .WithMany(u => u.UserActivities)
                .HasForeignKey(ua => ua.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // RolePermission
            modelBuilder.Entity<RolePermission>()
                .HasIndex(rp => new { rp.Role, rp.PermissionId })
                .IsUnique();

            // AnalyticsSnapshot
            modelBuilder.Entity<AnalyticsSnapshot>()
                .HasIndex(a => a.SnapshotDate)
                .IsUnique();
        }
    }
}
