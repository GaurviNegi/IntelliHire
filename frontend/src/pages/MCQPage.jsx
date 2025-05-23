

// const MCQPage = ({ question }) => {
//   const storageKey = `selectedOption-${question.id}`; // Unique key per question
//   const [selectedOption, setSelectedOption] = useState(
//     localStorage.getItem(storageKey) || ""
//   );

//   useEffect(() => {
//     localStorage.setItem(storageKey, selectedOption); // Save to localStorage
//   }, [selectedOption]);

//   return (
//     <div>
//       <h2 className="text-xl font-bold">{question.title}</h2>
//       <ul className="mt-4">
//         {question.options.map((option, index) => (
//           <li key={index} className="mt-2">
//             <label className="flex items-center space-x-2">
//               <input
//                 type="radio"
//                 name={`option-${question.id}`}
//                 value={option}
//                 checked={selectedOption === option}
//                 onChange={() => setSelectedOption(option)}
//               />
//               <span>{option}</span>
//             </label>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default MCQPage;



import { useEffect } from "react";

const MCQPage = ({ question, selectedOption, handleOptionSelect }) => {
  const storageKey = `selectedOption-${question._id}`;

  // Update localStorage whenever selectedOption changes
  useEffect(() => {
    if (selectedOption) {
      localStorage.setItem(storageKey, selectedOption);
    }
  }, [selectedOption, storageKey]);

  return (
    <div>
      <h2 className="text-xl font-bold">{question.title}</h2>
      <ul className="mt-4">
        {question.options.map((option, index) => (
          <li key={index} className="mt-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name={`option-${question._id}`} // Use _id here
                value={option}
                checked={selectedOption === option}
                onChange={() =>
                  handleOptionSelect(question._id, option, option === question.correctAnswer)
                }
              />
              <span>{option}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MCQPage;




