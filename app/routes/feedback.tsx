// This is the feedback form page that users will see when they click on the feedback link in the navigation bar.
// The page contains a form with multiple questions for users to provide feedback on the tool.
// Each option will be stored as a number value from 1 to 5, with 1 being the lowest and 5 being the highest.
// Users can also provide additional comments or suggestions in a text area.
// The data will be submitted to the server for processing and storage in the database.
// In future development, it is recommended to add an admin panel to view and analyze the feedback data.

// Author: Jerry Fan
// Date: 4/30/2024

import { ActionFunction, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { createFeedback } from "~/models/feedback.server";
import React from "react";
import { useUser } from "~/utils";

// Define the data structure for the feedback form
interface FeedbackData {
  relevanceAccuracy: number;
  easeOfUse: number;
  learningOutcomes: number;
  feedbackAssessment: number;
  userSatisfaction: number;
  recommendationLikely: number;
  additionalComments: string;
}

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const feedbackData: FeedbackData = {
    relevanceAccuracy: Number(form.get("relevanceAccuracy")),
    easeOfUse: Number(form.get("easeOfUse")),
    learningOutcomes: Number(form.get("learningOutcomes")),
    feedbackAssessment: Number(form.get("feedbackAssessment")),
    userSatisfaction: Number(form.get("userSatisfaction")),
    recommendationLikely: Number(form.get("recommendationLikely")),
    additionalComments: form.get("additionalComments")?.toString() || "", // The additional comments field is optional
  };

  const errors: Record<string, string> = {};
  const requiredFields = ['relevanceAccuracy', 'easeOfUse', 'learningOutcomes', 'feedbackAssessment', 'userSatisfaction', 'recommendationLikely'];
  requiredFields.forEach(field => {
    const value = form.get(field);
    if (value === null || value.toString().trim() === "" || isNaN(Number(value))) {
      errors[field] = "This field is required and must be a valid number."; // Error message for required fields
    }
  });

  if (Object.keys(errors).length > 0) {
    // Return errors to be displayed
    return errors;
  }

  try {
    await createFeedback(feedbackData);
    return redirect('/confirmation');
  } catch (error) {
    console.error("Feedback submission failed", error);
    // Redirect to a generic error page
    return redirect("/error");
  }
};

interface FeedbackQuestionProps {
  questionText: string;
  name: string;
}

const FeedbackQuestion: React.FC<FeedbackQuestionProps> = ({ questionText, name }) => (
  <div style={{ marginBottom: "30px" }}>
    <p style={{ marginBottom: "10px", fontWeight: "bold" }}>{questionText}</p>
    <div style={{ display: "flex", gap: "40px" }}> {/* Increased gap between options */}
      {["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"].map((option, index) => (
        <label key={index} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <input
            type="radio"
            name={name}
            value={index + 1}
          />
          {option}
        </label>
      ))}
    </div>
  </div>
);

export default function FeedbackForm() {
  const user = useUser();
  
  return (
    <div className="flex h-full min-h-screen flex-col" >
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to="/">AICADEMY</Link>
        </h1>
        <p>{user.userType}{":  "}{user.email}</p>
        <Form action="/logout" method="post">
          <Link to="/home">
            <button
              type="button"
              className="mr-2 rounded-md bg-white px-4 py-2 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50">
                Home
            </button>
          </Link>
          <button
            type="submit"
            className="rounded-md bg-blue-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600">
            Logout
          </button>
        </Form>
      </header>
      
      <Form
  method="post"
  className="bg-white p-6 rounded-lg shadow-lg"
  style={{
    width: "50%",
    minWidth: "300px",
    marginTop: "20px",
    marginLeft: "auto",
    marginRight: "auto", // Automatically adjusts left and right margins
  }}
> {/* Styling the form */}
        <h2 style={{ marginBottom: "20px", textAlign: "left", fontSize: "24px", fontWeight: "bold" }}>Submit Your Feedback</h2>

        <FeedbackQuestion
          questionText="The content provided is relevant to my course material."
          name="relevanceAccuracy"
        />

        <FeedbackQuestion
          questionText="The tool is easy to navigate and use."
          name="easeOfUse"
        />

        <FeedbackQuestion
          questionText="The tool effectively meets its educational objectives."
          name="learningOutcomes"
        />

        <FeedbackQuestion
          questionText="The feedback and guidance provided by the tool are helpful."
          name="feedbackAssessment"
        />

        <FeedbackQuestion
          questionText="I am satisfied with my overall experience using the tool."
          name="userSatisfaction"
        />

        <FeedbackQuestion
          questionText="I am likely to recommend this tool to others."
          name="recommendationLikely"
        />

        <div style={{ marginBottom: "30px" }}>
          <label htmlFor="additionalComments" style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
            Do you have any other comments or suggestions?
          </label>
          <textarea
            id="additionalComments"
            name="additionalComments"
            rows={5}
            style={{ width: "100%", padding: "15px", borderRadius: "4px", border: "1px solid #ccc" }}
          ></textarea>
        </div>

        <button type="submit" style={{ width: "100%", padding: "15px 20px", borderRadius: "4px", border: "none", backgroundColor: "#007bff", color: "white", cursor: "pointer", fontSize: "18px" }}>
          Submit Feedback
        </button>
      </Form>
    </div>
  );
}
