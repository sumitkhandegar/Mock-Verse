import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "../../components/InterviewCard";

import { getCurrentUser } from "../../lib/action/auth.action";
import {
  getLatestInterviews,
  getInterviewsByUserId,
} from "../../lib/action/general.action";

async function Home() {
  const user = await getCurrentUser();

  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user?.id!),
    getLatestInterviews({ userId: user?.id! }),
  ]);

  const hasPastInterviews = userInterviews?.length! > 0;
  const hasUpcomingInterviews = allInterview?.length! > 0;

  return (
    <main className="px-4 sm:px-8 md:px-12 py-10 space-y-16">
      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between shadow-sm">
        <div className="flex flex-col gap-4 max-w-xl">
          <h1 className="text-4xl font-extrabold text-gray-800 leading-tight">
            Get Interview-Ready with{" "}
            <span className="text-blue-600">AI-Powered Practice</span> &
            Feedback
          </h1>
          <p className="text-lg text-gray-700">
            Practice real interview questions & get instant feedback to level up
            your performance.
          </p>
          <Button
            asChild
            className="w-fit bg-blue-600 hover:bg-blue-700 text-white mt-4 shadow-lg"
          >
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>
        <Image
          src="/robot.png"
          alt="AI Interview Assistant"
          width={350}
          height={350}
          className="hidden sm:block"
        />
      </section>

      {/* Your Interviews Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Interviews</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id ?? ""}
                role={interview.role}
                type={interview.type}
                techstack={
                  Array.isArray(interview.techstack)
                    ? interview.techstack
                    : [interview.techstack]
                }
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p className="text-gray-600 col-span-full">
              You haven&apos;t taken any interviews yet.
            </p>
          )}
        </div>
      </section>

      {/* Available Interviews Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Take Interviews</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hasUpcomingInterviews ? (
            allInterview?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id ?? ""}
                role={interview.role}
                type={interview.type}
                techstack={
                  Array.isArray(interview.techstack)
                    ? interview.techstack
                    : [interview.techstack]
                }
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <p className="text-gray-600 col-span-full">
              There are no interviews available.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export default Home;
