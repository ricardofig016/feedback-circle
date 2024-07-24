"use strict";

const submitFeedbackMessages = {
  name: {
    defaultInfo: {
      text: "who the feedback is about",
      icon: "info",
    },
    missingValue: {
      text: "You must input the name of the appraisee",
      icon: "warning",
    },
  },
  category: {
    defaultInfo: {
      text: "info message",
      icon: "info",
    },
    missingValue: {
      text: "You must select a category",
      icon: "warning",
    },
  },
  evaluation: {
    defaultInfo: {
      text: "info message",
      icon: "info",
    },
    missingValue: {
      text: "You must select the evaluation",
      icon: "warning",
    },
  },
  visibility: {
    defaultInfo: {
      text: "info message",
      icon: "info",
    },
    missingValue: {
      text: "You must select the visibility",
      icon: "warning",
    },
  },
  body: {
    defaultInfo: {
      text: "description",
      icon: "info",
    },
    missingValue: {
      text: "You must input the body",
      icon: "warning",
    },
  },
};

export default submitFeedbackMessages;
