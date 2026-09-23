export interface TermSection {
  number: number;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export const SOUVA_TERMS: {
  company: string;
  effectiveDate: string;
  intro: string;
  sections: TermSection[];
  footerNote: string;
} = {
  company: "SOUVA Mobile Pet Grooming · Operated by SOUVA CORP, a California corporation",
  effectiveDate: "September 2026",
  intro: "These Terms & Conditions of Service apply to grooming appointments and related services provided by SOUVA. By booking an appointment and accepting these Terms, the client agrees to the following:",
  sections: [
    {
      number: 1,
      title: "Booking and Communication",
      paragraphs: [
        "When booking an appointment, the client must provide accurate and complete information about their dog, requested service, service address, and a phone number and email address where they can be reached.",
        "An authorized adult must be available to hand off and receive the dog unless alternative access or handoff arrangements have been approved by SOUVA in advance.",
        "Because SOUVA provides mobile grooming services, appointment arrival times may be approximate or provided as an arrival window. Traffic, weather, parking conditions, the needs of a previous pet, mechanical issues, or other circumstances may affect arrival times.",
        "SOUVA will make reasonable efforts to notify the client of significant delays.",
      ],
    },
    {
      number: 2,
      title: "Access and Parking",
      paragraphs: [
        "The client must notify SOUVA in advance of any parking, access, gate, building, HOA, security, or other restrictions that could affect our ability to provide service.",
        "Our grooming van requires a safe and legal parking location reasonably close to the dog’s handoff location.",
        "Certain locations may require parking confirmation before an appointment is accepted.",
        "If suitable parking or access is unavailable, SOUVA may request an alternative nearby location or reschedule the appointment.",
        "If SOUVA arrives for a confirmed appointment and cannot reasonably or legally park, access the property, or receive the dog, the appointment may be treated as a late cancellation or no-show in accordance with Section 9.",
      ],
    },
    {
      number: 3,
      title: "Health and Behavior",
      paragraphs: [
        "Before each appointment, the client must disclose any known illness, injury, recent surgery, allergy, product sensitivity, seizure history, heart condition, skin condition, mobility limitation, difficulty standing, anxiety, bite history, aggression, grooming sensitivity, or other medical or behavioral condition that may affect the grooming process.",
        "The client must also inform SOUVA if the dog shows signs of contagious illness or is known or suspected to have fleas, ticks, or other parasites.",
        "The client agrees to provide accurate information regarding any known history of biting or aggressive behavior.",
        "SOUVA may postpone, modify, shorten, or discontinue a grooming service if continuing would create an unreasonable risk to the dog or groomer.",
      ],
    },
    {
      number: 4,
      title: "Vaccinations",
      paragraphs: [
        "The client confirms that their dog meets applicable vaccination requirements and agrees to provide vaccination information or records when reasonably requested.",
        "Proof of current rabies vaccination may be required before service.",
        "SOUVA will communicate any additional vaccination requirements applicable to a particular service before the appointment when appropriate.",
      ],
    },
    {
      number: 5,
      title: "Senior Dogs and Dogs With Special Needs",
      paragraphs: [
        "SOUVA welcomes senior dogs and dogs with special handling needs when grooming can be performed safely.",
        "We will work within each dog’s comfort, physical ability, and tolerance. We may provide breaks, modify grooming techniques, shorten the service, or end the appointment before completing the requested haircut if necessary for the dog’s well-being.",
        "Age, physical limitations, and certain medical conditions can increase sensitivity or stress during grooming.",
        "The dog’s health, comfort, and safety take priority over completion of a particular hairstyle.",
      ],
    },
    {
      number: 6,
      title: "Matting and Coat Condition",
      paragraphs: [
        "The dog’s comfort takes priority over preserving coat length.",
        "If tight or significant matting is discovered, SOUVA will determine which grooming options can reasonably be performed while prioritizing the dog’s comfort and safety. Options may include limited brushing, a shorter haircut, a shave-down, modification of the requested style, or discontinuation of the service.",
        "SOUVA will not perform prolonged dematting when we believe it would cause excessive pain, stress, or discomfort.",
        "Severe matting may conceal pre-existing skin irritation, sores, bruising, parasites, wounds, or other conditions and may increase the risk of irritation during or after clipping.",
        "Additional time required because of matting or coat condition may result in additional charges.",
        "Whenever reasonably possible, SOUVA will discuss significant changes to the requested service and applicable additional charges with the client before proceeding.",
      ],
    },
    {
      number: 7,
      title: "Fleas, Ticks, Parasites, and Skin Concerns",
      paragraphs: [
        "If SOUVA discovers fleas, ticks, parasites, wounds, significant irritation, or another condition that may require attention, we may modify or discontinue the grooming service.",
        "Additional cleaning, sanitation, handling, or treatment-related charges may apply when disclosed and authorized as appropriate.",
        "SOUVA may recommend that the client consult a veterinarian.",
        "SOUVA does not diagnose medical conditions and does not provide veterinary treatment or veterinary medical advice.",
      ],
    },
    {
      number: 8,
      title: "Services and Pricing",
      paragraphs: [
        "All prices displayed by SOUVA are starting prices unless expressly stated otherwise.",
        "The initial price is based on information provided by the client during booking.",
        "Final pricing may vary based on factors including the dog’s breed, weight, size, coat type, coat condition, matting, shedding, behavior, temperament, requested style, special handling requirements, additional services, and the time required to safely complete the service.",
        "Whenever reasonably possible, SOUVA will explain significant price changes and request approval before performing additional work that materially changes the expected price.",
        "If grooming must be discontinued before the requested service is completed, the client remains responsible for the work already performed and any previously authorized charges.",
      ],
    },
    {
      number: 9,
      title: "Cancellations, Rescheduling, and No-Shows",
      paragraphs: [
        "SOUVA reserves dedicated one-on-one appointment time for each client.",
        "Cancellations or appointment changes should be made at least 24 hours before the scheduled appointment.",
        "Cancellations made less than 24 hours before the scheduled appointment may be subject to a cancellation fee of up to 50% of the scheduled service price.",
        "If the client is unavailable when SOUVA arrives, cannot provide access to the dog, or cannot provide suitable parking or access after the appointment has been confirmed, the appointment may be considered a no-show and may be subject to a fee of up to 100% of the scheduled service price.",
        "We understand that genuine emergencies and unexpected circumstances occur. SOUVA may consider exceptional circumstances on a case-by-case basis.",
        "If SOUVA must cancel an appointment because of vehicle trouble, severe weather, equipment failure, safety concerns, illness, or another operational circumstance, no cancellation fee will be charged. We will make reasonable efforts to offer a new appointment date.",
      ],
    },
    {
      number: 10,
      title: "Payment",
      paragraphs: [
        "Payment is due upon completion of the grooming service unless different payment terms are clearly disclosed during booking.",
        "Payments may be processed through a third-party payment provider.",
        "Any applicable deposit, cancellation fee, no-show fee, or other charge will be disclosed as part of the booking process or otherwise communicated before it is charged, as required by applicable law.",
        "Tips are optional and are never required.",
      ],
    },
    {
      number: 11,
      title: "Grooming Authorization and Safety",
      paragraphs: [
        "By confirming an appointment, the client authorizes SOUVA to perform the selected grooming services and to use reasonable professional grooming, handling, restraint, and safety techniques appropriate for the dog and service being performed.",
        "Professional grooming involves live animals and the use of grooming tools and equipment, including dryers, clippers, scissors, nail tools, bathing equipment, and grooming restraints. Dogs may sometimes move unexpectedly.",
        "Although SOUVA uses reasonable professional care, minor incidents such as nail quicking, temporary skin irritation, small nicks, scratches, or reactions to grooming products may occasionally occur.",
        "SOUVA will make reasonable efforts to inform the client of any known incident or significant concern arising during the grooming appointment.",
        "Nothing in these Terms is intended to waive or limit any rights or remedies that cannot legally be waived or limited under applicable law.",
      ],
    },
    {
      number: 12,
      title: "Emergencies",
      paragraphs: [
        "If SOUVA observes an urgent health or safety concern during an appointment, we will make reasonable efforts to contact the client and, when provided, the client’s designated emergency contact.",
        "If neither can be reached and SOUVA reasonably believes the dog requires prompt veterinary attention, the client authorizes SOUVA to seek reasonable emergency veterinary care for the dog.",
        "The client is responsible for veterinary expenses except to the extent SOUVA is legally responsible for those expenses.",
      ],
    },
    {
      number: 13,
      title: "Photos and Privacy",
      paragraphs: [
        "SOUVA may take photographs when reasonably necessary to document a dog’s coat condition, matting, skin condition, grooming concerns, or completed service.",
        "Permission to use a dog’s photographs or videos for SOUVA’s website, social media, advertising, or other promotional purposes will be requested separately.",
        "Declining marketing photo consent will not affect the client’s ability to receive grooming services.",
        "SOUVA will not intentionally publish a client’s home address, phone number, email address, or other private contact information as part of pet marketing content.",
      ],
    },
    {
      number: 14,
      title: "Appointment Communications",
      paragraphs: [
        "By providing a phone number and email address when requesting or booking an appointment, the client agrees to receive communications reasonably necessary to manage the appointment, such as booking confirmations, reminders, arrival updates, service-related communications, cancellations, and rescheduling notices.",
        "Any consent required for promotional or marketing communications will be requested separately where applicable.",
      ],
    },
    {
      number: 15,
      title: "Right to Refuse or Discontinue Service",
      paragraphs: [
        "SOUVA reserves the right to decline, modify, postpone, or discontinue a service when reasonably necessary because of circumstances including unsafe animal behavior, significant distress or illness, unsafe working conditions, inadequate parking or access, severe weather, equipment or vehicle problems, or materially inaccurate or incomplete information provided during booking.",
        "The safety and well-being of the dog and groomer will take priority over completing a requested service.",
      ],
    },
    {
      number: 16,
      title: "Acceptance of Terms",
      paragraphs: [
        "By booking a service and accepting these Terms & Conditions, the client confirms that:",
      ],
      bullets: [
        "they are authorized to make grooming and care decisions for the dog;",
        "the information provided about the dog is accurate to the best of their knowledge;",
        "they have disclosed known medical, behavioral, and handling concerns relevant to grooming;",
        "they authorize SOUVA to perform the selected grooming service; and",
        "they have read and agree to these Terms & Conditions of Service.",
      ],
    },
  ],
  footerNote: "These Terms do not waive any rights the client may have under applicable law. SOUVA may update these Terms from time to time. The version applicable to an appointment will be the version presented or otherwise applicable when the booking is confirmed, subject to applicable law.",
};
