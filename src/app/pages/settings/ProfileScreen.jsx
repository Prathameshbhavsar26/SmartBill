import { useEffect, useState } from "react";
import { Check, Edit2, Mail, Phone } from "lucide-react";
import { Badge, Btn, Card, Input } from "../../components/common/ui";
import { getUserDisplayName, getUserInitials } from "../../utils/userUtils";
import { getProfile, updateProfile } from "../../api/authAPI";

export default function ProfileScreen() {
  const [profileUser, setProfileUser] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    businessType: "Retail",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ======================================================
  // LOAD CURRENT LOGGED-IN USER
  // ======================================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        const response = await getProfile();

        if (!response?.user) {
          throw new Error("User profile could not be loaded.");
        }

        const currentUser = response.user;

        // Backend user is the ONLY source of profile data.
        setProfileUser(currentUser);

        setFormData({
          firstName: currentUser.firstName || "",
          lastName: currentUser.lastName || "",
          businessName: currentUser.businessName || "",
          businessType: currentUser.businessType || "Retail",
          email: currentUser.email || "",
          phone: currentUser.phone || "",
        });

        // Keep localStorage synchronized with backend.
        localStorage.setItem(
          "smartbill_user",
          JSON.stringify(currentUser)
        );
      } catch (err) {
        console.error("LOAD PROFILE ERROR:", err);

        setError(
          err?.message ||
            "Unable to load your profile. Please login again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // ======================================================
  // HANDLE INPUT CHANGE
  // ======================================================

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setMessage("");
    setError("");
  };

  // ======================================================
  // UPDATE CURRENT LOGGED-IN USER
  // ======================================================

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await updateProfile(formData);

      if (!response?.user) {
        throw new Error("Profile update failed.");
      }

      const updatedUser = response.user;

      // Update the profile displayed on this screen.
      setProfileUser(updatedUser);

      setFormData({
        firstName: updatedUser.firstName || "",
        lastName: updatedUser.lastName || "",
        businessName: updatedUser.businessName || "",
        businessType: updatedUser.businessType || "Retail",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
      });

      // Update stored user.
      localStorage.setItem(
        "smartbill_user",
        JSON.stringify(updatedUser)
      );

      // Backend returns a fresh JWT.
      if (response.token) {
        localStorage.setItem("smartbill_token", response.token);
      }

      setMessage(
        response.message || "Profile updated successfully."
      );
    } catch (err) {
      console.error("UPDATE PROFILE ERROR:", err);

      setError(
        err?.message || "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // DISPLAY DATA
  // ======================================================

  const displayName = profileUser
    ? getUserDisplayName(profileUser)
    : "User";

  const initials = profileUser
    ? getUserInitials(displayName)
    : "U";

  const businessName =
    profileUser?.businessName || formData.businessName || "SmartBill";

  const roleTitle =
    profileUser?.role === "superadmin"
      ? "Super Admin"
      : "Business Owner";

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="max-w-2xl">
        <Card className="p-6">
          <p className="text-sm text-slate-500">
            Loading profile...
          </p>
        </Card>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error && !profileUser) {
    return (
      <div className="max-w-2xl">
        <Card className="p-6">
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="max-w-2xl space-y-5">

      {/* ================= PROFILE CARD ================= */}

      <Card className="p-6">

        <div className="flex items-start gap-5 mb-6">

          <div className="relative">

            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <span className="text-xl font-bold text-white">
                {initials}
              </span>
            </div>

            <button
              type="button"
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50"
            >
              <Edit2 className="w-3 h-3 text-slate-600" />
            </button>

          </div>

          <div>

            <h3 className="font-bold text-slate-900 text-lg">
              {displayName}
            </h3>

            <p className="text-sm text-slate-500">
              {roleTitle} · {businessName}
            </p>

            <Badge
              label="Pro Plan"
              variant="blue"
            />

          </div>

        </div>

        {/* ================= FORM ================= */}

        <div className="grid grid-cols-2 gap-4">

          <Input
            label="First Name"
            value={formData.firstName}
            onChange={(e) =>
              handleChange("firstName", e.target.value)
            }
          />

          <Input
            label="Last Name"
            value={formData.lastName}
            onChange={(e) =>
              handleChange("lastName", e.target.value)
            }
          />

          <Input
            label="Business Name"
            value={formData.businessName}
            onChange={(e) =>
              handleChange("businessName", e.target.value)
            }
          />

          <Input
            label="Business Type"
            value={formData.businessType}
            onChange={(e) =>
              handleChange("businessType", e.target.value)
            }
          />

          <Input
            label="Email"
            value={formData.email}
            onChange={(e) =>
              handleChange("email", e.target.value)
            }
            icon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) =>
              handleChange("phone", e.target.value)
            }
            icon={<Phone className="w-4 h-4" />}
          />

        </div>

        {/* ================= SUCCESS ================= */}

        {message && (
          <div className="mt-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
            <p className="text-sm text-green-700">
              {message}
            </p>
          </div>
        )}

        {/* ================= ERROR ================= */}

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* ================= UPDATE ================= */}

        <Btn
          variant="primary"
          className="mt-5"
          icon={<Check className="w-4 h-4" />}
          onClick={handleUpdateProfile}
          disabled={saving}
        >
          {saving ? "Updating..." : "Update Profile"}
        </Btn>

      </Card>

      {/* ================= ACCOUNT SUMMARY ================= */}

      <Card className="p-6">

        <h3 className="font-semibold text-slate-900 mb-4">
          Account Summary
        </h3>

        <div className="grid grid-cols-3 gap-4">

          {[
            ["342", "Customers"],
            ["7", "Products Active"],
            ["1,042", "Invoices"],
          ].map(([v, l]) => (

            <div
              key={l}
              className="bg-slate-50 rounded-xl p-4 text-center"
            >
              <p className="text-xl font-bold text-blue-600">
                {v}
              </p>

              <p className="text-xs text-slate-500 mt-0.5">
                {l}
              </p>
            </div>

          ))}

        </div>

      </Card>

    </div>
  );
}