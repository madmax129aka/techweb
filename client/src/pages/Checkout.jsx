import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";
import { REGISTRATION_DRAFT_KEY } from "./RegisterForm";

/**
 * Payment step - step 2 of the routed Register -> Checkout flow (see the
 * hand-off note in Register.jsx). Reads the draft left in sessionStorage
 * by Register.jsx; if it's missing (e.g. this URL was opened directly,
 * or the tab was restarted), sends the user back to /register rather than
 * rendering a broken payment form with no registrant details.
 * 
 * NOW USES RAZORPAY for automated payment verification instead of manual UPI QR + transaction ID.
 */
export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [draft, setDraft] = useState(null);
  const [razorpayKeyId, setRazorpayKeyId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [registrationId, setRegistrationId] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(REGISTRATION_DRAFT_KEY);
    if (!raw) {
      toast.error("Your registration details were lost - please start again");
      navigate("/register");
      return;
    }
    const parsed = JSON.parse(raw);
    setDraft(parsed);

    // Load Razorpay configuration
    api
      .get("/api/payment/config")
      .then((data) => {
        setRazorpayKeyId(data.keyId);
        // Load Razorpay script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
      })
      .catch(() => {
        toast.error("Payment system not configured. Please contact support.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createRegistrationRecord = async () => {
    if (!draft) return null;

    try {
      const { mode, form, teamName, members } = draft;
      const teamMembers =
        mode === "team" ? [{ name: form.name, regNo: form.registerNo, role: "lead" }, ...members] : null;

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone || "");
      formData.append("password", form.password);
      formData.append("collegeName", form.collegeName || "");
      formData.append("registerNo", form.registerNo || "");
      formData.append("teamName", mode === "team" ? teamName : "");
      if (teamMembers) formData.append("teamMembers", JSON.stringify(teamMembers));
      formData.append("eventIds", JSON.stringify(items.map((i) => i.id)));
      formData.append("paymentMethod", "razorpay");

      const data = await api.post("/api/registrations", formData, { isFormData: true });
      return data.registration;
    } catch (err) {
      toast.error(err.message);
      return null;
    }
  };

  const handleRazorpayPayment = async () => {
    if (!razorpayKeyId) {
      toast.error("Payment system not ready. Please refresh the page.");
      return;
    }

    setSubmitting(true);

    try {
      // Create registration record first
      const registration = await createRegistrationRecord();
      if (!registration) {
        setSubmitting(false);
        return;
      }

      setRegistrationId(registration.id);

      // Create Razorpay order
      const orderData = await api.post("/api/payment/create-order", {
        amount: total,
        registrationId: registration.id,
      });

      // Open Razorpay checkout
      const options = {
        key: razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "TechAstra Symposium",
        description: `Registration Payment - ${items.length} event(s)`,
        prefill: {
          name: draft.form.name,
          email: draft.form.email,
          contact: draft.form.phone || "",
        },
        theme: {
          color: "#dc2626", // crimson color
        },
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verifyData = await api.post("/api/payment/verify", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              registrationId: registration.id,
            });

            if (verifyData.verified) {
              sessionStorage.removeItem(REGISTRATION_DRAFT_KEY);
              clearCart();
              toast.success(`Payment successful! Registration Code: ${verifyData.registration.registrationCode}`);
              navigate(`/status?code=${verifyData.registration.registrationCode}`);
            } else {
              toast.error("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            toast.error(err.message || "Payment verification failed");
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
            toast.error("Payment cancelled. You can retry when ready.");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      toast.error(err.message || "Failed to initiate payment");
      setSubmitting(false);
    }
  };

  if (!draft) return null; // redirecting to /register, see effect above

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="text-center mb-10 animate-cinematic-fade">
        <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4">Step 2 of 2</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-offwhite">Complete Your Payment</h1>
      </div>

      {/* Order Summary */}
      <div className="border border-crimson/15 p-6 mb-6">
        <h3 className="text-sm font-semibold text-offwhite mb-4 uppercase tracking-wide">Order Summary</h3>
        
        <div className="space-y-3 mb-4">
          {/* Group combo items and individual items */}
          {(() => {
            const combos = new Map();
            const individualItems = [];
            
            items.forEach(item => {
              if (item.isComboItem && item.comboId) {
                if (!combos.has(item.comboId)) {
                  combos.set(item.comboId, {
                    name: item.comboName,
                    price: item.comboPrice,
                    events: []
                  });
                }
                combos.get(item.comboId).events.push(item.name);
              } else {
                individualItems.push(item);
              }
            });
            
            return (
              <>
                {/* Display combo passes */}
                {Array.from(combos.entries()).map(([comboId, combo]) => (
                  <div key={comboId} className="border-l-2 border-crimson/30 pl-3">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="text-sm font-medium text-crimson-light">{combo.name}</p>
                        <p className="text-xs text-offwhite/50 mt-1">
                          Includes: {combo.events.join(", ")}
                        </p>
                      </div>
                      <p className="text-sm text-offwhite">&#8377;{combo.price}</p>
                    </div>
                  </div>
                ))}
                
                {/* Display individual events */}
                {individualItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <p className="text-sm text-offwhite/80">{item.name}</p>
                    <p className="text-sm text-offwhite">&#8377;{item.price}</p>
                  </div>
                ))}
              </>
            );
          })()}
        </div>
        
        <div className="border-t border-crimson/15 pt-3 mt-3">
          <div className="flex justify-between items-center">
            <p className="text-base font-semibold text-offwhite">Total</p>
            <p className="font-serif text-2xl text-crimson-light">&#8377;{total}</p>
          </div>
        </div>
      </div>

      <div className="text-center mb-8 border border-crimson/15 p-6">
        <p className="text-offwhite/50 text-sm mb-3">Secure online payment via Razorpay</p>
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-offwhite/70 text-sm">UPI</span>
          <span className="text-offwhite/30">•</span>
          <span className="text-offwhite/70 text-sm">Cards</span>
          <span className="text-offwhite/30">•</span>
          <span className="text-offwhite/70 text-sm">Net Banking</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="border border-crimson/10 bg-crimson/5 p-4 rounded">
          <h3 className="text-sm font-semibold text-offwhite mb-2">Payment Process:</h3>
          <ol className="text-xs text-offwhite/70 space-y-1 list-decimal list-inside">
            <li>Click "Proceed to Payment" below</li>
            <li>Choose your payment method (UPI/Card/Net Banking)</li>
            <li>Complete payment securely via Razorpay</li>
            <li>Your registration will be auto-approved instantly</li>
            <li>Download your ID card immediately</li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/register")}
            data-log="checkout-back-to-details"
            className="sm:flex-none"
            disabled={submitting}
          >
            Back to Details
          </Button>
          <Button
            type="button"
            onClick={handleRazorpayPayment}
            className="flex-1"
            disabled={submitting || !razorpayKeyId}
          >
            {submitting ? "Processing..." : "Proceed to Payment"}
          </Button>
        </div>

        {!razorpayKeyId && (
          <p className="text-xs text-center text-offwhite/50">Loading payment gateway...</p>
        )}
      </div>
    </div>
  );
}
