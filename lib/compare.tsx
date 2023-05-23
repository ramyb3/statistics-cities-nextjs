import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import { DialogTitle } from "@mui/material";
import Select from "react-select";
import { TooltipWrapper } from "./other-components";
import { useAtomValue, useSetAtom } from "jotai";
import {
  allDataAtom,
  apiDataAtom,
  comparedAtom,
  searchAtom,
  tooltipAtom,
} from "./atoms";
import { sortByKey, tableData } from "./utils";

type OptionType = {
  value: string;
  label: string;
};

export default function Compare() {
  const setData = useSetAtom(allDataAtom);
  const setCompared = useSetAtom(comparedAtom);
  const setSearch = useSetAtom(searchAtom);

  const apiData = useAtomValue(apiDataAtom);
  const tooltip = useAtomValue(tooltipAtom);

  const [values, setValues] = useState<OptionType[]>([]);
  const [open, setOpen] = useState(false);
  const [selectData, setSelectData] = useState([]);

  useEffect(() => {
    if (open) {
      const arr: any = [];
      const data = sortByKey(apiData, tableData[0].onClick);

      for (let i = 0; i < data.length; i++) {
        const city = data[i][tableData[0].onClick];
        arr.push({ value: city, label: city });
      }

      setSelectData(arr);
    }

    setValues([]);

    // eslint-disable-next-line
  }, [open]);

  const compareCities = () => {
    if (values.length < 2) {
      alert("נא לבחור לפחות 2 יישובים בשביל לקבל תוצאה!");
      return;
    }
    if (values.length > 5) {
      alert("ניתן להשוות עד 5 יישובים!");
      return;
    }

    const arr = [];
    const cities = [];

    for (let i = 0; i < Object.keys(values).length; i++) {
      const obj = apiData.find(
        (city: any) => city[tableData[0].onClick] === values[i].label
      );
      arr.push(obj);
      cities.push(values[i].label);
    }

    setSearch("");
    setCompared(cities);
    setData(arr);
    setOpen(false);
  };

  return (
    <>
      <TooltipWrapper title="ניתן להשוות עד 5 יישובים" open={tooltip.step3}>
        <button onClick={() => setOpen(true)} className="bg-[#d8bfd8]">
          השוואה בין יישובים
        </button>
      </TooltipWrapper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <div className="flex flex-col items-center p-1 gap-4">
          <DialogTitle sx={{ color: "red", fontWeight: "bold" }}>
            ניתן להשוות עד 5 יישובים
          </DialogTitle>

          <Select
            noOptionsMessage={() => "אין תוצאות!"}
            isMulti
            placeholder={<span>חפש יישוב</span>}
            onChange={(e: any) => setValues(e)}
            menuPortalTarget={
              typeof document !== "undefined" ? document.body : undefined
            }
            menuPlacement={"bottom"}
            closeMenuOnSelect={false}
            styles={selectStyle}
            options={selectData}
            components={{ IndicatorSeparator: () => null }}
          />
          <button onClick={compareCities}>השוואה בין יישובים</button>
        </div>
      </Dialog>
    </>
  );
}

const selectStyle = {
  control: (styles: any) => ({
    ...styles,
    cursor: "pointer",
    minWidth: "500px",
  }),
  menuPortal: (provided: any) => ({ ...provided, zIndex: 9999 }),
  option: (styles: any) => ({ ...styles, cursor: "pointer" }),
};
