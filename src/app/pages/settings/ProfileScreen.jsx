import { useEffect, useState } from "react";
import { Check, Edit2, Mail, Phone } from "lucide-react";
import { Badge, Btn, Card, Input } from "../../components/common/ui";
import { getUserDisplayName, getUserInitials } from "../../utils/userUtils";
import { getProfile, updateProfile } from "../../api/authAPI";

export default function ProfileScreen({ user }) {
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
  // LOAD CURRENT LOGGED-IN USER PROFILE
  // ======================================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getProfile();

        if (response?.user) {
          setFormData({
            firstName: response.user.firstName || "",
            lastName: response.user.lastName || "",
            businessName: response.user.businessName || "",
            businessType: response.user.businessType || "Retail",
            email: response.user.email || "",
            phone: response.user.phone || "",
          });
        }
      } catch (err) {
        console.error("LOAD PROFILE ERROR:", err);

        // Fallback to the user received from App.jsx
        if (user) {
          setFormData({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            businessName: user.businessName || "",
            businessType: user.businessType || "Retail",
            email: user.email || "",
            phone: user.phone || "",
          });
        }

        setError(
          err?.message || "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

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
  // UPDATE CURRENT USER PROFILE
  // ======================================================

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await updateProfile(formData);

      // Save the updated user returned by backend
      if (response?.user) {
        localStorage.setItem(
          "smartbill_user",
          JSON.stringify(response.user)
        );

        setFormData({
          firstName: response.user.firstName || "",
          lastName: response.user.lastName || "",
          businessName: response.user.businessName || "",
          businessType: response.user.businessType || "Retail",
          email: response.user.email || "",
          phone: response.user.phone || "",
        });
      }

      // Backend sends a new JWT after profile update
      if (response?.token) {
        localStorage.setItem("smartbill_token", response.token);
      }

      setMessage(
        response?.message || "Profile updated successfully."
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

  const displayUser = {
    ...(user || {}),
    ...formData,
  };

  const displayName =
    getUserDisplayName(displayUser) || "User";

  const initials =
    getUserInitials(displayName) || "U";

  const businessName =
    formData.businessName || "SmartBill";

  const roleTitle =
    user?.role === "superadmin"
      ? "Super Admin"
      : "Business Owner";

  // ======================================================
  // UI
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
              handleChange(
                "firstName",
                e.target.value
              )
            }
          />

          <Input
            label="Last Name"
            value={formData.lastName}
            onChange={(e) =>
              handleChange(
                "lastName",
                e.target.value
              )
            }
          />

          <Input
            label="Business Name"
            value={formData.businessName}
            onChange={(e) =>
              handleChange(
                "businessName",
                e.target.value
              )
            }
          />

          <Input
            label="Business Type"
            value={formData.businessType}
            onChange={(e) =>
              handleChange(
                "businessType",
                e.target.value
              )
            }
          />

          <Input
            label="Email"
            value={formData.email}
            onChange={(e) =>
              handleChange(
                "email",
                e.target.value
              )
            }
            icon={
              <Mail className="w-4 h-4" />
            }
          />

          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) =>
              handleChange(
                "phone",
                e.target.value
              )
            }
            icon={
              <Phone className="w-4 h-4" />
            }
          />

        </div>

        {/* ================= SUCCESS MESSAGE ================= */}

        {message && (
          <div className="mt-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
            <p className="text-sm text-green-700">
              {message}
            </p>
          </div>
        )}

        {/* ================= ERROR MESSAGE ================= */}

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* ================= UPDATE BUTTON ================= */}

        <Btn
          variant="primary"
          className="mt-5"
          icon={
            <Check className="w-4 h-4" />
          }
          onClick={handleUpdateProfile}
          disabled={saving}
        >
          {saving
            ? "Updating..."
            : "Update Profile"}
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