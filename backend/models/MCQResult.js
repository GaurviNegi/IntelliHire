const mongoose = require("mongoose");

const MCQResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
      selectedOption: { type: String, required: true },
      isCorrect: { type: Boolean, required: true }
    }
  ],
  totalMCQScore:{type:Number , default:0}
});

const MCQResult = mongoose.model("MCQResult", MCQResultSchema);
module.exports = MCQResult;
