"use strict";

const submitFeedbackMessages = {
  name: {
    defaultInfo: {
      text: "<p>The name of the person you want to give feedback</p><p>This person must belong to your <b>work circle</b> ( ex.: someone from your team )</p>",
      icon: "info",
    },
    missingValue: {
      text: "<p>Name is a required field</p>",
      icon: "warning",
    },
  },
  category: {
    defaultInfo: {
      text: "<h3>Category Description</h3><p><b>General:</b> If you're not sure which category your feedback fits into</p><p><b>Execution and Delivery:</b> Contribution to the Company demonstrated by the ability to technically plan and execute the work with the necessary levels of autonomy and quality</p><p><b>Innovation:</b> Shown level of creativity and adoption of new technologies, processes, or paradigms</p><p><b>Agility:</b> Demonstrated ability for timely collaboration, execution, and decision making</p><p><b>Commitment:</b> Displayed degree of commitment in all circumstances, with a positive attitude and a teamwork mindset</p><p><b>Communication:</b> Demonstrated ability to communicate effectively, in both oral and written formats, in all situations</p><p><b>Customer Orientation:</b> Level of attention shown to Customer needs when planning and executing his/her work</p>",
      icon: "info",
    },
    missingValue: {
      text: "<p>Category is a required field</p>",
      icon: "warning",
    },
  },
  type: {
    defaultInfo: {
      text: "<p>Specify whether your feedback refers to a positive aspect or an area needing improvement</p>",
      icon: "info",
    },
    missingValue: {
      text: "<p>Type is a required field</p>",
      icon: "warning",
    },
  },
  privacy: {
    defaultInfo: {
      text: "<h3>Privacy Options Description</h3><p><b>Anonymous:</b> Your identity will not be shared with anyone</p><p><b>Private:</b> Your identity will be shared with the appraiser only, you will appear as anonymous to the person you are giving feedback to</p><p><b>Public:</b> Your identity will be shared with both the person you are giving feedback to and their appraiser</p>",
      icon: "info",
    },
    missingValue: {
      text: "<p>Privacy is a required field</p>",
      icon: "warning",
    },
  },
  title: {
    defaultInfo: {
      text: "<p>The subject of your feedback</p><e>Should accurately reflect the feedback's content, while being clear, concise and specific</p><p>Use keywords/phrases</p>",
      icon: "info",
    },
    missingValue: {
      text: "<p>Title is a required field</p>",
      icon: "warning",
    },
  },
  body: {
    defaultInfo: {
      text: "<p>Describe your experience with the person and provide any relevant details such as time and place</p>",
      icon: "info",
    },
    missingValue: {
      text: "<p>Body is a required field</p>",
      icon: "warning",
    },
  },
};

export default submitFeedbackMessages;
