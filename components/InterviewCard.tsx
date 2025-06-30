import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
// import DisplayTechIcons from "./DisplayTechIcons";

import { cn, getRandomInterviewCover } from "@/lib/utils";
import { getFeedbackByInterviewId } from "../lib/action/general.action";

interface InterviewCardProps {
  interviewId: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt: string | number | Date;
}

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  const feedback =
    userId && interviewId
      ? await getFeedbackByInterviewId({
          interviewId,
          userId,
        })
      : null;

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeColor =
    {
      Behavioral: "bg-light-400",
      Mixed: "bg-light-600",
      Technical: "bg-light-800",
    }[normalizedType] || "bg-light-600";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  return (
    <div className="w-[360px] max-sm:w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-6 relative min-h-96 flex flex-col justify-between">
      {/* Type Badge */}
      <div
        className={cn(
          "absolute top-0 right-0 px-4 py-1 rounded-bl-lg text-sm font-medium text-white",
          badgeColor // e.g. bg-blue-600, bg-green-500
        )}
      >
        {normalizedType}
      </div>

      <div>
        {/* Cover Image */}
        <Image
          src={getRandomInterviewCover()}
          alt="cover-image"
          width={90}
          height={90}
          className="rounded-full object-cover mx-auto mb-4"
        />

        {/* Role Title */}
        <h3 className="text-lg font-semibold text-center capitalize mb-3">
          {role} Interview
        </h3>

        {/* Date & Score */}
        <div className="flex justify-center gap-6 text-sm text-gray-700 mb-4">
          <div className="flex items-center gap-2">
            <Image src="/calendar.svg" width={20} height={20} alt="calendar" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Image src="/star.svg" width={20} height={20} alt="star" />
            <span>{feedback?.totalScore ?? "---"}/100</span>
          </div>
        </div>

        {/* Feedback Summary or Placeholder */}
        <p className="text-sm text-gray-600 text-center line-clamp-2">
          {feedback?.finalAssessment ??
            "You haven't taken this interview yet. Take it now to improve your skills."}
        </p>
      </div>

      {/* CTA Button */}
      <div className="flex justify-center mt-6">
        <Button className="bg-blue-600 text-white hover:bg-blue-700 transition-all">
          <Link
            href={
              feedback
                ? `/interview/${interviewId}/feedback`
                : `/interview/${interviewId}`
            }
          >
            {feedback ? "Check Feedback" : "View Interview"}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default InterviewCard;
