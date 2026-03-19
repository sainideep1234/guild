import { model, Schema } from "mongoose";

const UserDetailSchema = new Schema(
  {
    account: { ref: "Registration", type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    dob: { type: String },
    address: {
      pincode: { type: String },
      revenue_state: { type: String },
      revenue_district: { type: String },
      house_no: String,
    },
    bsg_uid: String,
    bsg_state: String,
    bsg_district: String,
    highest_qualification: String,
    professional_qualification: String,
    tshirt_size: String,
    section: String,
    year_of_rastrapati: String,
    certificate_no: String,
    souvenir: String,
    mobile_no: String,
    email: String,
    aadhaar_no: String,

    // Merged from UserDocument
    photo_path: String,
    adhar_doc_path: String,
    rashtrapati_certificate_path: String,
  },
  { timestamps: true },
);

const UserDetail = model("UserDetail", UserDetailSchema);
export default UserDetail;
