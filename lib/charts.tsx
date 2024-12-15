import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useEffect, useState } from "react";
import { chartLogic, options, sendMail, tableData } from "./utils";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  allDataAtom,
  apiDataAtom,
  comparedAtom,
  displayAtom,
  mailTextAtom,
} from "./atoms";
import { ButtonsSearch } from "./other-components";

const years: number[] = [];

for (let i = new Date(Date.now()).getFullYear(); i > 2018; i--) {
  years.push(i);        
}

const color = "rgb(150, 53, 142)";

export default function Charts() {
  const [allData, setData] = useAtom(allDataAtom);
  const [compared, setCompared] = useAtom(comparedAtom);

  const setDisplay = useSetAtom(displayAtom);

  const apiData = useAtomValue(apiDataAtom);
  const mailText = useAtomValue(mailTextAtom);

  const [value, setValue] = useState(options[0].value);
  const [year, setYear] = useState(years[0]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getChartLogic = async () => {
      const resp: any = await chartLogic(value, allData, compared, year);

      setChartData(resp);
      setLoading(false);
    };

    setLoading(true);
    getChartLogic();

    // eslint-disable-next-line
  }, [value, allData, year]);

  const charts = {
    chart: {
      type: "column",
      events: {
        render(this: any) {
          if (
            options.findIndex((option) => option.value === value) > 3 ||
            compared.length === 0
          ) {
            for (let i = this.series.length - 1; i > 0; i--) {
              this.series[i]?.remove();
            }
          }
          if (
            options.findIndex((option) => option.value === value) < 4 &&
            compared.length > 1
          ) {
            for (let i = this.series.length - 1; i > compared.length - 1; i--) {
              this.series[i]?.remove();
            }
          }
        },
      },
    },
    title: {
      text: null,
    },
    legend: {
      enabled:
        options.findIndex((option) => option.value === value) > 3 ||
        compared.length === 0
          ? false
          : true,
    },
    xAxis: {
      type: "category",
      labels: {
        style: {
          color,
        },
      },
      title: {
        style: {
          color,
        },
      },
    },
    yAxis: {
      min: 0,
      labels: {
        style: {
          color,
        },
      },
      title: {
        text:
          value === options[0].value ||
          options.findIndex((option) => option.value === value) > 3
            ? "תושבים"
            : "מקרים",
        style: {
          color,
        },
      },
    },
    tooltip: {
      formatter: function (this: any) {
        return `<div style="font-weight:bold; display:flex">
        ${parseInt(this.y).toLocaleString()}</div>`;
      },
    },
    series: [
      {
        color: "#2caffe",
        cursor: "pointer",
        name:
          compared.length > 0 &&
          options.findIndex((option) => option.value === value) < 4
            ? compared[0]
            : "תושבים",
        data:
          compared.length > 0 &&
          options.findIndex((option) => option.value === value) < 4
            ? chartData[0]
            : chartData,
        point: {
          events: {
            click: async (e: any) => {
              if (options.findIndex((option) => option.value === value) > 3) {
                setData(
                  (value === options[4].value ? allData : apiData).filter(
                    (city: any) =>
                      city[
                        value === options[4].value
                          ? tableData[0].onClick
                          : "נפה"
                      ] === e.point.name
                  )
                );
                setCompared([]);
                setDisplay(true);
              }
            },
          },
        },
      },
      {
        color: "#08af0d",
        cursor: "pointer",
        name: compared[1],
        data: chartData[1],
      },
      {
        color: "#c30000",
        cursor: "pointer",
        name: compared[2],
        data: chartData[2],
      },
      {
        color: "#ffa500",
        cursor: "pointer",
        name: compared[3],
        data: chartData[3],
      },
      {
        color: "#808080",
        cursor: "pointer",
        name: compared[4],
        data: chartData[4],
      },
    ],
  };

  return (
    <>
      <div className="flex justify-center items-center p-1 gap-2.5">
        <select
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            sendMail(mailText, `Choose From Chart- ${e.target.value}`);
          }}
        >
          {options.map((option, index) => {
            if (
              compared.length === 0 &&
              allData.length > 1 &&
              index > 0 &&
              index < 4
            ) {
              return null;
            }

            return (
              <option key={index} value={option.value}>
                {option.name}
              </option>
            );
          })}
        </select>
      </div>

      {options.findIndex((option) => option.value === value) < 4 &&
      options.findIndex((option) => option.value === value) > 0 ? (
        <div className="flex flex-col justify-center items-center p-1 gap-2.5">
          <select value={year} onChange={(e: any) => setYear(e.target.value)}>
            {years.map((item, index) => {
              return (
                <option key={index} value={item}>
                  {item}
                </option>
              );
            })}
          </select>
          <div>**מידע שהוא לא דמוגרפי מתעדכן אחת לרבעון ע{'"'}י המדינה**</div>
        </div>
      ) : null}

      {!loading ? (
        <>
          {chartData.length > 0 ? (
            <HighchartsReact highcharts={Highcharts} options={charts} />
          ) : (
            <h2>אין נתונים!</h2>
          )}

          {allData.length === 1 && value !== options[5].value && (
            <ButtonsSearch city={allData[0][tableData[0].onClick]} />
          )}
        </>
      ) : (
        <h2>טוען...</h2>
      )}
    </>
  );
}
