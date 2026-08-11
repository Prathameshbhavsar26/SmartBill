import { useState, useEffect } from "react";
import { Check, Edit2, Mail, MapPin, Phone, UserCircle } from "lucide-react";
import { Badge, Btn, Card, Input } from "../../components/common/ui";
import { getUserDisplayName, getUserInitials } from "../../utils/userUtils";

export default function ProfileScreen({ user }) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "Admin",
    lastName: user?.lastName || "User",
    email: user?.email || "admin@business.in",
    phone: user?.phone || "+91 98765 43210",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "Admin",
        lastName: user.lastName || "User",
        email: user.email || "admin@business.in",
        phone: user.phone
          ? user.phone.startsWith("+91")
            ? user.phone
            : `+91 ${user.phone}`
          : "+91 98765 43210",
      });
    }
  }, [user]);

  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(displayName);
  const businessName = user?.businessName || "SmartBill";
  const roleTitle =
    user?.role === "superadmin" ? "Super Admin" : "Business Owner";

  return (
    <div className="max-w-2xl space-y-5">
      <Card className="p-6">
        <div className="flex items-start gap-5 mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <span className="text-xl font-bold text-white">{initials}</span>
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50">
              <Edit2 className="w-3 h-3 text-slate-600" />
            </button>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{displayName}</h3>
            <p className="text-sm text-slate-500">
              {roleTitle} · {businessName}
            </p>
            <Badge label="Pro Plan" variant="blue" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={formData.firstName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, firstName: e.target.value }))
            }
          />
          <Input
            label="Last Name"
            value={formData.lastName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, lastName: e.target.value }))
            }
          />
          <Input
            label="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            icon={<Mail className="w-4 h-4" />}
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone: e.target.value }))
            }
            icon={<Phone className="w-4 h-4" />}
          />
        </div>
        <Btn
          variant="primary"
          className="mt-5"
          icon={<Check className="w-4 h-4" />}
        >
          Update Profile
        </Btn>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Account Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            ["342", "Customers"],
            ["7", "Products Active"],
            ["1,042", "Invoices"],
          ].map(([v, l]) => (
            <div key={l} className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-xl font-bold text-blue-600">{v}</p>
              <p className="text-xs text-slate-500 mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

