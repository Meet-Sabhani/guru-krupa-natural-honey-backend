import transporter from "../config/nodemailer.js";
import Contact from "../model/Contact.js";

export const createContact = async (req, res) => {
  try {
    const { email, fullName, subject, message, phoneNumber } = req.body;
    console.log("req.body: ", req.body);

    const newContact = await Contact.create({
      email,
      fullName,
      subject,
      message,
      phoneNumber,
    });

    // Send mail to admin
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: "meetsabhani18@gmail.com",
      subject: `New Contact - ${subject}`,
      replyTo: email,
      text: `Message: ${message}\n\nFrom: ${fullName}\nEmail: ${email}\nPhone: ${phoneNumber}`,
      html: `
    <p><strong>Message:</strong> ${message}</p>
    <p><strong>From:</strong> ${fullName}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phoneNumber}</p>
  `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, data: newContact });
  } catch (err) {
    console.log("contact create err: ", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.json({ success: false, message: "Missing status" });
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedContact) {
      return res
        .status(404)
        .json({ success: false, message: "Contact not found" });
    }

    res.json({ success: true, data: updatedContact });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const { search = "", pageSize = 10, page = 1, status } = req.body;

    const query = {};

    // Add search conditions
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        ...(isNaN(search)
          ? []
          : [{ phoneNumber: { $regex: search, $options: "i" } }]),
      ];
    }

    // Add status filter if it's a valid string
    if (
      status &&
      ["pending", "resolved", "reopened", "not_issue"].includes(status)
    ) {
      query.status = status;
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(pageSize))
      .limit(Number(pageSize));

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        total,
        page: Number(page),
        hasMore: Number(page) * Number(pageSize) < total,
        pageSize: Number(pageSize),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
