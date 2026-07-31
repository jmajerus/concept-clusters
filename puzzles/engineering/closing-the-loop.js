// Concept Clusters OER pilot: Closing the Loop
//
// Adapted and synthesized from Chemical Process Dynamics and Controls,
// Peter Woolf et al., University of Michigan / Engineering LibreTexts,
// licensed CC BY 3.0. The source distributes these ideas across chapters
// on sensors and actuators, PID control, modeling, and control architectures;
// this puzzle reorganizes them into one learner-constructed system map.
// Source: https://eng.libretexts.org/Bookshelves/Industrial_and_Systems_Engineering/Chemical_Process_Dynamics_and_Controls_%28Woolf%29
// Changes: original selection, grouping, bridge labels, explanations, lenses,
// and wording for the Concept Clusters format.

export default {
  id: "closing-the-loop",
  title: "Closing the Loop",
  category: "Engineering",
  large: true,
  info: {
    text: "A control system becomes a loop only when it can compare desired and measured conditions, act on the difference, and remain usable despite delays and disturbances.",
    link: "wiki:Control system",
    extraLink: "https://eng.libretexts.org/Bookshelves/Industrial_and_Systems_Engineering/Chemical_Process_Dynamics_and_Controls_%28Woolf%29"
  },
  lenses: [
    {
      id: "information-path",
      prompt: "Which concepts carry or transform information about desired and observed behavior?",
      targets: [
        "setpoint",
        "process variable",
        "measurement signal",
        "comparator",
        "error signal",
        "controller"
      ],
      explanation: "These concepts form the informational side of the loop: a desired value and an observed value are represented, compared, and converted into a decision. The actuator and process then turn that decision into physical change.",
      reasons: {
        "setpoint": "It represents the condition the system is trying to achieve.",
        "process variable": "It represents the actual condition being controlled.",
        "measurement signal": "It carries the sensor's representation of the observed condition.",
        "comparator": "It brings the desired and measured values into relation.",
        "error signal": "It expresses the remaining difference that calls for correction.",
        "controller": "It transforms information about error into a command."
      }
    },
    {
      id: "physical-intervention",
      prompt: "Which concepts directly describe how the controller changes the physical process?",
      targets: [
        "actuator",
        "final control element",
        "manipulated variable",
        "process"
      ],
      explanation: "The command matters only when machinery or another final control element changes a manipulable input to the process. This is the energetic and material side of the loop, not merely its information flow.",
      reasons: {
        "actuator": "It converts a command into physical action.",
        "final control element": "It is the device that directly changes the process input, such as a valve or heater.",
        "manipulated variable": "It is the quantity deliberately changed to influence the process.",
        "process": "It is the physical system whose behavior is being altered."
      }
    },
    {
      id: "why-correction-is-imperfect",
      prompt: "Which concepts explain why a logically correct controller can still correct badly?",
      targets: [
        "disturbance",
        "dead time",
        "measurement noise",
        "actuator saturation",
        "tuning"
      ],
      explanation: "Control takes place in a real system with outside influences, delayed evidence, imperfect measurements, finite actuator authority, and design trade-offs. Closing the loop does not guarantee good control; the loop must fit the process.",
      reasons: {
        "disturbance": "It pushes the process away from its target from outside the intended control action.",
        "dead time": "It hides the effect of an action until later, inviting late or excessive correction.",
        "measurement noise": "It can make harmless fluctuations look like errors that require action.",
        "actuator saturation": "It limits how much corrective action the system can physically apply.",
        "tuning": "Its choices trade speed, offset, overshoot, and stability against one another."
      }
    },
    {
      id: "choices-inside-automation",
      prompt: "Which concepts reveal choices that designers or operators embed inside an automatic system?",
      targets: [
        "setpoint",
        "control law",
        "manipulated variable",
        "tuning"
      ],
      explanation: "Automation does not remove judgment. People choose the objective, the rule for responding, which process input may be changed, and how aggressively the loop should react.",
      reasons: {
        "setpoint": "Someone decides what value counts as the desired condition.",
        "control law": "Designers choose how measured error should become action.",
        "manipulated variable": "The system architecture determines which input the controller is allowed to change.",
        "tuning": "Designers or operators choose the parameters that shape the response."
      }
    }
  ],
  clusters: [
    {
      name: "Reference and measurement",
      color: "teal",
      fact: "A feedback loop begins with two representations of reality: the desired condition expressed by the setpoint and the observed condition represented by the sensor's measurement of the process variable.",
      terms: [
        "setpoint",
        "process variable",
        "sensor",
        "measurement signal"
      ],
      seeds: [
        "setpoint",
        "sensor"
      ],
      termInfo: {
        "setpoint": "The desired value the control system is trying to maintain.",
        "process variable": "The actual measured condition of the process, such as temperature, level, pressure, or flow.",
        "sensor": "A device that detects a physical condition and converts it into usable measurement information.",
        "measurement signal": "The sensor's transmitted representation of the observed process variable."
      },
      info: {
        link: "https://eng.libretexts.org/Bookshelves/Industrial_and_Systems_Engineering/Chemical_Process_Dynamics_and_Controls_%28Woolf%29/03%3A_Sensors_and_Actuators"
      }
    },
    {
      name: "Comparison and decision",
      color: "blue",
      fact: "The controller does not respond to the measurement alone: it compares measured behavior with the target, expresses the difference as error, and applies a control law to decide what action to request.",
      terms: [
        "comparator",
        "error signal",
        "controller",
        "control law"
      ],
      seeds: [
        "error signal",
        "controller"
      ],
      termInfo: {
        "comparator": "The function that compares the setpoint with the measured process variable.",
        "error signal": "The difference between the desired value and the measured value.",
        "controller": "The mechanism that converts error information into a requested corrective action.",
        "control law": "The rule or algorithm that determines how the controller responds to error."
      },
      info: {
        link: "https://eng.libretexts.org/Bookshelves/Industrial_and_Systems_Engineering/Chemical_Process_Dynamics_and_Controls_%28Woolf%29/09%3A_Proportional-Integral-Derivative_%28PID%29_Control/9.02%3A_P_I_D_PI_PD_and_PID_control"
      }
    },
    {
      name: "Action on the process",
      color: "amber",
      fact: "A control decision becomes effective only when an actuator and final control element change a manipulated variable that can actually alter the physical process.",
      terms: [
        "actuator",
        "final control element",
        "manipulated variable",
        "process"
      ],
      seeds: [
        "actuator",
        "manipulated variable"
      ],
      termInfo: {
        "actuator": "A mechanism that converts the controller's command into physical action.",
        "final control element": "The device that directly changes a process input, such as a valve, heater, pump, or motor drive.",
        "manipulated variable": "The process input deliberately changed to influence the controlled variable.",
        "process": "The physical system whose behavior the control loop is intended to regulate."
      },
      info: {
        link: "https://eng.libretexts.org/Bookshelves/Industrial_and_Systems_Engineering/Chemical_Process_Dynamics_and_Controls_%28Woolf%29/03%3A_Sensors_and_Actuators"
      }
    },
    {
      name: "Limits on correction",
      color: "magenta",
      fact: "Real loops act with incomplete authority and imperfect timing: disturbances move the process, dead time postpones evidence, noise corrupts measurement, and saturation prevents an actuator from supplying unlimited correction.",
      terms: [
        "disturbance",
        "dead time",
        "measurement noise",
        "actuator saturation"
      ],
      seeds: [
        "disturbance",
        "dead time"
      ],
      termInfo: {
        "disturbance": "An outside influence that changes the process independently of the controller's intended action.",
        "dead time": "A delay between an input or disturbance and the first observable response of the process.",
        "measurement noise": "Unwanted variation in the measured signal that does not represent the underlying process condition.",
        "actuator saturation": "The condition in which the requested action exceeds the actuator's physical minimum or maximum capability."
      },
      info: {
        link: "https://eng.libretexts.org/Bookshelves/Industrial_and_Systems_Engineering/Chemical_Process_Dynamics_and_Controls_%28Woolf%29/09%3A_Proportional-Integral-Derivative_%28PID%29_Control/9.06%3A_PID_Downsides_and_Solutions"
      }
    }
  ],
  bridges: [
    {
      term: "feedback",
      conceptId: "feedback-loop",
      clusters: [0, 1],
      relationKind: "dynamic",
      fact: "Feedback closes the informational side of the loop by returning a measurement of the process variable to the comparison and decision mechanism, where it can be judged against the setpoint.",
      idealTerms: [
        "measurement signal",
        "comparator"
      ],
      info: {
        text: "Information about the process output returned to the controller so later action can respond to what actually happened.",
        link: "https://eng.libretexts.org/Bookshelves/Industrial_and_Systems_Engineering/Chemical_Process_Dynamics_and_Controls_%28Woolf%29/11%3A_Control_Architectures/11.01%3A_Feedback_control-_What_is_it_When_useful_When_not_Common_usage."
      }
    },
    {
      term: "control signal",
      clusters: [1, 2],
      relationKind: "dynamic",
      fact: "The control signal carries the controller's decision into the physical side of the system, commanding the actuator or final control element to change the manipulated variable.",
      idealTerms: [
        "controller",
        "actuator"
      ],
      info: {
        text: "The controller output that requests a particular corrective action from the actuator.",
        link: "https://eng.libretexts.org/Bookshelves/Industrial_and_Systems_Engineering/Chemical_Process_Dynamics_and_Controls_%28Woolf%29/09%3A_Proportional-Integral-Derivative_%28PID%29_Control/9.03%3A_PID_Tuning_via_Classical_Methods"
      }
    },
    {
      term: "tuning",
      clusters: [1, 3],
      relationKind: "dynamic",
      fact: "Tuning adapts the controller's response to the process it actually governs: stronger or faster correction may reduce error sooner, but can also amplify noise, overshoot, oscillate, or become unstable when delays and physical limits intervene.",
      idealTerms: [
        "control law",
        "dead time"
      ],
      info: {
        text: "Choosing controller parameters to balance response speed, remaining error, overshoot, oscillation, and robustness.",
        link: "https://eng.libretexts.org/Bookshelves/Industrial_and_Systems_Engineering/Chemical_Process_Dynamics_and_Controls_%28Woolf%29/09%3A_Proportional-Integral-Derivative_%28PID%29_Control/9.05%3A_PID_tuning_via_optimization"
      }
    }
  ]
};
