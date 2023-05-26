import axios from "axios";

export type MailTemplate = {
  resolution: string;
  response: string;
  name: string;
};

export const tableData = [
  {
    text: "יישוב",
    onClick: "שם_ישוב",
  },
  {
    text: "גילאים 0-5",
    onClick: "גיל_0_5",
  },
  {
    text: "גילאים 6-18",
    onClick: "גיל_6_18",
  },
  {
    text: "גילאים 19-45",
    onClick: "גיל_19_45",
  },
  {
    text: "גילאים 46-55",
    onClick: "גיל_46_55",
  },
  {
    text: "גילאים 56-64",
    onClick: "גיל_56_64",
  },
  {
    text: "גיל 65 ומעלה",
    onClick: "גיל_65_פלוס",
  },
  {
    text: 'סה"כ כמות תושבים',
    onClick: "סהכ",
  },
];

export const options = [
  {
    name: "גיל",
    value: "age",
  },
  {
    name: "פשיעה",
    value: "crime",
  },
  {
    name: "תאונות דרכים",
    value: "carAccidents",
  },
  {
    name: "קריאות למוקדי 100",
    value: "emergencyCalls",
  },
  {
    name: "יישוב",
    value: "city",
  },
  {
    name: "איזור",
    value: "area",
  },
];

export async function sendMail(mailText: MailTemplate | null, text: string) {
  try {
    //@ts-ignore
    await axios.post(process.env.NEXT_PUBLIC_MAIL, { ...mailText, text });
  } catch (e) {
    console.error(e);
  }
}

export async function getUserAgent() {
  let body = null;

  try {
    const response = await axios.get(
      `https://api.apicagent.com/?ua=${navigator.userAgent}`
    );

    body = {
      resolution: `${window.screen.width} X ${window.screen.height}`,
      response: JSON.stringify(response.data, null, 2),
      name: "Statistics of Cities",
    };
  } catch (e) {
    console.error(e);
  }

  return body;
}

export const getData = async () => {
  try {
    const resp = await axios.get("/api/all-data");

    let arr = resp.data.result.records.filter(
      (city: any) => parseInt(city["סמל_ישוב"]) !== 0
    );

    for (let i = 0; i < arr.length; i++) {
      if (arr[i][tableData[0].onClick].includes("(")) {
        arr[i][tableData[0].onClick] = arr[i][tableData[0].onClick]
          .replace("(", ")")
          .replace(")", "(");
      }
    }

    const arr1 = [...arr];
    const arr2 = [...arr];

    arr1.sort((a, b) => {
      return (
        parseInt(b[tableData[tableData.length - 1].onClick]) -
        parseInt(a[tableData[tableData.length - 1].onClick])
      );
    });

    return [arr2, arr1];
  } catch (e) {
    console.error(e);
    return [[], []];
  }
};

export const sortByKey = (array: any, key: string) => {
  return array.sort((a: any, b: any) => {
    const x =
      key === tableData[0].onClick
        ? a[tableData[0].onClick].trim()
        : parseInt(a[key]);
    const y =
      key === tableData[0].onClick
        ? b[tableData[0].onClick].trim()
        : parseInt(b[key]);

    return x < y ? -1 : x > y ? 1 : 0;
  });
};

export const parseCity = (city: string) => {
  if (city.includes("(")) {
    city = city.replaceAll("(", "").replaceAll(")", "");
  }

  return city;
};

export const chartLogic = async (
  value: string,
  data: any,
  compared: string[],
  year: number
) => {
  let arr = [];

  if (value === options[0].value) {
    if (compared.length > 0) {
      for (let j = 0; j < data.length; j++) {
        const array = [];

        for (let i = 1; i < tableData.length; i++) {
          const obj = sumData(
            [data[j]],
            tableData[i].onClick,
            tableData[i].text
          );
          array.push(obj);
        }

        arr.push(array);
      }
    } else {
      for (let i = 1; i < tableData.length; i++) {
        const obj = sumData(data, tableData[i].onClick, tableData[i].text);
        arr.push(obj);
      }
    }
  } else if (value === options[4].value) {
    for (let i = 0; i < data.length; i++) {
      arr.push([
        data[i][tableData[0].onClick],
        parseInt(data[i][tableData[tableData.length - 1].onClick]),
      ]);
    }
  } else if (value === options[5].value) {
    let area = data.map((city: any) => city["סמל_נפה"]);
    area = area.filter(
      (item: any, index: number) => area.indexOf(item) === index
    );

    for (let i = 0; i < area.length; i++) {
      const obj = data.filter((city: any) => city["סמל_נפה"] === area[i]);
      arr.push(
        sumData(obj, tableData[tableData.length - 1].onClick, obj[0]["נפה"])
      );
    }
  } else {
    if (compared.length > 0) {
      for (let i = 0; i < compared.length; i++) {
        arr.push(getStatsArray(await checkStat(year, compared[i], value)));
      }
    } else {
      arr = getStatsArray(
        await checkStat(year, data[0][tableData[0].onClick], value)
      );
    }
  }

  return arr;
};

const getStatsArray = (data: any) => {
  const arr = [];

  if (data[1] > -1) {
    for (let i = 0; i < data[0][data[1]].Statistics.length; i++) {
      arr.push([
        data[0][data[1]].Statistics[i].Subject.trim()
          .replaceAll("תאונות", "")
          .replaceAll("נפגעים", "")
          .replaceAll("-", ""),
        data[0][data[1]].Statistics[i].CountFact,
      ]);
    }

    arr.unshift(sumData(data[0][data[1]].Statistics, "CountFact", 'סה"כ'));
  }

  return arr;
};

const checkStat = async (year: number, city: string, value: string) => {
  const title =
    value === options[1].value
      ? "נתוני עבירות פליליות"
      : value === options[2].value
      ? "תנועה"
      : "קריאות למוקדי 100";

  const resp = await getCityStats(parseCity(city), year);
  const index = resp.findIndex((obj: any) => obj.Title === title);

  return [resp, index];
};

const getCityStats = async (city: string, year: number) => {
  try {
    const resp = await axios.post("/api/requests", { city, year });
    return resp.data.Stats;
  } catch (e) {
    console.error(e);
    return [];
  }
};

const sumData = (arr: any, key: string, name: string) => {
  let sum = 0;

  arr.forEach((item: any) => {
    sum += parseInt(item[key]);
  });

  return [name, sum];
};
