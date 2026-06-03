"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  ChevronLeft,
  Loader2,
  X,
  Check,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCustomer } from "@/features/auth/store/authSlice";
import {
  shopifyFetch,
  GET_CUSTOMER_ADDRESSES,
  ADDRESS_CREATE,
  ADDRESS_UPDATE,
  ADDRESS_DELETE,
  ADDRESS_SET_DEFAULT,
} from "@/shared/lib/shopify";

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string | null;
  city: string;
  province: string;
  zip: string;
  country: string;
  phone: string | null;
}

interface AddressFormData {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  phone: string;
}

const EMPTY_FORM: AddressFormData = {
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  province: "",
  zip: "",
  country: "",
  phone: "",
};

export default function AddressesPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { customer, accessToken, loading } = useAppSelector((s) => s.auth);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [defaultId, setDefaultId] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  // form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // auth guard
  useEffect(() => {
    if (!accessToken) {
      router.push("/auth/login");
      return;
    }
    if (!customer && accessToken) dispatch(fetchCustomer(accessToken));
  }, [accessToken, customer, dispatch, router]);

  // fetch addresses
  const fetchAddresses = async () => {
    if (!accessToken) return;
    setFetchLoading(true);
    try {
      const data = await shopifyFetch<{
        customer: {
          defaultAddress: { id: string } | null;
          addresses: { edges: { node: Address }[] };
        } | null;
      }>({
        query: GET_CUSTOMER_ADDRESSES,
        variables: { customerAccessToken: accessToken },
        cache: "no-store",
      });
      setAddresses(data.customer?.addresses.edges.map((e) => e.node) ?? []);
      setDefaultId(data.customer?.defaultAddress?.id ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const openAddForm = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  };

  const openEditForm = (addr: Address) => {
    setEditingId(addr.id);
    setFormData({
      firstName: addr.firstName,
      lastName: addr.lastName,
      address1: addr.address1,
      address2: addr.address2 ?? "",
      city: addr.city,
      province: addr.province,
      zip: addr.zip,
      country: addr.country,
      phone: addr.phone ?? "",
    });
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError(null);
  };

  const handleSave = async () => {
    if (!accessToken) return;
    setFormError(null);

    // basic validation
    if (!formData.firstName || !formData.lastName || !formData.address1 || !formData.city || !formData.country || !formData.zip) {
      setFormError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        // Update
        const data = await shopifyFetch<{
          customerAddressUpdate: { customerUserErrors: { message: string }[] };
        }>({
          query: ADDRESS_UPDATE,
          variables: {
            customerAccessToken: accessToken,
            id: editingId,
            address: formData,
          },
        });
        const errs = data.customerAddressUpdate.customerUserErrors;
        if (errs.length) { setFormError(errs[0].message); return; }
      } else {
        // Create
        const data = await shopifyFetch<{
          customerAddressCreate: { customerUserErrors: { message: string }[] };
        }>({
          query: ADDRESS_CREATE,
          variables: {
            customerAccessToken: accessToken,
            address: formData,
          },
        });
        const errs = data.customerAddressCreate.customerUserErrors;
        if (errs.length) { setFormError(errs[0].message); return; }
      }
      closeForm();
      await fetchAddresses();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!accessToken) return;
    setDeletingId(id);
    try {
      await shopifyFetch({
        query: ADDRESS_DELETE,
        variables: { customerAccessToken: accessToken, id },
      });
      await fetchAddresses();
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!accessToken) return;
    setSettingDefaultId(id);
    try {
      await shopifyFetch({
        query: ADDRESS_SET_DEFAULT,
        variables: { customerAccessToken: accessToken, addressId: id },
      });
      setDefaultId(id);
    } catch (e) {
      console.error(e);
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleChange = (field: keyof AddressFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // loading skeleton
  if (loading || !customer)
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-border-light dark:bg-border-dark rounded-card w-48" />
          <div className="h-32 bg-border-light dark:bg-border-dark rounded-card" />
          <div className="h-32 bg-border-light dark:bg-border-dark rounded-card" />
        </div>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back + Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/account"
            className="inline-flex items-center gap-1 text-xs text-ink-2 dark:text-ink-dk2 hover:text-brand-warm transition-colors mb-2"
          >
            <ChevronLeft size={14} /> Back to Account
          </Link>
          <h1 className="font-display text-2xl tracking-heading text-ink-1 dark:text-ink-dk1">
            Saved Addresses
          </h1>
        </div>
        <button
          onClick={openAddForm}
          className="inline-flex items-center gap-2 bg-brand-warm text-white text-sm font-medium px-4 py-2 rounded-btn hover:opacity-90 transition-opacity"
        >
          <Plus size={15} /> Add Address
        </button>
      </div>

      {/* Address Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-surface-light dark:bg-surface-dark rounded-card shadow-card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg text-ink-1 dark:text-ink-dk1">
                {editingId ? "Edit Address" : "Add New Address"}
              </h2>
              <button onClick={closeForm} className="text-ink-2 dark:text-ink-dk2 hover:text-ink-1 dark:hover:text-ink-dk1">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "First Name *", field: "firstName" as const },
                { label: "Last Name *", field: "lastName" as const },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-ink-2 dark:text-ink-dk2 mb-1">{label}</label>
                  <input
                    type="text"
                    value={formData[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className="w-full text-sm border border-border-light dark:border-border-dark rounded-btn px-3 py-2 bg-bg-light dark:bg-bg-dark text-ink-1 dark:text-ink-dk1 focus:outline-none focus:border-brand-warm"
                  />
                </div>
              ))}

              <div className="col-span-2">
                <label className="block text-xs font-medium text-ink-2 dark:text-ink-dk2 mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  value={formData.address1}
                  onChange={(e) => handleChange("address1", e.target.value)}
                  className="w-full text-sm border border-border-light dark:border-border-dark rounded-btn px-3 py-2 bg-bg-light dark:bg-bg-dark text-ink-1 dark:text-ink-dk1 focus:outline-none focus:border-brand-warm"
                  placeholder="Street address, apartment, suite, etc."
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-ink-2 dark:text-ink-dk2 mb-1">Address Line 2</label>
                <input
                  type="text"
                  value={formData.address2}
                  onChange={(e) => handleChange("address2", e.target.value)}
                  className="w-full text-sm border border-border-light dark:border-border-dark rounded-btn px-3 py-2 bg-bg-light dark:bg-bg-dark text-ink-1 dark:text-ink-dk1 focus:outline-none focus:border-brand-warm"
                  placeholder="Apartment, suite, unit (optional)"
                />
              </div>

              {[
                { label: "City *", field: "city" as const },
                { label: "Province / State", field: "province" as const },
                { label: "ZIP / Postal Code *", field: "zip" as const },
                { label: "Country *", field: "country" as const },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-ink-2 dark:text-ink-dk2 mb-1">{label}</label>
                  <input
                    type="text"
                    value={formData[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className="w-full text-sm border border-border-light dark:border-border-dark rounded-btn px-3 py-2 bg-bg-light dark:bg-bg-dark text-ink-1 dark:text-ink-dk1 focus:outline-none focus:border-brand-warm"
                  />
                </div>
              ))}

              <div className="col-span-2">
                <label className="block text-xs font-medium text-ink-2 dark:text-ink-dk2 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full text-sm border border-border-light dark:border-border-dark rounded-btn px-3 py-2 bg-bg-light dark:bg-bg-dark text-ink-1 dark:text-ink-dk1 focus:outline-none focus:border-brand-warm"
                  placeholder="+1 555 000 0000"
                />
              </div>
            </div>

            {formError && (
              <p className="mt-4 text-sm text-brand-red">{formError}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeForm}
                className="flex-1 text-sm border border-border-light dark:border-border-dark text-ink-2 dark:text-ink-dk2 rounded-btn py-2 hover:bg-bg-light dark:hover:bg-bg-dark transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 text-sm bg-brand-warm text-white rounded-btn py-2 font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {saving ? "Saving..." : "Save Address"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Addresses List */}
      {fetchLoading ? (
        <div className="flex items-center justify-center py-16 gap-2">
          <Loader2 size={18} className="animate-spin text-ink-2 dark:text-ink-dk2" />
          <span className="text-sm text-ink-2 dark:text-ink-dk2">Loading addresses...</span>
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-surface-light dark:bg-surface-dark rounded-card shadow-soft text-center py-16">
          <MapPin size={36} className="mx-auto text-ink-2 dark:text-ink-dk2 opacity-30 mb-4" />
          <p className="text-sm text-ink-2 dark:text-ink-dk2 mb-4">No saved addresses yet.</p>
          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-2 bg-brand-warm text-white text-sm font-medium px-4 py-2 rounded-btn hover:opacity-90 transition-opacity"
          >
            <Plus size={14} /> Add Your First Address
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((addr) => {
            const isDefault = addr.id === defaultId;
            return (
              <div
                key={addr.id}
                className={`bg-surface-light dark:bg-surface-dark rounded-card shadow-soft p-5 border-2 transition-colors ${
                  isDefault ? "border-brand-warm/40" : "border-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-btn bg-bg-light dark:bg-bg-dark flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin size={15} className="text-brand-warm" />
                    </div>
                    <div>
                      {isDefault && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-warm bg-brand-warm/10 px-2 py-0.5 rounded-pill mb-1">
                          <Star size={9} fill="currentColor" /> Default
                        </span>
                      )}
                      <p className="text-sm font-semibold text-ink-1 dark:text-ink-dk1">
                        {addr.firstName} {addr.lastName}
                      </p>
                      <p className="text-sm text-ink-2 dark:text-ink-dk2 mt-0.5">
                        {addr.address1}
                        {addr.address2 ? `, ${addr.address2}` : ""}
                      </p>
                      <p className="text-sm text-ink-2 dark:text-ink-dk2">
                        {addr.city}{addr.province ? `, ${addr.province}` : ""} {addr.zip}
                      </p>
                      <p className="text-sm text-ink-2 dark:text-ink-dk2">{addr.country}</p>
                      {addr.phone && (
                        <p className="text-xs text-ink-2 dark:text-ink-dk2 mt-1">{addr.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditForm(addr)}
                        className="p-1.5 text-ink-2 dark:text-ink-dk2 hover:text-brand-warm transition-colors rounded"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(addr.id)}
                        disabled={deletingId === addr.id}
                        className="p-1.5 text-ink-2 dark:text-ink-dk2 hover:text-brand-red transition-colors rounded disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === addr.id
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Trash2 size={14} />}
                      </button>
                    </div>
                    {!isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        disabled={settingDefaultId === addr.id}
                        className="text-[11px] text-brand-warm hover:underline disabled:opacity-50 flex items-center gap-1"
                      >
                        {settingDefaultId === addr.id
                          ? <Loader2 size={10} className="animate-spin" />
                          : null}
                        Set as default
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}