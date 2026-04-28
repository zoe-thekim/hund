import { useRef, useState, useEffect, type ChangeEvent, type MouseEvent } from "react";
import {
  Eye,
  EyeOff,
  LogOut,
  MessageCircle,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useStore from "../../store/useStore";
import { authAPI, orderAPI } from "../../api";
import { normalizeProfileImageFromApi } from "../../api";
import type { Tab, Address, Order, UserInfo, AuthUser, DbOrder } from "./myPageTypes";
import {
  getDateString,
  toPriceText,
  formatOrderStatus,
  toPhoneFromUser,
  getProfileImageFromUser,
  getMarketingAgreement,
  getProfileFromUser,
  normalizeMyOrder,
  toAddressList,
} from "./myPageMappers";

export default function MyPage() {
  const navigate = useNavigate();
  const authUser = useStore((state) => state.authUser) as AuthUser | null;
  const authToken = useStore((state) => state.authToken);
  const logout = useStore((state) => state.logout);
  const updateAuthUser = useStore((state) => state.updateAuthUser);

  const [activeTab, setActiveTab] = useState<Tab>("Profile");
  const [profileImage, setProfileImage] = useState("/placeholder.svg");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserInfo>({
    name: "",
    email: "",
    phone: "",
    birthday: "",
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  const myPageRequestId = useRef(0);

  const syncFromAuthUser = (nextUser: AuthUser | null) => {
    setProfile(getProfileFromUser(nextUser));
    setProfileImage(getProfileImageFromUser(nextUser));
    setMarketingEnabled(getMarketingAgreement(nextUser));
    setIsUploadingAvatar(false);
  };

  useEffect(() => {
    syncFromAuthUser(authUser);
  }, [authUser]);

  useEffect(() => {
    const loadMyPageData = async () => {
      if (!authToken) {
        return;
      }

      const requestId = ++myPageRequestId.current;
      setIsDataLoading(true);
      setDataError("");

      try {
        const response = await authAPI.me(authToken);
        const data = response?.data ?? {};
        const latestUser = data.user ?? data.data ?? data;
        if (!latestUser || typeof latestUser !== "object") {
          throw new Error("invalid_profile");
        }

        if (requestId !== myPageRequestId.current) {
          return;
        }

        const nextUser: AuthUser = {
          ...(authUser ?? {}),
          ...latestUser,
        };
        updateAuthUser(nextUser);
        syncFromAuthUser(nextUser);

        if (requestId !== myPageRequestId.current) {
          return;
        }

        let orderRows: DbOrder[] = [];
        const nextUserId = String(nextUser.id ?? "").trim();
        if (nextUserId) {
          const orderResponse = await orderAPI.getByUserId(nextUserId, authToken);
          if (requestId !== myPageRequestId.current) {
            return;
          }
          orderRows = Array.isArray(orderResponse?.data) ? orderResponse.data : [];
        }

        if (requestId !== myPageRequestId.current) {
          return;
        }

        const normalizedOrders = orderRows
          .map((row) => normalizeMyOrder(row as DbOrder))
          .filter((row): row is Order => Boolean(row));

        setOrders(normalizedOrders);
        setAddresses(toAddressList(nextUser, orderRows));
      } catch {
        if (requestId === myPageRequestId.current) {
          setDataError("Unable to load your page data.");
        }
      } finally {
        if (requestId === myPageRequestId.current) {
          setIsDataLoading(false);
        }
      }
    };

    loadMyPageData();
  }, [authToken, authUser?.id]);

  const handleMarketingSettingToggle = async (nextValue: boolean) => {
    if (!authToken || !authUser) {
      return;
    }

    const previousValue = marketingEnabled;
    const optimisticUser: AuthUser = {
      ...authUser,
      agreeToMarketing: nextValue,
      agree_to_marketing: nextValue,
    };

    // Optimistic update
    updateAuthUser(optimisticUser);
    syncFromAuthUser(optimisticUser);

    try {
      const response = await authAPI.updateProfile(
        { agreeToMarketing: nextValue },
        authToken
      );
      const data = response?.data ?? {};
      const latestUser = data.user ?? data.data ?? data;

      if (latestUser && typeof latestUser === "object") {
        const newAuthUser: AuthUser = {
          ...authUser,
          ...(latestUser as AuthUser),
        };
        updateAuthUser(newAuthUser);
        syncFromAuthUser(newAuthUser);
      }
    } catch {
      // Roll back to the previous value if update fails
      const rollbackUser: AuthUser = {
        ...authUser,
        agreeToMarketing: previousValue,
        agree_to_marketing: previousValue,
      };
      updateAuthUser(rollbackUser);
      syncFromAuthUser(rollbackUser);
    }
  };

  const handleProfileImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authUser || !authToken) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const preview = event.target?.result as string;
      setProfileImage(preview);
    };
    reader.readAsDataURL(file);

    setIsUploadingAvatar(true);
    try {
      const response = await authAPI.uploadProfileImage(file, authToken);
      const data = response?.data ?? {};
      const uploadedUrl = normalizeProfileImageFromApi(
        data.profileImageUrl ?? data.user?.profileImageUrl ?? data.data?.profileImageUrl
      );
      const userFromResponse = data.user ?? data.data;

      if (typeof uploadedUrl === "string" && uploadedUrl.trim()) {
        setProfileImage(uploadedUrl);
      }

      const updatedAuthUser = {
        ...authUser,
        ...(userFromResponse ?? {}),
        ...(typeof uploadedUrl === "string" ? { profileImageUrl: uploadedUrl } : {}),
      };
      updateAuthUser(updatedAuthUser);
      syncFromAuthUser(updatedAuthUser);
    } catch {
      // Keep local preview on upload failure and prompt save when needed.
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleProfileSave = async (next: UserInfo) => {
    if (!authUser) {
      return;
    }

    const payload: Partial<AuthUser> = {
      name: next.name,
      phoneNumber: next.phone.trim(),
      birthDate: next.birthday || null,
    };

    try {
      const response = await authAPI.updateProfile(payload, authToken);
      const data = response?.data ?? {};
      const updatedUser = data.user ?? data.data ?? data;

      // Update authUser with latest data from server
      const newAuthUser = {
        ...authUser,
        ...updatedUser,
      };
      updateAuthUser(newAuthUser);

      // Sync UI state immediately
      syncFromAuthUser(newAuthUser);
    } catch {
      // Keep optimistic update in UI if API call fails
      const fallbackUser = {
        ...authUser,
        ...payload,
      };
      updateAuthUser(fallbackUser);
      syncFromAuthUser(fallbackUser);
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
            {isUploadingAvatar ? (
              <p className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[11px] text-black/60 bg-white/95 px-2 py-0.5 rounded-full mt-1">
                Uploading...
              </p>
            ) : null}
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
          {activeTab === "My Orders" && (
            <MyOrdersTab
              orders={orders}
              isLoading={isDataLoading}
              errorMessage={dataError}
            />
          )}
          {activeTab === "Address" && (
            <AddressTab
              addresses={addresses}
              isLoading={isDataLoading}
              errorMessage={dataError}
            />
          )}
          {activeTab === "Account" && <AccountTab onLogout={handleLogout} userId={String(authUser?.id ?? "")} token={authToken} />}
          {activeTab === "Setting" && (
            <SettingTab
              marketingEnabled={marketingEnabled}
              onMarketingSettingToggle={handleMarketingSettingToggle}
            />
          )}
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
      setErrorMessage("Phone number is required.");
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
    return date.toLocaleDateString("en-US", {
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

function MyOrdersTab({
  orders,
  isLoading,
  errorMessage,
}: {
  orders: Order[];
  isLoading: boolean;
  errorMessage: string;
}) {
  if (isLoading) {
    return (
      <div className="max-w-4xl">
        <div className="bg-white border border-black/10 p-8 text-center">
          <p className="text-sm text-black/60">Loading order history...</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="max-w-4xl">
        <div className="bg-white border border-red-200 p-8 text-center">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    return formatOrderStatus(status);
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
                <h3 className="text-sm font-medium text-black mb-1">
                  {order.orderNumber} <span className="text-black/60">({order.id})</span>
                </h3>
                <p className="text-xs text-black/50">
                  {order.date
                    ? new Date(order.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "-"}
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

function AddressTab({
  addresses,
  isLoading,
  errorMessage,
}: {
  addresses: Address[];
  isLoading: boolean;
  errorMessage: string;
}) {
  if (isLoading) {
    return (
      <div className="max-w-4xl">
        <div className="bg-white border border-black/10 p-8 text-center">
            <p className="text-sm text-black/60">Loading address information...</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="max-w-4xl">
        <div className="bg-white border border-red-200 p-8 text-center">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="bg-white border border-black/10 p-8 text-center">
            <p className="text-sm text-black/60">No saved addresses.</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className="bg-white border border-black/10 p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-black mb-1">{addr.name}</h3>
                  {addr.isDefault && (
                    <span className="inline-block text-xs font-medium text-black/60 mb-3">Default Address</span>
                  )}
                </div>
              </div>

              <div className="text-sm text-black/70 space-y-1">
                <p>({addr.postalCode}) {addr.address}</p>
                <p>{addr.detail}</p>
                <p>{addr.phone}</p>
              </div>
            </div>
          ))
        )}
      </div>
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
      setPasswordMessage("Please fill in all password fields.");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setPasswordMessage("New password and confirm password do not match.");
      return;
    }

    if (passwords.new.length < 8) {
      setPasswordMessage("New password must be at least 8 characters.");
      return;
    }

    if (!userId) {
      setPasswordMessage("Password changes are not supported for this account.");
      return;
    }

    try {
      await authAPI.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
      }, token);
      setPasswordMessage("Password has been changed.");
      setShowPasswordForm(false);
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 400 || status === 401) {
        setPasswordMessage("Current password is incorrect.");
        return;
      }
      setPasswordMessage("Failed to change password.");
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
              <p className={`text-sm ${passwordMessage.includes("changed") || passwordMessage.includes("Changed") ? "text-green-700" : "text-red-700"}`}>
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

function SettingTab({
  marketingEnabled,
  onMarketingSettingToggle,
}: {
  marketingEnabled: boolean;
  onMarketingSettingToggle: (nextValue: boolean) => void | Promise<void>;
}) {
  const [isMarketingConfirmOpen, setIsMarketingConfirmOpen] = useState(false);
  // Newsletter toggle is local-only state (no server sync).
  const [settings, setSettings] = useState({
    newsletter: false,
  });

  const handleToggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleMarketingToggle = async () => {
    const nextValue = !marketingEnabled;
    if (nextValue) {
      setIsMarketingConfirmOpen(true);
      return;
    }
    await onMarketingSettingToggle(nextValue);
  };

  const confirmMarketingEnable = async () => {
    setIsMarketingConfirmOpen(false);
    await onMarketingSettingToggle(true);
  };

  const handleMarketingToggleCancel = () => {
    setIsMarketingConfirmOpen(false);
  };

  const handleMarketingBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setIsMarketingConfirmOpen(false);
    }
  };

  return (
    <div className="relative max-w-2xl space-y-4">
      {isMarketingConfirmOpen ? (
        <div
          role="presentation"
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={handleMarketingBackdropClick}
        >
          <div className="w-full max-w-md bg-white border border-black/10 rounded-3xl shadow-2xl p-6">
            <h3 className="text-base font-medium text-black mb-2">Marketing Consent</h3>
            <p className="text-sm text-black/70 leading-relaxed">
              Would you like to receive marketing emails from hund about new products and offers?
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={handleMarketingToggleCancel}
                className="px-4 py-2 border border-black/20 text-black text-sm font-medium hover:border-black transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmMarketingEnable}
                className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-black/80 transition-colors"
              >
                Enable Marketing
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="bg-white border border-black/10 p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-black mb-1">Marketing Emails</h3>
            <p className="text-xs text-black/60">Receive updates about new products and special offers</p>
          </div>
          <button
            onClick={handleMarketingToggle}
            className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
              marketingEnabled ? "bg-black" : "bg-black/20"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                marketingEnabled ? "translate-x-4" : ""
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
