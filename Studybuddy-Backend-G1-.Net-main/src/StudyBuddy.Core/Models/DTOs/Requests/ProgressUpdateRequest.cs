namespace StudyBuddy.Core.Models.DTOs.Requests
{
    public class ProgressUpdateRequest
    {
        public int LessonId { get; set; }
        public bool IsCompleted { get; set; }
    }
}
