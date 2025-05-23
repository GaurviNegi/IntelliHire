const mongoose = require("mongoose");

const CodingResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  submissions: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
      code: { type: String, required: true },
      language: { type: String, required: true },
      testCases: [
        {
          input: { type: String, required: true },
          expectedOutput: { type: String, required: true },
          actualOutput: { type: String, required: true },
          executionTime: { type: Number, required: true }, // Store execution time
          status: { type: String, required: true } // Passed / Failed
        }
      ],
      codingScore : {type : Number , default:0}
    }
  ], 
});

module.exports = mongoose.model("CodingResult", CodingResultSchema);
