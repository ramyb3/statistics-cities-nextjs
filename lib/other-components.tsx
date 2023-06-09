import { useEffect, useRef, useState } from "react";
import {
  allDataAtom,
  apiDataAtom,
  comparedAtom,
  displayAtom,
  mailTextAtom,
  searchAtom,
  tooltipAtom,
} from "./atoms";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Tooltip } from "@mui/material";
import Compare from "./compare";
import { parseCity, sendMail, sortByKey, tableData } from "./utils";

export default function TopLayout() {
  const [allData, setData] = useAtom(allDataAtom);
  const [display, setDisplay] = useAtom(displayAtom);

  const setCompared = useSetAtom(comparedAtom);
  const setSearch = useSetAtom(searchAtom);

  const tooltip = useAtomValue(tooltipAtom);
  const apiData = useAtomValue(apiDataAtom);
  const mailText = useAtomValue(mailTextAtom);

  return (
    <div className="flex justify-center p-2.5 gap-2.5">
      <Search />
      <TooltipWrapper title="להראות את כל היישובים" open={tooltip.step1}>
        <button
          className="bg-[#f5f5dc]"
          onClick={() => {
            setData(apiData);
            setDisplay(true);
            setCompared([]);
            setSearch("");
            sendMail(mailText, "Show All Cities");
          }}
        >
          כל היישובים
        </button>
      </TooltipWrapper>
      <TooltipWrapper title="לעבור בין תצוגות" open={tooltip.step2}>
        <button
          className="bg-[#afeeee]"
          onClick={() => {
            setDisplay(!display);
            sendMail(mailText, `תצוגת ${display ? "גרף" : "טבלה"}`);
          }}
        >
          תצוגת {!display ? "גרף" : "טבלה"}
        </button>
      </TooltipWrapper>
      <Compare />
      <span className="bg-[#8d70e6] rounded-xl text-center text-[#f5f5f5] p-1">
        יישובים: {allData.length}
      </span>
    </div>
  );
}

export function TableTitles() {
  const [allData, setData] = useAtom(allDataAtom);

  const tooltip = useAtomValue(tooltipAtom);
  const mailText = useAtomValue(mailTextAtom);

  const [order, setOrder] = useState(true);

  const orderTable = (method: string) => {
    const arr = sortByKey(allData, method);
    setData(order ? [...arr] : [...arr.reverse()]);
  };

  return (
    <thead>
      <tr>
        {tableData.map((header, index) => {
          return (
            <TooltipWrapper
              key={index}
              title={
                index === tableData.length - 1
                  ? 'ניתן למיין את הטבלה ע"י לחיצה על כל אחת מהעמודות'
                  : index === 0
                  ? "ניתן לראות מידע על כל יישוב בלחיצה עליו"
                  : ""
              }
              open={
                (tooltip.step4 && index === 0) ||
                (tooltip.step5 && index === tableData.length - 1)
              }
            >
              <th
                className="p-1 font-bold bg-[#ff7f50] border-2 border-[#dddddd] hover:cursor-pointer hover:bg-[#808080] hover:text-[#f5f5f5]"
                onClick={() => {
                  orderTable(header.onClick);
                  setOrder(!order);
                  sendMail(mailText, `ארגון לפי ${header.onClick}`);
                }}
              >
                {header.text}
              </th>
            </TooltipWrapper>
          );
        })}
      </tr>
    </thead>
  );
}

export function TableItems({ cityData }: { cityData: any }) {
  const [allData, setData] = useAtom(allDataAtom);

  const setCompared = useSetAtom(comparedAtom);
  const setDisplay = useSetAtom(displayAtom);

  const mailText = useAtomValue(mailTextAtom);

  const getCity = async (city: string) => {
    setData(allData.filter((obj: any) => obj[tableData[0].onClick] === city));
    setDisplay(false);
    setCompared([]);
    await sendMail(mailText, `לחיצה על עיר בטבלה- ${city}`);
  };

  return (
    <tr>
      {tableData.map((item, index) => {
        return (
          <td
            key={index}
            className={`p-1 border-2 border-[#dddddd] ${
              index === 0
                ? "hover:cursor-pointer hover:bg-[#b22222] hover:text-[#f5f5f5]"
                : ""
            }`}
            onClick={() => {
              if (index === 0) {
                getCity(cityData[item.onClick]);
              }
            }}
          >
            {index === 0
              ? cityData[item.onClick]
              : parseInt(cityData[item.onClick]).toLocaleString()}
          </td>
        );
      })}
    </tr>
  );
}

export function TooltipWrapper({
  children,
  title,
  open,
}: {
  children: any;
  title: string;
  open: boolean;
}) {
  return (
    <Tooltip
      arrow
      title={<div className="text-lg text-center">{title}</div>}
      open={open}
    >
      {children}
    </Tooltip>
  );
}

export function ButtonsSearch({ city }: { city: string }) {
  const mailText = useAtomValue(mailTextAtom);

  return (
    <div className="flex mt-12 justify-evenly">
      <button
        className="p-2.5 bg-[#b0e0e6] rounded-2xl"
        onClick={() => sendMail(mailText, `נדל"ן- ${city}`)}
      >
        <a
          href={`https://www.nadlan.gov.il/?search=${parseCity(city)}`}
          target="_blank"
        >
          חיפוש עסקאות נדל{'"'}ן ביישוב
        </a>
      </button>
      <button
        className="p-2.5 bg-[#b0e0e6] rounded-2xl"
        onClick={() => sendMail(mailText, `גוגל- ${city}`)}
      >
        <a href={`https://www.google.co.il/search?q=${city}`} target="_blank">
          חיפוש היישוב בגוגל
        </a>
      </button>
    </div>
  );
}

function Search() {
  const [search, setSearch] = useAtom(searchAtom);

  const setData = useSetAtom(allDataAtom);
  const setCompared = useSetAtom(comparedAtom);

  const apiData = useAtomValue(apiDataAtom);
  const mailText = useAtomValue(mailTextAtom);

  const serachRef = useRef(null);

  useEffect(() => {
    if (search === "" && serachRef.current) {
      //@ts-ignore
      serachRef.current.value = "";
    }
  }, [search]);

  const searchCity = async () => {
    if (search !== "") {
      const list = apiData.filter((city: any) =>
        city[tableData[0].onClick].includes(search)
      );

      if (list.length === 0) {
        alert("אין תוצאות! נסו שוב");
      } else {
        setCompared([]);
        setData(list);
      }

      await sendMail(mailText, `חיפוש- ${search}`);
    } else {
      alert("נא להקליד יישוב בשביל לקבל תוצאה!");
    }
  };

  return (
    <div className="flex gap-1">
      <input
        className="text-lg text-center border-2 border-black max-w-[140px]"
        ref={serachRef}
        placeholder="הזן יישוב"
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            searchCity();
          }
        }}
      />
      <button onClick={searchCity}>חיפוש</button>
    </div>
  );
}
