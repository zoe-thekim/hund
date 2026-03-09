import { useRef, useState, useEffect, type ChangeEvent } from "react";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  LogOut,
  MessageCircle,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useStore from "../../store/useStore";
import { authAPI } from "../../api";

type Tab = "Profile" | "My Orders" | "Address" | "Account" | "Setting";

interface Address {
  id: string;
  name: string;
  phone: string;
  postalCode: string;
  address: string;
  detail: string;
  isDefault: boolean;
}

// Daum 우편번호 서비스 타입 정의
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: {
          zonecode: string;
          address: string;
          addressType: string;
          userSelectedType: string;
          noSelected: string;
          userLanguageType: string;
          roadAddress: string;
          jibunAddress: string;
          buildingName: string;
          apartment: string;
          autoRoadAddress: string;
          autoJibunAddress: string;
          sido: string;
          sigungu: string;
          bname: string;
          roadname: string;
        }) => void;
        onresize?: (size: { width: number; height: number }) => void;
        width?: string;
        height?: string;
      }) => {
        open: () => void;
      };
    };
  }
}

interface Order {
  id: string;
  date: string;
  items: string;
  total: string;
  status: "pending" | "shipped" | "delivered";
}

interface UserInfo {
  name: string;
  email: string;
  phone: string;
  birthday: string;
}

export default function MyPage() {
  const navigate = useNavigate();
  const authUser = useStore((state) => state.authUser);
  const authToken = useStore((state) => state.authToken);
  const logout = useStore((state) => state.logout);
  const updateAuthUser = useStore((state) => state.updateAuthUser);

  const [activeTab, setActiveTab] = useState<Tab>("Profile");
  const [profileImage, setProfileImage] = useState("/placeholder.svg");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserInfo>({
    name: "",
    email: "",
    phone: "",
    birthday: "",
  });

  useEffect(() => {
    if (!authUser) {
      return;
    }

    const phoneRaw = authUser.phoneNumber ?? authUser.phone ?? "";
    const normalizedPhone = typeof phoneRaw === "string" && !phoneRaw.includes("@") ? phoneRaw : "";

    setProfile({
      name: authUser.name ?? "",
      email: authUser.email ?? "",
      phone: normalizedPhone,
      birthday: authUser.birthDate ?? authUser.birthday ?? "",
    });
  }, [authUser]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!authToken) {
        return;
      }

      try {
        const response = await authAPI.me(authToken);
        const data = response?.data ?? {};
        const user = data.user ?? data.data ?? data;
        if (!user || typeof user !== "object") {
          return;
        }

        const nextUser = {
          ...authUser,
          ...user,
        };
        updateAuthUser(nextUser);
      } catch {
        // Keep current auth state if profile API is unavailable.
      }
    };

    fetchProfile();
  }, [authToken]);

  const handleProfileImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleProfileSave = async (next: UserInfo) => {
    setProfile(next);
    if (!authUser) {
      return;
    }

    const payload = {
      name: next.name,
      phoneNumber: next.phone.trim(),
      birthDate: next.birthday || null,
    };

    try {
      const response = await authAPI.updateProfile(payload, authToken, authUser.id);
      const data = response?.data ?? {};
      const updatedUser = data.user ?? data.data ?? data;
      updateAuthUser({
        ...authUser,
        ...updatedUser,
      });
    } catch {
      updateAuthUser({
        ...authUser,
        ...payload,
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <main className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-screen-xl mx-auto px-5 md:px-10 py-16">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-12">
          <div className="relative group flex-shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-white border border-black/10">
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <button
              onClick={triggerFileInput}
              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Change profile image"
            >
              <span className="text-white text-xs font-medium">Edit</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="hidden"
              aria-label="Upload profile image"
            />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-normal text-black mb-2">My Page</h1>
            <p className="text-sm text-black/60">Manage your account, orders, addresses, and preferences</p>
          </div>
        </div>

        <nav className="border-b border-black/10 mb-8 overflow-x-auto">
          <div className="flex gap-8 min-w-max md:min-w-0">
            {(["Profile", "My Orders", "Address", "Account", "Setting"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-medium tracking-wide uppercase whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab
                    ? "text-black border-black"
                    : "text-black/50 border-transparent hover:text-black"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </nav>

        <div>
          {activeTab === "Profile" && <ProfileTab profile={profile} onSave={handleProfileSave} />}
          {activeTab === "My Orders" && <MyOrdersTab />}
          {activeTab === "Address" && <AddressTab />}
          {activeTab === "Account" && <AccountTab onLogout={handleLogout} userId={authUser?.id ?? ""} token={authToken} />}
          {activeTab === "Setting" && <SettingTab />}
        </div>
      </div>
    </main>
  );
}

function ProfileTab({ profile, onSave }: { profile: UserInfo; onSave: (next: UserInfo) => void | Promise<void> }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserInfo>(profile);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleInputChange = (field: keyof UserInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setErrorMessage("");
    if (!formData.phone.trim()) {
      setErrorMessage("전화번호는 필수입니다.");
      return;
    }
    await onSave(formData);
    setIsEditing(false);
  };

  const formatBirthday = (value: string) => {
    if (!value) {
      return "-";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w">
      <div className="bg-white border border-black/10 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-black">Personal Information</h2>
          <button
            onClick={() => {
              if (isEditing) {
                setFormData(profile);
              }
              setIsEditing((prev) => !prev);
            }}
            className="text-sm font-medium text-black/70 hover:text-black underline underline-offset-2 transition-colors"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-medium text-black/70 uppercase tracking-wide mb-2">Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-0 py-2 border-0 border-b border-black/20 text-black focus:outline-none focus:border-black transition-colors text-sm"
              />
            ) : (
              <p className="text-black text-sm">{profile.name || "-"}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-black/70 uppercase tracking-wide mb-2">Email</label>
            <p className="text-black text-sm break-all">{profile.email || "-"}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-black/70 uppercase tracking-wide mb-2">Phone</label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full px-0 py-2 border-0 border-b border-black/20 text-black focus:outline-none focus:border-black transition-colors text-sm"
              />
            ) : (
              <p className="text-black text-sm">{profile.phone || "-"}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-black/70 uppercase tracking-wide mb-2">Birthday</label>
            {isEditing ? (
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => handleInputChange("birthday", e.target.value)}
                className="w-full px-0 py-2 border-0 border-b border-black/20 text-black focus:outline-none focus:border-black transition-colors text-sm"
              />
            ) : (
              <p className="text-black text-sm">{formatBirthday(profile.birthday)}</p>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="mt-8 pt-6 border-t border-black/10 flex gap-3 justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2 text-sm font-medium text-black bg-white border border-black/20 hover:bg-black/5 transition-colors"
            >
              Save
            </button>
          </div>
        )}
        {errorMessage ? (
          <p className="mt-4 text-sm text-red-700">{errorMessage}</p>
        ) : null}
      </div>
    </div>
  );
}

function MyOrdersTab() {
  const [orders] = useState<Order[]>([
    {
      id: "ORD-001",
      date: "2026-02-28",
      items: "Striped Dog Sweater (M)",
      total: "₩20,000",
      status: "delivered",
    },
    {
      id: "ORD-002",
      date: "2026-02-15",
      items: "Cozy Winter Coat (L), Classic Collar (2)",
      total: "₩47,000",
      status: "delivered",
    },
    {
      id: "ORD-003",
      date: "2026-02-10",
      items: "Luxury Pet Harness (M)",
      total: "₩28,000",
      status: "shipped",
    },
    {
      id: "ORD-004",
      date: "2026-01-30",
      items: "Striped Dog Sweater (S)",
      total: "₩20,000",
      status: "pending",
    },
  ]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "delivered":
        return "Delivered";
      case "shipped":
        return "In Transit";
      case "pending":
        return "Processing";
      default:
        return status;
    }
  };

  return (
    <div className="max-w-4xl space-y-4">
      {orders.length === 0 ? (
        <div className="bg-white border border-black/10 p-8 text-center">
          <p className="text-sm text-black/60">No orders yet</p>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="bg-white border border-black/10 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium text-black mb-1">{order.id}</h3>
                <p className="text-xs text-black/50">
                  {new Date(order.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <span className="text-xs font-medium uppercase tracking-wide text-black/60">
                {getStatusLabel(order.status)}
              </span>
            </div>

            <div className="border-t border-black/10 pt-4 mb-4">
              <p className="text-sm text-black mb-2">{order.items}</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-black">{order.total}</span>
              <button className="text-xs font-medium text-black/70 hover:text-black underline underline-offset-2 transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function AddressTab() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      name: "Home",
      phone: "010-1234-5678",
      postalCode: "06000",
      address: "서울 강남구 테헤란로 123",
      detail: "123동 456호",
      isDefault: true,
    },
    {
      id: "2",
      name: "Office",
      phone: "02-999-9999",
      postalCode: "04500",
      address: "서울 중구 을지로 456",
      detail: "789빌딩 10층",
      isDefault: false,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    postalCode: "",
    address: "",
    detail: "",
  });

  const openDaumPostcode = () => {
    new window.daum.Postcode({
      oncomplete: function(data) {
        setFormData((prev) => ({
          ...prev,
          postalCode: data.zonecode,
          address: data.address,
        }));
      }
    }).open();
  };

  const handleAddAddress = () => {
    if (formData.name && formData.phone && formData.address && formData.detail) {
      setAddresses((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          ...formData,
          isDefault: false,
        },
      ]);
      setFormData({ name: "", phone: "", postalCode: "", address: "", detail: "" });
      setShowForm(false);
    }
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setAddresses((prev) => prev.map((addr) => ({ ...addr, isDefault: addr.id === id })));
  };

  return (
    <div className="max-w-4xl">
      {!showForm ? (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white border border-black/10 p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-black mb-1">{addr.name}</h3>
                  {addr.isDefault && (
                    <span className="inline-block text-xs font-medium text-black/60 mb-3">Default Address</span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-black/40 hover:text-black transition-colors"
                  aria-label="Delete address"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="text-sm text-black/70 space-y-1 mb-4">
                <p>({addr.postalCode}) {addr.address}</p>
                <p>{addr.detail}</p>
                <p>{addr.phone}</p>
              </div>

              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="text-xs font-medium text-black/70 hover:text-black underline underline-offset-2 transition-colors"
                >
                  Set as Default
                </button>
              )}
            </div>
          ))}

          <button
            onClick={() => setShowForm(true)}
            className="w-full py-4 border border-black/20 text-sm font-medium text-black hover:bg-black/5 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Add New Address
          </button>
        </div>
      ) : (
        <div className="bg-white border border-black/10 p-6">
          <h3 className="text-sm font-medium text-black mb-6">Add New Address</h3>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-black/70 uppercase tracking-wide mb-2">Address Name</label>
              <input
                type="text"
                placeholder="e.g., Home, Office"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-black/10 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-black/70 uppercase tracking-wide mb-2">Phone Number</label>
              <input
                type="tel"
                placeholder="010-0000-0000"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-black/10 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-black/70 uppercase tracking-wide mb-2">Address</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="우편번호"
                  value={formData.postalCode}
                  onChange={(e) => setFormData((prev) => ({ ...prev, postalCode: e.target.value }))}
                  className="w-1/3 px-3 py-2 border border-black/10 text-sm focus:outline-none focus:border-black transition-colors"
                  readOnly
                />
                <button
                  type="button"
                  onClick={openDaumPostcode}
                  className="flex-1 py-2 border border-black text-black text-sm font-medium hover:bg-black hover:text-white transition-colors"
                >
                  주소 검색
                </button>
              </div>
              <input
                type="text"
                placeholder="기본 주소"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-black/10 text-sm focus:outline-none focus:border-black transition-colors"
                readOnly
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-black/70 uppercase tracking-wide mb-2">Detailed Address</label>
              <input
                type="text"
                placeholder="Street address and number"
                value={formData.detail}
                onChange={(e) => setFormData((prev) => ({ ...prev, detail: e.target.value }))}
                className="w-full px-3 py-2 border border-black/10 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddAddress}
              className="flex-1 py-2 bg-black text-white text-sm font-medium hover:bg-black/80 transition-colors"
            >
              Add Address
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 border border-black/20 text-sm font-medium text-black hover:bg-black/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AccountTab({ onLogout, userId, token }: { onLogout: () => void; userId: string; token: string | null }) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleChangePassword = async () => {
    setPasswordMessage("");

    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setPasswordMessage("모든 비밀번호 필드를 입력해주세요.");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setPasswordMessage("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (passwords.new.length < 8) {
      setPasswordMessage("새 비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    if (!userId) {
      setPasswordMessage("현재 계정은 비밀번호 변경을 지원하지 않습니다.");
      return;
    }

    try {
      await authAPI.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
      }, token, userId);
      setPasswordMessage("비밀번호가 변경되었습니다.");
      setShowPasswordForm(false);
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      const status = error?.response?.status;
      if (status === 400 || status === 401) {
        setPasswordMessage("현재 비밀번호가 올바르지 않습니다.");
        return;
      }
      setPasswordMessage("비밀번호 변경에 실패했습니다.");
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="bg-white border border-black/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-black">Change Password</h3>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-xs font-medium text-black/70 hover:text-black underline underline-offset-2 transition-colors"
          >
            {showPasswordForm ? "Cancel" : "Edit"}
          </button>
        </div>

        {!showPasswordForm ? (
          <p className="text-sm text-black/60">Use Edit to change your password.</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-black/70 uppercase tracking-wide mb-2">Current Password</label>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords((prev) => ({ ...prev, current: e.target.value }))}
                className="w-full px-3 py-2 border border-black/10 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-black/70 uppercase tracking-wide mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) => setPasswords((prev) => ({ ...prev, new: e.target.value }))}
                  className="w-full px-3 py-2 border border-black/10 text-sm focus:outline-none focus:border-black transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-black/70 uppercase tracking-wide mb-2">Confirm Password</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords((prev) => ({ ...prev, confirm: e.target.value }))}
                className="w-full px-3 py-2 border border-black/10 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <button
              onClick={handleChangePassword}
              className="w-full py-2 bg-black text-white text-sm font-medium hover:bg-black/80 transition-colors"
            >
              Change Password
            </button>

            {passwordMessage && (
              <p className={`text-sm ${passwordMessage.includes("변경") ? "text-green-700" : "text-red-700"}`}>
                {passwordMessage}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="bg-white border border-black/10 p-6">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 text-sm font-medium text-black hover:text-black/70 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}

function SettingTab() {
  const [settings, setSettings] = useState({
    marketing: true,
    newsletter: false,
  });

  const handleToggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="bg-white border border-black/10 p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-black mb-1">Marketing Emails</h3>
            <p className="text-xs text-black/60">Receive updates about new products and special offers</p>
          </div>
          <button
            onClick={() => handleToggleSetting("marketing")}
            className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
              settings.marketing ? "bg-black" : "bg-black/20"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                settings.marketing ? "translate-x-4" : ""
              }`}
            />
          </button>
        </div>
      </div>

      <div className="bg-white border border-black/10 p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-black mb-1">Newsletter</h3>
            <p className="text-xs text-black/60">Weekly styling tips and curated recommendations for your pet</p>
          </div>
          <button
            onClick={() => handleToggleSetting("newsletter")}
            className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
              settings.newsletter ? "bg-black" : "bg-black/20"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                settings.newsletter ? "translate-x-4" : ""
              }`}
            />
          </button>
        </div>
      </div>

      <div className="bg-white border border-black/10 p-6">
        <button className="flex items-center gap-3 text-sm font-medium text-black hover:text-black/70 transition-colors">
          <MessageCircle size={16} />
          Contact Customer Support
        </button>
      </div>

      <div className="bg-white border border-red-200 p-6">
        <div className="flex items-start gap-4">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-black mb-2">Delete Account</h3>
            <p className="text-xs text-black/60 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="text-xs font-medium text-red-600 hover:text-red-700 underline underline-offset-2 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
