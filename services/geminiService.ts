import { SoapNote } from '../types';

// Mock service - generates sample SOAP notes without external API
export const generateClinicalNote = async (
  audioBlob: Blob, 
  patientId: string
): Promise<SoapNote> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Generate a sample SOAP note
  const note: SoapNote = {
    patientId: patientId,
    date: currentDate,
    subjective: `Patient reports ongoing concerns related to their condition. Patient describes experiencing symptoms that have been present for the duration of the session. Patient expresses understanding of the treatment plan and is engaged in the therapeutic process.`,
    objective: `Patient presents as alert and oriented. Appearance is appropriate for age and setting. Speech is clear and coherent. Patient demonstrates good eye contact and appears comfortable in the clinical setting. No acute distress observed.`,
    assessment: `Patient continues to work through identified treatment goals. Progress is noted in patient's engagement and understanding of therapeutic interventions. Patient demonstrates appropriate insight into their condition and treatment needs.`,
    plan: `Continue with current treatment approach. Patient will return for follow-up as scheduled. Patient is encouraged to practice discussed strategies between sessions. Monitor progress and adjust interventions as needed based on patient response.`
  };

  return note;
};
