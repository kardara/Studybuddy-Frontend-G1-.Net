import { useState, useEffect } from "react";
import { User, Save } from "lucide-react";
import { authService } from "@/services/api/auth.service";

export default function AdminSettings() {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = authService.getCurrentUser();
        if (user) {
          setProfile({
            firstName: user.fullName?.split(' ')[0] || "",
            lastName: user.fullName?.split(' ').slice(1).join(' ') || "",
            email: user.email,
            bio: ""
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Implement profile update API call
      console.log('Saving profile:', profile);
      // await authService.updateProfile(profile);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-fade-in">Loading profile...</div>;
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account information
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="dashboard-card p-6">
          <h2 className="text-lg font-semibold mb-6">Profile Information</h2>

          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-primary" />
            </div>
            <div>
              <button className="btn-outline mb-2">Upload Photo</button>
              <p className="text-sm text-muted-foreground">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              rows={4}
              placeholder="Tell us about yourself..."
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="input-field resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
