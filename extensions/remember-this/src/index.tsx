import {
  Form,
  getPreferenceValues,
  ActionPanel,
  launchCommand,
  LaunchType,
  Action,
  Color,
  showToast,
  Toast,
  environment,
  openExtensionPreferences,
  Icon,
} from "@raycast/api";
import fs from "fs";
import path from "path";

type Values = {
  textfield: string;
  textarea: string;
  datepicker: Date;
  checkbox: boolean;
  dropdown: string;
  tokeneditor: string[];
};

const now = new Date();
now.setHours(now.getHours() + 5);

const placeholders = [
  "Respond to ✉ important work email",
  `Pay late 💳 credit card bill before ${now.toLocaleDateString()}`,
  `Complete 📚 math homework by ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
  `Return 🔙 overdue library books by ${now.toLocaleDateString()} `,
  `Confirm ✅ flight for ${now.toLocaleDateString("en-us", { month: "long", day: "numeric", year: "numeric" })}`,
  "Call 📞 doctor about medication refill",
  "Reschedule 📅 important meeting",
  `Submit ✔ critical project update by ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
  "Follow up 📩 on unanswered emails",
  "Claim 💰 unexpected refund",
  ` Renew ✅ expired license before ${now.toLocaleDateString()} `,
  `Pick up 🛒 groceries for dinner today by ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
  ` Pay 💸 overdue bills by ${now.toLocaleDateString()} `,
  `Submit ✔ report ASAP`,
  "Call 📞 doctor about concerning symptoms",
  "Fill 🖋 important paperwork",
  "Respond to 👥 team member's question",
  "Reply to ✉ important client email",
  "Call 📞 boss about project issue",
  "Retrieve 📥 crucial documents from home",
  "Submit ✅ time-sensitive request",
  `Pay 💸 late rent by ${now.toLocaleDateString()} `,
  `Return 📦 package by ${now.toLocaleDateString()} deadline `,
  "Book 🛩 last-minute flight",
  `Complete 📒 report for ${now.toLocaleDateString("en-us", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })} deadline`,
  `Withdraw 🏧 money from bank by ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} `,
  "Make 📞 important phone call",
  "Apply for 📝 time-sensitive opportunity",
  "Proofread 👀 critical document",
  "Contact 📞 insurance about claim",
  `Submit 📝 assignment by ${now} `,
  `Pick up🛒 groceries for tonight's dinner by ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} `,
  `Renew ✅ expiring subscription before ${now.toLocaleDateString()} `,
  "Receive 📦 important package delivery",
  `Investigate 🕵️‍♀️ work issue ASAP`,
];

const placeholder = placeholders[Math.floor(Math.random() * placeholders.length)];

const REMEMBERING_FILE = path.join(environment.supportPath, "remembering.csv");
export default function Command() {
  function handleSubmit(values: Values) {
    if (!values.textarea) {
      showToast({
        title: "No input provided!",
        message: "Please input something to remember!",
        style: Toast.Style.Failure,
      });
      return;
    }

    // Check if the file exists
    let fileExists = false;
    try {
      fs.accessSync(REMEMBERING_FILE);
      fileExists = true;
    } catch (error) {
      console.log("File No Existe and now it doooose");
    }

    // Check if the input already exists in the file
    if (fileExists) {
      const existingData = fs.readFileSync(REMEMBERING_FILE, "utf-8").toLowerCase().split("\n");
      const newData = values.textarea.toLowerCase();

      let inputExists = false;
      for (const row of existingData) {
        if (row.split(",")[1] === newData) {
          inputExists = true;
          break;
        }
      }

      if (inputExists) {
        showToast({
          title: "Input already exists!",
          message: "Please input something else to remember!",
          style: Toast.Style.Failure,
        });
        return;
      }
    }

    const expirationDate = calculateExpirationDate(values.dropdown);
    const data = `\n${expirationDate.toISOString()},${values.textarea}`;

    // Write to the file
    if (fileExists) {
      // Append to the existing file
      fs.appendFileSync(REMEMBERING_FILE, data);
    } else {
      // Create a new file
      fs.writeFileSync(REMEMBERING_FILE, data);
    }
    launchCommand({ name: "view", type: LaunchType.UserInitiated });
    launchCommand({ name: "menu", type: LaunchType.UserInitiated });
    // Log the expiration date and what to remember
    showToast({
      title: "Remembering That!",
    });
  }

  const preferences = getPreferenceValues<Preferences>();
  const rfdValue = preferences.rfd;

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            icon={Icon.CircleProgress100}
            onSubmit={handleSubmit}
            shortcut={{ modifiers: ["cmd"], key: "enter" }}
          />
          <Action
            title="Change Default Time"
            icon={Icon.Hammer}
            onAction={openExtensionPreferences}
            shortcut={{ modifiers: ["opt"], key: "enter" }}
          />
        </ActionPanel>
      }
    >
      <Form.Description text="Motivate yourself to stay on top of your deadlines" />
      <Form.TextField id="textarea" title="Remember This:" placeholder={placeholder} />

      <Form.Dropdown id="dropdown" title="For:" defaultValue={rfdValue.toString()}>
        <Form.Dropdown.Item value="30min" title="30 Minutes" />
        <Form.Dropdown.Item value="1h" title="1 Hour" />
        <Form.Dropdown.Item value="2h" title="2 Hours" />
        <Form.Dropdown.Item value="6h" title="6 Hours" />
        <Form.Dropdown.Item value="12h" title="12 Hours" />
        <Form.Dropdown.Item value="1day" title="1 Day" />
        <Form.Dropdown.Item value="2day" title="2 Days" />
        <Form.Dropdown.Item value="1week" title="1 Week" />
        <Form.Dropdown.Item value="2week" title="2 Weeks" />
        <Form.Dropdown.Item value="1month" title="1 Month" />
        <Form.Dropdown.Item value="3month" title="3 Months" />
        <Form.Dropdown.Item value="6month" title="6 Months" />
        <Form.Dropdown.Item value="1year" title="1 Year" />
        <Form.Dropdown.Item value="2year" title="2 Years" />
        <Form.Dropdown.Item value="5year" title="5 Years" />
        <Form.Dropdown.Item value="Forever" title="Forever" />
      </Form.Dropdown>
    </Form>
  );
}

function calculateExpirationDate(duration: string): Date {
  const now = new Date();
  switch (duration) {
    case "Forever":
      return new Date(now.getFullYear() + 100, 0, 1); // 100 years from now
    case "1day":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day from now
    case "2day":
      return new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
    case "1week":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week from now
    case "2week":
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks from now
    case "1month":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 month from now
    case "3month":
      return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 months from now
    case "6month":
      return new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000); // 6 months from now
    case "1year":
      return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
    case "2year":
      return new Date(now.getTime() + 730 * 24 * 60 * 60 * 1000); // 2 years from now
    case "5year":
      return new Date(now.getTime() + 1, 825 * 24 * 60 * 60 * 1000); // 2 years from now
    case "10min":
      return new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now
    case "30min":
      return new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
    case "1h":
      return new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    case "2h":
      return new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    case "3h":
      return new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours from now
    case "6h":
      return new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours from now
    case "12h":
      return new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours from now
    default:
      throw new Error(`Invalid duration: ${duration}`);
  }
}
