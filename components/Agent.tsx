"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "../constants";
import { createFeedback } from "../lib/action/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface AgentProps {
  userName: string;
  userId: string;
  interviewId?: string;
  feedbackId?: string;
  type: string;
  questions?: string[];
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    interface Message {
      type: string;
      transcriptType?: string;
      role: "user" | "system" | "assistant";
      transcript?: string;
      // Add other properties as needed
    }

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = {
          role: message.role,
          content: message.transcript ?? "",
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
        },
      });
    } else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
      });
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <>
      {/* Interviewer and User Cards */}
      <div className="flex justify-center items-center gap-10 flex-wrap sm:flex-nowrap mb-8">
        {/* AI Interviewer Card */}
        <div className="flex flex-col items-center gap-2 p-4 bg-white shadow-md rounded-xl w-64 text-center">
          <div className="relative">
            <Image
              src="/ai-avatar.png"
              alt="AI Interviewer"
              width={65}
              height={65}
              className="rounded-full object-cover"
            />
            {isSpeaking && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
          <h3 className="font-semibold text-gray-800">AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="flex flex-col items-center gap-2 p-4 bg-white shadow-md rounded-xl w-64 text-center">
          <Image
            src="/user-avatar.png"
            alt="User Avatar"
            width={120}
            height={120}
            className="rounded-full object-cover"
          />
          <h3 className="font-semibold text-gray-800">{userName}</h3>
        </div>
      </div>

      {/* Live Transcript Section */}
      {messages.length > 0 && (
        <div className="mx-auto max-w-3xl bg-gray-100 p-6 rounded-lg shadow-inner mb-8">
          <div className="text-center text-gray-800 text-lg font-medium animate-fadeIn">
            <p key={lastMessage}>{lastMessage}</p>
          </div>
        </div>
      )}

      {/* Call / End Button */}
      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button
            onClick={handleCall}
            className="relative px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 transition-all"
          >
            {/* Ping animation on CONNECTING */}
            <span
              className={cn(
                "absolute inset-0 rounded-full bg-blue-400 opacity-50 animate-ping",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />
            <span className="relative z-10">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : "..."}
            </span>
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-full shadow-md hover:bg-red-700 transition-all"
          >
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
