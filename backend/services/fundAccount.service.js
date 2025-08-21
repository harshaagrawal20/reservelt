// services/fundAccount.service.js
import fetch from "node-fetch";

// Create RazorpayX Contact for product owner
export const createRazorpayContact = async (name, email, contactNumber) => {
  try {
    const response = await fetch("https://api.razorpay.com/v1/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64")
      },
      body: JSON.stringify({
        name,
        email,
        contact: contactNumber,
        type: "vendor", // Owner is a vendor
        reference_id: `owner_${Date.now()}`,
        notes: {
          platform: "Reservelt"
        }
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.description);

    return data; // returns contact_id
  } catch (error) {
    console.error("Error creating RazorpayX Contact:", error);
    throw error;
  }
};

// Create RazorpayX Fund Account linked to Contact
export const createFundAccount = async (contactId, accountHolderName, ifsc, accountNumber) => {
  try {
    const response = await fetch("https://api.razorpay.com/v1/fund_accounts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64")
      },
      body: JSON.stringify({
        contact_id: contactId,
        account_type: "bank_account",
        bank_account: {
          name: accountHolderName,
          ifsc,
          account_number: accountNumber
        }
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.description);

    return data; // returns fund_account_id
  } catch (error) {
    console.error("Error creating RazorpayX Fund Account:", error);
    throw error;
  }
};
