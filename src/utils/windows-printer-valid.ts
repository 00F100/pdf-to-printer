import { Printer } from "../index";

// map windows-printer key to final printerData key
const properties: { [key: string]: keyof Printer } = {
  DeviceID: "deviceId",
  Name: "name",
  PrinterPaperNames: "paperSizes",
};

export default function isValidPrinter(printer: string): {
  isValid: boolean;
  printerData: Printer;
} {
  const printerData: Printer = {
    deviceId: "",
    name: "",
    paperSizes: [],
  };

  let ignoreNext: boolean = false;

  const lines = printer.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (ignoreNext) {
      ignoreNext = false;
    } else {
      let [label, value] = line.split(":").map((el) => el.trim());

      if (value == undefined) {
        value = "";
      }

      if (label == "PrinterPaperNames" && value.slice(-1) != "}") {
        value = `${value}}`;
      }

      // handle array dots
      if (value.match(/^{(.*)(\.{3})}$/)) {
        value = value.replace("...}", "}");
      }

      // handle array returns
      const matches = value.match(/^{(.*)}$/);

      if (matches && matches[1]) {
        // @ts-ignore
        value = matches[1].split(", ");
      }

      if (label == "PrinterPaperNames") {
        console.log("value", {
          label,
          value,
          matches,
        });
      }

      const key = properties[label];

      if (key === undefined) return;

      // @ts-ignore
      printerData[key] = value;
    }
  });

  const isValid = !!(printerData.deviceId && printerData.name);

  return {
    isValid,
    printerData,
  };
}
