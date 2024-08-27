"use strict";

const writeFeedbackMessages = {
  target: {
    defaultInfo: {
      text: "<p>The name of the person you want to give feedback</p>",
      icon: "info",
    },
    missing: {
      text: "<p>Target is a required field</p>",
      icon: "warning",
    },
    invalid: {
      text: "<p>Invalid target</p>",
      icon: "warning",
    },
    selfFeedback: {
      text: "<p>You can't make a feedback about yourself</p>",
      icon: "warning",
    },
  },
  type: {
    defaultInfo: {
      text: "<p>Performance is the 'normal' type of feedback. Continuous feedback is reserved to team managers and alike</p>",
      icon: "info",
    },
    missing: {
      text: "<p>Type is a required field</p>",
      icon: "warning",
    },
  },
  context: {
    defaultInfo: {
      text: "<p>The context in which the feedback took place</p>",
      icon: "info",
    },
    missing: {
      text: "<p>Context is a required field</p>",
      icon: "warning",
    },
  },
  competency: {
    defaultInfo: {
      text: "<h3>Competency Description</h3><p><b>General:</b> If you're not sure which competency your feedback fits into</p><p><b>Execution and Delivery:</b> Contribution to the Company demonstrated by the ability to technically plan and execute the work with the necessary levels of autonomy and quality</p><p><b>Innovation:</b> Shown level of creativity and adoption of new technologies, processes, or paradigms</p><p><b>Agility:</b> Demonstrated ability for timely collaboration, execution, and decision making</p><p><b>Commitment:</b> Displayed degree of commitment in all circumstances, with a positive attitude and a teamwork mindset</p><p><b>Communication:</b> Demonstrated ability to communicate effectively, in both oral and written formats, in all situations</p><p><b>Customer Orientation:</b> Level of attention shown to Customer needs when planning and executing his/her work</p>",
      icon: "info",
    },
    missing: {
      text: "<p>Competency is a required field</p>",
      icon: "warning",
    },
  },
  privacy: {
    defaultInfo: {
      text: "<h3>Privacy Options Description</h3><p><b>Anonymous:</b> Your identity will not be shared with anyone</p><p><b>Private:</b> Your identity will be shared with the appraiser and the team manager only, you will appear as anonymous to the person you are giving feedback to</p><p><b>Public:</b> Your identity will be shared with everyone with access to the feedback</p>",
      icon: "info",
    },
    missing: {
      text: "<p>Privacy is a required field</p>",
      icon: "warning",
    },
  },
  rating: {
    defaultInfo: {
      text: "<h3>The Rating System</h3><p><b>Excellent (4*):</b> The CM Employee consistently exceeds what's expected for their grade</p><p><b>Good (3*):</b> The CM Employee exceeds what's expected for their grade</p><p><b>Sufficient (2*):</b> The CM Employee meets what's expected for their grade</p><p><b>Insufficient (1*):</b> The CM Employee does not what's expected for their grade</p>",
      icon: "info",
    },
    missing: {
      text: "<p>Rating is a required field</p>",
      icon: "warning",
    },
  },
  positive: {
    defaultInfo: {
      text: "<p>Describe your experience with the person and provide any relevant details such as time and place</p>",
      icon: "info",
    },
    missing: {
      text: "<p>At least one field between 'Positive' and 'To be improved' is required</p>",
      icon: "warning",
    },
  },
  negative: {
    defaultInfo: {
      text: "<p>Describe your experience with the person and provide any relevant details such as time and place</p>",
      icon: "info",
    },
    missing: {
      text: "<p>At least one field between 'Positive' and 'To be improved' is required</p>",
      icon: "warning",
    },
  },
  actions: {
    defaultInfo: {
      text: "<p>This field is reserved to the 'continuous' feedback type</p>",
      icon: "info",
    },
  },
  responsible: {
    defaultInfo: {
      text: "<p>This field is reserved to the 'continuous' feedback type</p>",
      icon: "info",
    },
    missing: {
      text: "<p>Responsible is a required field if the feedback type is continuous</p>",
      icon: "warning",
    },
    invalid: {
      text: "<p>Invalid responsible</p>",
      icon: "warning",
    },
  },
  status: {
    defaultInfo: {
      text: "<p>This field is reserved to the 'continuous' feedback type</p>",
      icon: "info",
    },
    missing: {
      text: "<p>Status is a required field if the feedback type is continuous</p>",
      icon: "warning",
    },
  },
  deadline: {
    defaultInfo: {
      text: "<p>This field is reserved to the 'continuous' feedback type</p>",
      icon: "info",
    },
  },
};

export default writeFeedbackMessages;
