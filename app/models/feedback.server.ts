// Purpose: Backend logic for feedback creation
// Frontend: feedback.tsx

// Author: Jerry Fan
// Date: 4/30/2024

import { prisma } from "~/db.server";
export type { Feedback } from "@prisma/client";

// Create a new feedback
// values are from 1 to 5 inclusive
// comments are optional and can be null
// returns the new feedback

export async function createFeedback(data: {
  relevanceAccuracy: number;
  easeOfUse: number;
  learningOutcomes: number;
  feedbackAssessment: number;
  userSatisfaction: number;
  recommendationLikely: number;
  additionalComments?: string;
}) {
  return await prisma.feedback.create({
    data,
  });
}