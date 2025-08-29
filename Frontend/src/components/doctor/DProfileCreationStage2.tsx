function DProfileCreationStage2() {
  const name = "Arnold Mathews";
  return (
    <>
      <div className="bg-white p-5 rounded-lg mt-4 font-medium mb-2">
        <p>
          I, Dr. {name}, hereby declare that all the information I have provided
          is true and accurate to the best of my knowledge.
        </p>
        <p>I acknowledge and agree that:</p>
        <ul className="list-disc px-6">
          <li>
            I am a licensed and registered medical professional qualified to
            provide medical consultations and issue prescriptions.
          </li>
          <li>
            I understand that all medical information available through
            HealthHub is confidential and will be used solely for diagnosis,
            treatment, or care coordination.
          </li>
          <li>
            I will not share or misuse patient data in any form, and will comply
            with all relevant data protection laws and ethical standards.
          </li>
          <li>
            I accept that unauthorized access, data tampering, or violation of
            any patient’s privacy may result in permanent suspension from the
            platform and legal action as per applicable laws.
          </li>
          <li>
            I will maintain a professional and respectful interaction with all
            patients and colleagues on the platform.
          </li>
        </ul>
        <p>
          By proceeding, I accept the terms and conditions and affirm my
          responsibility as a healthcare provider using the HealthHub system.
        </p>
        <div className="flex gap-4 mt-3">
          <input type="checkbox" className="scale-125" />
          <span className="font-bold">
            I Accept and Agree to the above declaration.
          </span>
        </div>
      </div>
    </>
  );
}

export default DProfileCreationStage2;
