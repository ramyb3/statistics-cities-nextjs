import { useEffect } from "react";
import TopLayout, { TableItems, TableTitles } from "./other-components";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { allDataAtom, apiDataAtom, displayAtom, tooltipAtom } from "./atoms";
import { getData, sendMail } from "./utils";
import Charts from "./charts";

export default function MainPage() {
  const [allData, setData] = useAtom(allDataAtom);
  const [tooltip, setTooltip] = useAtom(tooltipAtom);

  const setAPIData = useSetAtom(apiDataAtom);

  const display = useAtomValue(displayAtom);

  useEffect(() => {
    const getCities = async () => {
      // await sendMail();

      try {
        const resp = await getData();

        setAPIData(resp[0]);
        setData(resp[1]);
      } catch (e) {
        alert("שגיאה בקבלת הנתונים!");
      }
    };

    for (
      let i = 0, time = 0;
      i < Object.keys(tooltip).length;
      i++, time += 2500
    ) {
      setTimeout(() => {
        setTooltip({
          ...tooltip,
          [`step${i + 1}`]: true,
          [`step${i + 2}`]: false,
        });
      }, time);
    }

    getCities();
  }, []);

  return (
    <>
      <TopLayout />

      {display ? (
        <table className="text-center m-auto mb-1">
          <TableTitles />

          {allData.map((city: any, index: number) => {
            return (
              <tbody key={index}>
                <TableItems cityData={city} />
              </tbody>
            );
          })}
        </table>
      ) : (
        <Charts />
      )}
    </>
  );
}
