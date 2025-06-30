"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

type CreateFeedbackParams = {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
};

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.

        Transcript:
        ${formattedTranscript}
      `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories.",
    });

    const feedback = {
      interviewId,
      userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    const feedbackRef = feedbackId
      ? db.collection("feedback").doc(feedbackId)
      : db.collection("feedback").doc();

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

type Interview = {
  role: string;
  techstack: string;
  type: string;
  id?: string;
  userId: string;
  createdAt: string;
  finalized: boolean;
};

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();
  return interview.data() as Interview | null;
}

type GetFeedbackByInterviewIdParams = {
  interviewId: string;
  userId?: string;
};

type Feedback = {
  id?: string;
  interviewId: string;
  userId: string;
  totalScore: number;
  categoryScores: Record<string, number>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
};

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  if (!userId) {
    // Return fallback demo feedback
    return {
      id: "demo-feedback",
      interviewId: "demo-interview",
      userId: "demo-user",
      totalScore: 78,
      categoryScores: {
        "Communication Skills": 82,
        "Technical Knowledge": 75,
        "Problem-Solving": 70,
        "Cultural & Role Fit": 76,
        "Confidence & Clarity": 85,
      },
      strengths: ["Clear communicator", "Strong confidence"],
      areasForImprovement: ["Improve technical precision", "Be more concise"],
      finalAssessment: "Strong candidate with minor gaps.",
      createdAt: new Date().toISOString(),
    };
  }

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

type GetLatestInterviewsParams = {
  userId?: string;
  limit?: number;
};

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  if (!userId) {
    return [
      {
        id: "demo-int-001",
        userId: "demo-user",
        role: "Backend Developer",
        techstack: "Node.js, Express",
        type: "Behavioral",
        finalized: true,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  const querySnapshot = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "==", userId)
    .limit(limit)
    .get();

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(
  userId?: string
): Promise<Interview[] | null> {
  if (!userId) {
    return [
      {
        id: "demo-interview",
        userId: "demo-user",
        role: "Frontend Developer",
        techstack: "React, TypeScript",
        type: "Technical",
        createdAt: new Date().toISOString(),
        finalized: true,
      },
    ];
  }

  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}
