import { Mail, MapPin, Phone, UserCircle } from "lucide-react";
import { Btn, Card, Input } from "../../components/common/ui";

export default function ProfileScreen() {
  return (
    <div className="max-w-2xl space-y-5">
      <Card className="p-6">
        <div className="flex items-start gap-5 mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <span className="text-xl font-bold text-white">AU</span>
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50">
              <Edit2 className="w-3 h-3 text-slate-600" />
            </button>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Admin User</h3>
            <p className="text-sm text-slate-500">
              Business Owner · Sharma Traders
            </p>
            <Badge label="Pro Plan" variant="blue" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" value="Admin" />
          <Input label="Last Name" value="User" />
          <Input
            label="Email"
            value="admin@business.in"
            icon={<Mail className="w-4 h-4" />}
          />
          <Input
            label="Phone"
            value="+91 98765 43210"
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

