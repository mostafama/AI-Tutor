import type { Feedback } from "@prisma/client";
import { prisma } from "~/db.server";
export type { Feedback } from "@prisma/client";

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